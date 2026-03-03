const fs = require('fs');
const { google } = require('googleapis');

function getAuth() {
  const creds = JSON.parse(fs.readFileSync(__dirname + '/credentials.json'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(__dirname + '/token.json'));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function sendEmail(to, subject, body) {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  const htmlBody = body
    .split(/\n\n+/)
    .map(para => para.replace(/\n/g, ' ').trim())
    .join('<br><br>');

  const bcc = 'jeff@hellogumbo.com, alex@hellogumbo.com';
  const signature = '<br><br>--<br>Jim Jensen<br><a href="https://hellogumbo.com">Gumbo</a> | <a href="https://hellogumbo.com">hellogumbo.com</a><br>AI-first engineering, served simple.<br><a href="mailto:jim@hellogumbo.com">jim@hellogumbo.com</a>';

  const raw = Buffer.from(
    'From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ' + to + '\r\nBcc: ' + bcc + '\r\nSubject: ' + subject + '\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">' + htmlBody + signature + '</div>'
  ).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
  console.log('Sent:', res.data.id);
  return res.data;
}

const to = 'alex@hellogumbo.com';
const subject = '[TEST] AI-Driven Value Creation for Shore Capital Portfolio Companies';
const body = [
  'Hi Imran,',
  '',
  'I came across your work as CTO at Shore Capital Partners and wanted to reach out. With your portfolio spanning healthcare, financial services, and knowledge companies, I imagine there is no shortage of opportunities to drive efficiency through AI and automation.',
  '',
  'At <a href="https://hellogumbo.com">Gumbo</a>, we build AI-powered systems that help PE-backed companies move faster -- from intelligent automation and workflow optimization to custom AI agents that accelerate portfolio company operations. We have worked with firms that share your focus on technology-enabled value creation.',
  '',
  'I would love to share a few examples of how we have helped similar portfolio companies unlock measurable gains. Would you be open to a brief conversation?',
  '',
  'Looking forward to connecting.'
].join('\n');

sendEmail(to, subject, body).then(() => console.log('Done')).catch(e => console.error('ERROR:', e.message));
