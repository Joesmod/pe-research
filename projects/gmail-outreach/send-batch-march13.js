const fs = require('fs');
const { sendEmail } = require('./send.js');

async function main() {
  const batch = JSON.parse(fs.readFileSync('batch-march13-8am.json', 'utf8'));

  console.log(`\n📧 Sending ${batch.length} emails...\n`);

  for (const email of batch) {
    console.log(`Sending to ${email.to} (${email.contact.company})...`);
    
    await sendEmail({
      to: email.to,
      bcc: email.bcc.join(','),
      subject: email.subject,
      body: email.body
    });

    console.log(`✅ Sent to ${email.contact.contact}`);
    
    // Wait 2 seconds between emails to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ All ${batch.length} emails sent!`);
}

main().catch(console.error);
