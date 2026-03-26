const { google } = require('googleapis');
const fs = require('fs');

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

async function sendEmail(to, subject, body, bccOverride) {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  const htmlBody = body
    .split(/\n\n+/)
    .map(para => para.replace(/\n/g, ' ').trim())
    .join('<br><br>');

  const bcc = bccOverride || 'jeff@hellogumbo.com, alex@hellogumbo.com';

  const signature = '<br><br>--<br>Jim Jensen<br><a href="https://hellogumbo.com">Gumbo</a> | <a href="https://hellogumbo.com">hellogumbo.com</a><br>AI-first engineering, served simple.<br><a href="mailto:jim@hellogumbo.com">jim@hellogumbo.com</a>';

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nBcc: ${bcc}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}${signature}</div>`
  ).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  console.log('Sent to ' + to + ': ' + res.data.id);
  return res.data;
}

const emails = [
  {
    to: 'bobby@aldrichcap.com',
    company: 'Aldrich Capital Partners',
    contact: 'Bobby Tahir',
    title: 'CTO Advisor',
    subject: 'AI Engineering for Aldrich Portfolio Companies',
    body: `Hi Bobby,

I came across your work as CTO Advisor at Aldrich Capital Partners and wanted to reach out. With Aldrich's focus on tech-enabled services and healthcare, I imagine your portfolio companies are constantly evaluating where AI and automation can drive real operational leverage.

That is exactly what we do at <a href="https://hellogumbo.com">Gumbo</a>. We are an AI-first engineering agency that builds production-grade AI systems for PE-backed companies -- from intelligent automation and internal tooling to customer-facing AI products. We work fast, ship real systems, and understand the value creation timelines PE firms operate on.

If any of your portfolio companies are exploring AI initiatives or need hands-on engineering support to turn AI strategy into working software, I would love to connect.

Would a quick call make sense?`
  },
  {
    to: 'wwashburn@capstreet.com',
    company: 'Capstreet',
    contact: 'Wayne Washburn',
    title: 'Chief Technology Officer',
    subject: 'Scaling Tech Across the Capstreet Portfolio',
    body: `Hi Wayne,

As CTO at Capstreet, you are in a unique position to see the technology needs across an entire portfolio of industrial and tech-enabled services businesses. The Capvalue Framework is a smart approach -- and I think there is an opportunity to accelerate it with AI.

At <a href="https://hellogumbo.com">Gumbo</a>, we are an AI-first engineering agency that partners with PE-backed companies to build and ship production AI systems. We handle everything from workflow automation and data infrastructure to customer-facing AI products. Our team understands the pace and accountability that comes with PE ownership.

With Capstreet's focus on software and tech-enabled services, I would imagine several portfolio companies could benefit from dedicated AI engineering support. Would it be worth a conversation to explore where we might add value?`
  },
  {
    to: 'tlong@bcap.com',
    company: 'Bertram Capital',
    contact: 'Tom Long',
    title: 'Principal',
    subject: 'Complementing Bertram Labs with AI Engineering',
    body: `Hi Tom,

Bertram Capital caught my attention because of Bertram Labs -- having an in-house tech enablement team is rare in PE and shows a real commitment to driving technology-led value creation across your portfolio.

I wanted to introduce <a href="https://hellogumbo.com">Gumbo</a>. We are an AI-first engineering agency that builds production AI systems for PE-backed companies. We specialize in the kind of work that complements an internal team like Bertram Labs: purpose-built AI automation, intelligent internal tools, and customer-facing AI features that create measurable value.

Whether your portfolio companies need help with AI-powered process automation, data pipelines, or building AI products from scratch, we can move fast and deliver production-ready systems.

Would it make sense to connect and explore where Gumbo could extend what Bertram Labs is already doing?`
  },
  {
    to: 'kevin@diversis.com',
    company: 'Diversis Capital',
    contact: 'Kevin Ma',
    title: 'Co-Founder & Managing Partner',
    subject: 'AI Engineering for Diversis Software Portfolio',
    body: `Hi Kevin,

Congratulations on closing Fund III -- and the explicit focus on AI-driven value creation really stands out. With portfolio companies like SalesRabbit, Fishbowl, and ServicePower, there is clearly a strong thesis around software businesses that can be transformed with the right technology investments.

I am reaching out from <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that partners with PE-backed software companies to build production AI systems. We help companies ship AI features, automate operations, and build intelligent products -- the kind of engineering work that turns an AI thesis into real EBITDA impact.

Given your background in CS, robotics, and EE, I think you would appreciate our approach: hands-on engineering, no slide decks, and a focus on shipping systems that actually work.

Would a short conversation make sense to explore where we could support Diversis portfolio companies?`
  },
  {
    to: 'ptwaddell@pfingsten.com',
    company: 'Pfingsten Partners',
    contact: 'Paul Twaddell',
    title: 'Principal - Operating Partner',
    subject: 'AI-Powered Operations for Pfingsten Portfolio Companies',
    body: `Hi Paul,

With 174 acquisitions and a reputation as one of the top middle-market PE firms for over a decade, Pfingsten clearly knows how to create value in manufacturing, distribution, and business services.

I wanted to introduce <a href="https://hellogumbo.com">Gumbo</a>. We are an AI-first engineering agency that helps PE-backed companies in exactly these sectors build and deploy AI systems -- from intelligent process automation and predictive analytics to AI-powered customer tools. We understand the operational focus that drives real returns in industrial and services businesses.

As an Operating Partner, you are likely seeing opportunities across the portfolio where AI could drive margin improvement, reduce manual work, or unlock new capabilities. That is where we come in -- we build and ship those systems, fast.

Would it be worth a quick conversation to explore how Gumbo could support value creation across the Pfingsten portfolio?`
  }
];

async function main() {
  const mode = process.argv[2] || 'preview';
  
  if (mode === 'preview') {
    // Send first email as preview to Alex
    const first = emails[0];
    console.log('Sending preview of first email to alex@hellogumbo.com...');
    console.log('Subject: [PREVIEW] ' + first.subject);
    console.log('Original recipient: ' + first.to + ' (' + first.contact + ' at ' + first.company + ')');
    await sendEmail(
      'alex@hellogumbo.com',
      '[PREVIEW - Batch 2/23] ' + first.subject + ' (to: ' + first.contact + ' at ' + first.company + ')',
      'PREVIEW - This email would go to ' + first.to + ' (' + first.contact + ', ' + first.title + ' at ' + first.company + ')\n\nFull batch: ' + emails.map(e => e.contact + ' at ' + e.company).join(', ') + '\n\n---ORIGINAL EMAIL BELOW---\n\n' + first.body,
      '' // no BCC for preview
    );
    console.log('Preview sent. Waiting for approval before sending batch.');
  } else if (mode === 'send') {
    for (const e of emails) {
      console.log('Sending to ' + e.contact + ' at ' + e.company + '...');
      await sendEmail(e.to, e.subject, e.body);
      console.log('Done: ' + e.company);
      await new Promise(r => setTimeout(r, 2000));
    }
    console.log('All 5 emails sent.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
