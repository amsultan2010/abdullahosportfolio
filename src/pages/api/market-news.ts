import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Google News RSS for business/finance topics
    const feeds = [
      'https://news.google.com/rss/search?q=stock+market+OR+S%26P+500+OR+nasdaq+OR+fed+rates+OR+inflation+OR+GDP+OR+treasury+yields&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en', // Google News Business topic
    ];

    const allItems: { title: string; source: string; url: string; pubDate: string }[] = [];

    for (const feedUrl of feeds) {
      try {
        const res = await fetch(feedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        });
        if (!res.ok) continue;
        const xml = await res.text();

        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(xml)) !== null && allItems.length < 15) {
          const block = match[1];
          const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || '';
          const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
          const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
          const source = block.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || '';

          const cleanTitle = title.replace(/ - [^-]+$/, '').trim();

          if (cleanTitle && !allItems.some(i => i.title === cleanTitle)) {
            allItems.push({
              title: cleanTitle,
              source: source || 'Market',
              url: link,
              pubDate,
            });
          }
        }
      } catch {
        continue;
      }
    }

    // Sort by date, newest first
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return new Response(JSON.stringify(allItems.slice(0, 12)), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, max-age=120',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
