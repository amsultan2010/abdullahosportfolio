import type { APIRoute } from 'astro';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

function fmtNum(n: number | undefined | null, decimals = 2): string {
  if (n == null || isNaN(n)) return '—';
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

export const GET: APIRoute = async ({ url }) => {
  const symbol = url.searchParams.get('symbol');
  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Missing symbol parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const yahooSymbol = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP'].includes(symbol.toUpperCase())
    ? `${symbol.toUpperCase()}-USD`
    : symbol.toUpperCase();

  try {
    // Fetch chart (5-day, 15min intervals) + stock-specific news in parallel
    const [chartRes, newsRes] = await Promise.all([
      fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=5d&interval=15m&includePrePost=false`,
        { headers: { 'User-Agent': UA } }
      ),
      fetch(
        `https://news.google.com/rss/search?q=${encodeURIComponent(symbol + ' stock OR ' + symbol + ' earnings OR ' + symbol + ' shares')}&hl=en-US&gl=US&ceid=US:en`,
        { headers: { 'User-Agent': UA } }
      ),
    ]);

    if (!chartRes.ok) throw new Error(`Chart failed: ${chartRes.status}`);

    const cData = await chartRes.json();
    const result = cData.chart?.result?.[0];
    if (!result) throw new Error('No chart data');

    const meta = result.meta || {};
    const ts: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const closes: (number | null)[] = quote.close || [];
    const highs: (number | null)[] = quote.high || [];
    const lows: (number | null)[] = quote.low || [];

    // Build chart points
    const paired = ts.map((t, i) => ({ t, c: closes[i] })).filter((p): p is { t: number; c: number } => p.c != null);
    const chart = { timestamps: paired.map(p => p.t), closes: paired.map(p => p.c) };

    // Calculate stats from chart data
    const validHighs = highs.filter((v): v is number => v != null);
    const validLows = lows.filter((v): v is number => v != null);
    const dayHigh = validHighs.length > 0 ? Math.max(...validHighs.slice(-26)) : null; // last ~6.5 hours (26 x 15min)
    const dayLow = validLows.length > 0 ? Math.min(...validLows.slice(-26)) : null;
    const fiveDayHigh = validHighs.length > 0 ? Math.max(...validHighs) : null;
    const fiveDayLow = validLows.length > 0 ? Math.min(...validLows) : null;

    // Extract from meta
    const summary = {
      name: meta.shortName || meta.longName || symbol,
      exchange: meta.exchangeName || meta.fullExchangeName || '',
      currency: meta.currency || 'USD',
      marketCap: fmtNum(meta.marketCap),
      volume: fmtNum(meta.regularMarketVolume, 0),
      pe: fmtNum(meta.trailingPE),
      fiftyTwoWeekHigh: fmtNum(meta.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: fmtNum(meta.fiftyTwoWeekLow),
      dayHigh: fmtNum(dayHigh),
      dayLow: fmtNum(dayLow),
      fiveDayHigh: fmtNum(fiveDayHigh),
      fiveDayLow: fmtNum(fiveDayLow),
      open: fmtNum(meta.regularMarketOpen),
      prevClose: fmtNum(meta.chartPreviousClose || meta.previousClose),
      regularMarketPrice: meta.regularMarketPrice,
      beta: '—',
      dividendYield: '—',
      targetMeanPrice: '—',
    };

    // Parse news RSS
    const newsItems: { title: string; source: string; url: string; pubDate: string }[] = [];
    if (newsRes.ok) {
      const xml = await newsRes.text();
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null && newsItems.length < 6) {
        const block = match[1];
        const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || '';
        const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
        const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
        const source = block.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || '';
        const cleanTitle = title.replace(/ - [^-]+$/, '').trim();
        if (cleanTitle && !newsItems.some(n => n.title === cleanTitle)) {
          newsItems.push({ title: cleanTitle, source: source || 'News', url: link, pubDate });
        }
      }
    }

    return new Response(JSON.stringify({ symbol: symbol.toUpperCase(), ...summary, chart, news: newsItems }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=120, max-age=60',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
