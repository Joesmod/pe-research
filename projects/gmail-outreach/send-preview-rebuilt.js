const { sendEmail } = require('./send.js');
const batch = require('./clean-batch-25-verified.json');

const preview = batch[0];
const firstName = preview.name.split(' ')[0] || 'there';

const subject = `[PREVIEW] Tech stack for ${preview.company}`;
const body = `Hi ${firstName},<br><br>I'm Jim from <a href="https://hellogumbo.com">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at ${preview.company}, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for ${preview.company}?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href="https://hellogumbo.com">Gumbo</a>`;

sendEmail('alex@hellogumbo.com', subject, body)
  .then(() => console.log('✓ Preview sent to alex@hellogumbo.com'))
  .catch(err => console.error('✗ Failed:', err.message));
