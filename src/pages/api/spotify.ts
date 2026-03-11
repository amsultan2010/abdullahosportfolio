import type { APIRoute } from 'astro';

const CLIENT_ID = import.meta.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = import.meta.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

const jsonHeaders = { 'Content-Type': 'application/json' };
const notPlaying = () => new Response(JSON.stringify({ isPlaying: false }), { headers: jsonHeaders });

async function getAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: REFRESH_TOKEN }),
  });
  return res.json();
}

function trackPayload(track: any, isPlaying: boolean, progressMs?: number) {
  return {
    isPlaying,
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(', '),
    album: track.album.name,
    albumArt: track.album.images?.[0]?.url || '',
    progressMs: progressMs ?? track.duration_ms,
    durationMs: track.duration_ms,
    trackUrl: track.external_urls?.spotify || '',
  };
}

export const GET: APIRoute = async () => {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return notPlaying();

  try {
    const { access_token } = await getAccessToken();
    if (!access_token) return notPlaying();

    // Try currently playing
    const npRes = await fetch(NOW_PLAYING_URL, { headers: { Authorization: `Bearer ${access_token}` } });
    if (npRes.status === 200) {
      const data = await npRes.json();
      if (data.item) {
        return new Response(JSON.stringify(trackPayload(data.item, data.is_playing, data.progress_ms)), {
          headers: { ...jsonHeaders, 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=5' },
        });
      }
    }

    // Fallback: recently played
    const rpRes = await fetch(RECENTLY_PLAYED_URL, { headers: { Authorization: `Bearer ${access_token}` } });
    if (rpRes.ok) {
      const rpData = await rpRes.json();
      const track = rpData.items?.[0]?.track;
      if (track) {
        return new Response(JSON.stringify(trackPayload(track, false)), {
          headers: { ...jsonHeaders, 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
        });
      }
    }

    return notPlaying();
  } catch {
    return notPlaying();
  }
};
