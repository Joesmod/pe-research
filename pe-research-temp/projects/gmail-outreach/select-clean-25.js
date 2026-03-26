const {google} = require('googleapis');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({version: 'v4', auth});
  const sheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get Sheet1 to check company-level Last Contacted
  const sheet1Res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:K'
  });
  
  const sheet1Rows = sheet1Res.data.values.slice(1);
  const companyLastContacted = {};
  const companyData = {};
  
  sheet1Rows.forEach(r => {
    const company = r[0]; // Company Name (col A)
    const lastContacted = r[9]; // Last Contacted (col J)
    const sectorFocus = r[6] || ''; // Sector Focus (col G)
    const portfolio = r[7] || ''; // Portfolio Companies (col H)
    
    if (company) {
      companyData[company.toLowerCase()] = {
        sectorFocus,
        portfolio
      };
      
      if (lastContacted && lastContacted.startsWith('202')) {
        companyLastContacted[company.toLowerCase()] = lastContacted;
      }
    }
  });
  
  console.log(`Sheet1: ${Object.keys(companyLastContacted).length} companies have Last Contacted timestamps\n`);
  
  // Get Contacts sheet
  const contactsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Contacts!A:I'
  });

  const contactRows = contactsRes.data.values.slice(1);
  
  // Filter: has email, not contacted, company not recently contacted, CLEAN DATA
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const eligible = contactRows.filter(r => {
    if (!r[3] || !r[3].includes('@')) return false; // no valid email
    if (r[8] && r[8].startsWith('202')) return false; // already contacted
    
    const company = (r[0] || '').toLowerCase();
    const companyLastContact = companyLastContacted[company];
    
    if (companyLastContact) {
      const lastContactDate = new Date(companyLastContact);
      if (lastContactDate > oneWeekAgo) {
        return false; // contacted within last week
      }
    }
    
    // Quality filters
    const score = r[7] || '';
    const linkedin = r[5] || '';
    
    // Skip if score looks like bad data (pure numbers >20) or missing
    const scoreNum = parseInt(score);
    if (!isNaN(scoreNum) && scoreNum > 20) return false;
    
    // Skip if notes indicate data issues
    if (score.includes('exhausted') || score.includes('NEEDS')) return false;
    if (score.includes('No public data')) return false;
    
    return true;
  });
  
  console.log(`${eligible.length} clean contacts are eligible\n`);
  
  // Prioritize: CTO/CIO/Chief AI/VP Technology roles, then by length of enrichment data
  const prioritized = eligible.sort((a,b) => {
    const titleA = (a[2] || '').toLowerCase();
    const titleB = (b[2] || '').toLowerCase();
    
    const techRolesA = ['cto', 'cio', 'chief technology', 'chief information', 'chief ai', 'vp technology', 'vp product', 'head of technology'].some(role => titleA.includes(role));
    const techRolesB = ['cto', 'cio', 'chief technology', 'chief information', 'chief ai', 'vp technology', 'vp product', 'head of technology'].some(role => titleB.includes(role));
    
    if (techRolesA && !techRolesB) return -1;
    if (!techRolesA && techRolesB) return 1;
    
    // Then by enrichment quality (longer score text = better enrichment)
    const scoreA = (a[7] || '').length;
    const scoreB = (b[7] || '').length;
    return scoreB - scoreA;
  });
  
  // ONE CONTACT PER COMPANY
  const seenCompanies = new Set();
  const top25 = [];
  
  for (const row of prioritized) {
    const company = (row[0] || '').toLowerCase();
    if (!seenCompanies.has(company)) {
      seenCompanies.add(company);
      top25.push(row);
      if (top25.length >= 25) break;
    }
  }
  
  console.log('=== TOP 25 CLEAN CONTACTS FOR OUTREACH ===\n');
  top25.forEach((r, i) => {
    const company = r[0] || '?';
    const name = r[1] || '?';
    const title = r[2] || '?';
    const email = r[3] || '?';
    const linkedin = r[5] || '';
    
    const compKey = company.toLowerCase();
    const sector = companyData[compKey]?.sectorFocus || '?';
    const portfolio = companyData[compKey]?.portfolio || '?';
    
    console.log(`${i+1}. ${company}`);
    console.log(`   Contact: ${name} - ${title}`);
    console.log(`   Email: ${email}`);
    console.log(`   Sector: ${sector}`);
    console.log(`   Portfolio: ${portfolio.substring(0, 100)}${portfolio.length > 100 ? '...' : ''}`);
    if (linkedin) console.log(`   LinkedIn: ${linkedin}`);
    console.log('');
  });
  
})().catch(e => console.error(e));
