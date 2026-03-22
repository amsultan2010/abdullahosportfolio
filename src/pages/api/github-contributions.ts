import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'No GITHUB_TOKEN configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const query = `
    query {
      user(login: "ronnielgandhe") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                weekday
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ronnielgandhe-portfolio',
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) throw new Error(`GitHub GraphQL failed: ${res.status}`);

    const data = await res.json();
    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) throw new Error('No contribution data found');

    // Transform to simple format: array of weeks, each week is array of day counts
    const weeks = calendar.weeks.map((w: any) =>
      w.contributionDays.map((d: any) => d.contributionCount)
    );

    // Find most recent contribution date
    const allDays = calendar.weeks.flatMap((w: any) => w.contributionDays);
    const lastContribDay = [...allDays].reverse().find((d: any) => d.contributionCount > 0);
    const lastUpdated = lastContribDay?.date || null;

    return new Response(JSON.stringify({
      totalContributions: calendar.totalContributions,
      weeks,
      lastUpdated,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, max-age=1800',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
