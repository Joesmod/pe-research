const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const emails = [
  {
    to: 'kevin@diversis.com',
    name: 'Kevin',
    subject: 'AI builds for software portfolios like SalesRabbit and Fishbowl',
    body: `Hi Kevin,

Diversis caught my eye -- a technical founder running a PE firm with $1.2B in Fund III and a portfolio full of software companies like SalesRabbit, Fishbowl, and ServicePower. That is a rare combination.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom automation and AI tools for PE portfolio companies. For software-heavy portfolios like yours, we have seen AI deliver fast ROI in areas like automated customer onboarding, intelligent support triage, and data pipeline modernization.

Our typical builds run [PRICING REMOVED] and ship in weeks -- working software, not strategy decks.

Given your technical background and the AI focus in Fund III, would it make sense to have a quick conversation about where we could add value across the Diversis portfolio?`,
    co: 'Diversis Capital',
    cRowIdx: 48,
    s1RowIdx: 88
  },
  {
    to: 'tlong@bcap.com',
    name: 'Tom',
    subject: 'Extending Bertram Labs with AI-powered portfolio tools',
    body: `Hi Tom,

Bertram Capital stands out for having Bertram Labs in-house -- product strategists, engineers, designers, and marketers already embedded in the firm. That is exactly the kind of infrastructure where targeted AI builds create outsized impact.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. We specialize in practical builds: workflow automation, AI agents for operational tasks, and intelligent reporting systems.

For a firm that already thinks like a tech company, we complement the existing team by shipping focused AI projects fast -- [PRICING REMOVED] builds that deliver in weeks, not months.

Would it make sense to connect and explore how we could extend what Bertram Labs is already doing across the portfolio?`,
    co: 'Bertram Capital',
    cRowIdx: 70,
    s1RowIdx: 137
  },
  {
    to: 'bobby@aldrichcap.com',
    name: 'Bobby',
    subject: 'AI tools for Aldrich portfolio companies like ProcessMaker',
    body: `Hi Bobby,

Your CTO Advisor role at Aldrich Capital is exactly the kind of position where we can be most useful. Translating technical strategy into real portfolio value -- especially across tech-enabled services and healthcare -- is hard without execution capacity.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We focus on practical, fast-shipping builds: AI agents for operational workflows, automated data pipelines, and integration systems that connect fragmented tech stacks.

We deliver working software in weeks. We work well alongside portfolio CTOs who need execution bandwidth for AI initiatives.

Would you be open to a quick call to discuss where AI could drive value across Aldrich's portfolio?`,
    co: 'Aldrich Capital Partners',
    cRowIdx: 134,
    s1RowIdx: 40
  },
  {
    to: 'aepstein@sterlingpartners.com',
    name: 'Avi',
    subject: 'AI-driven operations for education and healthcare portfolios',
    body: `Hi Avi,

Sterling Partners' focus on education and healthcare services creates strong opportunities for AI-driven operational improvements. These are sectors where automation can reduce administrative burden and improve outcomes without sacrificing the human element.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. Think automated reporting that replaces manual Excel workflows, AI agents that handle repetitive operational tasks, and integration layers that unify data across acquisitions.

Our builds typically run [PRICING REMOVED] and ship in weeks -- practical software that delivers measurable impact.

As COO, you have visibility across the full portfolio. Would it make sense to have a brief conversation about where AI could move the needle for Sterling's companies?`,
    co: 'Sterling Partners',
    cRowIdx: 143,
    s1RowIdx: 41
  },
  {
    to: 'tbrooker@svoco.com',
    name: 'Tom',
    subject: 'AI automation for business services portfolio operations',
    body: `Hi Tom,

Svoboda's deep focus on business services -- professional, industrial, and transportation/logistics -- across 50+ partnerships is impressive. These are exactly the kinds of companies where smart automation compounds value across every portfolio company.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. For business services firms, we have built everything from automated dispatch and scheduling systems to AI-powered customer intake and reporting dashboards.

As Operating Partner, you are in the best position to spot where operational friction is costing margin. We deliver working software in weeks.

Would you be open to a 15-minute call to explore where AI could create value across Svoboda's portfolio?`,
    co: 'Svoboda Capital Partners',
    cRowIdx: 158,
    s1RowIdx: 54
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

async function sendEmail(to, subject, body, bccOverride) {
  const blocked = ['heygumbo.com'];
  const domain = to.split('@')[1]?.toLowerCase();
  if (blocked.includes(domain)) throw new Error(`BLOCKED: "${to}" uses blocked domain`);

  const gmail2 = google.gmail({ version: 'v1', auth: getAuth2() });
  const htmlBody = body.split(/\n\n+/).map(p => p.replace(/\n/g, ' ').trim()).join('<br><br>');
  const bcc = bccOverride || 'jeff@hellogumbo.com, alex@hellogumbo.com';
  const signature = `<br><br>--<br>Jim Jensen<br><a href="https://hellogumbo.com">Gumbo</a> | <a href="https://hellogumbo.com">hellogumbo.com</a><br>AI-first engineering, served simple.<br><a href="mailto:jim@hellogumbo.com">jim@hellogumbo.com</a>`;
  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nBcc: ${bcc}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}${signature}</div>`
  ).toString('base64url');
  const res = await gmail2.users.messages.send({ userId: 'me', requestBody: { raw } });
  return res.data;
}

const mode = process.argv[2] || 'preview'; // 'preview' or 'send'

async function run() {
  if (mode === 'preview') {
    // Send first email to Alex for approval
    const e = emails[0];
    console.log('Sending PREVIEW of first email to alex@hellogumbo.com...');
    console.log(`Subject: ${e.subject}`);
    console.log(`Original recipient: ${e.to} (${e.name} @ ${e.co})`);
    const previewBody = `<b>[PREVIEW - This would go to ${e.to} (${e.name} at ${e.co})]</b><br><br>` + e.body;
    const res = await sendEmail('alex@hellogumbo.com', `[PREVIEW] ${e.subject}`, previewBody, '');
    console.log('Preview sent:', res.id);
    console.log('\nWaiting for approval. Run with "send" to send all 5.');
  } else if (mode === 'send') {
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

    // Update CRM
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
}

run().catch(e => console.error(e));
