const { google } = require('googleapis');

async function findPriorityFirms() {
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
  console.log('Finding real PE firms with incomplete contacts...\n');

  const priorityFirms = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const notebookLM = row[1] || '';  // This appears to have website URLs
    const contact = row[2] || '';
    const email = row[4] || '';
    const website = row[5] || '';
    const status = row[9] || '';
    const notes = row[11] || '';
    const gumboScore = row[13] || '';

    // Extract website from NotebookLM column or Website column
    const firmWebsite = notebookLM.startsWith('http') ? notebookLM : (website || '');
    
    // Skip if already enriched with good contact
    if (status.includes('Enriched') && contact && email && 
        !email.startsWith('info@') && 
        !email.startsWith('sales@') &&
        !email.startsWith('ir@') &&
        !email.includes('@c2fo.com') && // Bad pattern
        contact !== 'Jacob Zodikoff' && // Not a real contact
        contact !== 'EMPTY') {
      continue;
    }

    // Need enrichment if: no real contact name, no email, or generic email
    const needsWork = !contact || 
                      contact === 'EMPTY' ||
                      contact === 'Jacob Zodikoff' ||
                      !email || 
                      email === 'EMPTY' ||
                      email.startsWith('info@') || 
                      email.startsWith('sales@') ||
                      email.startsWith('ir@');

    // Filter for REAL PE firms
    const looksLikePE = company.toLowerCase().includes('capital') ||
                        company.toLowerCase().includes('partners') ||
                        company.toLowerCase().includes('equity') ||
                        company.toLowerCase().includes('investment') ||
                        company.toLowerCase().includes('ventures');
                        
    const notRecruitingOrOther = !company.toLowerCase().includes('search') &&
                                 !company.toLowerCase().includes('association') &&
                                 !company.toLowerCase().includes('ilpa') &&
                                 !company.toLowerCase().includes('who invest') &&
                                 !company.toLowerCase().includes('podcast');

    if (needsWork && company && firmWebsite && looksLikePE && notRecruitingOrOther) {
      priorityFirms.push({
        rowIndex: i,
        company,
        contact: contact || 'EMPTY',
        email: email || 'EMPTY',
        website: firmWebsite,
        status,
        notes,
        gumboScore: gumboScore || 'N/A'
      });
    }
  }

  console.log(`Found ${priorityFirms.length} real PE firms needing enrichment\n`);
  
  // Sort by Gumbo Score (higher is better)
  priorityFirms.sort((a, b) => {
    const scoreA = parseInt(a.gumboScore) || 0;
    const scoreB = parseInt(b.gumboScore) || 0;
    return scoreB - scoreA;
  });

  // Show top 20
  console.log('🎯 TOP 20 PRIORITY FIRMS (by Gumbo Score):\n');
  priorityFirms.slice(0, 20).forEach((firm, idx) => {
    console.log(`${idx + 1}. ${firm.company} (Score: ${firm.gumboScore})`);
    console.log(`   Row ${firm.rowIndex + 1} | Contact: ${firm.contact} | Email: ${firm.email}`);
    console.log(`   Website: ${firm.website}`);
    console.log(`   Status: ${firm.status || 'N/A'}`);
    console.log('');
  });
}

findPriorityFirms().catch(console.error);
