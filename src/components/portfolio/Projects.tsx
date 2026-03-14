import { useState, useRef, useEffect, useCallback } from 'react';
import type { ProjectDetail, DetailContent } from './DetailPanel';

interface ProjectsProps {
  onCardClick?: (detail: DetailContent) => void;
  windowMode?: boolean;
}

interface FileTab {
  projectIdx: number;
  fileName: string;  // "README.md", "requirements.txt", etc.
  content: string | null;
  loading: boolean;
}

// Extract repo slug from GitHub URL
function repoSlug(url: string): string {
  // "https://github.com/ronnielgandhe/quantzoo" → "ronnielgandhe/quantzoo"
  return url.replace('https://github.com/', '');
}

// Vibrant tech tag color palette for VS Code style
const techColors: Record<string, { bg: string; text: string; border: string }> = {
  'Python':      { bg: 'rgba(78, 154, 66, 0.15)',  text: '#6ab04c', border: 'rgba(78, 154, 66, 0.3)' },
  'PyTorch':     { bg: 'rgba(238, 76, 44, 0.14)',  text: '#ee4c2c', border: 'rgba(238, 76, 44, 0.28)' },
  'Hugging Face': { bg: 'rgba(255, 213, 79, 0.14)', text: '#ffd54f', border: 'rgba(255, 213, 79, 0.28)' },
  'FastAPI':     { bg: 'rgba(0, 150, 136, 0.14)',   text: '#009688', border: 'rgba(0, 150, 136, 0.28)' },
  'TypeScript':  { bg: 'rgba(49, 120, 198, 0.15)',  text: '#4daafc', border: 'rgba(49, 120, 198, 0.3)' },
  'JavaScript':  { bg: 'rgba(247, 223, 30, 0.14)',  text: '#f0db4f', border: 'rgba(247, 223, 30, 0.28)' },
  'React':       { bg: 'rgba(97, 218, 251, 0.12)',  text: '#61dafb', border: 'rgba(97, 218, 251, 0.25)' },
  'Next.js':     { bg: 'rgba(255, 255, 255, 0.08)', text: '#e0e0e0', border: 'rgba(255, 255, 255, 0.18)' },
  'Node.js':     { bg: 'rgba(104, 159, 56, 0.14)',  text: '#8bc34a', border: 'rgba(104, 159, 56, 0.28)' },
  'AWS':         { bg: 'rgba(255, 153, 0, 0.14)',   text: '#ff9900', border: 'rgba(255, 153, 0, 0.28)' },
  'Docker':      { bg: 'rgba(36, 150, 237, 0.14)',  text: '#2496ed', border: 'rgba(36, 150, 237, 0.28)' },
  'PostgreSQL':  { bg: 'rgba(51, 103, 145, 0.15)',  text: '#6296b4', border: 'rgba(51, 103, 145, 0.3)' },
  'Redis':       { bg: 'rgba(220, 50, 47, 0.14)',   text: '#dc382f', border: 'rgba(220, 50, 47, 0.28)' },
  'GraphQL':     { bg: 'rgba(229, 53, 171, 0.14)',  text: '#e535ab', border: 'rgba(229, 53, 171, 0.28)' },
  'Terraform':   { bg: 'rgba(98, 75, 210, 0.14)',   text: '#7b61ff', border: 'rgba(98, 75, 210, 0.28)' },
  'Go':          { bg: 'rgba(0, 173, 216, 0.14)',   text: '#00add8', border: 'rgba(0, 173, 216, 0.28)' },
  'Rust':        { bg: 'rgba(222, 165, 132, 0.14)', text: '#dea584', border: 'rgba(222, 165, 132, 0.28)' },
  'SQL':         { bg: 'rgba(0, 114, 198, 0.14)',   text: '#4daafc', border: 'rgba(0, 114, 198, 0.28)' },
  'MongoDB':     { bg: 'rgba(77, 179, 61, 0.14)',   text: '#4db33d', border: 'rgba(77, 179, 61, 0.28)' },
  'Tailwind CSS': { bg: 'rgba(56, 189, 248, 0.12)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.25)' },
  'Swift':       { bg: 'rgba(240, 81, 56, 0.14)',   text: '#f05138', border: 'rgba(240, 81, 56, 0.28)' },
  'Kotlin':      { bg: 'rgba(127, 82, 255, 0.14)',  text: '#7f52ff', border: 'rgba(127, 82, 255, 0.28)' },
  'C++':         { bg: 'rgba(0, 89, 156, 0.15)',    text: '#659ad2', border: 'rgba(0, 89, 156, 0.3)' },
  'Figma':       { bg: 'rgba(162, 89, 255, 0.14)',  text: '#a259ff', border: 'rgba(162, 89, 255, 0.28)' },
  'Stripe':      { bg: 'rgba(99, 91, 255, 0.14)',   text: '#635bff', border: 'rgba(99, 91, 255, 0.28)' },
  'OpenAI':      { bg: 'rgba(116, 170, 156, 0.14)', text: '#74aa9c', border: 'rgba(116, 170, 156, 0.28)' },
  'Astro':       { bg: 'rgba(255, 93, 1, 0.14)',    text: '#ff5d01', border: 'rgba(255, 93, 1, 0.28)' },
  'Vercel':      { bg: 'rgba(255, 255, 255, 0.08)', text: '#e0e0e0', border: 'rgba(255, 255, 255, 0.18)' },
  'GitHub Actions': { bg: 'rgba(36, 150, 237, 0.14)', text: '#2496ed', border: 'rgba(36, 150, 237, 0.28)' },
  'Grafana':     { bg: 'rgba(240, 134, 31, 0.14)',  text: '#f0861f', border: 'rgba(240, 134, 31, 0.28)' },
  'Datadog':     { bg: 'rgba(99, 44, 166, 0.14)',   text: '#b17fd6', border: 'rgba(99, 44, 166, 0.28)' },
  'LaunchDarkly': { bg: 'rgba(60, 60, 60, 0.2)',    text: '#a0a0a0', border: 'rgba(160, 160, 160, 0.2)' },
  'Supabase':    { bg: 'rgba(62, 207, 142, 0.14)',  text: '#3ecf8e', border: 'rgba(62, 207, 142, 0.28)' },
  'Firebase':    { bg: 'rgba(255, 196, 0, 0.14)',   text: '#ffc400', border: 'rgba(255, 196, 0, 0.28)' },
  'Selenium':    { bg: 'rgba(67, 176, 42, 0.14)',   text: '#43b02a', border: 'rgba(67, 176, 42, 0.28)' },
  'NumPy':       { bg: 'rgba(77, 119, 207, 0.14)',  text: '#4d77cf', border: 'rgba(77, 119, 207, 0.28)' },
  'Pandas':      { bg: 'rgba(21, 2, 101, 0.2)',     text: '#a0a0e0', border: 'rgba(160, 160, 224, 0.25)' },
  'scikit-learn': { bg: 'rgba(249, 130, 57, 0.14)', text: '#f98239', border: 'rgba(249, 130, 57, 0.28)' },
};

// Rotating bright fallback palette for unknown techs
const fallbackColors = [
  { bg: 'rgba(255, 107, 107, 0.14)', text: '#ff6b6b', border: 'rgba(255, 107, 107, 0.28)' },
  { bg: 'rgba(78, 205, 196, 0.14)',  text: '#4ecdc4', border: 'rgba(78, 205, 196, 0.28)' },
  { bg: 'rgba(255, 230, 109, 0.14)', text: '#ffe66d', border: 'rgba(255, 230, 109, 0.28)' },
  { bg: 'rgba(168, 130, 255, 0.14)', text: '#a882ff', border: 'rgba(168, 130, 255, 0.28)' },
  { bg: 'rgba(255, 159, 67, 0.14)',  text: '#ff9f43', border: 'rgba(255, 159, 67, 0.28)' },
  { bg: 'rgba(0, 210, 211, 0.14)',   text: '#00d2d3', border: 'rgba(0, 210, 211, 0.28)' },
];

function getTechColor(tech: string): { bg: string; text: string; border: string } {
  // Direct match
  if (techColors[tech]) return techColors[tech];
  // Partial match (e.g. "AWS (S3, DynamoDB, Lambda, CloudWatch)" → "AWS")
  const key = Object.keys(techColors).find(k => tech.toLowerCase().includes(k.toLowerCase()));
  if (key) return techColors[key];
  // Fallback: deterministic color based on string hash
  let hash = 0;
  for (let i = 0; i < tech.length; i++) hash = ((hash << 5) - hash + tech.charCodeAt(i)) | 0;
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

const projects = [
  {
    id: 1,
    title: "QuantZoo",
    description: "A production-grade Python framework for systematic quantitative trading research. QuantZoo provides an end-to-end pipeline from strategy ideation through backtesting, walk-forward validation, and live paper trading — all with built-in risk analytics and a real-time streaming dashboard. The framework supports custom strategy plugins, ML-based signal generation with PyTorch, and sentiment analysis via Hugging Face transformers, making it a complete toolkit for exploring and validating systematic trading ideas.",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    coverImage: "/trading.png",
    repoUrl: "https://github.com/ronnielgandhe/quantzoo",
    language: "Python",
    files: ["README.md", "architecture.md", "backend.md", "frontend.md", "impact.md", "takeaways.md"],
    detail: {
      type: 'project' as const,
      id: 1,
      title: "QuantZoo",
      gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      coverImage: "/trading.png",
      architecture: "QuantZoo is structured as a modular monorepo with clearly separated concerns. At its core sits a plugin-based Strategy Engine that loads strategy modules at runtime, allowing researchers to drop in new algorithms without touching framework code. The backtesting engine operates on vectorized NumPy/Pandas operations rather than row-by-row iteration, achieving 10-50x speedups on large datasets. Walk-forward validation runs configurable rolling windows with strict temporal boundaries to prevent look-ahead bias — each window trains on N months of history and validates on the next M months, then rolls forward. The FastAPI backend exposes REST endpoints for strategy management and WebSocket channels for real-time streaming of portfolio metrics, P&L curves, and risk dashboards. A lightweight React frontend renders live charts and trade logs. Data ingestion supports multiple providers (Yahoo Finance, Alpha Vantage, custom CSV) through a unified DataFeed interface.",
      technicalChallenges: [
        "Preventing look-ahead bias in walk-forward validation required building a strict temporal isolation layer — each validation window gets a read-only snapshot of data up to its cutoff date, and the framework raises exceptions if any strategy tries to access future data",
        "Achieving sub-second latency on the real-time streaming pipeline meant moving from a polling architecture to WebSocket push with delta compression — only changed fields are transmitted, reducing payload size by ~80%",
        "The plugin architecture needed to support strategies ranging from simple moving-average crossovers to complex multi-asset ML models, which required a flexible interface contract that standardizes signal generation while allowing arbitrary internal state management",
        "Integrating PyTorch models for signal generation within the backtesting loop without introducing memory leaks required careful tensor lifecycle management and explicit GPU memory clearing between validation windows"
      ],
      lessonsLearned: [
        "Vectorized backtesting is not just faster — it forces you to think about your strategy logic differently, often revealing subtle bugs that loop-based approaches hide behind sequential state mutations",
        "Financial data is deceptively messy: timezone misalignment, split adjustments, survivorship bias, and missing data points each required dedicated preprocessing pipelines with extensive validation",
        "Walk-forward validation is the single most important tool for honest strategy evaluation — strategies that looked profitable in simple train/test splits regularly fell apart under rolling validation",
        "A clean plugin interface pays for itself many times over — QuantZoo went from supporting 3 strategies to 15+ in the same time it took to build the original 3, because the abstraction made new strategies trivial to add"
      ],
      techStack: ["Python", "PyTorch", "Hugging Face", "FastAPI", "NumPy", "Pandas", "WebSocket"],
      repoUrl: "https://github.com/ronnielgandhe/quantzoo",
      sections: [
        {
          title: "Architecture",
          content: "QuantZoo follows a layered architecture with four main subsystems:\n\n**Data Layer** — A unified DataFeed interface abstracts away data providers (Yahoo Finance, Alpha Vantage, CSV files). Raw market data flows through a normalization pipeline that handles timezone alignment, stock split adjustments, and missing data interpolation before landing in an in-memory columnar store optimized for vectorized access.\n\n**Strategy Engine** — The plugin-based core where trading logic lives. Each strategy implements a standard interface (generate_signals, calculate_position_sizes, on_fill) but has full freedom in its internal implementation. Strategies can be pure rule-based, ML-driven, or hybrid. The engine manages strategy lifecycle, parameter injection, and inter-strategy communication for portfolio-level strategies.\n\n**Backtesting & Validation** — The backtesting engine processes strategies against historical data using vectorized NumPy operations. Walk-forward validation wraps the backtester in configurable rolling windows with strict temporal isolation. The validation harness outputs per-window metrics, aggregate performance statistics, and overfitting diagnostics.\n\n**Streaming & Dashboard** — FastAPI serves REST endpoints for strategy CRUD and WebSocket channels for real-time data. The React frontend consumes these streams to render live P&L curves, drawdown charts, position heat maps, and trade logs with sub-second update latency."
        },
        {
          title: "Backend",
          content: "The Python backend is organized around three core packages:\n\n**quantzoo.core** — Contains the Strategy base class, the Portfolio manager (tracks positions, cash, and P&L), the RiskEngine (calculates Sharpe, Sortino, max drawdown, VaR in real-time), and the EventBus for decoupled component communication.\n\n**quantzoo.data** — Implements the DataFeed protocol and provider adapters. Includes a TimeSeriesStore that maintains aligned, gap-filled OHLCV data with configurable resampling. The store supports efficient slicing for walk-forward windows without copying data.\n\n**quantzoo.backtest** — The vectorized backtesting engine that processes entire signal arrays at once rather than iterating bar-by-bar. Position sizing, slippage modeling, and commission calculations are all vectorized. The WalkForwardRunner orchestrates multi-window validation with parallel execution support via Python's multiprocessing.\n\nFastAPI handles the API layer with Pydantic models for request/response validation, background tasks for long-running backtests, and WebSocket managers for streaming real-time metrics to connected dashboard clients."
        },
        {
          title: "Frontend",
          content: "The dashboard is a lightweight React application focused on real-time data visualization:\n\n**Live Charts** — P&L equity curves, drawdown charts, and volatility cones update in real-time via WebSocket subscriptions. Charts use lightweight canvas rendering to handle thousands of data points without frame drops.\n\n**Trade Log** — A scrolling feed of executed trades with entry/exit prices, P&L per trade, and holding duration. Each trade links back to the signal that generated it for debugging strategy logic.\n\n**Risk Dashboard** — Real-time risk metrics including rolling Sharpe ratio, current drawdown, Value at Risk (95% and 99%), and position concentration heat maps. Visual alerts trigger when risk thresholds are breached.\n\n**Strategy Manager** — Interface for loading strategies, configuring parameters, launching backtests, and comparing results across multiple strategy variants side-by-side."
        },
        {
          title: "Impact",
          content: "QuantZoo served as both a learning vehicle and a practical research tool:\n\n**Research Velocity** — The plugin architecture and walk-forward validation framework reduced the time from strategy idea to validated backtest from days to hours. Over 15 strategy variants were tested and compared using the framework.\n\n**Honest Evaluation** — Walk-forward validation exposed overfitting in strategies that appeared profitable under naive backtesting. Several strategies that showed 40%+ annual returns in simple backtests degraded to breakeven or negative returns under rolling validation — a critical finding that would have been missed without the framework.\n\n**Technical Depth** — Building QuantZoo required working across financial modeling, systems programming, real-time streaming, and machine learning — providing deep exposure to each domain and how they interact in production quantitative systems."
        },
        {
          title: "Takeaways",
          content: "Key lessons from building QuantZoo:\n\n**Abstractions matter more than algorithms.** The plugin-based strategy engine was the highest-leverage decision in the project. A clean interface contract meant new strategies could be written and tested in hours, while framework improvements automatically benefited all existing strategies.\n\n**Financial data demands paranoia.** Every assumption about data quality is wrong until proven otherwise. Timezone misalignment caused phantom trades, missing split adjustments inflated returns by 10-20%, and survivorship bias in index constituents made historical comparisons unreliable. Each issue required a dedicated preprocessing step with validation checks.\n\n**Vectorization is a design philosophy, not just an optimization.** Rewriting the backtester from loop-based to vectorized operations was not a simple refactor — it required fundamentally rethinking how strategy state is managed. The payoff was a 30x performance improvement and, unexpectedly, cleaner and more testable code.\n\n**Real-time systems need backpressure.** The initial WebSocket implementation would overwhelm slow clients during high-volatility periods. Adding delta compression and client-side throttling reduced bandwidth by 80% and eliminated dropped connections."
        }
      ]
    } satisfies ProjectDetail
  },
  {
    id: 2,
    title: "CreatorScope",
    description: "A go-to-market automation tool designed to help brands discover and evaluate TikTok creators for partnerships at scale. CreatorScope combines multi-source creator discovery, intelligent three-tier classification (Pass / Review / Filter), and a proprietary Creator Intent Score (0-100) that predicts how likely a creator is to accept brand deals. The tool manages API budgets of 50-400 calls per search session while maximizing discovery coverage across niches, and ships with pre-built presets for common verticals like fitness, beauty, tech, and food.",
    gradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)",
    coverImage: "/cover.png",
    repoUrl: "https://github.com/ronnielgandhe/creatorscope",
    language: "Python",
    files: ["README.md", "architecture.md", "scoring engine.md", "discovery pipeline.md", "impact.md", "takeaways.md"],
    detail: {
      type: 'project' as const,
      id: 2,
      title: "CreatorScope",
      gradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)",
      coverImage: "/cover.png",
      demoVideo: "/creatorscope-demo.mov",
      architecture: "CreatorScope is built as a FastAPI monolith with a SQLAlchemy ORM layer backed by SQLite for persistence. The system is organized into three main pipelines: Discovery, Classification, and Scoring. Discovery uses background task workers to fan out API calls across RapidAPI's TikTok scraper endpoints, collecting creator profiles, video metadata, and engagement metrics. The Classification pipeline runs a configurable three-tier filter (Pass / Review / Filter) based on follower thresholds, engagement rates, content category matching, and posting frequency. Creators that pass classification enter the Scoring pipeline, which computes the Creator Intent Score — a weighted composite metric (0-100) that predicts brand deal receptiveness based on signals like bio keywords, prior sponsorship mentions, engagement authenticity, and content consistency. The single-page frontend polls the backend for real-time progress and renders results in a sortable, filterable dashboard.",
      technicalChallenges: [
        "API budget optimization was the central engineering challenge — with paid API calls ranging from 50-400 per session, every call needed to maximize information gain. The solution was a cascading discovery strategy: start with broad niche searches, identify high-potential clusters, then selectively deep-dive into promising creator profiles rather than exhaustively scraping",
        "Building the Creator Intent Score required defining and weighting signals that predict brand deal openness without direct data. Signals like 'email in bio,' 'prior #ad or #sponsored tags,' 'consistent posting cadence,' and 'engagement rate vs. follower count ratio' each contribute to the composite score, with weights tuned through manual evaluation against known brand-friendly creators",
        "Async scraping with reliable error recovery was tricky — RapidAPI endpoints have variable latency (200ms to 5s), intermittent 429s, and occasionally return malformed data. The retry system uses exponential backoff with jitter, circuit-breaker patterns for sustained failures, and graceful degradation that marks partially-scraped creators for later completion",
        "The three-tier classification needed to handle edge cases where creators straddle category boundaries — a fitness creator who also posts cooking content, for example. The solution uses soft category matching with weighted overlap rather than hard category assignment"
      ],
      lessonsLearned: [
        "API budget management is a first-class engineering concern when building on paid external APIs — treating calls as a finite resource fundamentally changes how you design discovery algorithms and prioritize which data to fetch",
        "Three-tier classification (Pass / Review / Filter) is vastly more practical than binary pass/fail — the Review tier captures borderline creators that a human should evaluate, reducing both false positives and false negatives",
        "Pre-built niche presets (fitness, beauty, tech, food, travel) dramatically improved the user experience — non-technical brand managers could run sophisticated discovery sessions with a single click instead of manually configuring search parameters",
        "Composite scoring metrics need explainability — when a creator scores 73/100, users want to know why. Breaking the score into visible sub-components (engagement quality, brand signals, content consistency) built trust in the tool's recommendations"
      ],
      techStack: ["Python", "FastAPI", "SQLAlchemy", "SQLite", "RapidAPI", "HTML/CSS/JS"],
      repoUrl: "https://github.com/ronnielgandhe/creatorscope",
      sections: [
        {
          title: "Architecture",
          content: "CreatorScope follows a pipeline architecture with three sequential stages:\n\n**Discovery Pipeline** — Fans out API calls to TikTok scraper endpoints via RapidAPI. Uses a cascading strategy: broad niche keyword searches first, then targeted profile lookups for high-potential creators identified in the initial sweep. Background workers managed by FastAPI's BackgroundTasks handle the async I/O, with a shared progress tracker that the frontend polls for real-time updates.\n\n**Classification Pipeline** — Applies a configurable three-tier filter to discovered creators. Tier 1 (Pass) creators meet all threshold criteria: minimum follower count, engagement rate above baseline, content category match, and recent posting activity. Tier 2 (Review) captures borderline cases for human evaluation. Tier 3 (Filter) removes creators who clearly don't fit. Thresholds are adjustable per niche preset.\n\n**Scoring Pipeline** — Computes the Creator Intent Score for all Pass and Review creators. The score aggregates weighted signals into a 0-100 composite metric stored alongside the creator profile in SQLite via SQLAlchemy models.\n\nThe frontend is a single-page vanilla HTML/CSS/JS application that communicates with the FastAPI backend over REST endpoints, using polling for real-time progress during active discovery sessions."
        },
        {
          title: "Scoring Engine",
          content: "The Creator Intent Score is the core differentiator of CreatorScope. It predicts how receptive a creator will be to brand partnerships on a 0-100 scale.\n\n**Signal Components:**\n- Bio Signals (25% weight) — Presence of business email, 'DM for collabs' language, link-in-bio to management/agency\n- Sponsorship History (30% weight) — Prior use of #ad, #sponsored, #partner hashtags, @brand mentions in captions\n- Engagement Quality (20% weight) — Ratio of engagement rate to follower count, comment sentiment analysis, like-to-view ratio\n- Content Consistency (15% weight) — Posting frequency, niche adherence over last 30 posts, content quality signals\n- Growth Trajectory (10% weight) — Follower growth rate, trending content indicators\n\n**Calibration:** Weights were tuned by manually labeling ~200 creators as 'brand-friendly' or 'not interested' based on public information, then iterating on the weight distribution until the score ranked the labeled set correctly. The system achieves strong separation between known brand-friendly creators (typically scoring 65+) and creators with no brand interest (typically scoring below 35).\n\n**Explainability:** Each sub-score is stored and displayed alongside the composite, so users can understand exactly why a creator received their score and make informed decisions about borderline cases."
        },
        {
          title: "Discovery Pipeline",
          content: "The discovery system is designed to maximize creator coverage within a fixed API budget:\n\n**Budget Allocation Strategy:**\n- Phase 1 (40% of budget): Broad niche keyword searches to identify the creator landscape. Uses the niche preset's keyword list to run hashtag and keyword searches, collecting creator IDs and basic metrics.\n- Phase 2 (35% of budget): Targeted profile deep-dives for creators that passed initial engagement thresholds. Fetches full profile data, recent video metadata, and engagement breakdowns.\n- Phase 3 (25% of budget): Related creator expansion — for top-scoring profiles, fetches 'suggested creators' and 'similar accounts' to discover adjacent creators the keyword search might have missed.\n\n**Rate Limit Management:** API calls are dispatched through a rate limiter that respects RapidAPI's per-second and per-minute quotas. A circuit breaker trips after 3 consecutive failures, pausing that endpoint for 30 seconds before retrying. Failed calls are queued for retry with exponential backoff.\n\n**Niche Presets:** Pre-configured discovery profiles for common verticals. Each preset includes curated keyword lists, follower range targets, minimum engagement thresholds, and content category filters. Presets for fitness, beauty, tech, food, and travel are included out of the box, with support for custom presets."
        },
        {
          title: "Impact",
          content: "CreatorScope was built to solve a real pain point in influencer marketing:\n\n**Problem Solved** — Brand partnership teams typically spend hours manually browsing TikTok, evaluating creators one-by-one based on gut feeling. CreatorScope automates the discovery and initial evaluation, surfacing a ranked, scored list of potential partners in minutes rather than days.\n\n**Scale** — A single discovery session processes 50-400 creators (depending on API budget), classifies them into actionable tiers, and scores the top candidates — work that would take a human team an entire day compressed into a 5-10 minute automated run.\n\n**Decision Quality** — The Creator Intent Score provides a data-driven basis for outreach prioritization. Instead of reaching out to creators based on follower count alone, brands can target creators with high intent scores who are statistically more likely to respond positively to partnership inquiries."
        },
        {
          title: "Takeaways",
          content: "Lessons from building a data product on top of third-party APIs:\n\n**Treat API calls as a scarce resource.** When every API call costs money, you architect differently. CreatorScope's cascading discovery strategy — broad sweeps first, targeted deep-dives second — was born from budget constraints, but it actually produced better results than exhaustive scraping because it focused resources on high-potential creators.\n\n**Classification needs a middle tier.** Binary pass/fail classification forces bad decisions on borderline cases. The three-tier system (Pass / Review / Filter) acknowledges uncertainty and routes ambiguous creators to human judgment, which is where humans actually add value in the pipeline.\n\n**Scoring metrics need to be transparent.** A black-box score that says '73/100' is far less useful than a breakdown showing 'high engagement quality, strong brand signals, moderate posting consistency.' Users trust transparent metrics and can override them intelligently when they have domain knowledge the algorithm lacks.\n\n**Presets are product leverage.** The niche presets took relatively little engineering effort but had an outsized impact on usability. They transformed the tool from something that required API and marketing expertise to configure into something a brand manager could use productively in their first session."
        }
      ]
    } satisfies ProjectDetail
  },
  {
    id: 3,
    title: "YourNews",
    description: "An AI-powered personalized news aggregator that learns what you care about and surfaces the stories that matter most. YourNews combines a hybrid TF-IDF/BM25 ranking pipeline with GPT-4 summaries and a click-feedback personalization system that adapts to your reading habits over time. A smart query classifier distinguishes between navigational searches ('CNN homepage') and informational queries ('climate change policy'), routing each to the optimal ranking strategy. The result is a news experience that feels hand-curated without requiring any explicit preference configuration.",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d1f3d 50%, #1a1a2e 100%)",
    coverImage: "/yournews-cover.png",
    repoUrl: "https://github.com/ronnielgandhe/yournews",
    language: "Python",
    files: ["README.md", "architecture.md", "ranking pipeline.md", "personalization.md", "impact.md", "takeaways.md"],
    detail: {
      type: 'project' as const,
      id: 3,
      title: "YourNews",
      gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d1f3d 50%, #1a1a2e 100%)",
      coverImage: "/yournews-cover.png",
      demoVideo: "/yournews-demo.mp4",
      architecture: "YourNews is built around a three-stage pipeline: Ingestion, Ranking, and Personalization. The Ingestion layer aggregates articles from multiple RSS feeds and news APIs, deduplicates near-identical stories using cosine similarity on TF-IDF vectors, and stores normalized articles in a document store. The Ranking layer implements a hybrid TF-IDF/BM25 scorer — TF-IDF captures broad topical relevance while BM25 handles keyword-specific precision, with a learned interpolation weight that adjusts based on query type. A smart query classifier (trained on labeled query examples) detects whether a query is navigational or informational and routes it to the appropriate ranking strategy. The Personalization layer maintains per-user interest profiles built from click-feedback signals, applying a lightweight re-ranking pass that boosts articles matching the user's demonstrated interests while applying diversity penalties to prevent filter bubbles. GPT-4 generates concise summaries for top-ranked articles, with a caching layer to minimize API costs.",
      technicalChallenges: [
        "Balancing TF-IDF and BM25 scoring required building a query-adaptive interpolation system — informational queries weight BM25 more heavily (better for specific keyword matching) while navigational queries lean on TF-IDF (better for topical relevance). The interpolation weights were learned from a labeled dataset of 500+ query-result pairs",
        "Click-feedback personalization had a cold-start problem: new users have no click history to build a profile from. The solution was a two-phase approach — start with a topic-category onboarding step that initializes a coarse preference vector, then gradually transition to fine-grained click-based personalization as interaction data accumulates",
        "Preventing filter bubbles required explicit diversity injection into the re-ranking step. Without it, the personalization feedback loop would converge users onto an increasingly narrow set of topics. The diversity penalty ensures that even strongly personalized feeds contain 20-30% of articles outside the user's primary interest areas",
        "GPT-4 summarization costs scaled linearly with article volume, so a multi-tier caching strategy was essential — in-memory cache for hot articles, disk cache for recent articles, and pre-computed summaries for trending stories that many users would see"
      ],
      lessonsLearned: [
        "Hybrid ranking consistently outperforms either TF-IDF or BM25 alone, but the interpolation weights matter enormously — a fixed 50/50 split performed worse than either individual method. Query-adaptive weighting was the key breakthrough",
        "Personalization is a double-edged sword: without diversity penalties, click-feedback loops converge to filter bubbles within 20-30 interactions. Building diversity injection from day one is far easier than retrofitting it later",
        "Smart query classification (navigational vs. informational) is a high-leverage feature that dramatically improves result quality with relatively little engineering effort — most search systems treat all queries identically and suffer for it",
        "API cost management for LLM-powered features requires thinking about caching as a first-class architectural concern, not an optimization to add later. The caching layer for GPT-4 summaries reduced costs by approximately 70%"
      ],
      techStack: ["Python", "GPT-4 API", "TF-IDF", "BM25", "FastAPI", "React"],
      repoUrl: "https://github.com/ronnielgandhe/yournews",
      sections: [
        {
          title: "Architecture",
          content: "YourNews is structured as a three-stage pipeline with clear boundaries between each stage:\n\n**Ingestion Layer** — Pulls articles from configurable RSS feeds and news APIs on a scheduled cadence. Incoming articles pass through a deduplication filter that computes TF-IDF vectors and flags near-duplicates (cosine similarity > 0.85) for merging. Deduplicated articles are normalized (title, body, source, timestamp, category) and stored in the document store.\n\n**Ranking Layer** — The core search and ranking engine. When a user submits a query, the smart query classifier first categorizes it as navigational or informational. The hybrid ranker then scores all candidate articles using a weighted combination of TF-IDF and BM25, with interpolation weights set by the query type. Top results are passed to the personalization layer for re-ranking.\n\n**Personalization Layer** — Applies per-user interest profiles to re-rank results. Profiles are vectors in topic-category space, updated incrementally on each click interaction. A diversity penalty ensures feed variety. GPT-4 summaries are generated for top-5 results per query, with multi-tier caching to control costs.\n\nFastAPI serves the backend API, and a React frontend provides the search interface and personalized news feed."
        },
        {
          title: "Ranking Pipeline",
          content: "The ranking pipeline is the heart of YourNews and combines two complementary scoring methods:\n\n**TF-IDF Scoring** — Computes term frequency-inverse document frequency vectors for the full article corpus. Effective at capturing broad topical relevance — an article about 'climate policy' will score well for queries about 'environmental regulation' even without exact keyword matches. The TF-IDF index is rebuilt incrementally as new articles are ingested.\n\n**BM25 Scoring** — A probabilistic ranking function that excels at precise keyword matching with diminishing returns for term frequency. Better than TF-IDF for specific factual queries where exact terminology matters.\n\n**Hybrid Interpolation** — The final relevance score is a weighted combination: score = alpha * TF-IDF + (1 - alpha) * BM25. The key insight is that alpha should not be fixed — it varies by query type. Informational queries ('how does carbon capture work') use alpha=0.35 (BM25-heavy), while navigational queries ('New York Times tech section') use alpha=0.7 (TF-IDF-heavy). Alpha values were learned from a labeled evaluation set of 500+ queries.\n\n**Query Classifier** — A lightweight text classifier trained on labeled query examples that categorizes incoming queries as navigational or informational. Features include query length, presence of entity names, question words, and specificity indicators. Routes each query to the appropriate alpha value."
        },
        {
          title: "Personalization",
          content: "The personalization system learns user preferences from reading behavior without requiring explicit configuration:\n\n**Interest Profiles** — Each user has a vector in topic-category space (politics, technology, sports, science, business, entertainment, health, etc.). Vector dimensions are updated incrementally: when a user clicks an article, the article's category weights are added to the user's profile vector with a decay-weighted running average. Recent clicks influence the profile more than older ones.\n\n**Cold Start Solution** — New users see a brief topic selection screen that initializes their preference vector. This coarse initialization is enough to provide noticeably personalized results from the first query. As click data accumulates, the explicit preferences are gradually blended with and eventually superseded by the behavioral signal.\n\n**Diversity Injection** — To prevent filter bubbles, the re-ranking step reserves 20-30% of result slots for articles outside the user's top interest categories. This is implemented as a diversity penalty that reduces the score of articles too similar to other results already in the list (Maximal Marginal Relevance). The diversity ratio is tunable per user.\n\n**Click-Feedback Loop** — Each article click is logged with context (query, rank position, time spent). The system distinguishes between engagement signals (long reads, return visits) and noise (accidental clicks, quick bounces) to keep the preference vector clean."
        },
        {
          title: "Impact",
          content: "YourNews demonstrates that personalized information retrieval does not require massive infrastructure:\n\n**Personalization Without Scale** — Most personalized news systems rely on millions of users for collaborative filtering. YourNews achieves meaningful personalization for individual users through content-based profiling and click-feedback, making it viable even for single-user deployments.\n\n**Ranking Quality** — The hybrid TF-IDF/BM25 approach with query-adaptive weighting consistently outperformed either method alone in evaluation. On the labeled query set, the hybrid ranker improved NDCG@10 by 15-20% over the better of the two individual methods.\n\n**Cost-Effective AI Summaries** — The multi-tier caching strategy for GPT-4 summaries reduced API costs by ~70% while maintaining summary freshness for trending articles. This proved that LLM-powered features can be economically viable with thoughtful caching architecture."
        },
        {
          title: "Takeaways",
          content: "Building a personalized ranking system taught several non-obvious lessons:\n\n**Hybrid ranking needs query awareness.** Combining TF-IDF and BM25 with fixed weights actually performed worse than either method alone for certain query types. The breakthrough was making the interpolation weights query-dependent — a simple idea that required building a query classifier, but delivered the best overall ranking quality.\n\n**Personalization must fight its own success.** Left unchecked, click-feedback personalization creates a self-reinforcing loop that narrows the user's information diet. Diversity injection is not optional — it is a core component of any responsible personalization system. Building it in from the start is vastly easier than adding it after users notice their feeds getting stale.\n\n**Cache everything that touches an LLM.** GPT-4 summaries are expensive and often requested for the same articles by different users. A three-tier caching strategy (memory, disk, pre-computed) was the difference between a prototype-only feature and something economically viable.\n\n**Query classification is underrated.** Most search tutorials treat all queries the same. In practice, users issue fundamentally different types of queries (navigational vs. informational), and routing them to different ranking strategies is one of the highest-leverage improvements you can make."
        }
      ]
    } satisfies ProjectDetail
  },
  {
    id: 4,
    title: "How Many Clicks",
    description: "A Wikipedia pathfinding game where you race against an AI to connect two random articles using only hyperlinks. The AI uses a custom beam search algorithm with semantic scoring, hub page recognition, and related-term expansion to find efficient paths — then you try to beat it. The game visualizes the AI's journey in real-time, showing which links it considered, why it chose each hop, and how its semantic understanding of the target guided its decisions. Built entirely in the browser with React and the Wikipedia MediaWiki API, no backend required.",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a1a2e 100%)",
    coverImage: "/howmanyclicks-cover.png",
    repoUrl: "https://github.com/ronnielgandhe/how-many-clicks",
    language: "JavaScript",
    files: ["README.md", "architecture.md", "pathfinding.md", "game design.md", "impact.md", "takeaways.md"],
    detail: {
      type: 'project' as const,
      id: 4,
      title: "How Many Clicks",
      gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #1a1a2e 100%)",
      coverImage: "/howmanyclicks-cover.png",
      demoVideo: "/howmanyclicks-demo.mp4",
      architecture: "How Many Clicks is an entirely client-side React application bundled with Vite — no backend, no database, no server costs. All pathfinding runs in the browser using the Wikipedia MediaWiki API for article content and link extraction. The core algorithm is a beam search that maintains a frontier of the K most promising articles at each step, scoring each outgoing link based on semantic similarity to the target article. The scoring system combines keyword overlap, related-term expansion (generated from the target article's content), and a hub recognition system that identifies high-connectivity 'bridge' articles (like 'United States,' 'Europe,' 'Science') and strategically uses or avoids them depending on context. Two difficulty modes are available: Normal mode uses a narrow beam (K=3) for more human-like exploration, while God Mode widens the beam (K=8) and enables aggressive related-term expansion for faster, more optimal paths. The game UI renders the AI's journey in real-time with article thumbnail previews, link-by-link reasoning annotations, and an interactive path visualization.",
      technicalChallenges: [
        "The semantic scoring function had to work without any NLP models in the browser — no word embeddings, no transformers, just raw text comparison. The solution uses a multi-signal approach: exact keyword matches, stemmed keyword overlap, related-term expansion from the target article's content, and category-based similarity inferred from Wikipedia categories. This lightweight approach achieves surprisingly good pathfinding with zero model inference",
        "Hub article recognition was critical for pathfinding quality. Articles like 'United States' or 'World War II' link to thousands of other articles and act as bridges between unrelated topics. The algorithm maintains a dynamic hub score based on outgoing link count and topic breadth — it uses hubs strategically when stuck but penalizes them when better semantic paths are available, preventing the degenerate strategy of always routing through 'United States'",
        "Real-time visualization of the AI's decision process required careful state management — each step of the beam search needs to be rendered with the articles considered, scores assigned, and reasoning for the chosen path. This meant making the pathfinding algorithm yield intermediate results rather than running to completion, using an async generator pattern that plays nicely with React's rendering cycle",
        "Wikipedia API rate limiting in the browser was a constraint — the MediaWiki API throttles unauthenticated requests, so the pathfinding algorithm needed to minimize API calls. Caching article link data, batching link-extraction requests, and pruning the search frontier aggressively were all necessary to keep the game responsive"
      ],
      lessonsLearned: [
        "Beam search with semantic scoring dramatically outperforms naive BFS for Wikipedia navigation — BFS treats all links as equal and quickly explodes to thousands of nodes, while beam search focuses on the most promising paths and typically finds connections in 4-6 hops",
        "Related-term expansion is the secret weapon for finding non-obvious paths. When searching for a path to 'Jazz Music,' expanding the target terms to include 'New Orleans,' 'improvisation,' 'saxophone,' and 'blues' helps the algorithm recognize relevant links that do not contain the word 'jazz'",
        "Entirely client-side applications can deliver rich, interactive experiences without any backend infrastructure — the trade-off is working within browser API rate limits and bundle size constraints, but the benefit is zero operational costs and instant deployment",
        "Gamification transforms a technical demo into something people actually want to use. The competitive element of racing the AI made people engage with the pathfinding visualization in a way that a standalone algorithm demo never would"
      ],
      techStack: ["React", "Vite", "JavaScript", "Wikipedia API", "CSS Animations"],
      repoUrl: "https://github.com/ronnielgandhe/how-many-clicks",
      sections: [
        {
          title: "Architecture",
          content: "How Many Clicks is a zero-backend React application with all logic running in the browser:\n\n**Application Layer** — React components manage game state (article selection, turn tracking, score comparison), user navigation through Wikipedia articles, and the AI pathfinding visualization. Vite handles bundling with hot module replacement for development.\n\n**Wikipedia API Layer** — A thin client wrapper around the MediaWiki API handles article content fetching, link extraction, and search. Includes request batching (up to 50 titles per API call), response caching with LRU eviction, and automatic retry with backoff for rate-limited requests.\n\n**Pathfinding Engine** — The beam search algorithm runs as an async generator, yielding intermediate results at each step for real-time visualization. The engine is decoupled from the UI through a clean interface: it accepts a start article, target article, and configuration (beam width, mode), and yields step-by-step results including considered links, scores, and the chosen path.\n\n**Visualization Layer** — Renders the AI's journey as an animated path with article previews, score annotations, and reasoning commentary. CSS animations handle transitions between steps, and the path visualization uses SVG for connection lines between article nodes."
        },
        {
          title: "Pathfinding",
          content: "The pathfinding algorithm is a semantically-guided beam search customized for Wikipedia's link graph:\n\n**Beam Search Core** — At each step, the algorithm fetches all outgoing links from the current frontier articles, scores each link against the target, and keeps the top-K scoring links as the new frontier. K=3 for Normal mode, K=8 for God Mode.\n\n**Semantic Scoring** — Each candidate link is scored by combining multiple signals:\n- Direct keyword match (40% weight): Does the link text or target article title contain keywords from the target?\n- Stemmed overlap (25% weight): Stemmed versions of link terms matched against stemmed target terms\n- Related-term match (25% weight): Match against an expanded term set generated from the target article's opening paragraph\n- Category proximity (10% weight): Wikipedia categories shared between the candidate and target articles\n\n**Hub Recognition** — The algorithm maintains a dynamic hub database of high-connectivity articles. When the frontier is stuck (no links score above a threshold), hub articles are temporarily prioritized as 'escape hatches' to reach a different region of the link graph. When good semantic paths are available, hubs are penalized to avoid degenerate shortest paths that route everything through 'United States.'\n\n**Related-Term Expansion** — Before pathfinding begins, the algorithm analyzes the target article's first paragraph to extract related terms, synonyms, and associated concepts. For a target of 'Jazz,' the expanded set might include: 'New Orleans,' 'improvisation,' 'blues,' 'swing,' 'bebop,' 'saxophone,' 'Louis Armstrong.' This dramatically improves the algorithm's ability to recognize relevant links that do not explicitly mention the target topic."
        },
        {
          title: "Game Design",
          content: "The game design turns a pathfinding algorithm into a compelling competitive experience:\n\n**Game Flow** — Two random Wikipedia articles are selected. The AI pathfinder runs first, with its journey visualized step-by-step in real time. Once the AI finishes, the user is shown the AI's path length and challenged to match or beat it by manually navigating Wikipedia links.\n\n**Difficulty Modes:**\n- Normal Mode: AI uses beam width K=3 with standard scoring. Produces human-like paths that are challenging but beatable. The AI typically finds paths of 4-6 hops.\n- God Mode: AI uses beam width K=8 with aggressive related-term expansion and wider semantic matching. Produces near-optimal paths that are very difficult to beat. Fun for experienced players.\n\n**Journey Visualization** — As the AI searches, each step is animated: the current article is shown with a preview snippet, considered links are briefly displayed with their scores, and the chosen link animates into the path. Commentary text explains the AI's reasoning ('Chose \\'Industrial Revolution\\' because it connects manufacturing to the target topic of \\'Steam Engine\\'').\n\n**Scoring** — Players are scored on path length (fewer clicks = better), with bonus recognition for beating the AI. The game tracks personal bests and encourages replaying with different article pairs."
        },
        {
          title: "Impact",
          content: "How Many Clicks demonstrates that sophisticated AI concepts can be made accessible through games:\n\n**Engagement** — The competitive framing makes people genuinely invested in understanding how the pathfinding works. Players naturally develop intuitions about semantic similarity, hub articles, and graph traversal simply by trying to beat the AI.\n\n**Zero Infrastructure** — Running entirely in the browser means zero hosting costs, zero DevOps, and instant deployment via any static hosting provider. The trade-off (Wikipedia API rate limits) is manageable with caching and request batching.\n\n**Educational Value** — The real-time visualization of beam search decisions serves as an intuitive introduction to graph search algorithms, heuristic scoring, and the structure of Wikipedia's link graph — concepts that are typically taught through dry textbook examples."
        },
        {
          title: "Takeaways",
          content: "Key lessons from building a game around a pathfinding algorithm:\n\n**Lightweight NLP can be surprisingly effective.** Without access to word embeddings or language models in the browser, the multi-signal scoring approach (keyword matching, stemming, related-term expansion, category proximity) achieves pathfinding quality that feels intelligent. Sophisticated NLP is not always necessary when you can combine multiple simple signals thoughtfully.\n\n**Hub recognition is essential for graph navigation.** Without it, the algorithm degenerates to routing everything through a handful of super-connected articles. The dynamic hub scoring system — use hubs when stuck, penalize them when better paths exist — was the key to producing interesting, diverse paths.\n\n**Async generators are perfect for visualizable algorithms.** Making the beam search yield intermediate results at each step, rather than returning only the final path, enabled real-time visualization with minimal architectural complexity. The generator pattern separated algorithm logic from rendering concerns cleanly.\n\n**Games make algorithms sticky.** A standalone beam search demo would get a few minutes of attention. Wrapping it in a competitive game with scoring, personal bests, and real-time visualization makes people spend 20-30 minutes exploring how the algorithm works. Gamification is an underrated tool for making technical concepts engaging."
        }
      ]
    } satisfies ProjectDetail
  }
];

// File icon by extension/name
function getFileIcon(name: string): { icon: string; color: string } {
  if (name === 'README.md') return { icon: 'M', color: '#519aba' };
  if (name.endsWith('.md')) return { icon: 'M', color: '#519aba' };
  if (name.endsWith('.py')) return { icon: 'Py', color: '#3572A5' };
  if (name.endsWith('.js')) return { icon: 'JS', color: '#f1e05a' };
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return { icon: 'TS', color: '#3178c6' };
  if (name.endsWith('.json')) return { icon: '{ }', color: '#cbcb41' };
  if (name.endsWith('.txt')) return { icon: 'T', color: '#8a8a8a' };
  if (name.endsWith('.html')) return { icon: '<>', color: '#e34c26' };
  if (name.endsWith('/')) return { icon: '📁', color: '' };
  return { icon: '·', color: '#8a8a8a' };
}

// Check if a file name corresponds to a project section
function getSectionContent(projDetail: ProjectDetail, fileName: string): string | null {
  if (!projDetail.sections || fileName === 'README.md') return null;
  const sectionTitle = fileName.replace(/\.md$/, '').toLowerCase();
  const section = projDetail.sections.find(s => s.title.toLowerCase() === sectionTitle);
  return section ? section.content : null;
}

// Get the section title (original casing) from a file name
function getSectionTitle(projDetail: ProjectDetail, fileName: string): string | null {
  if (!projDetail.sections || fileName === 'README.md') return null;
  const sectionTitle = fileName.replace(/\.md$/, '').toLowerCase();
  const section = projDetail.sections.find(s => s.title.toLowerCase() === sectionTitle);
  return section ? section.title : null;
}

// Render markdown-like content with bold, paragraphs, and lists
function renderMarkdownContent(content: string) {
  const paragraphs = content.split('\n\n');
  return paragraphs.map((para, pi) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // Check if this is a list (lines starting with -)
    const lines = trimmed.split('\n');
    const isList = lines.every(l => l.trim().startsWith('- ') || l.trim() === '');
    if (isList) {
      return (
        <ul key={pi} style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
          {lines.filter(l => l.trim().startsWith('- ')).map((line, li) => (
            <li key={li} style={{ marginBottom: '4px' }}>{renderInlineMarkdown(line.trim().slice(2))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={pi} style={{ margin: '0 0 16px' }}>
        {renderInlineMarkdown(trimmed.replace(/\n/g, ' '))}
      </p>
    );
  });
}

// Render inline markdown (bold text with **)
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#e6e6e6', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function getLangColor(lang: string): string {
  if (lang === 'Python') return '#3572A5';
  if (lang === 'JavaScript') return '#f1e05a';
  if (lang === 'TypeScript') return '#3178c6';
  return '#8a8a8a';
}

const Projects = ({ onCardClick, windowMode }: ProjectsProps) => {
  const [selectedProject, setSelectedProject] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({ 0: true });
  const [fileTabs, setFileTabs] = useState<FileTab[]>([{ projectIdx: 0, fileName: 'README.md', content: null, loading: false }]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(120);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const [sidebarWidth] = useState(220);
  const [fileCache, setFileCache] = useState<Record<string, string>>({});
  const editorRef = useRef<HTMLDivElement>(null);

  const activeTab = fileTabs[activeTabIdx] || fileTabs[0];

  // Fetch file content from GitHub
  const fetchFileContent = useCallback(async (projIdx: number, fileName: string) => {
    const cacheKey = `${projIdx}:${fileName}`;
    if (fileCache[cacheKey]) return fileCache[cacheKey];

    const repo = repoSlug(projects[projIdx].repoUrl);
    try {
      const res = await fetch(`/api/github?repo=${encodeURIComponent(repo)}&file=${encodeURIComponent(fileName)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.content) {
        setFileCache(prev => ({ ...prev, [cacheKey]: data.content }));
        return data.content as string;
      }
    } catch {}
    return null;
  }, [fileCache]);

  // Open a file tab
  const openFile = useCallback((projIdx: number, fileName: string) => {
    // Check if tab already exists
    const existingIdx = fileTabs.findIndex(t => t.projectIdx === projIdx && t.fileName === fileName);
    if (existingIdx >= 0) {
      setActiveTabIdx(existingIdx);
      setSelectedProject(projIdx);
      return;
    }

    // Check if this is a section file (non-README .md file matching a section title)
    const sectionContent = getSectionContent(projects[projIdx].detail, fileName);
    if (sectionContent !== null) {
      const newTab: FileTab = { projectIdx: projIdx, fileName, content: sectionContent, loading: false };
      const newTabs = [...fileTabs, newTab];
      const newIdx = newTabs.length - 1;
      setFileTabs(newTabs);
      setActiveTabIdx(newIdx);
      setSelectedProject(projIdx);
      return;
    }

    // Create new tab
    const newTab: FileTab = { projectIdx: projIdx, fileName, content: null, loading: true };
    const newTabs = [...fileTabs, newTab];
    const newIdx = newTabs.length - 1;
    setFileTabs(newTabs);
    setActiveTabIdx(newIdx);
    setSelectedProject(projIdx);

    // Fetch content
    const cacheKey = `${projIdx}:${fileName}`;
    if (fileCache[cacheKey]) {
      setFileTabs(prev => prev.map((t, i) => i === newIdx ? { ...t, content: fileCache[cacheKey], loading: false } : t));
    } else {
      fetchFileContent(projIdx, fileName).then(content => {
        setFileTabs(prev => prev.map((t, i) => i === newIdx ? { ...t, content: content || '# File not found\n\nCould not load this file from GitHub.', loading: false } : t));
      });
    }
  }, [fileTabs, fileCache, fetchFileContent]);

  // Select project (opens README tab)
  const selectProject = (idx: number) => {
    setSelectedProject(idx);
    // Check if a README tab for this project exists
    const readmeIdx = fileTabs.findIndex(t => t.projectIdx === idx && t.fileName === 'README.md');
    if (readmeIdx >= 0) {
      setActiveTabIdx(readmeIdx);
    } else {
      openFile(idx, 'README.md');
    }
  };

  const closeTab = (tabIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = fileTabs.filter((_, i) => i !== tabIdx);
    setFileTabs(newTabs);
    if (activeTabIdx === tabIdx) {
      const newActive = Math.min(tabIdx, newTabs.length - 1);
      setActiveTabIdx(Math.max(0, newActive));
      if (newTabs[newActive]) setSelectedProject(newTabs[newActive].projectIdx);
    } else if (activeTabIdx > tabIdx) {
      setActiveTabIdx(activeTabIdx - 1);
    }
  };

  const project = projects[selectedProject];
  const detail = project.detail;

  // Auto-fetch content for the active tab if it hasn't been loaded yet
  useEffect(() => {
    const tab = fileTabs[activeTabIdx];
    if (!tab || tab.content !== null || tab.loading) return;

    // Section files should already have content set — don't fetch from GitHub
    const sectionContent = getSectionContent(projects[tab.projectIdx].detail, tab.fileName);
    if (sectionContent !== null) {
      setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, content: sectionContent, loading: false } : t));
      return;
    }

    // Mark as loading
    setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, loading: true } : t));

    const repo = repoSlug(projects[tab.projectIdx].repoUrl);
    const cacheKey = `${tab.projectIdx}:${tab.fileName}`;

    if (fileCache[cacheKey]) {
      setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, content: fileCache[cacheKey], loading: false } : t));
      return;
    }

    fetch(`/api/github?repo=${encodeURIComponent(repo)}&file=${encodeURIComponent(tab.fileName)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const content = data?.content || null;
        if (content) setFileCache(prev => ({ ...prev, [cacheKey]: content }));
        setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, content: content || `# Could not load ${tab.fileName}`, loading: false } : t));
      })
      .catch(() => {
        setFileTabs(prev => prev.map((t, i) => i === activeTabIdx ? { ...t, content: `# Could not load ${tab.fileName}`, loading: false } : t));
      });
  }, [activeTabIdx, fileTabs.length]);

  // Scroll editor to top when switching tabs
  useEffect(() => {
    editorRef.current?.scrollTo(0, 0);
  }, [activeTabIdx]);

  return (
    <div className="vsc-root" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: "'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace",
      fontSize: '13px',
      color: '#cccccc',
      background: '#1e1e1e',
      overflow: 'hidden',
    }}>
      {/* Main area: activity bar + sidebar + editor */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── Activity Bar ── */}
        <div style={{
          width: '48px',
          minWidth: '48px',
          background: '#333333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '4px',
          gap: '2px',
          borderRight: '1px solid #252526',
        }}>
          <ActivityIcon active label="Explorer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7V5a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="6" />
              <line x1="14.5" y1="14.5" x2="20" y2="20" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Source Control">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="2.5" />
              <circle cx="18" cy="10" r="2.5" />
              <circle cx="6" cy="18" r="2.5" />
              <path d="M6 8.5v7M8.5 6h5.5a2 2 0 012 2v2" />
            </svg>
          </ActivityIcon>
          <ActivityIcon label="Extensions">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
          </ActivityIcon>

          <div style={{ flex: 1 }} />

          <ActivityIcon label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </ActivityIcon>
        </div>

        {/* ── Explorer Sidebar ── */}
        <div style={{
          width: `${sidebarWidth}px`,
          minWidth: `${sidebarWidth}px`,
          background: '#252526',
          borderRight: '1px solid #1e1e1e',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Sidebar header */}
          <div style={{
            padding: '10px 16px 8px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#bbbbbb',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          }}>
            Explorer
          </div>

          {/* File tree */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
            {projects.map((proj, idx) => {
              const isExpanded = expandedFolders[idx] || false;
              const folderSlug = proj.title.toUpperCase().replace(/\s+/g, '-');
              return (
                <div key={proj.id}>
                  {/* Folder row */}
                  <div
                    onClick={() => {
                      if (selectedProject === idx && expandedFolders[idx]) {
                        // Already selected + expanded: just collapse
                        setExpandedFolders(prev => ({ ...prev, [idx]: false }));
                      } else {
                        // Select + expand
                        setExpandedFolders(prev => ({ ...prev, [idx]: true }));
                        selectProject(idx);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px 3px 12px',
                      cursor: 'pointer',
                      background: selectedProject === idx ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: '#cccccc',
                      fontSize: '13px',
                      userSelect: 'none',
                    }}
                    className="vsc-tree-item"
                  >
                    <span style={{
                      fontSize: '10px',
                      width: '14px',
                      textAlign: 'center',
                      color: '#888',
                      transition: 'transform 0.15s',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}>▶</span>
                    <span style={{ fontSize: '14px' }}>📁</span>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '12px',
                      letterSpacing: '0.04em',
                    }}>{folderSlug}</span>
                  </div>

                  {/* Files */}
                  {isExpanded && proj.files.map((file, fi) => {
                    const { icon, color } = getFileIcon(file);
                    const isDir = file.endsWith('/');
                    const isReadme = file === 'README.md';
                    const isActiveFile = activeTab?.projectIdx === idx && activeTab?.fileName === file;

                    const isSectionFile = file.endsWith('.md') && file !== 'README.md' && getSectionContent(proj.detail, file) !== null;

                    const handleFileClick = () => {
                      if (isDir) return;
                      if (isSectionFile) {
                        // Section .md files scroll to that section within the README view
                        // First, make sure the README tab is active for this project
                        const readmeIdx = fileTabs.findIndex(t => t.projectIdx === idx && t.fileName === 'README.md');
                        if (readmeIdx >= 0) {
                          setActiveTabIdx(readmeIdx);
                          setSelectedProject(idx);
                        } else {
                          openFile(idx, 'README.md');
                        }
                        // Scroll to the section heading after a short delay to allow tab switch
                        const sectionTitle = getSectionTitle(proj.detail, file);
                        if (sectionTitle) {
                          const sectionId = `section-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`;
                          setTimeout(() => {
                            const el = document.getElementById(sectionId);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 50);
                        }
                      } else if (isReadme) {
                        // README opens as a tab
                        openFile(idx, file);
                      } else {
                        // All other files open the GitHub repo directly
                        window.open(proj.repoUrl, '_blank');
                      }
                    };

                    return (
                      <div
                        key={fi}
                        onClick={handleFileClick}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px 2px 38px',
                          cursor: isDir ? 'default' : 'pointer',
                          color: isDir ? '#888' : '#cccccc',
                          fontSize: '13px',
                          userSelect: 'none',
                          background: isActiveFile ? 'rgba(255,255,255,0.08)' : 'transparent',
                        }}
                        className="vsc-tree-item"
                      >
                        {isDir ? (
                          <span style={{ fontSize: '10px', width: '14px', textAlign: 'center', color: '#666' }}>▶</span>
                        ) : (
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            width: '14px',
                            textAlign: 'center',
                            color: color,
                          }}>{icon}</span>
                        )}
                        <span>{file}</span>
                        {!isDir && !isReadme && !isSectionFile && (
                          <span style={{ fontSize: '10px', color: '#555', marginLeft: 'auto' }}>↗</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Editor + Terminal ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Tab bar */}
          <div className="vsc-tab-bar" style={{
            display: 'flex',
            alignItems: 'stretch',
            height: '35px',
            background: '#252526',
            borderBottom: '1px solid #1e1e1e',
            overflow: 'hidden',
          }}>
            {fileTabs.map((tab, tabIdx) => {
              const p = projects[tab.projectIdx];
              const isActive = tabIdx === activeTabIdx;
              const { icon, color } = getFileIcon(tab.fileName);
              return (
                <div
                  key={`${tab.projectIdx}-${tab.fileName}`}
                  onClick={() => { setActiveTabIdx(tabIdx); setSelectedProject(tab.projectIdx); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: isActive ? '#1e1e1e' : '#2d2d2d',
                    borderRight: '1px solid #1e1e1e',
                    position: 'relative',
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                  }}
                  className={`vsc-tab ${isActive ? 'vsc-tab-active' : 'vsc-tab-inactive'}`}
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color }}>{icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.fileName}</span>
                  <span style={{ fontSize: '10px', color: '#666', marginLeft: '2px' }}>— {p.title}</span>
                  <span
                    onClick={(e) => closeTab(tabIdx, e)}
                    style={{
                      marginLeft: '6px',
                      fontSize: '14px',
                      lineHeight: 1,
                      color: '#666',
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '3px',
                    }}
                    className="vsc-tab-close"
                  >×</span>
                  {isActive && <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: '#007acc',
                  }} />}
                </div>
              );
            })}
            <div style={{ flex: 1, background: '#252526' }} />
          </div>

          {/* Breadcrumb */}
          <div style={{
            padding: '4px 16px',
            fontSize: '12px',
            color: '#888',
            background: '#1e1e1e',
            borderBottom: '1px solid #252526',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span>{project.title.toUpperCase().replace(/\s+/g, '-')}</span>
            <span style={{ color: '#555' }}>/</span>
            <span style={{ color: '#cccccc' }}>{activeTab?.fileName || 'README.md'}</span>
          </div>

          {/* Editor content */}
          <div
            ref={editorRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              background: '#1e1e1e',
              padding: '20px 32px 32px',
              minHeight: 0,
            }}
          >
            {/* README.md — always show the rich project view with demos & details */}
            {activeTab?.fileName === 'README.md' ? (
              <div className="vsc-readme">
                  <>
                    {detail.demoVideo && (
                      <div key={detail.demoVideo} style={{
                        width: '100%', borderRadius: '8px', overflow: 'hidden',
                        marginBottom: '24px', background: '#000', border: '1px solid #333',
                      }}>
                        <video autoPlay loop muted playsInline style={{ width: '100%', display: 'block', borderRadius: '8px' }}>
                          <source src={detail.demoVideo} type="video/mp4" />
                          <source src={detail.demoVideo} type="video/quicktime" />
                        </video>
                      </div>
                    )}
                    {!detail.demoVideo && detail.coverImage && (
                      <div style={{
                        width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden',
                        marginBottom: '24px', background: detail.gradient,
                      }}>
                        <img src={detail.coverImage} alt={detail.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                      </div>
                    )}
                    <h1 style={{
                      fontSize: '26px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px',
                      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                      {detail.title}
                      {detail.repoUrl && (
                        <a href={detail.repoUrl} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: '13px', fontWeight: 400, color: '#4daafc', textDecoration: 'none', fontFamily: "'SF Mono', monospace" }}>
                          ↗ GitHub
                        </a>
                      )}
                    </h1>
                    <p style={{ color: '#c8c8c8', fontSize: '14px', lineHeight: 1.7, margin: '0 0 20px', fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                      {project.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                      {detail.techStack.map((tech, i) => {
                        const tc = getTechColor(tech);
                        return (
                          <span key={i} style={{
                            padding: '3px 10px', fontSize: '11px', fontWeight: 500, borderRadius: '4px',
                            background: tc.bg, color: tc.text,
                            border: `1px solid ${tc.border}`, fontFamily: "'SF Mono', monospace",
                          }}>{tech}</span>
                        );
                      })}
                    </div>
                    {detail.architecture && (
                      <>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: "-apple-system, sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#4daafc' }}>#</span> Architecture
                        </h2>
                        <p style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', fontFamily: "-apple-system, sans-serif" }}>
                          {detail.architecture}
                        </p>
                      </>
                    )}
                    {detail.technicalChallenges?.length > 0 && (
                      <>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: "-apple-system, sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#f1b73a' }}>#</span> Technical Challenges
                        </h2>
                        <ul style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', paddingLeft: '20px', fontFamily: "-apple-system, sans-serif" }}>
                          {detail.technicalChallenges.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                        </ul>
                      </>
                    )}
                    {detail.lessonsLearned?.length > 0 && (
                      <>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: "-apple-system, sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#4ec9b0' }}>#</span> Lessons Learned
                        </h2>
                        <ul style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', paddingLeft: '20px', fontFamily: "-apple-system, sans-serif" }}>
                          {detail.lessonsLearned.map((l, i) => <li key={i} style={{ marginBottom: '4px' }}>{l}</li>)}
                        </ul>
                      </>
                    )}
                    {/* Sections */}
                    {detail.sections?.map((section, si) => (
                      <div key={si} id={`section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 8px', fontFamily: "-apple-system, sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: ['#4daafc', '#f1b73a', '#4ec9b0', '#c586c0', '#ce9178'][si % 5] }}>#</span> {section.title}
                        </h2>
                        <div style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', fontFamily: "-apple-system, sans-serif" }}>
                          {renderMarkdownContent(section.content)}
                        </div>
                      </div>
                    ))}
                  </>
              </div>
            ) : activeTab?.fileName?.endsWith('.md') && activeTab.fileName !== 'README.md' && getSectionContent(detail, activeTab.fileName) !== null ? (
              /* Section .md file — rich rendered view */
              <div className="vsc-readme">
                <h1 style={{
                  fontSize: '24px', fontWeight: 600, color: '#e6e6e6', margin: '0 0 6px',
                  fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ color: '#4daafc' }}>#</span> {activeTab.fileName.replace(/\.md$/, '')}
                </h1>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 20px', fontFamily: "-apple-system, sans-serif" }}>
                  {detail.title} / {activeTab.fileName}
                </p>
                <div style={{ color: '#b8b8b8', fontSize: '13px', lineHeight: 1.8, fontFamily: "-apple-system, sans-serif" }}>
                  {renderMarkdownContent(activeTab.content || '')}
                </div>
              </div>
            ) : (
              /* Non-README file: show as code/text */
              <div>
                {activeTab?.loading ? (
                  <div style={{ color: '#666', fontSize: '13px', padding: '20px 0' }}>
                    Loading {activeTab.fileName}...
                  </div>
                ) : (
                  <pre style={{
                    color: '#d4d4d4',
                    fontSize: '13px',
                    lineHeight: 1.65,
                    fontFamily: "'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Menlo', monospace",
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                    padding: 0,
                  }}>
                    {activeTab?.content?.split('\n').map((line, i) => (
                      <div key={i} style={{ display: 'flex', minHeight: '20px' }}>
                        <span style={{
                          width: '48px',
                          minWidth: '48px',
                          textAlign: 'right',
                          paddingRight: '16px',
                          color: '#545454',
                          userSelect: 'none',
                          fontSize: '12px',
                        }}>{i + 1}</span>
                        <span style={{ flex: 1 }}>{colorizeCode(line, activeTab?.fileName || '')}</span>
                      </div>
                    ))}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* ── Terminal Panel (draggable) ── */}
          {terminalOpen && (
            <div style={{
              height: `${terminalHeight}px`,
              minHeight: '28px',
              maxHeight: '300px',
              borderTop: '1px solid #333',
              display: 'flex',
              flexDirection: 'column',
              background: '#1e1e1e',
              transition: isDragging ? 'none' : 'height 0.15s ease',
            }}>
              {/* Drag handle */}
              <div
                style={{
                  height: '4px',
                  cursor: 'ns-resize',
                  background: isDragging ? 'rgba(0, 122, 204, 0.5)' : 'transparent',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                  dragStartY.current = e.clientY;
                  dragStartHeight.current = terminalHeight;
                  const onMove = (ev: MouseEvent) => {
                    const delta = dragStartY.current - ev.clientY;
                    const newH = Math.max(28, Math.min(300, dragStartHeight.current + delta));
                    if (newH <= 32) {
                      setTerminalOpen(false);
                      setIsDragging(false);
                      document.removeEventListener('mousemove', onMove);
                      document.removeEventListener('mouseup', onUp);
                      return;
                    }
                    setTerminalHeight(newH);
                  };
                  const onUp = () => {
                    setIsDragging(false);
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                  };
                  document.addEventListener('mousemove', onMove);
                  document.addEventListener('mouseup', onUp);
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0, 122, 204, 0.3)'; }}
                onMouseLeave={(e) => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              />
              {/* Terminal tabs */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                height: '28px',
                minHeight: '28px',
                background: '#252526',
                borderBottom: '1px solid #333',
                gap: '16px',
              }}>
                <span style={{ fontSize: '11px', color: '#cccccc', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Terminal</span>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Problems</span>
                <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Output</span>
                <div style={{ flex: 1 }} />
                <span
                  onClick={() => setTerminalOpen(false)}
                  style={{ color: '#666', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                  title="Close terminal"
                >×</span>
              </div>

              {/* Terminal content */}
              {terminalHeight > 40 && (
                <div style={{
                  flex: 1,
                  padding: '6px 14px',
                  fontSize: '12px',
                  lineHeight: 1.7,
                  overflowY: 'auto',
                  color: '#cccccc',
                }}>
                  <div>
                    <span style={{ color: '#4ec9b0' }}>ronniel@MacBookPro</span>
                    <span style={{ color: '#666' }}>:</span>
                    <span style={{ color: '#569cd6' }}>~/{project.title.toLowerCase().replace(/\s+/g, '-')}</span>
                    <span style={{ color: '#666' }}> $ </span>
                    <span style={{ color: '#cccccc' }}>git log --oneline -3</span>
                  </div>
                  <div style={{ color: '#ce9178' }}>
                    <span style={{ color: '#f1b73a' }}>a3f2e1d</span> feat: initial project setup
                  </div>
                  <div style={{ color: '#ce9178' }}>
                    <span style={{ color: '#f1b73a' }}>b7c4a2e</span> docs: add README
                  </div>
                  <div style={{ color: '#ce9178' }}>
                    <span style={{ color: '#f1b73a' }}>c8d5b3f</span> chore: configure build pipeline
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div style={{
        height: '22px',
        minHeight: '22px',
        background: '#007acc',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        gap: '14px',
        fontSize: '11.5px',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" opacity="0.9">
            <path d="M13.5 3.5L8 1 2.5 3.5v4c0 3.5 2.5 6.5 5.5 7.5 3-1 5.5-4 5.5-7.5v-4z" fillRule="evenodd" />
          </svg>
          main
        </span>
        <span>○ 0 △ 0</span>
        {!terminalOpen && (
          <span
            onClick={() => { setTerminalOpen(true); setTerminalHeight(120); }}
            style={{ cursor: 'pointer', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Open terminal"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Terminal
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span>Ln 1, Col 1</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getLangColor(project.language),
          }} />
          {project.language}
        </span>
      </div>

      <style>{`
        .vsc-root ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .vsc-root ::-webkit-scrollbar-track {
          background: transparent;
        }
        .vsc-root ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 0;
        }
        .vsc-root ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        .vsc-tree-item:hover {
          background: rgba(255,255,255,0.05) !important;
        }
        .vsc-tab-active {
          color: #ffffff;
          transition: color 0.15s ease;
        }
        .vsc-tab-inactive {
          color: #969696;
          transition: color 0.15s ease;
        }
        /* When hovering any tab, that tab glows white */
        .vsc-tab:hover {
          color: #ffffff !important;
        }
        /* When hovering over the tab bar, fade the active tab... */
        .vsc-tab-bar:hover .vsc-tab-active {
          color: #969696 !important;
        }
        /* ...unless the active tab itself is being hovered */
        .vsc-tab-bar:hover .vsc-tab-active:hover {
          color: #ffffff !important;
        }
        .vsc-tab:hover .vsc-tab-close {
          color: #ccc !important;
        }
        .vsc-tab-close:hover {
          background: rgba(255,255,255,0.1) !important;
          color: #fff !important;
        }
        .vsc-readme h2 {
          border-bottom: 1px solid #333;
          padding-bottom: 6px;
        }
      `}</style>
    </div>
  );
};

// ── Simple Markdown Renderer for README files ──

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';

  const renderInline = (text: string): React.ReactNode => {
    // Bold
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.*?)\*\*|`(.*?)`|\[(.*?)\]\((.*?)\)/g;
    let lastIdx = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
      if (match[1]) parts.push(<strong key={key++} style={{ color: '#e6e6e6', fontWeight: 600 }}>{match[1]}</strong>);
      if (match[2]) parts.push(<code key={key++} style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px', fontSize: '12px', color: '#ce9178' }}>{match[2]}</code>);
      if (match[3] && match[4]) parts.push(<a key={key++} href={match[4]} target="_blank" rel="noopener noreferrer" style={{ color: '#4daafc', textDecoration: 'none' }}>{match[3]}</a>);
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < text.length) parts.push(text.slice(lastIdx));
    return parts.length > 0 ? parts : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} style={{
            background: '#0d1117',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '12px 16px',
            margin: '8px 0 16px',
            fontSize: '12px',
            lineHeight: 1.6,
            overflowX: 'auto',
            color: '#d4d4d4',
          }}>
            {codeLines.join('\n')}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: '24px', fontWeight: 600, color: '#e6e6e6', margin: '24px 0 8px', fontFamily: "-apple-system, sans-serif", borderBottom: '1px solid #333', paddingBottom: '8px' }}>{renderInline(line.slice(2))}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: '20px', fontWeight: 600, color: '#e6e6e6', margin: '20px 0 8px', fontFamily: "-apple-system, sans-serif", borderBottom: '1px solid #333', paddingBottom: '6px' }}>{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: '16px', fontWeight: 600, color: '#e6e6e6', margin: '16px 0 6px', fontFamily: "-apple-system, sans-serif" }}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<div key={i} style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: 1.7, paddingLeft: '20px', margin: '2px 0', fontFamily: "-apple-system, sans-serif" }}>• {renderInline(line.slice(2))}</div>);
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s/)?.[1];
      elements.push(<div key={i} style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: 1.7, paddingLeft: '20px', margin: '2px 0', fontFamily: "-apple-system, sans-serif" }}>{num}. {renderInline(line.replace(/^\d+\.\s/, ''))}</div>);
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '8px' }} />);
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={i} style={{ borderLeft: '3px solid #4daafc', paddingLeft: '12px', margin: '8px 0', color: '#a0a0a0', fontStyle: 'italic', fontSize: '13px' }}>{renderInline(line.slice(2))}</blockquote>);
    } else if (line.startsWith('![')) {
      // Image — skip rendering but show placeholder
      const alt = line.match(/!\[(.*?)\]/)?.[1] || 'image';
      elements.push(<div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid #333', margin: '8px 0', color: '#666', fontSize: '12px', textAlign: 'center' }}>📷 {alt}</div>);
    } else {
      elements.push(<p key={i} style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: 1.7, margin: '4px 0', fontFamily: "-apple-system, sans-serif" }}>{renderInline(line)}</p>);
    }
  }

  return <div className="vsc-readme">{elements}</div>;
}

// ── Simple syntax coloring for code files ──

function colorizeCode(line: string, fileName: string): React.ReactNode {
  // Python files
  if (fileName.endsWith('.py') || fileName.endsWith('.txt')) {
    return line
      .replace(/^(import |from |class |def |return |if |else|elif |for |while |try|except|with |as |in |not |and |or |raise |yield |async |await )/g, '___KW___$1')
      .split('___KW___')
      .map((part, i) => {
        if (/^(import |from |class |def |return |if |else|elif |for |while |try|except|with |as |in |not |and |or |raise |yield |async |await )/.test(part)) {
          return <span key={i} style={{ color: '#c586c0' }}>{part}</span>;
        }
        return part;
      });
  }
  // For other files just return plain text
  return line;
}

// ── Activity Bar Icon ──

function ActivityIcon({ children, active, label }: { children: React.ReactNode; active?: boolean; label: string }) {
  return (
    <div
      title={label}
      style={{
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: active ? '#ffffff' : '#858585',
        position: 'relative',
        transition: 'color 0.15s',
      }}
    >
      {children}
      {active && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: '24px',
          background: '#ffffff',
          borderRadius: '0 1px 1px 0',
        }} />
      )}
    </div>
  );
}

export default Projects;
