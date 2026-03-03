const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const emails = [
  {
    to: 'paglialoro@roarkcapital.com',
    name: 'Paul',
    subject: 'AI ops for franchise portfolios like Inspire and Driven Brands',
    body: `Hi Paul,

Roark's franchise and multi-unit portfolio -- Inspire Brands, Driven Brands, Purpose Brands -- caught my attention. At that scale, even small operational improvements compound fast across hundreds of locations.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom automation and AI tools for PE portfolio companies. Think internal workflow automation, data pipeline modernization, and AI-assisted decision-making -- the kind of work that drives measurable EBITDA impact without massive headcount increases.

A few examples of what we build: automated reporting dashboards that replace manual Excel workflows, AI agents that handle customer service or internal ops tasks, and integration layers that connect fragmented tech stacks across portfolio companies.

Would it make sense to set up a quick call to explore where AI could move the needle across Roark's portfolio?`,
    co: 'Roark Capital Group',
    cRowIdx: 37,
    s1RowIdx: 27
  },
  {
    to: 'bogobowicz@kohlberg.com',
    name: 'Michael',
    subject: 'AI and data strategy for Kohlberg portfolio companies',
    body: `Hi Michael,

Your role as Operating Executive for AI and Data at Kohlberg is exactly the kind of position we love working alongside. Translating AI from buzzword to actual portfolio value creation is hard -- especially across diverse sectors like healthcare, industrial, and financial services.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. We focus on practical implementations that drive measurable results: think automated data pipelines, AI agents for operational workflows, and intelligent reporting systems.

Rather than big consulting engagements, we build fast and ship in weeks -- delivering working software, not slide decks.

Given your focus on AI and data across Kohlberg's portfolio, I would love to compare notes on where you are seeing the biggest opportunities. Open to a quick conversation?`,
    co: 'Kohlberg & Company',
    cRowIdx: 38,
    s1RowIdx: 59
  },
  {
    to: 'dhook@baymarkpartners.com',
    name: 'David',
    subject: 'Automating ops across IT services and distribution portfolios',
    body: `Hi David,

Baymark's focus on IT services, healthcare, and distribution companies presents a lot of surface area for AI-driven efficiency gains. These are exactly the kinds of businesses where smart automation can reduce overhead and accelerate growth without adding headcount.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom automation and AI tools for PE portfolio companies. We handle everything from internal workflow automation to customer-facing AI features -- practical builds that ship in weeks, not months.

Some of what we have built recently: AI agents that automate repetitive business processes, reporting dashboards that replace manual data wrangling, and integration systems that connect disconnected tools across portfolio companies.

Would you be open to a 15-minute call to explore where automation could create value across Baymark's portfolio?`,
    co: 'Baymark Partners',
    cRowIdx: 107,
    s1RowIdx: 13
  },
  {
    to: 'jvitale@aligncp.com',
    name: 'Joe',
    subject: 'AI-powered M&A integration tools for B2B software portfolios',
    body: `Hi Joe,

Align Capital's B2B software and professional services focus -- companies like E Source, Marco Rubber, and Global Guardian -- is right in our sweet spot. Post-acquisition integration and operational improvement are where AI delivers the fastest ROI.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We specialize in practical builds that ship fast: workflow automation, data infrastructure modernization, and AI agents that handle operational tasks.

For portfolio M&A specifically, we have seen AI accelerate integration timelines -- automated data migration, unified reporting across acquired entities, and intelligent process standardization.

Given your focus on portfolio M&A at Align, would it make sense to have a quick conversation about where AI could streamline integration or drive value creation?`,
    co: 'Align Capital Partners',
    cRowIdx: 116,
    s1RowIdx: 24
  },
  {
    to: 'stuartnoelcompassgroupequitypartners@cgep.com',
    name: 'Stuart',
    subject: 'AI automation for industrial and life science portfolio operations',
    body: `Hi Stuart,

Compass Group's breadth across electronic manufacturing, industrial automation, food, and life sciences is impressive -- over 100 transactions and more than $1B in total value. That kind of diversified portfolio creates real opportunities for AI-driven operational improvements that scale.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. We focus on practical, high-impact builds: automated reporting, AI agents for operational workflows, data pipeline modernization, and integration systems that connect fragmented tech stacks.

We deliver working software in weeks -- not strategy decks that collect dust.

Would you be open to a brief call to discuss where AI and automation could drive value across Compass Group's portfolio?`,
    co: 'Compass Group Equity Partners',
    cRowIdx: 119,
    s1RowIdx: 29
  }
];

const { checkDedup } = require('./dedup-guard');

// Import sendEmail directly instead of shelling out (shell breaks on quotes in HTML body)
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
      console.log(`\nChecking dedup for ${e.name} at ${e.co} (${e.to})...`);
      const dedupResult = await checkDedup(e.to, e.subject);
      if (dedupResult.blocked) {
        console.log(`SKIPPED: ${dedupResult.reason}`);
        results.push({ ...e, sent: false, error: dedupResult.reason });
        continue;
      }
      console.log(`Sending to ${e.name} at ${e.co} (${e.to})...`);
      const res = await sendEmail(e.to, e.subject, e.body);
      console.log('Sent:', res.id);
      results.push({ ...e, sent: true });
    } catch (err) {
      console.error(`FAILED for ${e.to}:`, err.message);
      results.push({ ...e, sent: false, error: err.message });
    }
  }
  
  // Update CRM
  console.log('\n=== Updating CRM ===');
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const ts = new Date().toISOString();
  
  for (const e of results) {
    if (!e.sent) continue;
    try {
      // Update Sheet1 Last Contacted (col J) and Status (col I)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!I${e.s1RowIdx}:J${e.s1RowIdx}`,
        valueInputOption: 'RAW',
        requestBody: { values: [['Contacted', ts]] }
      });
      // Update Contacts Last Contacted (col I)
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
