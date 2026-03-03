// Inline the sendEmail logic for preview (send.js doesn't export)
const fs = require('fs');
const { google } = require('googleapis');

const CREDS_PATH = __dirname + '/credentials.json';
const TOKEN_PATH = __dirname + '/token.json';

function getAuth() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function main() {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  const to = 'alex@hellogumbo.com';
  const subject = "[PREVIEW] Value creation meets AI - quick thought for Revelstoke's PTG";
  const body = `PREVIEW - This is the first email of today's batch (3 total). Reply to approve sending all 3 to actual recipients.<br><br><b>To:</b> athoma@revelstokecapital.com<br><b>BCC:</b> jeff@hellogumbo.com, alex@hellogumbo.com<br><b>Subject:</b> Value creation meets AI - quick thought for Revelstoke's PTG<br><br>---<br><br>Andrew,<br><br>Your move from McKinsey's PE procurement practice to leading Strategic Partnerships &amp; Value Creation at Revelstoke caught my eye. The Portfolio Transformation Group is doing something most healthcare PE firms talk about but few actually build - a dedicated ops team that drives real post-acquisition value.<br><br>We built <a href="https://hellogumbo.com">Gumbo</a> to plug directly into that kind of structure. Our AI agents handle the operational heavy lifting across portfolio companies - think due diligence automation, back-office integration, and cross-portfolio intelligence - so your PTG team can focus on strategy instead of spreadsheets.<br><br>With 200+ acquisitions and a growing portfolio, I imagine the integration complexity only compounds. Would love to show you how <a href="https://hellogumbo.com">Gumbo</a> could accelerate what your team is already doing well.<br><br>Open to a 15-minute call this week?<br><br>Best,<br>Jim`;

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${body}</div>`
  ).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  console.log('Sent preview:', res.data.id);
}

main().catch(e => console.error('ERR:', e));
