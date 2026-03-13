import type { APIRoute } from 'astro';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

const SECTOR_QUERIES: Record<string, string> = {
  Tech: 'technology stocks OR big tech OR AAPL OR MSFT OR NVDA OR semiconductor',
  Consumer: 'consumer stocks OR retail stocks OR AMZN OR TSLA OR e-commerce earnings',
  Finance: 'bank stocks OR financial sector OR JPMorgan OR Goldman Sachs OR interest rates banks',
  Health: 'healthcare stocks OR pharma stocks OR biotech OR drug approval OR JNJ OR UNH',
  Crypto: 'bitcoin OR ethereum OR crypto market OR cryptocurrency OR blockchain',
  Cloud: 'cloud computing stocks OR cybersecurity stocks OR SaaS OR Palantir OR CrowdStrike',
  Energy: 'energy stocks OR oil price OR Boeing OR defense stocks OR infrastructure',
};

export const GET: APIRoute = async ({ url }) => {
  const sector = url.searchParams.get('sector');
  if (!sector) {
    return new Response(JSON.stringify({ error: 'Missing sector parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const query = SECTOR_QUERIES[sector] || `${sector} stocks market`;

  try {
    const res = await fetch(
      `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,
      { headers: { 'User-Agent': UA } }
    );

    const items: { title: string; source: string; url: string; pubDate: string }[] = [];

    if (res.ok) {
      const xml = await res.text();
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
        const block = match[1];
        const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || '';
        const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
        const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
        const source = block.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || '';
        const cleanTitle = title.replace(/ - [^-]+$/, '').trim();
        if (cleanTitle && !items.some(n => n.title === cleanTitle)) {
          items.push({ title: cleanTitle, source: source || 'News', url: link, pubDate });
        }
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
