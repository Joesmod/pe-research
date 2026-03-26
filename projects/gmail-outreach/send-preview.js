// Send preview email to Alex
const { sendEmail } = require('./send.js');
const emails = require('./emails-draft.json');

async function sendPreview() {
  const firstEmail = emails[0];
  
  const previewSubject = `[PREVIEW] ${firstEmail.subject}`;
  const previewBody = `<p><strong>PREVIEW EMAIL - Batch of 25 PE outreach emails ready</strong></p>

<p>This is email #1 of 25. Review below and reply with approval to send the full batch.</p>

<hr>

<p><strong>To:</strong> ${firstEmail.to}<br>
<strong>Company:</strong> ${firstEmail.company}<br>
<strong>Contact:</strong> ${firstEmail.name}<br>
<strong>Title:</strong> ${firstEmail.title}</p>

<p><strong>Subject:</strong> ${firstEmail.subject}</p>

<hr>

${firstEmail.body}

<hr>

<p><em>Total batch: 25 emails to high-score PE contacts (Gumbo Score 9+, verified emails, tech/value creation roles)</em></p>`;

  console.log('Sending preview to alex@hellogumbo.com...');
  
  await sendEmail('alex@hellogumbo.com', previewSubject, previewBody);
  
  console.log('✓ Preview sent to alex@hellogumbo.com');
}

sendPreview().catch(console.error);
