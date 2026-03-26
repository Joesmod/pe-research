const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

const CREDS_PATH = path.join(__dirname, 'gmail-outreach', 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'gmail-outreach', 'token.json');
const SA_KEY = path.join(__dirname, 'gmail-outreach', 'service-account.json');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function getGmailAuth() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function sendEmail(to, subject, body) {
  const auth = getGmailAuth();
  const gmail = google.gmail({ version: 'v1', auth });
  const htmlBody = body
    .split(/\n\n+/)
    .map(para => para.replace(/\n/g, ' ').trim())
    .join('<br><br>');
  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}</div>`
  ).toString('base64url');
  const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  return res.data.id;
}

async function updateSheets(companyName, contactRow, timestamp) {
  const auth = new google.auth.GoogleAuth({ keyFile: SA_KEY, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const c = await auth.getClient();
  const s = google.sheets({ version: 'v4', auth: c });

  // Find company row in Sheet1
  const sheet1 = await s.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:A' });
  const rows = sheet1.data.values || [];
  const rowIdx = rows.findIndex(r => r[0] === companyName);
  if (rowIdx > 0) {
    await s.spreadsheets.values.update({
      spreadsheetId: SHEET_ID, range: `Sheet1!I${rowIdx + 1}:J${rowIdx + 1}`,
      valueInputOption: 'RAW', requestBody: { values: [['Contacted', timestamp]] }
    });
  }

  // Find contact row in Contacts and update Last Contacted (col I)
  if (contactRow > 0) {
    await s.spreadsheets.values.update({
      spreadsheetId: SHEET_ID, range: `Contacts!I${contactRow + 1}`,
      valueInputOption: 'RAW', requestBody: { values: [[timestamp]] }
    });
  }
}

const emails = [
  {
    company: 'JLL Partners',
    to: 'j.hunter@jllpartners.com',
    contactName: 'Jeff',
    subject: 'AI engineering capacity for JLL portfolio companies',
    body: `Hi Jeff,

Your role as Chief AI Officer at JLL Partners is exactly why I wanted to reach out. We're Gumbo -- an AI-first engineering studio that builds production AI systems: LLM integrations, agent workflows, RAG pipelines, NLP, and computer vision.

Given JLL's portfolio across business services, healthcare, and technology services -- including companies like Promptworks and Modus Create -- I imagine you're evaluating where AI can drive the most value. We work as embedded pods with portfolio companies, which means we plug in fast and ship weekly. For someone in your seat coordinating AI strategy across the portfolio, having a technical team that can actually execute makes the difference between pilots that stall and ones that scale.

Would a quick call make sense to see if there's a fit?

Best,
Jim
Gumbo | hellogumbo.com`,
    contactRow: 7 // Jeff Hunter row in Contacts
  },
  {
    company: 'Greater Sum Ventures',
    to: 'brian.seagraves@greatersumventures.com',
    contactName: 'Brian',
    subject: 'AI development partner for Greater Sum portfolio',
    body: `Hi Brian,

Your role overseeing product and technology across Greater Sum's portfolio caught my attention. We're Gumbo -- an AI-first product and engineering studio that builds and ships production AI systems as embedded teams.

With Greater Sum's focus on tech-enabled business services and companies like PracticeTek and ProfitSolv, there's likely strong demand for AI features -- whether that's automating workflows, building intelligent customer-facing tools, or creating new product capabilities. We staff dedicated pods that integrate directly with your portfolio companies' teams and deliver weekly.

Would it be worth a quick conversation to see where there might be a fit?

Best,
Jim
Gumbo | hellogumbo.com`,
    contactRow: 12 // Brian Seagraves row
  },
  {
    company: 'Huron Capital',
    to: 'lierardi@huroncapital.com',
    contactName: 'Leah',
    subject: 'AI engineering for Huron Capital\'s ExecFactor program',
    body: `Hi Leah,

Huron Capital's ExecFactor program is a smart approach to value creation, and it's exactly the kind of model where we add the most value. We're Gumbo -- an AI-first engineering studio that builds production AI systems as embedded teams.

With Huron's portfolio spanning infrastructure, facility, and residential services, we've seen that services businesses often have the highest ROI from AI -- automating back-office operations, building smarter scheduling and dispatch systems, or using data pipelines to improve decision-making. We staff dedicated pods that plug directly into portfolio companies and ship weekly.

Would it make sense to connect and see if there's alignment with any current ExecFactor initiatives?

Best,
Jim
Gumbo | hellogumbo.com`,
    contactRow: 27 // Leah Ierardi row
  },
  {
    company: 'Waud Capital Partners',
    to: 'rroggeveen@waudcapital.com',
    contactName: 'Richard',
    subject: 'AI engineering studio for Waud\'s software and healthcare portfolio',
    body: `Hi Richard,

Your focus on software and technology at Waud Capital is exactly why I wanted to reach out. We're Gumbo -- an AI-first engineering studio that builds production AI systems: LLM integrations, agent workflows, RAG pipelines, and computer vision.

With Waud's portfolio across healthcare services and software, we've found that these companies are often sitting on high-value AI opportunities but lack the specialized engineering talent to execute. We work as dedicated pods that integrate directly with your portfolio companies' existing teams -- no long ramp-up, just senior engineers shipping production code from week one.

Would a quick call make sense to explore if there's a fit with anything in the portfolio?

Best,
Jim
Gumbo | hellogumbo.com`,
    contactRow: 54 // Richard Roggeveen row
  },
  {
    company: 'Revelstoke Capital Partners',
    to: 'athoma@revelstokecapital.com',
    contactName: 'Andrew',
    subject: 'AI capacity for Revelstoke\'s healthcare services platforms',
    body: `Hi Andrew,

Your role leading strategic partnerships and value creation at Revelstoke is why I wanted to reach out. We're Gumbo -- an AI-first engineering studio that builds production AI systems as embedded teams.

Healthcare services is one of the sectors where we see the biggest AI opportunities -- from automating clinical documentation and patient intake workflows to building intelligent scheduling systems and using NLP to extract insights from unstructured medical data. We staff dedicated pods that plug directly into your portfolio companies and deliver weekly.

Would it be worth a quick conversation to see where AI could move the needle across Revelstoke's platforms?

Best,
Jim
Gumbo | hellogumbo.com`,
    contactRow: 80 // Andrew Thoma row
  }
];

(async () => {
  const timestamp = new Date().toISOString();
  const results = [];

  for (const e of emails) {
    try {
      const msgId = await sendEmail(e.to, e.subject, e.body);
      console.log(`✅ ${e.company} (${e.to}): ${msgId}`);
      await updateSheets(e.company, e.contactRow, timestamp);
      console.log(`   Sheet updated`);
      results.push({ company: e.company, to: e.to, subject: e.subject, status: 'sent' });
    } catch (err) {
      console.error(`❌ ${e.company}: ${err.message}`);
      results.push({ company: e.company, to: e.to, status: 'failed', error: err.message });
    }
  }

  console.log('\n=== SUMMARY ===');
  results.forEach(r => console.log(`${r.status === 'sent' ? '✅' : '❌'} ${r.company} -> ${r.to} | ${r.subject || r.error}`));
})();
