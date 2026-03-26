const fs = require('fs');
const { sendEmail } = require('./send.js');

async function main() {
  // Load the first email
  const emails = JSON.parse(fs.readFileSync('emails-march17-25.json', 'utf8'));
  const first = emails[0];
  
  // Send preview to Alex
  const previewSubject = `[PREVIEW] ${first.subject}`;
  const previewBody = `Alex - This is a PREVIEW of the first email in today's batch of 25.\n\nOriginal recipient: ${first.to} (${first.company} - ${first.contact}, ${first.title})\n\n---\n\n${first.body}`;
  
  console.log(`📧 Sending preview to alex@hellogumbo.com...\n`);
  console.log(`Subject: ${previewSubject}`);
  console.log(`\nPreview content:\n`);
  console.log(previewBody);
  console.log('\n---\n');
  
  await sendEmail('alex@hellogumbo.com', previewSubject, previewBody);
  
  console.log('\n✅ Preview sent! Waiting for Alex approval before sending batch.');
}

main().catch(console.error);
