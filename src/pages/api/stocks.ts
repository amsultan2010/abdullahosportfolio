import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const symbols = ['SPY', 'QQQ', 'BTC-USD', 'AAPL', 'NVDA', 'TSLA'];
  try {
    const results = await Promise.all(
      symbols.map(async (s) => {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${s}?range=1d&interval=5m`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }
        );
        if (!res.ok) throw new Error(`Failed ${s}: ${res.status}`);
        const data = await res.json();
        const result = data.chart.result[0];
        const meta = result.meta;
        const closes: number[] = (result.indicators.quote[0].close as (number | null)[])
          .filter((v): v is number => v !== null);
        const nameMap: Record<string, string> = {
          SPY: 'S&P 500', QQQ: 'Nasdaq', 'BTC-USD': 'Bitcoin',
          AAPL: 'Apple', NVDA: 'NVIDIA', TSLA: 'Tesla',
        };
        return {
          symbol: s.replace('-USD', ''),
          name: nameMap[s] || s,
          price: meta.regularMarketPrice,
          prevClose: meta.chartPreviousClose,
          change: meta.regularMarketPrice - meta.chartPreviousClose,
          pct: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
          history: closes.slice(-80),
        };
      })
    );
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
