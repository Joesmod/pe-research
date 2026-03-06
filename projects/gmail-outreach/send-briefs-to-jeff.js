const { sendEmail } = require('./send.js');
const fs = require('fs');

async function sendBriefs() {
  // Read both briefs
  const charlesbank = fs.readFileSync('../charlesbank-meeting-brief.md', 'utf8');
  const knoxLane = fs.readFileSync('../knox-lane-meeting-brief.md', 'utf8');
  
  // Send Charlesbank brief
  console.log('Sending Charlesbank brief...');
  await sendEmail(
    'jeff@hellogumbo.com',
    'Charlesbank Meeting Brief (Mar 11, 11 AM ET)',
    `<pre>${charlesbank}</pre>`
  );
  console.log('✅ Charlesbank brief sent');
  
  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Send Knox Lane brief
  console.log('Sending Knox Lane brief...');
  await sendEmail(
    'jeff@hellogumbo.com',
    'Knox Lane Meeting Brief (Mar 11, Afternoon)',
    `<pre>${knoxLane}</pre>`
  );
  console.log('✅ Knox Lane brief sent');
  
  console.log('\n✅ Both briefs sent to jeff@hellogumbo.com');
}

sendBriefs().catch(console.error);
