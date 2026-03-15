const { google } = require('googleapis');

async function findRealPETargets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  
  // Keywords that indicate PE firms vs other types
  const peFirmKeywords = ['capital', 'equity', 'partners', 'investments', 'ventures'];
  const excludeKeywords = ['search', 'advisors', 'consulting', 'oasis', 'prep', 'wefunder', 'keltic', 'hrcap'];
  
  const realPETargets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const companyName = (row[0] || '').toLowerCase();
    const contactName = row[2] || '';
    const email = row[4] || '';
    const status = (row[9] || '').toLowerCase();
    const notes = (row[11] || '').toLowerCase();
    const gumboScore = parseInt(row[13]) || 0;
    
    // Skip if already contacted/sent
    if (status.includes('contacted') || status.includes('sent')) {
      continue;
    }
    
    // Skip obvious non-PE
    if (excludeKeywords.some(kw => companyName.includes(kw))) {
      continue;
    }
    
    // Check for PE indicators in name
    const likelyPE = peFirmKeywords.some(kw => companyName.includes(kw));
    
    // Check for enrichment needs
    const genericEmailPattern = /^(info|sales|ir|media|contact|press|deals|team|hello|support|inquiries)@/i;
    const hasGenericEmail = email && genericEmailPattern.test(email);
    const needsEnrichment = !contactName || !email || hasGenericEmail;
    
    // Look for PE indicators in notes (mentions of funds, portfolio, AUM)
    const peNotesIndicators = ['fund', 'aum', 'portfolio', '$', 'investments', 'private equity'];
    const hasPEIndicators = peNotesIndicators.some(kw => notes.includes(kw));
    
    if (likelyPE && needsEnrichment && (gumboScore >= 6 || hasPEIndicators)) {
      realPETargets.push({
        rowIndex: i,
        companyName: row[0],
        contactName,
        email,
        status: row[9],
        gumboScore,
        notes: row[11] ? row[11].substring(0, 150) : '',
        reason: !contactName ? 'No contact' : (!email ? 'No email' : 'Generic email')
      });
    }
  }
  
  console.log(`\nFound ${realPETargets.length} likely PE firms needing enrichment:\n`);
  
  // Sort by Gumbo Score descending
  realPETargets.sort((a, b) => b.gumboScore - a.gumboScore);
  
  // Show top 20
  const batch = realPETargets.slice(0, 20);
  batch.forEach((lead, idx) => {
    console.log(`${idx + 1}. ${lead.companyName} (Score: ${lead.gumboScore})`);
    console.log(`   Contact: ${lead.contactName || 'MISSING'}`);
    console.log(`   Email: ${lead.email || 'MISSING'} (${lead.reason})`);
    console.log(`   Row: ${lead.rowIndex + 1}`);
    console.log('');
  });
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('real-pe-targets-march7-736am.json', JSON.stringify(batch, null, 2));
  console.log(`✓ Saved ${batch.length} priority PE targets to real-pe-targets-march7-736am.json`);
}

findRealPETargets().catch(console.error);
