import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Use Google News RSS feed (free, no API key)
    const res = await fetch('https://news.google.com/rss?hl=en-CA&gl=CA&ceid=CA:en', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    });
    if (!res.ok) throw new Error(`News fetch failed: ${res.status}`);
    const xml = await res.text();

    // Parse RSS XML — extract <item> blocks
    const items: { title: string; source: string; url: string; pubDate: string }[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const block = match[1];
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const source = block.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || '';

      // Clean the title (Google News appends " - Source" to titles)
      const cleanTitle = title.replace(/ - [^-]+$/, '').trim();

      if (cleanTitle) {
        items.push({
          title: cleanTitle,
          source: source || 'News',
          url: link,
          pubDate,
        });
      }
    }

    return new Response(JSON.stringify(items), {
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
