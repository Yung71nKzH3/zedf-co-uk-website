import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getSpotifyEnv(): Promise<{ clientId?: string; clientSecret?: string }> {
  let clientId = process.env.SPOTIFY_CLIENT_ID;
  let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (typeof globalThis !== 'undefined') {
    const g = globalThis as any;
    const genv = g.env || g.__env__ || {};
    if (!clientId && genv.SPOTIFY_CLIENT_ID) clientId = genv.SPOTIFY_CLIENT_ID;
    if (!clientSecret && genv.SPOTIFY_CLIENT_SECRET) clientSecret = genv.SPOTIFY_CLIENT_SECRET;
  }

  return { clientId, clientSecret };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const { clientId, clientSecret } = await getSpotifyEnv();

  // If Spotify returned an error
  if (error) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Spotify Auth Error</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #0d1117; color: #f0f6fc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #161b22; border: 1px solid #f85149; border-radius: 12px; padding: 32px; max-width: 500px; text-align: center; }
    h1 { color: #f85149; margin-top: 0; }
    p { color: #8b949e; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Spotify Authorization Failed</h1>
    <p>Error from Spotify: <code>${error}</code></p>
    <a href="/api/spotify/callback" style="color: #58a6ff;">Try again</a>
  </div>
</body>
</html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // If no code is present yet, render the helper launcher page
  if (!code) {
    const redirectUri = `${url.origin}/api/spotify/callback`;
    const defaultClientId = clientId || '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spotify Token Generator • ZEDF</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #080d16; color: #f0f6fc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #0d1117; border: 1px solid #30363d; border-radius: 14px; padding: 32px; max-width: 540px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; font-weight: 700; margin-top: 0; display: flex; align-items: center; gap: 10px; color: #1db954; }
    p { font-size: 13.5px; color: #8b949e; line-height: 1.5; margin: 12px 0; }
    code { background: #161b22; border: 1px solid #30363d; padding: 3px 6px; border-radius: 5px; color: #58a6ff; font-family: monospace; font-size: 12px; word-break: break-all; }
    .input-group { margin: 18px 0; text-align: left; }
    label { display: block; font-size: 12px; font-weight: 600; color: #c9d1d9; margin-bottom: 6px; }
    input { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 8px; border: 1px solid #30363d; background: #161b22; color: #fff; font-size: 13px; font-family: monospace; outline: none; }
    input:focus { border-color: #1db954; box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.2); }
    button { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #1db954; color: #000; font-weight: 700; font-size: 14px; cursor: pointer; transition: background 0.2s; margin-top: 10px; }
    button:hover { background: #1ed760; }
    .step-box { background: #161b22; border-left: 3px solid #1db954; padding: 12px; border-radius: 4px; margin: 16px 0; font-size: 12.5px; color: #8b949e; }
  </style>
</head>
<body>
  <div class="card">
    <h1>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1db954"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.218.358-.684.47-1.042.253-2.857-1.745-6.455-2.14-10.69-1.173-.41.093-.815-.164-.908-.574-.093-.41.164-.814.574-.908 4.636-1.06 8.608-.61 11.813 1.35.358.217.47.683.253 1.052zm1.468-3.267c-.274.444-.86.586-1.304.312-3.27-2.01-8.257-2.592-12.127-1.417-.5.152-1.03-.133-1.182-.633-.15-.5.133-1.03.633-1.182 4.417-1.34 9.912-.693 13.668 1.616.444.274.586.86.312 1.304zm.126-3.41c-3.923-2.33-10.388-2.544-14.13-1.408-.6.182-1.237-.16-1.42-.76-.182-.6.16-1.237.76-1.42 4.298-1.305 11.433-1.054 15.938 1.62.54.32.716 1.023.396 1.564-.32.54-1.023.716-1.544.404z"/></svg>
      Spotify Refresh Token Helper
    </h1>
    <p>Generate your Spotify Refresh Token securely using your live HTTPS domain!</p>

    <div class="step-box">
      <strong>Step 1:</strong> In your <a href="https://developer.spotify.com/dashboard" target="_blank" style="color: #58a6ff;">Spotify Developer Dashboard</a> &rarr; App &rarr; <strong>Settings</strong>, set your Redirect URI to:<br>
      <code id="redirectUriText">${redirectUri}</code>
      <br><small style="color: #6e7681;">(Make sure to click <strong>Save</strong> at the bottom of the Spotify dashboard!)</small>
    </div>

    <form onsubmit="handleAuth(event)">
      <div class="input-group">
        <label for="clientId">Spotify Client ID</label>
        <input id="clientId" type="text" placeholder="e.g. 4a2b9..." value="${defaultClientId}" required />
      </div>

      <button type="submit">Authorize with Spotify &rarr;</button>
    </form>
  </div>

  <script>
    function handleAuth(e) {
      e.preventDefault();
      const clientId = document.getElementById('clientId').value.trim();
      const redirectUri = '${redirectUri}';
      const scope = encodeURIComponent('user-read-currently-playing user-read-recently-played');
      const authUrl = 'https://accounts.spotify.com/authorize?client_id=' + encodeURIComponent(clientId) + '&response_type=code&redirect_uri=' + encodeURIComponent(redirectUri) + '&scope=' + scope;
      window.location.href = authUrl;
    }
  </script>
</body>
</html>`;

    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // If code is present, we have returned from Spotify!
  const redirectUri = `${url.origin}/api/spotify/callback`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spotify Token Exchanger • ZEDF</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #080d16; color: #f0f6fc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #0d1117; border: 1px solid #30363d; border-radius: 14px; padding: 32px; max-width: 540px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; font-weight: 700; margin-top: 0; color: #1db954; }
    p { font-size: 13px; color: #8b949e; line-height: 1.5; }
    .input-group { margin: 16px 0; text-align: left; }
    label { display: block; font-size: 12px; font-weight: 600; color: #c9d1d9; margin-bottom: 6px; }
    input { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 8px; border: 1px solid #30363d; background: #161b22; color: #fff; font-size: 13px; font-family: monospace; outline: none; }
    input:focus { border-color: #1db954; }
    button { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #1db954; color: #000; font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 10px; }
    button:hover { background: #1ed760; }
    .result-box { display: none; background: #161b22; border: 1px solid #238636; border-radius: 8px; padding: 16px; margin-top: 20px; }
    .token-display { font-family: monospace; font-size: 12px; color: #7ee787; word-break: break-all; background: #0d1117; padding: 10px; border-radius: 6px; margin: 10px 0; border: 1px solid #30363d; }
    .copy-btn { background: #238636; color: #fff; padding: 8px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600; width: auto; margin-top: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Spotify Code Received!</h1>
    <p>Spotify successfully authorized your account. Now enter your Client ID &amp; Client Secret to get your permanent Refresh Token.</p>

    <form onsubmit="exchangeToken(event)">
      <div class="input-group">
        <label for="clientId">Spotify Client ID</label>
        <input id="clientId" type="text" placeholder="Paste Client ID" value="${clientId || ''}" required />
      </div>

      <div class="input-group">
        <label for="clientSecret">Spotify Client Secret</label>
        <input id="clientSecret" type="password" placeholder="Paste Client Secret" value="${clientSecret || ''}" required />
      </div>

      <button type="submit" id="submitBtn">Get Refresh Token &rarr;</button>
    </form>

    <div id="resultBox" class="result-box">
      <div style="font-weight: 600; color: #3fb950; font-size: 14px; margin-bottom: 6px;">Success! Here is your Refresh Token:</div>
      <div id="tokenText" class="token-display"></div>
      <button class="copy-btn" onclick="copyToken()">Copy Refresh Token</button>
    </div>

    <div id="errorBox" style="display: none; background: #2a1215; border: 1px solid #f85149; border-radius: 8px; padding: 12px; margin-top: 16px; color: #f85149; font-size: 12.5px;"></div>
  </div>

  <script>
    async function exchangeToken(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      const errorBox = document.getElementById('errorBox');
      const resultBox = document.getElementById('resultBox');
      errorBox.style.display = 'none';
      resultBox.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerText = 'Exchanging...';

      const clientId = document.getElementById('clientId').value.trim();
      const clientSecret = document.getElementById('clientSecret').value.trim();
      const code = '${code}';
      const redirectUri = '${redirectUri}';

      try {
        const basicAuth = btoa(clientId + ':' + clientSecret);
        const res = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + basicAuth,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri
          })
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error_description || data.error || 'Failed to exchange code');
        }

        document.getElementById('tokenText').innerText = data.refresh_token;
        resultBox.style.display = 'block';
        submitBtn.innerText = 'Refreshed Successfully!';
      } catch (err) {
        errorBox.innerText = 'Error: ' + err.message;
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Try Again';
      }
    }

    function copyToken() {
      const token = document.getElementById('tokenText').innerText;
      navigator.clipboard.writeText(token);
      alert('Copied Spotify Refresh Token to clipboard!');
    }
  </script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
