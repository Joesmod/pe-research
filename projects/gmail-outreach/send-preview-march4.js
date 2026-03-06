// Preview Email - March 4 Batch
// Sends first email to Alex for approval before batch

const { sendEmail } = require('./send.js');

const firstEmail = {
  originalRecipient: 'jflannery@charlesbank.com',
  subject: 'Portfolio AI Rollouts at Charlesbank',
  body: `John,<br><br>Congrats on leading Portfolio Resources at Charlesbank — I noticed you're actively supporting portcos through value creation.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that helps PE-backed companies roll out AI across operations. We've worked with portfolio companies to deploy AI agents for customer service, sales ops, and back-office automation.<br><br>Would you be open to a brief call to explore how we could support your portfolio companies?<br><br>Best,<br>Jim from Gumbo`
};

async function sendPreview() {
  console.log('📧 PREVIEW EMAIL - March 4 Batch');
  console.log(`Original recipient: ${firstEmail.originalRecipient}`);
  console.log(`Sending preview to: alex@hellogumbo.com`);
  console.log(`Subject: ${firstEmail.subject}\n`);
  
  try {
    const previewSubject = `[PREVIEW] ${firstEmail.subject} → ${firstEmail.originalRecipient}`;
    const previewBody = `<strong style="color: red;">⚠️ PREVIEW - This email will be sent to: ${firstEmail.originalRecipient}</strong><br><br><hr><br>${firstEmail.body}`;
    
    await sendEmail('alex@hellogumbo.com', previewSubject, previewBody);
    console.log('✅ Preview sent to Alex!');
    console.log('\nAwaiting approval before sending batch...');
  } catch (error) {
    console.error('❌ Failed to send preview:', error.message);
  }
}

sendPreview();
