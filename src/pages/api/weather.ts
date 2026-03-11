import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');

  try {
    // Use Open-Meteo (free, no API key needed)
    const apiUrl = lat && lon
      ? `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius&timezone=auto`
      : `https://api.open-meteo.com/v1/forecast?latitude=43.65&longitude=-79.38&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius&timezone=auto`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Weather API failed: ${res.status}`);
    const data = await res.json();

    const current = data.current;
    const daily = data.daily;

    // Map WMO weather codes to descriptions and icons
    const weatherMap: Record<number, { desc: string; icon: string }> = {
      0: { desc: 'Clear', icon: '☀️' },
      1: { desc: 'Mainly Clear', icon: '🌤' },
      2: { desc: 'Partly Cloudy', icon: '⛅' },
      3: { desc: 'Overcast', icon: '☁️' },
      45: { desc: 'Foggy', icon: '🌫' },
      48: { desc: 'Rime Fog', icon: '🌫' },
      51: { desc: 'Light Drizzle', icon: '🌦' },
      53: { desc: 'Drizzle', icon: '🌦' },
      55: { desc: 'Dense Drizzle', icon: '🌧' },
      56: { desc: 'Freezing Drizzle', icon: '🌧' },
      57: { desc: 'Freezing Drizzle', icon: '🌧' },
      61: { desc: 'Light Rain', icon: '🌧' },
      63: { desc: 'Rain', icon: '🌧' },
      65: { desc: 'Heavy Rain', icon: '🌧' },
      66: { desc: 'Freezing Rain', icon: '🌧' },
      67: { desc: 'Freezing Rain', icon: '🌧' },
      71: { desc: 'Light Snow', icon: '🌨' },
      73: { desc: 'Snow', icon: '❄️' },
      75: { desc: 'Heavy Snow', icon: '❄️' },
      77: { desc: 'Snow Grains', icon: '❄️' },
      80: { desc: 'Light Showers', icon: '🌦' },
      81: { desc: 'Showers', icon: '🌧' },
      82: { desc: 'Heavy Showers', icon: '🌧' },
      85: { desc: 'Snow Showers', icon: '🌨' },
      86: { desc: 'Heavy Snow Showers', icon: '🌨' },
      95: { desc: 'Thunderstorm', icon: '⛈' },
      96: { desc: 'Thunderstorm w/ Hail', icon: '⛈' },
      99: { desc: 'Thunderstorm w/ Hail', icon: '⛈' },
    };

    const code = current.weather_code;
    const weather = weatherMap[code] || { desc: 'Unknown', icon: '🌡' };

    const result = {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      description: weather.desc,
      icon: weather.icon,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      high: Math.round(daily.temperature_2m_max[0]),
      low: Math.round(daily.temperature_2m_min[0]),
    };

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600, max-age=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
