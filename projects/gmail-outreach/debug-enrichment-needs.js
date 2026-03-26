const { google } = require('googleapis');

async function debugNeeds() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:N1000',
  });

  const rows = response.data.values;
  
  // Categorize by status patterns
  let enrichedStatuses = [];
  let sectorStatuses = [];
  let needsResearchStatuses = [];
  let otherStatuses = [];
  
  for (let i = 1; i < Math.min(100, rows.length); i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    if (!company) continue;
    
    const entry = { row: i + 1, company, status, hasContact: !!contactName, hasEmail: !!email, website: !!website };
    
    if (status.includes('Enriched')) {
      enrichedStatuses.push(entry);
    } else if (status.includes('Dead')) {
      // skip
    } else if (status === 'Needs Manual Research' || status.includes('Needs Email') || status.includes('Research')) {
      needsResearchStatuses.push(entry);
    } else if (status.match(/^(Business Services|Healthcare|Technology|Industrial|Consumer|Financial Services|Manufacturing)/i)) {
      sectorStatuses.push(entry);
    } else {
      otherStatuses.push(entry);
    }
  }

  console.log('=== ENRICHED (sample 5) ===');
  enrichedStatuses.slice(0, 5).forEach(e => {
    console.log(`Row ${e.row}: ${e.company} | Status: ${e.status} | Contact: ${e.hasContact} | Email: ${e.hasEmail}`);
  });

  console.log('\n=== NEEDS RESEARCH (all) ===');
  needsResearchStatuses.forEach(e => {
    console.log(`Row ${e.row}: ${e.company} | Status: ${e.status} | Contact: ${e.hasContact} | Email: ${e.hasEmail} | Website: ${e.hasWebsite}`);
  });

  console.log('\n=== SECTOR STATUS (first 15) ===');
  sectorStatuses.slice(0, 15).forEach(e => {
    console.log(`Row ${e.row}: ${e.company} | Status: ${e.status} | Contact: ${e.hasContact} | Email: ${e.hasEmail} | Website: ${e.hasWebsite}`);
  });

  console.log('\n=== OTHER STATUS (first 10) ===');
  otherStatuses.slice(0, 10).forEach(e => {
    console.log(`Row ${e.row}: ${e.company} | Status: "${e.status}" | Contact: ${e.hasContact} | Email: ${e.hasEmail} | Website: ${e.hasWebsite}`);
  });

  console.log('\n=== SUMMARY ===');
  console.log(`Enriched: ${enrichedStatuses.length}`);
  console.log(`Needs Research: ${needsResearchStatuses.length}`);
  console.log(`Sector Status: ${sectorStatuses.length}`);
  console.log(`Other: ${otherStatuses.length}`);
}

debugNeeds().catch(console.error);
