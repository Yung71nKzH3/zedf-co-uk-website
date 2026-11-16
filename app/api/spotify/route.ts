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

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function renderSvgCard({
  isPlaying,
  title,
  artist,
  album,
  albumArtDataUri,
  progressMs,
  durationMs,
  statusLabel,
}: {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArtDataUri?: string | null;
  progressMs?: number;
  durationMs?: number;
  statusLabel?: string;
}): string {
  const safeTitle = escapeXml(title.length > 32 ? title.substring(0, 31) + '…' : title);
  const safeArtist = escapeXml(artist.length > 36 ? artist.substring(0, 35) + '…' : artist);
  const safeAlbum = escapeXml(album.length > 38 ? album.substring(0, 37) + '…' : album);
  const safeStatus = escapeXml(statusLabel || (isPlaying ? 'NOW PLAYING' : 'OFFLINE'));

  const progressPercent = durationMs && progressMs && durationMs > 0
    ? Math.min(100, Math.max(0, Math.round((progressMs / durationMs) * 100)))
    : 0;

  const currentTimeStr = progressMs ? formatTime(progressMs) : '0:00';
  const totalTimeStr = durationMs ? formatTime(durationMs) : '0:00';

  return `<svg width="460" height="135" viewBox="0 0 460 135" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="460" y2="135" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0c1422"/>
      <stop offset="50%" stop-color="#111c30"/>
      <stop offset="100%" stop-color="#0a101b"/>
    </linearGradient>
    <linearGradient id="neonGlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1DB954"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <clipPath id="albumClip">
      <rect x="18" y="18" width="76" height="76" rx="12"/>
    </clipPath>
    <style>
      .title { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; font-size: 15px; font-weight: 700; fill: #f8fafc; }
      .artist { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; font-weight: 500; fill: #94a3b8; }
      .album { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; fill: #64748b; }
      .status { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em; fill: ${isPlaying ? '#1DB954' : '#64748b'}; }
      .time { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; fill: #64748b; }
    </style>
  </defs>

  <!-- Background Container -->
  <rect x="0.5" y="0.5" width="459" height="134" rx="16" fill="url(#cardGrad)" stroke="#1e293b" stroke-width="1"/>
  <rect x="0.5" y="0.5" width="459" height="134" rx="16" fill="none" stroke="${isPlaying ? '#1DB954' : '#06b6d4'}" stroke-opacity="0.25" stroke-width="1"/>

  <!-- Album Art -->
  <g>
    ${
      albumArtDataUri
        ? `<image href="${albumArtDataUri}" x="18" y="18" width="76" height="76" clip-path="url(#albumClip)" preserveAspectRatio="xMidYMid slice" />`
        : `<rect x="18" y="18" width="76" height="76" rx="12" fill="#1e293b" />
           <circle cx="56" cy="56" r="24" fill="#0f172a" stroke="#334155" stroke-width="2"/>
           <circle cx="56" cy="56" r="8" fill="#1DB954"/>`
    }
    <rect x="18" y="18" width="76" height="76" rx="12" fill="none" stroke="#334155" stroke-width="1"/>
  </g>

  <!-- Header: Spotify Icon + Status + Equalizer -->
  <g transform="translate(108, 22)">
    <!-- Spotify Logo SVG -->
    <svg width="15" height="15" viewBox="0 0 24 24" fill="${isPlaying ? '#1DB954' : '#64748b'}">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.358-.684.47-1.042.253-2.857-1.745-6.455-2.14-10.69-1.173-.41.093-.815-.164-.908-.574-.093-.41.164-.814.574-.908 4.636-1.06 8.608-.61 11.813 1.35.358.217.47.683.253 1.052zm1.468-3.267c-.274.444-.86.586-1.304.312-3.27-2.01-8.257-2.592-12.127-1.417-.5.152-1.03-.133-1.182-.633-.15-.5.133-1.03.633-1.182 4.417-1.34 9.912-.693 13.668 1.616.444.274.586.86.312 1.304zm.126-3.41c-3.923-2.33-10.388-2.544-14.13-1.408-.6.182-1.237-.16-1.42-.76-.182-.6.16-1.237.76-1.42 4.298-1.305 11.433-1.054 15.938 1.62.54.32.716 1.023.396 1.564-.32.54-1.023.716-1.544.404z"/>
    </svg>

    <!-- Status Text -->
    <text x="22" y="11" class="status">${safeStatus}</text>

    <!-- Animated Equalizer Bars -->
    ${
      isPlaying
        ? `<g transform="translate(305, 0)">
            <rect x="0" y="2" width="2.5" height="10" rx="1.25" fill="#1DB954">
              <animate attributeName="height" values="4;12;5;11;4" dur="1.1s" repeatCount="indefinite" />
              <animate attributeName="y" values="10;2;9;3;10" dur="1.1s" repeatCount="indefinite" />
            </rect>
            <rect x="5.5" y="4" width="2.5" height="8" rx="1.25" fill="#1DB954">
              <animate attributeName="height" values="12;4;12;6;12" dur="0.9s" repeatCount="indefinite" />
              <animate attributeName="y" values="2;10;2;8;2" dur="0.9s" repeatCount="indefinite" />
            </rect>
            <rect x="11" y="6" width="2.5" height="6" rx="1.25" fill="#1DB954">
              <animate attributeName="height" values="6;12;3;12;6" dur="1.3s" repeatCount="indefinite" />
              <animate attributeName="y" values="8;2;11;2;8" dur="1.3s" repeatCount="indefinite" />
            </rect>
            <rect x="16.5" y="1" width="2.5" height="11" rx="1.25" fill="#1DB954">
              <animate attributeName="height" values="11;5;12;4;11" dur="1.0s" repeatCount="indefinite" />
              <animate attributeName="y" values="3;9;2;10;3" dur="1.0s" repeatCount="indefinite" />
            </rect>
          </g>`
        : `<g transform="translate(305, 6)">
            <rect x="0" y="0" width="2.5" height="4" rx="1.25" fill="#475569" />
            <rect x="5.5" y="0" width="2.5" height="4" rx="1.25" fill="#475569" />
            <rect x="11" y="0" width="2.5" height="4" rx="1.25" fill="#475569" />
            <rect x="16.5" y="0" width="2.5" height="4" rx="1.25" fill="#475569" />
          </g>`
    }
  </g>

  <!-- Track Information -->
  <g transform="translate(108, 48)">
    <text x="0" y="12" class="title">${safeTitle}</text>
    <text x="0" y="30" class="artist">${safeArtist}</text>
    <text x="0" y="46" class="album">${safeAlbum}</text>
  </g>

  <!-- Progress Bar & Timestamps -->
  <g transform="translate(18, 108)">
    <!-- Progress Bar Track -->
    <rect x="0" y="0" width="424" height="4" rx="2" fill="#1e293b"/>
    <!-- Progress Fill -->
    <rect x="0" y="0" width="${Math.round((progressPercent / 100) * 424)}" height="4" rx="2" fill="url(#neonGlow)"/>

    <!-- Timestamps -->
    <text x="0" y="16" class="time">${currentTimeStr}</text>
    <text x="424" y="16" text-anchor="end" class="time">${totalTimeStr}</text>
  </g>
</svg>`;
}

export async function GET() {
  const { clientId, clientSecret, refreshToken } = await getSpotifyEnv();

  // If credentials aren't set yet, return a clean, stylish offline card
  if (!clientId || !clientSecret || !refreshToken) {
    const svg = renderSvgCard({
      isPlaying: false,
      title: 'Not Listening to Spotify',
      artist: 'w1ll0w',
      album: 'zedf.co.uk • GitHub Profile Card',
      statusLabel: 'OFFLINE / PAUSED',
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

        const svg = renderSvgCard({
          isPlaying: !!data.is_playing,
          title: item.name || 'Unknown Track',
          artist: (item.artists || []).map((a: any) => a.name).join(', ') || 'Unknown Artist',
          album: item.album?.name || 'Unknown Album',
          albumArtDataUri,
          progressMs: data.progress_ms,
          durationMs: item.duration_ms,
          statusLabel: data.is_playing ? 'NOW PLAYING' : 'PAUSED',
        });

        return new Response(svg, {
          headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=30',
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

        const svg = renderSvgCard({
          isPlaying: false,
          title: recentTrack.name || 'Recently Played',
          artist: (recentTrack.artists || []).map((a: any) => a.name).join(', ') || 'w1ll0w',
          album: recentTrack.album?.name || 'Spotify',
          albumArtDataUri,
          progressMs: 0,
          durationMs: recentTrack.duration_ms,
          statusLabel: 'RECENTLY PLAYED',
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

    // If both failed or empty
    const svg = renderSvgCard({
      isPlaying: false,
      title: 'Not Listening to Spotify',
      artist: 'w1ll0w',
      album: 'zedf.co.uk • GitHub Profile Card',
      statusLabel: 'OFFLINE',
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    const svg = renderSvgCard({
      isPlaying: false,
      title: 'Not Listening to Spotify',
      artist: 'w1ll0w',
      album: 'zedf.co.uk • GitHub Profile Card',
      statusLabel: 'OFFLINE',
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
