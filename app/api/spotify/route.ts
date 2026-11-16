import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

async function getSpotifyEnv(): Promise<{
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}> {
  let clientId = process.env.SPOTIFY_CLIENT_ID;
  let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  let refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  // Cloudflare Workers runtime bindings check
  try {
    const cfw = await import('cloudflare:workers');
    const env = (cfw.env as any) || {};
    if (!clientId && env.SPOTIFY_CLIENT_ID) clientId = env.SPOTIFY_CLIENT_ID;
    if (!clientSecret && env.SPOTIFY_CLIENT_SECRET) clientSecret = env.SPOTIFY_CLIENT_SECRET;
    if (!refreshToken && env.SPOTIFY_REFRESH_TOKEN) refreshToken = env.SPOTIFY_REFRESH_TOKEN;
  } catch {}

  // Global environment fallback
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as any;
    const genv = g.env || g.__env__ || {};
    if (!clientId && genv.SPOTIFY_CLIENT_ID) clientId = genv.SPOTIFY_CLIENT_ID;
    if (!clientSecret && genv.SPOTIFY_CLIENT_SECRET) clientSecret = genv.SPOTIFY_CLIENT_SECRET;
    if (!refreshToken && genv.SPOTIFY_REFRESH_TOKEN) refreshToken = genv.SPOTIFY_REFRESH_TOKEN;
  }

  return { clientId, clientSecret, refreshToken };
}

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string | null> {
  try {
    const basicAuth = btoa(`${clientId}:${clientSecret}`);
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as SpotifyTokenResponse;
    return data.access_token || null;
  } catch {
    return null;
  }
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'image/*' } });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderGitHubSpotifyCard({
  isPlaying,
  title,
  artist,
  albumArtDataUri,
  statusLabel,
}: {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumArtDataUri?: string | null;
  statusLabel?: string;
}): string {
  const safeTitle = escapeXml(title.length > 30 ? title.substring(0, 29) + '…' : title);
  const safeArtist = escapeXml(artist.length > 34 ? artist.substring(0, 33) + '…' : artist);
  const safeStatus = escapeXml(statusLabel || (isPlaying ? 'Listening to Spotify' : 'Spotify • Offline'));

  return `<svg width="390" height="84" viewBox="0 0 390 84" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="albumClip">
      <rect x="12" y="12" width="60" height="60" rx="6"/>
    </clipPath>
    <style>
      .header { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; font-size: 10.5px; font-weight: 500; fill: #7d8590; letter-spacing: -0.01em; }
      .title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; font-size: 13.5px; font-weight: 600; fill: #e6edf3; }
      .artist { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; font-size: 11.5px; font-weight: 400; fill: #848d97; }
    </style>
  </defs>

  <!-- GitHub Card Container -->
  <rect x="0.5" y="0.5" width="389" height="83" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="1"/>

  <!-- Album Artwork -->
  <g>
    ${
      albumArtDataUri
        ? `<image href="${albumArtDataUri}" x="12" y="12" width="60" height="60" clip-path="url(#albumClip)" preserveAspectRatio="xMidYMid slice" />`
        : `<rect x="12" y="12" width="60" height="60" rx="6" fill="#161b22" />
           <circle cx="42" cy="42" r="18" fill="#21262d" stroke="#30363d" stroke-width="1"/>
           <circle cx="42" cy="42" r="6" fill="${isPlaying ? '#1db954' : '#484f58'}"/>`
    }
    <rect x="12" y="12" width="60" height="60" rx="6" fill="none" stroke="#30363d" stroke-width="1"/>
  </g>

  <!-- Track Information -->
  <g transform="translate(84, 12)">
    <!-- Header: Spotify Logo + Status + Optional Equalizer -->
    <g transform="translate(0, 0)">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="${isPlaying ? '#1db954' : '#7d8590'}">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.358-.684.47-1.042.253-2.857-1.745-6.455-2.14-10.69-1.173-.41.093-.815-.164-.908-.574-.093-.41.164-.814.574-.908 4.636-1.06 8.608-.61 11.813 1.35.358.217.47.683.253 1.052zm1.468-3.267c-.274.444-.86.586-1.304.312-3.27-2.01-8.257-2.592-12.127-1.417-.5.152-1.03-.133-1.182-.633-.15-.5.133-1.03.633-1.182 4.417-1.34 9.912-.693 13.668 1.616.444.274.586.86.312 1.304zm.126-3.41c-3.923-2.33-10.388-2.544-14.13-1.408-.6.182-1.237-.16-1.42-.76-.182-.6.16-1.237.76-1.42 4.298-1.305 11.433-1.054 15.938 1.62.54.32.716 1.023.396 1.564-.32.54-1.023.716-1.544.404z"/>
      </svg>
      <text x="18" y="10.5" class="header">${safeStatus}</text>

      ${
        isPlaying
          ? `<g transform="translate(276, 2)">
              <rect x="0" y="1" width="2" height="8" rx="1" fill="#1db954">
                <animate attributeName="height" values="3;9;4;8;3" dur="1.1s" repeatCount="indefinite" />
                <animate attributeName="y" values="7;1;6;2;7" dur="1.1s" repeatCount="indefinite" />
              </rect>
              <rect x="4" y="2" width="2" height="7" rx="1" fill="#1db954">
                <animate attributeName="height" values="8;3;9;5;8" dur="0.9s" repeatCount="indefinite" />
                <animate attributeName="y" values="2;7;1;5;2" dur="0.9s" repeatCount="indefinite" />
              </rect>
              <rect x="8" y="4" width="2" height="5" rx="1" fill="#1db954">
                <animate attributeName="height" values="5;9;2;9;5" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="y" values="5;1;8;1;5" dur="1.2s" repeatCount="indefinite" />
              </rect>
            </g>`
          : ''
      }
    </g>

    <!-- Track Title -->
    <text x="0" y="33" class="title">${safeTitle}</text>

    <!-- Artist Name -->
    <text x="0" y="51" class="artist">${safeArtist}</text>
  </g>
</svg>`;
}

export async function GET() {
  const { clientId, clientSecret, refreshToken } = await getSpotifyEnv();

  // If credentials aren't set yet, return clean GitHub-styled offline card
  if (!clientId || !clientSecret || !refreshToken) {
    const svg = renderGitHubSpotifyCard({
      isPlaying: false,
      title: 'Not Listening to Spotify',
      artist: 'w1ll0w',
      statusLabel: 'Spotify • Offline',
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
    if (!accessToken) {
      throw new Error('Unable to obtain access token');
    }

    // 1. Fetch currently playing
    const nowPlayingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (nowPlayingRes.status === 200) {
      const data = (await nowPlayingRes.json()) as any;
      if (data && data.item) {
        const item = data.item;
        const albumArtUrl = item.album?.images?.[1]?.url || item.album?.images?.[0]?.url;
        const albumArtDataUri = albumArtUrl ? await fetchImageAsBase64(albumArtUrl) : null;

        const svg = renderGitHubSpotifyCard({
          isPlaying: !!data.is_playing,
          title: item.name || 'Unknown Track',
          artist: (item.artists || []).map((a: any) => a.name).join(', ') || 'Unknown Artist',
          albumArtDataUri,
          statusLabel: data.is_playing ? 'Listening to Spotify' : 'Spotify • Paused',
        });

        return new Response(svg, {
          headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=20, s-maxage=20, stale-while-revalidate=40',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 2. Fallback to recently played
    const recentlyPlayedRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (recentlyPlayedRes.ok) {
      const recentData = (await recentlyPlayedRes.json()) as any;
      const recentTrack = recentData.items?.[0]?.track;
      if (recentTrack) {
        const albumArtUrl = recentTrack.album?.images?.[1]?.url || recentTrack.album?.images?.[0]?.url;
        const albumArtDataUri = albumArtUrl ? await fetchImageAsBase64(albumArtUrl) : null;

        const svg = renderGitHubSpotifyCard({
          isPlaying: false,
          title: recentTrack.name || 'Recently Played',
          artist: (recentTrack.artists || []).map((a: any) => a.name).join(', ') || 'w1ll0w',
          albumArtDataUri,
          statusLabel: 'Recently on Spotify',
        });

        return new Response(svg, {
          headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=45, s-maxage=45, stale-while-revalidate=60',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Default offline fallback
    const svg = renderGitHubSpotifyCard({
      isPlaying: false,
      title: 'Not Listening to Spotify',
      artist: 'w1ll0w',
      statusLabel: 'Spotify • Offline',
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    const svg = renderGitHubSpotifyCard({
      isPlaying: false,
      title: 'Not Listening to Spotify',
      artist: 'w1ll0w',
      statusLabel: 'Spotify • Offline',
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
