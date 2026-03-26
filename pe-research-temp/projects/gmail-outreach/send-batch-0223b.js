const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const emails = [
  {
    to: 'jlitinger@abry.com',
    name: 'Jonathan',
    subject: 'AI tools for IT services and BPO portfolio companies',
    body: `Hi Jonathan,

Abry's focus on business services, healthcare IT, and insurance -- especially human capital management, IT services, and BPO -- is right in our wheelhouse. These are the kinds of companies where AI-driven automation creates immediate, measurable efficiency gains.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. For BPO and IT services firms, we have built AI agents that automate repetitive workflows, intelligent routing systems, and reporting dashboards that replace manual data wrangling.

Our typical builds run [PRICING REMOVED] and ship in weeks -- working software, not consulting decks.

Would you be open to a quick conversation about where AI could drive value across Abry's portfolio?`,
    co: 'Abry Partners',
    cRowIdx: 126,
    s1RowIdx: 31
  },
  {
    to: 'bmlnarik@newharborcap.com',
    name: 'Bo',
    subject: 'AI-powered ops for healthcare and education portfolios',
    body: `Hi Bo,

New Harbor's focus on healthcare services and education -- combined with a dedicated Portfolio Ops Group and six consecutive years on Inc's Founder-Friendly list -- tells me you take operational value creation seriously.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. For healthcare and education companies, we have built automated patient intake systems, AI-powered scheduling optimization, and reporting infrastructure that replaces fragmented Excel workflows.

We deliver working software in weeks. We work well alongside existing ops teams who need execution bandwidth for AI initiatives.

Would it make sense to have a brief call to explore where AI could complement New Harbor's Portfolio Ops work?`,
    co: 'New Harbor Capital',
    cRowIdx: 149,
    s1RowIdx: 53
  },
  {
    to: 'grossbard@clearviewhc.com',
    name: 'Lee',
    subject: 'AI automation for healthcare and business services portfolios',
    body: `Hi Lee,

Clearview's 30-year track record across healthcare services, business services, and consumer -- with 150+ transactions -- is impressive. At that portfolio scale, even small operational improvements compound fast.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. For healthcare and services businesses, we build practical tools that ship fast: automated reporting dashboards, AI agents for patient or customer intake, and integration systems that connect disconnected tools across portfolio companies.

We deliver working software in weeks, not months.

As COO, you have visibility into where operational friction is costing margin. Would you be open to a 15-minute call to explore where AI could create value across Clearview's portfolio?`,
    co: 'Clearview Capital',
    cRowIdx: 164,
    s1RowIdx: 55
  },
  {
    to: 'gillian.rhew@pamlicocapital.com',
    name: 'Gillian',
    subject: 'AI tools for healthcare and financial services growth equity',
    body: `Hi Gillian,

Pamlico's growth equity approach across healthcare, business services, and financial services -- plus the dedicated ops team with Tillitski, Sheth, and Lanier -- signals a firm that takes hands-on value creation seriously. That is exactly where AI delivers the fastest ROI.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. We focus on practical builds: workflow automation, AI agents for operational tasks, and data infrastructure that scales with growth.

For a firm like Pamlico with a $750M Fund VI, the math on AI-driven efficiency gains across the portfolio adds up quickly. Our typical builds run [PRICING REMOVED] and ship in weeks.

Would it make sense to connect and discuss where AI could support Pamlico's value creation initiatives?`,
    co: 'Pamlico Capital',
    cRowIdx: 175,
    s1RowIdx: 70
  },
  {
    to: 'tbagley@pfingsten.com',
    name: 'Thomas',
    subject: 'AI-driven efficiency for mid-market services and distribution',
    body: `Hi Thomas,

Pfingsten's 10 consecutive years as a Top 50 PE Middle Market firm -- with a dedicated three-person Operations Team -- tells me you understand that operational excellence is what separates good deals from great ones.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. For business services and distribution companies, we have built automated dispatch and routing systems, AI-powered inventory management tools, and reporting dashboards that replace manual processes.

Our builds run [PRICING REMOVED] and ship in weeks -- practical software that your ops team can deploy across portfolio companies immediately.

As the founder, you have the long view on where technology creates lasting value. Would you be open to a quick conversation about how AI could complement Pfingsten's operations approach?`,
    co: 'Pfingsten Partners',
    cRowIdx: 181,
    s1RowIdx: 113
  }
];

function getAuth2() {
  const creds = JSON.parse(fs.readFileSync(__dirname + '/credentials.json'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(__dirname + '/token.json'));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function sendEmail(to, subject, body) {
  const blocked = ['heygumbo.com'];
  const domain = to.split('@')[1]?.toLowerCase();
  if (blocked.includes(domain)) throw new Error(`BLOCKED: "${to}" uses blocked domain`);

  const gmail2 = google.gmail({ version: 'v1', auth: getAuth2() });
  const htmlBody = body.split(/\n\n+/).map(p => p.replace(/\n/g, ' ').trim()).join('<br><br>');
  const bcc = 'jeff@hellogumbo.com, alex@hellogumbo.com';
  const signature = `<br><br>--<br>Jim Jensen<br><a href="https://hellogumbo.com">Gumbo</a> | <a href="https://hellogumbo.com">hellogumbo.com</a><br>AI-first engineering, served simple.<br><a href="mailto:jim@hellogumbo.com">jim@hellogumbo.com</a>`;
  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nBcc: ${bcc}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}${signature}</div>`
  ).toString('base64url');
  const res = await gmail2.users.messages.send({ userId: 'me', requestBody: { raw } });
  return res.data;
}

async function run() {
  const results = [];
  for (const e of emails) {
    try {
      console.log(`\nSending to ${e.name} at ${e.co} (${e.to})...`);
      const res = await sendEmail(e.to, e.subject, e.body);
      console.log('Sent:', res.id);
      results.push({ ...e, sent: true });
    } catch (err) {
      console.error(`FAILED for ${e.to}:`, err.message);
      results.push({ ...e, sent: false, error: err.message });
    }
  }

  console.log('\n=== Updating CRM ===');
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const ts = new Date().toISOString();

  for (const e of results) {
    if (!e.sent) continue;
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!I${e.s1RowIdx}:J${e.s1RowIdx}`,
        valueInputOption: 'RAW',
        requestBody: { values: [['Contacted', ts]] }
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Contacts!I${e.cRowIdx}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[ts]] }
      });
      console.log(`Updated CRM for ${e.co}`);
    } catch (err) {
      console.error(`CRM update failed for ${e.co}:`, err.message);
    }
  }

  console.log('\n=== SUMMARY ===');
  results.forEach(r => console.log(`${r.sent ? 'SENT' : 'FAILED'}: ${r.name} @ ${r.co} (${r.to}) - "${r.subject}"`));
}

run().catch(e => console.error(e));
