const fs = require('fs');
const http = require('http');
const { google } = require('googleapis');
const url = require('url');

const CREDS_PATH = __dirname + '/credentials.json';
const TOKEN_PATH = __dirname + '/token.json';
const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];

const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
const { client_id, client_secret } = creds.installed || creds.web;
const redirect_uri = 'http://localhost:3000/callback';
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' });
console.log('\n🔗 Open this URL in a browser and sign in with jim@hellogumbo.com:\n');
console.log(authUrl);
console.log('\nWaiting for callback on http://localhost:3000 ...\n');

const server = http.createServer(async (req, res) => {
  const qs = url.parse(req.url, true).query;
  if (qs.code) {
    try {
      const { tokens } = await oAuth2Client.getToken(qs.code);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      res.end('✅ Authorized! You can close this tab.');
      console.log('✅ Token saved to', TOKEN_PATH);
      server.close();
    } catch (e) {
      res.end('❌ Error: ' + e.message);
      console.error(e);
    }
  }
});
server.listen(3000);
