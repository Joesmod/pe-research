const { google } = require('googleapis');
const fs = require('fs');

// Read active targets from UTF-16 JSON
const activeTargetsRaw = fs.readFileSync('active-targets.json', 'utf16le');
const activeTargets = JSON.parse(activeTargetsRaw);

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Filter targets needing enrichment
  const needsEnrichment = activeTargets.filter(t => 
    !t.email || t.email === '' || 
    t.email.startsWith('info@') || 
    t.email.startsWith('ir@') || 
    t.email.startsWith('sales@')
  ).slice(0, 15);
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment:`);
  needsEnrichment.forEach(t => {
    console.log(`Row ${t.row}: ${t.company} - ${t.contact} (${t.title}) - Email: "${t.email || 'EMPTY'}"`);
  });
  
  return needsEnrichment;
}

enrichLeads().catch(console.error);
