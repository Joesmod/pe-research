const fs = require('fs');
const { google } = require('googleapis');

const CREDS_PATH = __dirname + '/credentials.json';
const TOKEN_PATH = __dirname + '/token.json';

const code = process.argv[2];
if (!code) { console.error('Usage: node exchange.js <code>'); process.exit(1); }

const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
const { client_id, client_secret } = creds.installed || creds.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');

(async () => {
  const { tokens } = await oAuth2Client.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('✅ Token saved!');
})().catch(e => console.error('❌', e.message));
