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
  console.log('Sent to ' + to + ': ' + res.data.id);
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
    fullName: 'Matthew Gosselin',
    email: 'mgosselin@audaxprivateequity.com',
    company: 'Audax Private Equity',
    title: 'Managing Director',
    subject: 'AI agents for Audax portfolio operations',
    body: `Matthew,

Audax's track record of 150+ platform investments in business services, healthcare, and industrial sectors caught my eye -- that volume of portfolio companies creates real opportunity for AI-driven operational leverage.

At <a href="https://hellogumbo.com">Gumbo</a>, we are an AI engineering agency that builds and deploys AI agents for PE-backed businesses. We help portfolio companies automate workflows, build intelligent reporting, and deploy customer-facing AI tools. For mid-market services businesses like Audax backs, these implementations tend to deliver fast, measurable ROI.

Would a quick 15-minute call make sense to walk through a few relevant examples?`,
    contactRow: 212,
    s1Row: 2
  },
  {
    fullName: 'Aakash Madhu',
    email: 'amadhu@lindenllc.com',
    company: 'Linden Capital Partners',
    title: 'Managing Director',
    subject: 'AI implementations for healthcare portfolio companies',
    body: `Aakash,

Linden's deep focus on healthcare and life sciences -- with portfolio companies like Advarra, Smile Doctors, and Spear Education -- is a space where we have seen AI adoption create outsized impact, especially around clinical workflows and patient engagement.

At <a href="https://hellogumbo.com">Gumbo</a>, we are an AI engineering agency that helps PE-backed companies deploy AI agents across operations. For healthcare services businesses, we build tools that automate administrative processes, enhance data pipelines, and create intelligent interfaces -- all while keeping compliance front and center.

I would love to share a couple of use cases specific to healthcare services. Would 15 minutes this week work?`,
    contactRow: 227,
    s1Row: 5
  },
  {
    fullName: 'Michael Nichols',
    email: 'mnichols@kelso.com',
    company: 'Kelso & Company',
    title: 'Partner, Managing Director',
    subject: 'AI-powered value creation across Kelso portfolio',
    body: `Michael,

Kelso's diversified approach across healthcare, business services, and financial services -- plus recent exits like the Accession Risk Management sale to Brown & Brown -- suggests a portfolio that could benefit meaningfully from AI-driven operational improvements.

At <a href="https://hellogumbo.com">Gumbo</a>, we are an AI engineering agency that builds and deploys AI agents for PE-backed companies. From automated workflows to intelligent reporting and customer-facing tools, we help services businesses improve margins and scale more efficiently.

Would you have 15 minutes for a quick call to discuss how this might apply to current portfolio priorities?`,
    contactRow: 242,
    s1Row: 7
  },
  {
    fullName: 'Laura Holson',
    email: 'lholson@newmountaincapital.com',
    company: 'New Mountain Capital',
    title: 'Managing Director & COO, Credit',
    subject: 'AI automation for New Mountain portfolio operations',
    body: `Laura,

New Mountain's focus on healthcare services, business services, and software -- particularly tech-enabled services companies -- aligns well with the kind of AI implementations that deliver quick operational wins.

At <a href="https://hellogumbo.com">Gumbo</a>, we are an AI engineering agency that helps PE-backed businesses deploy AI agents to automate processes, build smarter reporting, and create tools that help lean teams scale. Given your role overseeing operations, I think a few of our recent projects would resonate.

Would a 15-minute call this week make sense to walk through some examples?`,
    contactRow: 260,
    s1Row: 12
  },
  {
    fullName: 'Jim Gallagher',
    email: 'gallagher@gryphoninvestors.com',
    company: 'Gryphon Investors',
    title: 'Managing Director & Head of Business Development',
    subject: 'AI engineering for Gryphon portfolio companies',
    body: `Jim,

Gryphon's services-heavy mid-market portfolio across business services, healthcare, and industrial sectors is exactly where we see AI tooling create the most impact -- automating manual processes that are common across services businesses.

At <a href="https://hellogumbo.com">Gumbo</a>, we are an AI engineering agency that builds and deploys AI agents for PE-backed companies. We help portfolio businesses automate workflows, deploy intelligent data tools, and build AI-powered interfaces that drive efficiency without heavy IT overhead.

Would you have 15 minutes to discuss how this might fit with Gryphon's current portfolio priorities?`,
    contactRow: 279,
    s1Row: 18
  },
  {
    fullName: 'Connor O\'Byrne',
    email: 'connor@gemspring.com',
    company: 'Gemspring Capital',
    title: 'Managing Director, Business Development',
    subject: 'AI agents for Gemspring portfolio growth',
    body: `Connor,

Gemspring's portfolio -- spanning companies like ClearCompany, Crash Champions, and GoldenSource -- shows a real appetite for technology-enabled value creation across diverse sectors.

At <a href="https://hellogumbo.com">Gumbo</a>, we are an AI engineering agency that builds and deploys AI agents for PE-backed businesses. From automated workflows to intelligent customer tools, we help portfolio companies move faster and operate leaner. For software and services businesses like Gemspring backs, the implementations tend to pay back quickly.

Would 15 minutes work this week to share a few relevant examples?`,
    contactRow: 298,
    s1Row: 22
  }
];

const NOW = new Date().toISOString();

async function run() {
  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];
    console.log(`[${i+1}/${contacts.length}] Sending to ${c.fullName} (${c.email})...`);
    await sendEmail(c.email, c.subject, c.body);
    
    await updateSheet(`Contacts!I${c.contactRow}`, NOW);
    await updateSheet(`Sheet1!I${c.s1Row}`, 'Contacted');
    await updateSheet(`Sheet1!J${c.s1Row}`, NOW);
    console.log(`  CRM updated for ${c.company}`);
    
    if (i < contacts.length - 1) await new Promise(r => setTimeout(r, 2000));
  }
  console.log('ALL_DONE');
}

run().catch(e => { console.error(e); process.exit(1); });
