/**
 * One-time OAuth2 authorization flow
 * Run this once to generate token.json
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];

async function authorize() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Missing credentials.json');
    console.error('1. Go to https://console.cloud.google.com');
    console.error('2. Create/select a project');
    console.error('3. Enable Gmail API');
    console.error('4. Create OAuth 2.0 credentials (Desktop app)');
    console.error('5. Download and save as credentials.json in this directory');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3456');

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('🔗 Open this URL in a browser to authorize:\n');
  console.log(authUrl);
  console.log('\nWaiting for callback...');

  // Start local server to catch the redirect
  const server = http.createServer(async (req, res) => {
    const qs = new url.URL(req.url, 'http://localhost:3456').searchParams;
    const code = qs.get('code');
    if (!code) {
      res.end('No code received');
      return;
    }

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      res.end('✅ Authorization successful! You can close this tab.');
      console.log('\n✅ Token saved to token.json');
      server.close();
      process.exit(0);
    } catch (err) {
      res.end('Error: ' + err.message);
      console.error('Error:', err.message);
      server.close();
      process.exit(1);
    }
  });

  server.listen(3456);
}

authorize();
