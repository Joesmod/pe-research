const { sendEmail } = require('./send.js');

const previewEmail = {
  to: 'alex@hellogumbo.com',
  subject: '[PREVIEW] One Rock + AI: Operational Analytics for Portfolio Companies',
  body: `<p><strong>PREVIEW - Do not send batch until approved</strong></p>

<p><em>This is email 1 of 25. Full batch script: batch-emails-2026-03-12.js</em></p>

<hr>

<p><strong>To:</strong> aspector@onerockcapital.com (Allison Spector, Managing Director, Head of Sustainability at One Rock Capital Partners)</p>
<p><strong>Subject:</strong> One Rock + AI: Operational Analytics for Portfolio Companies</p>

<hr>

<p>Allison,</p>

<p>One Rock's sustainability-led value creation is unique in mid-market PE. As you drive ESG improvements across portfolio companies, there's a massive opportunity to layer in AI-powered operational analytics.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms embed intelligence into their portcos without the heavy lift. We've helped firms like yours turn operational data (supply chain, energy usage, workforce planning) into real-time decision support - and it directly improves sustainability metrics.</p>

<p>Would you be open to a brief call? I'd love to show you how we're helping sustainability-focused firms accelerate value creation with AI.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>

<hr>

<p><strong>Batch summary:</strong> 25 emails to PE contacts with Gumbo Score >= 8, verified emails, prioritizing tech/AI/value creation roles. No company contacted in last 7 days. Script ready but NOT executed.</p>`,
  from: 'Jim from Gumbo'
};

sendEmail(
  previewEmail.to,
  previewEmail.subject,
  previewEmail.body,
  previewEmail.from
).then(() => {
  console.log('✓ Preview sent to Alex');
}).catch(console.error);
