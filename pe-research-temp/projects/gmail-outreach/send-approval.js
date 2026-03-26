const fs = require('fs');
const { google } = require('googleapis');

const CREDS_PATH = __dirname + '/credentials.json';
const TOKEN_PATH = __dirname + '/token.json';

function getAuth() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
  return oAuth2Client;
}

async function sendEmail(to, subject, body) {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });
  const htmlBody = body.split(/\n\n+/).map(p => p.replace(/\n/g, ' ').trim()).join('<br><br>');
  const bcc = 'jeff@hellogumbo.com, alex@hellogumbo.com';
  const signature = '<br><br>--<br>Jim Jensen<br><a href="https://hellogumbo.com">Gumbo</a> | <a href="https://hellogumbo.com">hellogumbo.com</a><br>AI-first engineering, served simple.<br><a href="mailto:jim@hellogumbo.com">jim@hellogumbo.com</a>';
  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nBcc: ${bcc}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}${signature}</div>`
  ).toString('base64url');
  const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  return res.data;
}

const body = `Hi Alex,

Follow-up batch ready for approval. These are 8 contacts from the Feb 18-19 sends who haven't replied (7 days cold). Each follow-up is a short reply to the original thread.

Feb 18 batch:
1. Jeff Hunter, Chief AI Officer -- JLL Partners (j.hunter@jllpartners.com) -- Re: AI engineering capacity for JLL portfolio companies
2. Brian Seagraves, VP Product & Technology -- Greater Sum Ventures (brian.seagraves@greatersumventures.com) -- Re: AI development partner for Greater Sum portfolio
3. Leah Ierardi, VP Head of BD -- Huron Capital (lierardi@huroncapital.com) -- Re: AI engineering for Huron Capital's ExecFactor program
4. Richard Roggeveen, Principal -- Waud Capital (rroggeveen@waudcapital.com) -- Re: AI engineering studio for Waud's software and healthcare portfolio
5. Andrew Thoma, MD Strategic Partnerships -- Revelstoke (athoma@revelstokecapital.com) -- Re: AI capacity for Revelstoke's healthcare services platforms

Feb 19 batch:
6. Jason Tanker -- Renovus Capital (jason.tanker@renovuscapital.com) -- Re: AI Tools for Knowledge Services Portfolios
7. Itai Baron -- Comvest Partners (i.baron@comvest.com) -- Re: Driving Portfolio Value with AI at Scale
8. Imran Shaikh, CTO -- Shore Capital (ishaikh@shorecp.com) -- Re: AI Strategy for Shore Capital's 50+ Portfolio Companies

Each follow-up body is the same short note:

"Hi [Name], Circling back on my note last week. Happy to do a quick 15 minutes if useful -- no prep needed on your end. Best, Jim"

Note: Sherif Barrad at Charlesbank replied asking for a capabilities deck -- keeping that separate for Steve/Jeff to handle directly.

Let me know if these are good to send.

- Jim`;

sendEmail('alex@hellogumbo.com', 'Follow-up batch for approval (8 contacts, Feb 18-19)', body)
  .then(r => console.log('Sent:', r.id))
  .catch(e => console.error(e));
