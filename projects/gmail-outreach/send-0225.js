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

const emails = [
  {
    to: "cchock@vistriaprg.com",
    subject: "Digital transformation across healthcare and education portfolios",
    body: `Hi Calvin,

Your role leading digital transformation at Vistria caught my eye -- healthcare, education, and financial services portfolios all have different tech stacks but similar operational bottlenecks.

We're <a href="https://hellogumbo.com">Gumbo</a>, and we build and deploy AI agents across PE portfolios. Not strategy decks -- working systems that handle operational work inside portfolio companies. Repeatable playbooks that scale across platforms without rebuilding from scratch each time.

With companies like Forcura and Medalogix in the portfolio, there's likely overlap in where AI can move the needle. Happy to compare notes -- 15 minutes?

Best,
Jim`
  },
  {
    to: "pmurray@leeequity.com",
    subject: "AI engineering for Lee Equity's healthcare and financial services portfolio",
    body: `Hi Paul,

Running technology across Lee Equity's portfolio -- healthcare services, financial services, business services -- means you're juggling a dozen different tech environments at once.

We're <a href="https://hellogumbo.com">Gumbo</a>, and we build AI agents that deploy across PE portfolios. Not one-off consulting projects -- repeatable systems that handle operational work inside the companies. The kind of builds that drive measurable value without massive headcount.

Happy to do a quick 15 minutes to compare notes on what we're seeing work across similar portfolios.

Best,
Jim`
  },
  {
    to: "esouza@berkshirepartners.com",
    subject: "AI across Berkshire's healthcare and business services portfolio",
    body: `Hi Eric,

Wearing both the CTO and CISO hats at Berkshire means you're thinking about portfolio-wide technology and security simultaneously -- that's a rare combination and exactly the lens we think about AI deployment through.

We're <a href="https://hellogumbo.com">Gumbo</a>, and we build AI agents across PE portfolios. Working systems, not strategy decks -- deployed with security and governance baked in from day one. Companies like Ensemble Health Partners and Precision Medicine Group are exactly the kind of platforms where AI agents create measurable operational leverage.

15 minutes to compare notes?

Best,
Jim`
  },
  {
    to: "joe.rubino@gtcr.com",
    subject: "AI engineering capacity for GTCR's portfolio resources group",
    body: `Hi Joe,

Co-heading GTCR's Portfolio Resources Group as CTO -- you're the person actually building the technology layer across healthcare, financial services, and business services platforms. That's exactly the work we do.

We're <a href="https://hellogumbo.com">Gumbo</a>, and we build and deploy AI agents across PE portfolios. Repeatable playbooks that scale across portfolio companies without rebuilding from scratch. The gap between AI strategy and working systems inside the companies is where most firms stall -- we close it.

Would 15 minutes be useful to compare approaches?

Best,
Jim`
  }
];

(async () => {
  for (let i = 0; i < emails.length; i++) {
    const e = emails[i];
    try {
      const res = await sendEmail(e.to, e.subject, e.body);
      console.log(`✅ ${i+1}/4 Sent to ${e.to} — ID: ${res.id}`);
    } catch (err) {
      console.error(`❌ ${i+1}/4 FAILED ${e.to}:`, err.message);
    }
    if (i < emails.length - 1) await new Promise(r => setTimeout(r, 2000));
  }
  console.log('\nDone!');
})();
