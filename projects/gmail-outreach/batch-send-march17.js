const fs = require('fs');
const { sendEmail } = require('./send.js');

async function main() {
  const emails = JSON.parse(fs.readFileSync('emails-march17-25.json', 'utf8'));
  
  console.log(`🚀 Starting batch send for ${emails.length} emails...`);
  console.log(`Started at: ${new Date().toISOString()}\n`);
  
  const results = [];
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const num = i + 1;
    
    console.log(`[${num}/${emails.length}] Sending to ${email.contact} at ${email.company}...`);
    
    try {
      const result = await sendEmail(email.to, email.subject, email.body);
      results.push({
        ...email,
        status: 'sent',
        messageId: result.id,
        sentAt: new Date().toISOString()
      });
      console.log(`   ✅ Sent (ID: ${result.id})`);
      
      // Delay 3 seconds between sends to avoid rate limits
      if (i < emails.length - 1) {
        console.log('   ⏱️  Waiting 3 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      results.push({
        ...email,
        status: 'failed',
        error: error.message,
        failedAt: new Date().toISOString()
      });
    }
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = `batch-results-${timestamp}.json`;
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  
  const successful = results.filter(r => r.status === 'sent').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`\n📊 Batch Send Complete`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📄 Results saved to: ${resultsFile}`);
  console.log(`\nFinished at: ${new Date().toISOString()}`);
}

main().catch(console.error);
