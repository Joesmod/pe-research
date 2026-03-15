const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  const rows = res.data.values || [];
  const headers = rows[0];
  
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  
  let total = 0;
  let hasContact = 0;
  let hasEmail = 0;
  let hasBoth = 0;
  let enriched = 0;
  let dead = 0;
  let sent = 0;
  let unresearched = 0;
  let needsWork = 0;
  
  const genericEmails = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'careers@'];
  const sampleNeedsWork = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    if (!company.trim()) continue;
    
    total++;
    
    if (contact.trim()) hasContact++;
    if (email.trim()) hasEmail++;
    if (contact.trim() && email.trim()) hasBoth++;
    
    if (status === 'Enriched') enriched++;
    else if (status === 'Dead') dead++;
    else if (status === 'Sent') sent++;
    else if (status === 'Unresearched') unresearched++;
    
    const hasGenericEmail = genericEmails.some(prefix => email.toLowerCase().startsWith(prefix));
    const needsEnrichment = (!contact.trim() || !email.trim() || hasGenericEmail) && 
                           status !== 'Enriched' && status !== 'Dead' && status !== 'Sent';
    
    if (needsEnrichment) {
      needsWork++;
      if (sampleNeedsWork.length < 10) {
        sampleNeedsWork.push({
          row: i + 1,
          company,
          contact,
          email,
          status
        });
      }
    }
  }
  
  console.log('=== Sheet Status ===');
  console.log(`Total firms: ${total}`);
  console.log(`With contact: ${hasContact} (${(hasContact/total*100).toFixed(1)}%)`);
  console.log(`With email: ${hasEmail} (${(hasEmail/total*100).toFixed(1)}%)`);
  console.log(`With both: ${hasBoth} (${(hasBoth/total*100).toFixed(1)}%)`);
  console.log('');
  console.log('Status breakdown:');
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Dead: ${dead}`);
  console.log(`  Sent: ${sent}`);
  console.log(`  Unresearched: ${unresearched}`);
  console.log(`  Other: ${total - enriched - dead - sent - unresearched}`);
  console.log('');
  console.log(`🎯 Leads needing enrichment: ${needsWork}`);
  
  if (sampleNeedsWork.length > 0) {
    console.log('\n=== Sample leads needing work ===');
    sampleNeedsWork.forEach(l => {
      console.log(`Row ${l.row}: ${l.company}`);
      console.log(`  Contact: ${l.contact || '(empty)'}`);
      console.log(`  Email: ${l.email || '(empty)'}`);
      console.log(`  Status: ${l.status || '(empty)'}`);
    });
  }
}

main().catch(console.error);
