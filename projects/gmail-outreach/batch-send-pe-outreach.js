// BATCH SEND SCRIPT - PE OUTREACH 2026-03-25
// DO NOT RUN without Alex's approval

const { sendEmail } = require('./send.js');
const emails = require('./emails-draft.json');

async function sendBatch() {
  console.log(`Sending ${emails.length} emails...\n`);
  
  const results = [];
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`${i+1}/${emails.length}: Sending to ${email.name} (${email.company})...`);
    
    try {
      await sendEmail(email.to, email.subject, email.body);
      
      console.log(`  ✓ Sent to ${email.to}`);
      results.push({ success: true, email: email.to, company: email.company });
      
      // Rate limit: 1 email per 2 seconds
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`  ✗ Failed to send to ${email.to}: ${error.message}`);
      results.push({ success: false, email: email.to, company: email.company, error: error.message });
    }
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n=== BATCH COMPLETE ===`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log(`\nFailed sends:`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.company} (${r.email}): ${r.error}`);
    });
  }
}

if (require.main === module) {
  sendBatch().catch(console.error);
}

module.exports = { sendBatch };
