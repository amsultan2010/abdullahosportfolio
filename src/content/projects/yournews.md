---
title: YourNews
slug: yournews
year: 2024
tech: ["Next.js","Express.js","TypeScript","OpenAI API","MongoDB","Docker","GitHub Actions"]
summary: Personalized news aggregator using TF-IDF/BM25 ranking and GPT-4 summaries—AI summaries with insights, takeaways, actions and watch items. Built to scale to 10K+ users.
repoUrl: "https://github.com/ronnielgandhe/yournews"
highlights:
  - RSS feed ingestion pipeline
  - TF-IDF personalization engine
  - AI-powered summaries
  - Sub-1s page load times
---

## Problem

Traditional news aggregators (Google News, Feedly) have two major issues:

1. **Generic Ranking**: Articles are sorted by recency or publisher prominence, not personal relevance. If you care about AI policy but not celebrity news, you still see both mixed together.

2. **Time Cost**: Reading full articles takes 5–10 minutes each. Scanning headlines doesn't provide enough context to decide if an article is worth reading.

I wanted a **personalized news feed** that:
- Learns what topics I care about (without explicit configuration)
- Surfaces relevant articles first
- Provides AI-generated summaries so I can decide whether to read the full text

The challenge: build this **at scale**. Supporting thousands of users with different interests, without a custom ml model for each person.

---

## Approach

YourNews uses a **two-stage pipeline**: content ingestion → personalization ranking.

### System Architecture

```
┌────────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  RSS Fetcher   │──────▶│  Content Store  │──────▶│  Ranking Engine  │
│  (Express.js)  │       │  (MongoDB)      │       │  (TF-IDF)        │
└────────────────┘       └─────────────────┘       └──────────────────┘
        │                        │                          │
        │                        ▼                          ▼
        │                 ┌─────────────────┐      ┌────────────────┐
        │                 │  GPT-4 API      │      │  User Profile  │
        │                 │  (Summaries)    │      │  (Interests)   │
        │                 └─────────────────┘      └────────────────┘
        ▼
   Scheduled Cron
   (every 15 min)
```

**Flow**:
1. **Ingestion**: Cron job fetches RSS feeds from 50+ sources (NYT, TechCrunch, ArXiv, etc.) every 15 minutes
2. **Storage**: Articles stored in MongoDB with full text, metadata, and embeddings
3. **Summarization**: AI summaries with insights, takeaways, actions and watch items. GPT-4 generates 3-sentence summaries (cached to avoid redundant API calls)
4. **Personalization**: TF-IDF/BM25-based ranking scores articles against user's reading history. Ranking = TF-IDF/BM25 + exponential recency decay + source priors + per-domain cap + profile focus.
5. **Delivery**: Next.js frontend renders ranked articles with summaries

### Technology Choices

- **Next.js 13**: Server components for fast initial page load (SSR for feed, client-side for interactions). Edge runtime for API routes reduces latency.

- **Express.js**: Separate backend for RSS ingestion (runs as a scheduled job, not part of Next.js app). Easier to scale independently.

- **MongoDB**: Schema flexibility for varying article structures (some feeds have authors, others don't). Full-text search for keyword queries.

- **OpenAI API (GPT-4)**: Summarization via prompt engineering. Cache responses in DB (summary only changes if article content changes).

- **TF-IDF**: Lightweight personalization. Doesn't require training a neural network. Computes similarity between article text and user's past reads.
 - **TF-IDF / Ranking**: Lightweight personalization. Doesn't require training a neural network. Computes similarity between article text and user's past reads. Ranking also applies a per-domain cap to prevent any single source from dominating results while still honoring relevance.

- **Docker + GitHub Actions**: Containerized backend (Express + MongoDB) deployed via CI/CD. Tests run on every commit.

### Development Challenges

1. **RSS Feed Reliability**: Many feeds break unpredictably (dead links, malformed XML, rate limits). Implemented:
   - Retry logic with exponential backoff (3 attempts, 2s → 8s → 32s)
   - Timeout checks (abort if fetch takes >10s)
   - Dead feed detection (disable source if failures >5 consecutive times)

2. **Defensive fetching**: Retries with exponential backoff, strict timeouts, and dead-feed quarantine improved ingestion reliability from ~78% raw fetches to ~94%.

2. **GPT-4 API Costs**: Summarizing every article on every fetch would cost $500/month. Optimized:
   - Cache summaries in MongoDB (keyed by article URL)
   - Only summarize articles that match user interests (TF-IDF score >0.3)
   - Batch API requests (10 articles per call) to reduce overhead

3. **Cost controls**: Summary caching keyed by content hash, threshold-based summarization (only summarize if TF-IDF score > 0.3), and batched API calls cut LLM costs by ~3×.

3. **Personalization Cold Start**: New users have no reading history → no personalized ranking. Solution:
   - Default feed shows "trending" articles (most clicked by all users)
   - After 3 article clicks, switch to personalized feed
   - Option to manually select topics (Tech, Finance, Science) to bootstrap preferences

4. **Cold start**: Trending-first feed and optional topic selection switch to personalized ranking after the first few clicks, improving early retention.

4. **Slow TF-IDF at Scale**: Initial implementation recalculated TF-IDF scores on every page load (10K articles × user history = 100K operations). Optimized:
   - Precompute TF-IDF vectors for all articles (stored in MongoDB)
   - User profile vector cached in Redis (updated only when user reads an article)
   - Ranking becomes dot product (instant)

5. **Latency path**: Precomputed article vectors + cached user profiles reduce ranking to a dot product; typical page renders in ~3–5s under load.

---

## Implementation Details

### RSS Ingestion Pipeline

**Express.js Cron Job**:
```typescript
import Parser from 'rss-parser';
import axios from 'axios';

const parser = new Parser();

async function fetchFeed(feedUrl: string) {
  try {
    const feed = await parser.parseURL(feedUrl);
    for (const item of feed.items) {
      await saveArticle({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentSnippet,
        source: feedUrl
      });
    }
  } catch (error) {
    console.error(`Failed to fetch ${feedUrl}:`, error);
    await handleFeedError(feedUrl);
  }
}

// Run every 15 minutes
setInterval(() => {
  RSS_FEEDS.forEach(fetchFeed);
}, 15 * 60 * 1000);
```

**Retry Logic**:
```typescript
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);  // Exponential backoff
    }
  }
}
```

**Results**: Feed ingestion reliability improved from 78% (raw fetches) to 94% (with retries)

### AI Summarization

**GPT-4 Prompt**:
```typescript
async function generateSummary(articleText: string) {
  const cachedSummary = await db.summaries.findOne({ articleHash: hash(articleText) });
  if (cachedSummary) return cachedSummary.text;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Summarize news articles in 3 concise sentences." },
      { role: "user", content: articleText }
    ],
    max_tokens: 150,
    temperature: 0.3  // Low temperature for factual summaries
  });

  const summary = response.choices[0].message.content;
  await db.summaries.insertOne({ articleHash: hash(articleText), text: summary });
  return summary;
}
```

**Cost Optimization**:
- Cache hit rate: 83% (most articles fetched multiple times from different sources)
- Monthly cost: $45 for ~15K summaries (1500 unique articles/month, 10 summaries/article on average)

### Personalization Engine (TF-IDF)

**Article Vectorization**:
```python
from sklearn.feature_extraction.text import TfidfVectorizer

# Compute TF-IDF vectors for all articles
vectorizer = TfidfVectorizer(max_features=500, stop_words='english')
article_vectors = vectorizer.fit_transform([article.content for article in articles])

# Store in MongoDB
for i, article in enumerate(articles):
    db.articles.update_one(
        {'_id': article.id},
        {'$set': {'tfidf_vector': article_vectors[i].toarray().tolist()}}
    )
```

**User Profile**:
```python
def build_user_profile(user_history):
    # User profile = average of vectors for articles they've read
    read_vectors = [article.tfidf_vector for article in user_history]
    return np.mean(read_vectors, axis=0)
```

**Ranking**:
```python
from sklearn.metrics.pairwise import cosine_similarity

def rank_articles(user_profile, articles):
    scores = cosine_similarity([user_profile], [a.tfidf_vector for a in articles])[0]
    return sorted(zip(articles, scores), key=lambda x: x[1], reverse=True)
```

**Performance**: Ranking 1000 articles for a user takes ~12ms (precomputed vectors + NumPy operations)

The personalization stack is profile-aware ranking and includes smart query classification (person, event, topic, market) to select appropriate retrieval and ranking heuristics.

### Frontend (Next.js)

**Server-Side Rendering**:
```tsx
// app/feed/page.tsx
export default async function FeedPage() {
  const user = await getUser();
  const articles = await getRankedArticles(user.id);
  
  return (
    <div className="grid gap-4">
      {articles.map(article => (
        <ArticleCard
          key={article.id}
          title={article.title}
          summary={article.summary}
          source={article.source}
          url={article.link}
        />
      ))}
    </div>
  );
}
```

**Edge API Routes** (for clicks, likes):
```typescript
// app/api/track-click/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';  // Deploy to Vercel Edge Network

export async function POST(request: Request) {
  const { userId, articleId } = await request.json();
  
  // Update user profile (Redis cache)
  await updateUserProfile(userId, articleId);
  
  return NextResponse.json({ success: true });
}
```

**Load Times**:
- Initial page load (SSR): 780ms
- Client-side navigation: 120ms
- Edge API response: 45ms
 - Panels render in ~3–5s (typical for full dashboard panels under load)

### Testing

**Unit Tests** (Jest + TypeScript):
- RSS parser handles malformed XML
- TF-IDF ranking returns articles in correct order
- GPT-4 cache prevents duplicate API calls

**Integration Tests** (Playwright):
- User signs up → sees trending articles
- User reads 3 articles → feed switches to personalized
- User clicks article → tracked in analytics

**Load Tests** (k6):
- Simulated 1000 concurrent users fetching feeds
- Result: P95 latency <2s, no errors

---

## Results / Learnings

### Quantitative Results

**Pilot Launch (100 beta users, 2 months)**:
- **Total articles ingested**: 18,742
- **Unique sources**: 52 RSS feeds
- **Summaries generated**: 1,890 (10% of articles: only those matching user interests)
- **Average session time**: 4.2 minutes (vs. 1.8 min for unfiltered feeds: users read more)
- **Click-through rate**: 32% (users clicked 1 in 3 articles shown)

**Cost**:
- **Infrastructure**: $12/month (Vercel Pro + MongoDB Atlas)
- **OpenAI API**: $45/month (GPT-4 summaries)
- **Total**: $57/month for 100 users ($0.57/user)

### Technical Learnings

1. **RSS is Fragile**: Feeds break constantly (dead links, schema changes, rate limits). Defensive programming (retries, timeouts, fallbacks) is mandatory.

2. **Cache Everything**: Initial API costs were 3× higher before caching summaries. Rule: if computation is expensive and result is stable, cache it.

3. **Edge Functions Win**: Moving API routes to Vercel Edge reduced latency by 60% (from 180ms to 70ms) for international users.

4. **TF-IDF is "Good Enough"**: Considered training a neural network for personalization, but TF-IDF achieved 85% of the quality with 1% of the complexity.

5. **Cold Start Matters**: New users saw generic feeds, half bounced. Adding topic selection at signup improved retention by 40%.

### Business Insight

Learned that **personalization drives engagement**. Users spent 2× longer on the site when they saw relevant articles. this validated the core hypothesis.

Also realized that **RSS is a declining format** (many publishers dropped RSS support in 2023). Future versions need to scrape HTML directly or integrate with APIs (NYT, Reddit, Twitter).

---

## Future Improvements

- **Multi-Language Support**: Translate articles + summaries (GPT-4 Turbo supports this natively)
- **Email Digest**: Daily email with top 5 personalized articles
- **Social Sharing**: Users can share articles with annotations (similar to Substack Notes)
- **Mobile App**: React Native version with push notifications for breaking news

---

**Status**: Live at [yournews.app](https://github.com/ronnielgandhe/yournews) • Open source • Scaling to 1K users

