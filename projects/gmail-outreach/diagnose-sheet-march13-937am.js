const { google } = require('googleapis');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:O1000'
  });
  
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  console.log('Headers:', headers.join(' | '), '\n');
  
  const firmCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const emailCol = headers.indexOf('Email');
  const websiteCol = headers.indexOf('Website');
  const statusCol = headers.indexOf('Status');
  
  let emptyContact = 0;
  let emptyEmail = 0;
  let genericEmail = 0;
  let enriched = 0;
  let sent = 0;
  let dead = 0;
  let noStatus = 0;
  let missingWebsite = 0;
  
  const statusBreakdown = {};
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const website = row[websiteCol] || '';
    const status = row[statusCol] || '';
    
    if (!firm) continue;
    
    if (!contact) emptyContact++;
    if (!email) emptyEmail++;
    if (!website) missingWebsite++;
    
    const isGeneric = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@')
    );
    
    if (isGeneric) genericEmail++;
    
    if (status.toLowerCase().includes('enriched')) enriched++;
    if (status.toLowerCase().includes('sent')) sent++;
    if (status.toLowerCase().includes('dead')) dead++;
    if (!status) noStatus++;
    
    // Track status values
    if (status) {
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    }
  }
  
  console.log('📊 Sheet Statistics:');
  console.log('==========================================');
  console.log(`Total firms: ${rows.length - 1}`);
  console.log(`Empty Contact Name: ${emptyContact}`);
  console.log(`Empty Email: ${emptyEmail}`);
  console.log(`Generic Email (info@/sales@/etc): ${genericEmail}`);
  console.log(`Missing Website: ${missingWebsite}`);
  console.log(`Status = "Enriched": ${enriched}`);
  console.log(`Status contains "Sent": ${sent}`);
  console.log(`Status contains "Dead": ${dead}`);
  console.log(`No Status: ${noStatus}`);
  
  console.log('\n📋 Status Field Breakdown (top 20):');
  console.log('==========================================');
  const sortedStatuses = Object.entries(statusBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  sortedStatuses.forEach(([status, count]) => {
    console.log(`  ${count.toString().padStart(4)} - "${status}"`);
  });
  
  // Sample some rows that might need attention
  console.log('\n🔍 Sample Rows (first 15 with empty contact/email or generic):');
  console.log('==========================================');
  
  let sampleCount = 0;
  for (let i = 1; i < rows.length && sampleCount < 15; i++) {
    const row = rows[i];
    const firm = row[firmCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const website = row[websiteCol] || '';
    const status = row[statusCol] || '';
    
    if (!firm) continue;
    
    const isGeneric = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@')
    );
    
    if (!contact || !email || isGeneric) {
      console.log(`\nRow ${i + 1}: ${firm}`);
      console.log(`  Contact: '${contact}' | Email: '${email}'`);
      console.log(`  Website: ${website}`);
      console.log(`  Status: ${status}`);
      sampleCount++;
    }
  }
  
})().catch(console.error);
