const fs = require('fs');

async function generateUpdateList() {
  // Load audit results
  const audit = JSON.parse(fs.readFileSync('crm-audit-results.json'));
  const needsUpdate = audit.needsUpdate;
  const notInCRM = audit.notInCRM;
  
  console.log('MANUAL CRM UPDATE LIST\n');
  console.log('='.repeat(80));
  console.log('\n**PART 1: 48 EXISTING ENTRIES TO UPDATE**\n');
  console.log('Row | Company | Email | Status → Contacted | Last Contacted → [timestamp]\n');
  
  const updates = [];
  
  needsUpdate.forEach(item => {
    const sentDate = new Date(item.sent.date).toISOString();
    updates.push({
      row: item.crm.row,
      company: item.crm.company,
      email: item.crm.email,
      currentStatus: item.crm.status || '(empty)',
      newStatus: 'Contacted',
      newTimestamp: sentDate
    });
    
    console.log(`${item.crm.row} | ${item.crm.company} | ${item.crm.email} | Contacted | ${sentDate}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('\n**PART 2: 25 NEW ENTRIES TO ADD** (sent Monday March 9 but not in CRM)\n');
  console.log('Email | Subject | Date Sent\n');
  
  const newEntries = [];
  
  // Get the 25 PE emails from March 9 (exclude lemwarmup)
  const march9Emails = notInCRM.filter(e => 
    e.dateStr.includes('Mon, 9 Mar 2026') && 
    e.subject.startsWith('Tech stack for')
  );
  
  march9Emails.forEach(item => {
    const company = item.subject.replace('Tech stack for ', '');
    newEntries.push({
      email: item.to,
      company,
      subject: item.subject,
      date: item.dateStr
    });
    
    console.log(`${item.to} | ${item.subject} | ${item.dateStr}`);
  });
  
  // Generate CSV for easy import
  const csv = [];
  csv.push('Type,Row,Company,Email,Status,Last Contacted');
  
  updates.forEach(u => {
    csv.push(`UPDATE,${u.row},"${u.company}","${u.email}",Contacted,${u.newTimestamp}`);
  });
  
  newEntries.forEach(n => {
    csv.push(`NEW,,"${n.company}","${n.email}",Contacted,${n.date}`);
  });
  
  fs.writeFileSync('crm-update-list.csv', csv.join('\n'));
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Total updates: ${updates.length + newEntries.length}`);
  console.log(`   - ${updates.length} existing rows to update`);
  console.log(`   - ${newEntries.length} new entries to add`);
  console.log('\n✅ Saved to crm-update-list.csv');
}

generateUpdateList().catch(console.error);
