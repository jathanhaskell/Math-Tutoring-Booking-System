#!/usr/bin/env node
// auth-helper.js
//
// One-time local script to obtain a Google OAuth refresh token for the Worker.
//
// Prerequisites:
//   1. A Google Cloud OAuth 2.0 Client ID (Type: "Web application") with the redirect URI:
//        http://localhost:8888/callback
//   2. Node.js installed (you already have it).
//
// Usage:
//   node auth-helper.js
//
// You will be prompted for your Client ID and Client Secret, then a browser opens for Google consent.
// After you grant access, the script prints a refresh_token. Copy it — you'll paste it as the
// GOOGLE_REFRESH_TOKEN secret in the Cloudflare Worker dashboard.

const http = require('http');
const { URL } = require('url');
const { exec } = require('child_process');
const readline = require('readline');

const PORT = 8888;
const REDIRECT = `http://localhost:${PORT}/callback`;
const SCOPE = 'https://www.googleapis.com/auth/calendar.events';

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (a) => { rl.close(); resolve(a.trim()); });
  });
}

function openBrowser(url) {
  const cmd = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;
  exec(cmd, () => { /* if it fails, the user can still copy the printed URL */ });
}

(async () => {
  console.log('\n=== Google OAuth refresh-token helper ===\n');
  const clientId = process.env.GOOGLE_CLIENT_ID || (await ask('Google OAuth Client ID: '));
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || (await ask('Google OAuth Client Secret: '));
  if (!clientId || !clientSecret) {
    console.error('Both Client ID and Client Secret are required.');
    process.exit(1);
  }

  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT)}` +
    '&response_type=code' +
    `&scope=${encodeURIComponent(SCOPE)}` +
    '&access_type=offline' +
    '&prompt=consent';

  let resolveDone;
  const done = new Promise((r) => { resolveDone = r; });

  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    if (u.pathname !== '/callback') {
      res.writeHead(404); res.end('Not found'); return;
    }
    const code = u.searchParams.get('code');
    const error = u.searchParams.get('error');
    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>Auth error</h1><p>${error}</p>`);
      console.error('OAuth error:', error);
      resolveDone(1);
      return;
    }
    if (!code) {
      res.writeHead(400); res.end('Missing code'); return;
    }
    try {
      const params = new URLSearchParams();
      params.set('client_id', clientId);
      params.set('client_secret', clientSecret);
      params.set('code', code);
      params.set('grant_type', 'authorization_code');
      params.set('redirect_uri', REDIRECT);
      const tokRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const data = await tokRes.json();
      if (!tokRes.ok) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Token exchange failed</h1><pre>' + JSON.stringify(data, null, 2) + '</pre>');
        console.error('Token exchange failed:', data);
        resolveDone(1);
        return;
      }
      if (!data.refresh_token) {
        // This usually means the user has previously authorized this Client ID and Google reused a
        // prior grant. Revoking it forces a fresh refresh_token. We force prompt=consent above
        // which should prevent this, but just in case:
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>No refresh_token returned</h1>' +
                '<p>Go to <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>, ' +
                'remove this app, and run the helper again.</p>' +
                '<pre>' + JSON.stringify(data, null, 2) + '</pre>');
        console.error('No refresh_token in response:', data);
        resolveDone(1);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Done.</h1><p>The refresh token is printed in your terminal. You can close this tab.</p>');
      console.log('\n--- COPY THIS VALUE ---');
      console.log('GOOGLE_REFRESH_TOKEN=' + data.refresh_token);
      console.log('-----------------------\n');
      console.log('Paste it as the GOOGLE_REFRESH_TOKEN secret in the Cloudflare Worker dashboard.\n');
      resolveDone(0);
    } catch (e) {
      res.writeHead(500); res.end('Error: ' + e.message);
      console.error(e);
      resolveDone(1);
    }
  });

  server.listen(PORT, () => {
    console.log(`\nListening on ${REDIRECT}`);
    console.log('\nOpening Google consent screen in your browser…');
    console.log('(If it doesn\'t open, paste this URL manually:)\n');
    console.log(authUrl);
    openBrowser(authUrl);
  });

  const exitCode = await done;
  server.close();
  process.exit(exitCode);
})();
