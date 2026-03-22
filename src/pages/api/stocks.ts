import type { APIRoute } from 'astro';

const STOCK_UNIVERSE: { symbol: string; name: string }[] = [
  // Indices & ETFs
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'Nasdaq' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'IWM', name: 'Russell 2000' },
  // Mega-cap tech
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOG', name: 'Google' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMD', name: 'AMD' },
  { symbol: 'AVGO', name: 'Broadcom' },
  { symbol: 'CRM', name: 'Salesforce' },
  { symbol: 'ORCL', name: 'Oracle' },
  { symbol: 'ADBE', name: 'Adobe' },
  { symbol: 'INTC', name: 'Intel' },
  { symbol: 'NFLX', name: 'Netflix' },
  { symbol: 'UBER', name: 'Uber' },
  { symbol: 'SHOP', name: 'Shopify' },
  { symbol: 'SQ', name: 'Block' },
  { symbol: 'SNAP', name: 'Snap' },
  { symbol: 'PLTR', name: 'Palantir' },
  { symbol: 'RBLX', name: 'Roblox' },
  { symbol: 'SNOW', name: 'Snowflake' },
  { symbol: 'NET', name: 'Cloudflare' },
  { symbol: 'CRWD', name: 'CrowdStrike' },
  { symbol: 'DDOG', name: 'Datadog' },
  { symbol: 'ARM', name: 'ARM Holdings' },
  // Finance & payments
  { symbol: 'JPM', name: 'JPMorgan' },
  { symbol: 'V', name: 'Visa' },
  { symbol: 'MA', name: 'Mastercard' },
  { symbol: 'GS', name: 'Goldman Sachs' },
  // Consumer & health
  { symbol: 'DIS', name: 'Disney' },
  { symbol: 'NKE', name: 'Nike' },
  { symbol: 'SBUX', name: 'Starbucks' },
  { symbol: 'MCD', name: 'McDonald\'s' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'PFE', name: 'Pfizer' },
  { symbol: 'LLY', name: 'Eli Lilly' },
  { symbol: 'UNH', name: 'UnitedHealth' },
  // Energy & industrial
  { symbol: 'XOM', name: 'Exxon' },
  { symbol: 'BA', name: 'Boeing' },
  { symbol: 'CAT', name: 'Caterpillar' },
  // Crypto
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum' },
  { symbol: 'COIN', name: 'Coinbase' },
  { symbol: 'MSTR', name: 'MicroStrategy' },
];

export const GET: APIRoute = async () => {
  try {
    const results = (await Promise.allSettled(
      STOCK_UNIVERSE.map(async ({ symbol, name }) => {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }
        );
        if (!res.ok) throw new Error(`Failed ${symbol}: ${res.status}`);
        const data = await res.json();
        const result = data.chart.result[0];
        const meta = result.meta;
        const closes: number[] = (result.indicators.quote[0].close as (number | null)[])
          .filter((v): v is number => v !== null);
        return {
          symbol: symbol.replace('-USD', ''),
          name,
          price: meta.regularMarketPrice,
          prevClose: meta.chartPreviousClose,
          change: meta.regularMarketPrice - meta.chartPreviousClose,
          pct: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
          history: closes.slice(-80),
        };
      })
    ))
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    // Sort by absolute % change descending — biggest movers first
    results.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

    return new Response(JSON.stringify(results), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, max-age=30',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
