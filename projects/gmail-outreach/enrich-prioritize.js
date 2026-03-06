const { google } = require('googleapis');
const fs = require('fs');

async function prioritizeEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  // Find firms needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 5) continue;
    
    const [firmName, website, contactName, title, email, , , , , status] = row;
    
    // Skip if dead/not PE
    if (status && status.includes('Dead')) continue;
    
    // Needs enrichment if:
    // 1. Status is "Partial" or "New - Unresearched"
    // 2. Email is generic (info@, sales@, ir@, admin@, contact@)
    // 3. Missing contact name or email
    
    const isPartial = status === 'Partial' || status === 'New - Unresearched';
    const isGeneric = email && (email.includes('info@') || email.includes('sales@') || 
                                 email.includes('ir@') || email.includes('admin@') || 
                                 email.includes('contact@') || email.includes('value@'));
    const missingInfo = !contactName || !email;
    
    if (isPartial || isGeneric || missingInfo) {
      needsEnrichment.push({
        row: i + 1,
        firmName,
        website,
        contactName,
        title,
        email,
        status,
        priority: (isPartial ? 2 : 0) + (isGeneric ? 1 : 0) + (missingInfo ? 3 : 0)
      });
    }
  }
  
  // Sort by priority (higher = more urgent)
  needsEnrichment.sort((a, b) => b.priority - a.priority);
  
  // Take top 15
  const top15 = needsEnrichment.slice(0, 15);
  
  console.log(JSON.stringify(top15, null, 2));
}

prioritizeEnrichment().catch(console.error);
