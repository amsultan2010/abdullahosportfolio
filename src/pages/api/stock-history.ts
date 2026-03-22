import type { APIRoute } from 'astro';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP'];
const VALID_RANGES = ['1mo', '3mo', '1y'];

export const GET: APIRoute = async ({ url }) => {
  const symbolsParam = url.searchParams.get('symbols');
  const range = url.searchParams.get('range');

  if (!symbolsParam || !range) {
    return new Response(JSON.stringify({ error: 'Missing required parameters: symbols, range' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!VALID_RANGES.includes(range)) {
    return new Response(JSON.stringify({ error: `Invalid range. Must be one of: ${VALID_RANGES.join(', ')}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

  if (symbols.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid symbols provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch in batches of 8 to avoid rate limiting
    const BATCH_SIZE = 8;
    const allResults: PromiseSettledResult<{ symbol: string; closes: number[]; timestamps: number[] }>[] = [];

    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      const batch = symbols.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(async (symbol) => {
          const yahooSymbol = CRYPTO_SYMBOLS.includes(symbol) ? `${symbol}-USD` : symbol;
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${range}&interval=1d`,
            { headers: { 'User-Agent': UA } }
          );
          if (!res.ok) throw new Error(`Failed ${symbol}: ${res.status}`);
          const data = await res.json();
          const result = data.chart?.result?.[0];
          if (!result) throw new Error(`No data for ${symbol}`);
          const timestamps: number[] = result.timestamp || [];
          const rawCloses: (number | null)[] = result.indicators?.quote?.[0]?.close || [];
          const closes: number[] = [];
          const filteredTimestamps: number[] = [];
          for (let j = 0; j < rawCloses.length; j++) {
            if (rawCloses[j] != null) {
              closes.push(rawCloses[j] as number);
              filteredTimestamps.push(timestamps[j]);
            }
          }
          return { symbol, closes, timestamps: filteredTimestamps };
        })
      );
      allResults.push(...batchResults);
      // Small delay between batches to be nice to Yahoo Finance
      if (i + BATCH_SIZE < symbols.length) await new Promise(r => setTimeout(r, 200));
    }

    const results = allResults;

    const data: Record<string, { closes: number[]; timestamps: number[] }> = {};
    let successCount = 0;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { symbol, closes, timestamps } = result.value;
        data[symbol] = { closes, timestamps };
        successCount++;
      }
    }

    if (successCount === 0) {
      return new Response(JSON.stringify({ error: 'All symbol fetches failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, max-age=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
