const { google } = require('googleapis');
const fs = require('fs');

async function crossReferenceCRM() {
  // Load sent emails audit
  const sentEmails = JSON.parse(fs.readFileSync('sent-emails-audit.json'));
  console.log(`Loaded ${sentEmails.length} sent emails from audit\n`);
  
  // Load CRM
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:K'
  });
  
  const rows = res.data.values || [];
  const headers = rows[0];
  
  console.log('CRM Headers:', headers);
  console.log(`CRM has ${rows.length - 1} rows\n`);
  
  // Create email-to-row mapping
  const emailMap = {};
  for (let i = 1; i < rows.length; i++) {
    const email = (rows[i][4] || '').trim().toLowerCase(); // Column E (Email)
    if (email) {
      emailMap[email] = {
        row: i + 1,
        company: rows[i][0],
        contactName: rows[i][2],
        email: rows[i][4],
        status: rows[i][9],
        lastContacted: rows[i][10]
      };
    }
  }
  
  console.log(`Built email map for ${Object.keys(emailMap).length} contacts\n`);
  
  // Find mismatches
  const needsUpdate = [];
  const alreadyUpdated = [];
  const notInCRM = [];
  
  for (const sent of sentEmails) {
    const email = sent.to.toLowerCase();
    const crmEntry = emailMap[email];
    
    if (!crmEntry) {
      notInCRM.push(sent);
      continue;
    }
    
    // Check if status is "Contacted" and Last Contacted has a timestamp
    if (crmEntry.status === 'Contacted' && crmEntry.lastContacted) {
      alreadyUpdated.push({ sent, crm: crmEntry });
    } else {
      needsUpdate.push({ sent, crm: crmEntry });
    }
  }
  
  console.log('=== AUDIT RESULTS ===\n');
  console.log(`✅ Already updated: ${alreadyUpdated.length}`);
  console.log(`⚠️  Needs update: ${needsUpdate.length}`);
  console.log(`❌ Not in CRM: ${notInCRM.length}\n`);
  
  if (needsUpdate.length > 0) {
    console.log('NEEDS UPDATE:\n');
    needsUpdate.forEach((item, idx) => {
      console.log(`${idx + 1}. Row ${item.crm.row}: ${item.crm.company}`);
      console.log(`   Email: ${item.crm.email}`);
      console.log(`   Current Status: ${item.crm.status || '(empty)'}`);
      console.log(`   Last Contacted: ${item.crm.lastContacted || '(empty)'}`);
      console.log(`   Sent: ${item.sent.dateStr}\n`);
    });
  }
  
  if (notInCRM.length > 0) {
    console.log('\nNOT IN CRM (sent but no matching email in Sheet1):\n');
    notInCRM.slice(0, 20).forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.to} - ${item.subject}`);
    });
  }
  
  // Save results
  fs.writeFileSync('crm-audit-results.json', JSON.stringify({
    alreadyUpdated,
    needsUpdate,
    notInCRM
  }, null, 2));
  
  console.log(`\n✅ Results saved to crm-audit-results.json`);
  console.log(`\nSummary: ${needsUpdate.length} contacts need CRM updates`);
}

crossReferenceCRM().catch(console.error);
