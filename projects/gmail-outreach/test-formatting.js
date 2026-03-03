const { sendEmail } = require('./send.js');

const testBody = `Hi Alex,

This is a test email to verify line break formatting.

Here's a paragraph with proper spacing between paragraphs. Each paragraph should be separated by visible whitespace.

Another paragraph here. Single line breaks within a paragraph should flow naturally, but double line breaks should create clear separation.

Key points:
- Bullet one
- Bullet two
- Bullet three

Let me know if the formatting looks correct!

Thanks`;

sendEmail('alex@hellogumbo.com', 'Test: Line Break Formatting Check', testBody)
  .then(() => console.log('✅ Test email sent successfully'))
  .catch(err => console.error('❌ Error:', err));
