const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read the sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found');
    return;
  }
  
  const headers = rows[0];
  
  // Column indices
  const companyIdx = 0;  // Company Name
  const contactIdx = 2;  // Contact Name
  const emailIdx = 4;    // Email
  const websiteIdx = 5;  // Website
  const sectorIdx = 7;   // Sector Focus
  const portfolioIdx = 8; // Portfolio Companies
  const statusIdx = 9;   // Status
  
  // Find PE firms needing enrichment
  const peFirms = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[companyIdx] || '').trim();
    const contact = (row[contactIdx] || '').trim();
    const email = (row[emailIdx] || '').trim();
    const website = (row[websiteIdx] || '').trim();
    const sector = (row[sectorIdx] || '').trim();
    const portfolio = (row[portfolioIdx] || '').trim();
    const status = (row[statusIdx] || '').trim();
    
    // Skip if no company name
    if (!company) continue;
    
    // Skip if already enriched, dead, or bounced
    if (status === 'Enriched' || status === 'Dead' || status === 'Bounced' || status === 'Dead Lead') continue;
    
    // Skip obvious non-PE firms
    const isNonPE = company.match(/search|recruiter|recruiting|prep|oasis|training|education|consulting|advisory(?! partners)/i);
    if (isNonPE) continue;
    
    // Needs enrichment if missing contact or has generic email
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|admin|general)@/i);
    
    if (!contact || !email || hasGenericEmail) {
      // Score based on how likely it's a real PE firm
      let score = 0;
      
      // Has sector focus = likely PE
      if (sector && sector.length > 5) score += 2;
      
      // Has portfolio companies = likely PE
      if (portfolio && portfolio.length > 10) score += 3;
      
      // Has "Partners", "Capital", "Equity" in name = likely PE
      if (company.match(/partners|capital|equity|ventures|fund|investment/i)) score += 1;
      
      // Has proper website
      if (website && website.match(/^https?:\/\//)) score += 1;
      
      // Only include if score >= 3 (likely PE)
      if (score >= 3) {
        peFirms.push({
          rowIndex: i,
          company,
          contact,
          email,
          website,
          sector,
          portfolio,
          status,
          score
        });
      }
    }
  }
  
  // Sort by score (highest first)
  peFirms.sort((a, b) => b.score - a.score);
  
  console.log(`Found ${peFirms.length} likely PE firms needing enrichment\n`);
  
  // Show top 15
  const batch = peFirms.slice(0, 15);
  batch.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.company} (Score: ${item.score})`);
    console.log(`   Row: ${item.rowIndex + 1}`);
    console.log(`   Contact: ${item.contact || 'EMPTY'} | Email: ${item.email || 'EMPTY'}`);
    console.log(`   Website: ${item.website || 'EMPTY'}`);
    console.log(`   Sector: ${item.sector || 'EMPTY'}`);
    console.log(`   Portfolio: ${item.portfolio ? item.portfolio.substring(0, 60) + '...' : 'EMPTY'}\n`);
  });
  
  // Save for Apollo enrichment
  fs.writeFileSync('real-pe-targets-march5-136am.json', JSON.stringify(batch, null, 2));
  console.log('✅ Targets saved to real-pe-targets-march5-136am.json');
}

main().catch(console.error);
