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
    'From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ' + to + '\r\nBcc: ' + bcc + '\r\nSubject: ' + subject + '\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">' + htmlBody + signature + '</div>'
  ).toString('base64url');
  const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  console.log('Sent:', res.data.id);
  return res.data;
}

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateSheet(range, value) {
  const auth = new google.auth.GoogleAuth({keyFile: __dirname + '/service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID, range, valueInputOption: 'RAW',
    requestBody: { values: [[value]] }
  });
}

const contacts = [
  {
    name: 'Wayne',
    fullName: 'Wayne Washburn',
    email: 'wwashburn@capstreet.com',
    company: 'Capstreet',
    title: 'Chief Technology Officer',
    subject: 'AI for Capstreet portfolio companies',
    body: `Wayne,

I came across Capstreet and was impressed by the CapValue Framework -- building technology infrastructure into portfolio companies is exactly the kind of operational approach we support at <a href="https://hellogumbo.com">Gumbo</a>.

We are an AI engineering agency that helps PE-backed businesses deploy AI agents across operations -- think automated workflows, intelligent data pipelines, and customer-facing AI tools. For tech-enabled services and industrial business services like Capstreet targets, we have seen these implementations drive meaningful margin improvement within 90 days.

Given your role as CTO, I would love to share a few specific use cases that might map well to current or upcoming portfolio needs. Would a 15-minute call this week or next make sense?`,
    contactRow: 192,
    s1Row: 114
  },
  {
    name: 'Lia',
    fullName: 'Lia Lilleness',
    email: 'llilleness@alpineinvestors.com',
    company: 'Alpine Investors',
    title: 'VP Ops, Alpine Operations Group',
    subject: 'Scaling Alpine portfolio ops with AI agents',
    body: `Lia,

Alpine's PeopleFirst approach and the work the Operations Group does to drive value across portfolio companies caught my attention. With 190+ deals and a growing platform, the operational leverage from AI tooling could be significant.

At <a href="https://hellogumbo.com">Gumbo</a>, we are an AI engineering agency that builds and deploys AI agents for PE-backed businesses -- automating repetitive workflows, standing up intelligent reporting, and creating tools that let lean teams punch above their weight. For services and software platforms like Alpine backs, the ROI tends to be fast and measurable.

Since you lead operations across the portfolio, I would love to walk through a couple of relevant examples. Would you have 15 minutes this week?`,
    contactRow: 200,
    s1Row: 115
  },
  {
    name: 'Charles',
    fullName: 'Charles Anderson',
    email: 'canderson@ridgemontep.com',
    company: 'Ridgemont Equity Partners',
    title: 'Partner',
    subject: 'AI-driven value creation for Ridgemont portfolio',
    body: `Charles,

Ridgemont's focus on business and tech-enabled services, combined with healthcare and industrial growth platforms, maps well to the kind of AI implementations we build at <a href="https://hellogumbo.com">Gumbo</a>.

We are an AI engineering agency that helps PE-backed companies deploy AI agents to automate operations -- from internal workflows to customer-facing tools. For portfolio companies like Worldwide Express or SPG, these tools can unlock real efficiency gains without heavy IT lifts.

I would welcome the chance to share a few case studies that are relevant to Ridgemont's sectors. Would a brief call work sometime this week?`,
    contactRow: 697,
    s1Row: 209
  },
  {
    name: 'Bill',
    fullName: 'William Ogden',
    email: 'bill@unioncapitalassociates.com',
    company: 'Union Capital Associates',
    title: 'Managing Director',
    subject: 'AI tools for founder-owned businesses in Union Capital portfolio',
    body: `Bill,

Union Capital's focus on founder and family-owned businesses in the $20-200M range is a sweet spot for AI adoption -- these companies often have manual processes ripe for automation but lack the in-house tech resources to tackle it.

At <a href="https://hellogumbo.com">Gumbo</a>, we are an AI engineering agency that builds and deploys AI agents for PE-backed companies. Across food manufacturing, BPO, and business services (all sectors Union Capital targets), we have seen AI-driven workflow automation, quality monitoring, and intelligent reporting deliver fast payback.

I would love to share a few specific examples relevant to your portfolio. Do you have 15 minutes this week or next?`,
    contactRow: 701,
    s1Row: 296
  }
];

async function run() {
  // APPROVAL GATE: Send first email as preview to Alex
  const preview = contacts[0];
  console.log('Sending preview of first email to Alex...');
  await sendEmail(
    'alex@hellogumbo.com',
    '[PREVIEW] ' + preview.subject,
    'PREVIEW - This would go to: ' + preview.email + ' (' + preview.fullName + ', ' + preview.title + ' at ' + preview.company + ')\n\n---\n\n' + preview.body + '\n\n---\n\nRemaining batch:\n' + contacts.slice(1).map(c => '- ' + c.fullName + ' (' + c.title + ') at ' + c.company + ' <' + c.email + '>').join('\n') + '\n\nReply to approve sending.'
  );
  console.log('Preview sent. Waiting for approval before sending remaining emails.');
  console.log('APPROVAL_GATE_ACTIVE');
}

run().catch(e => { console.error(e); process.exit(1); });
