const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function findEnrichmentNeeds() {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found');
    return;
  }

  const header = rows[0];
  console.log('Header:', header);
  console.log('\n');

  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    const company = row[0] || '';  // Company Name
    const notebookLM = row[1] || '';  // NotebookLM  
    const contactName = row[2] || '';  // Contact Name
    const title = row[3] || '';  // Title
    const email = row[4] || '';  // Email
    const website = row[5] || '';  // Website
    const linkedin = row[6] || '';  // LinkedIn
    const status = row[9] || '';  // Status
    
    // Skip if company is empty
    if (!company || company.trim() === '') continue;
    
    // Skip if marked as Dead
    if (status.toLowerCase().includes('dead')) continue;
    
    // Need enrichment if:
    // - Empty contact name, or
    // - Empty/generic email
    const needsContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && (
      email.includes('info@') ||
      email.includes('sales@') ||
      email.includes('ir@') ||
      email.includes('contact@') ||
      email.includes('media@')
    );
    const needsEmail = !email || email.trim() === '' || hasGenericEmail;
    
    if (needsContact || needsEmail) {
      targets.push({
        rowIndex: i + 1,
        company,
        website: website.includes('http') ? website : `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
        currentContact: contactName,
        currentTitle: title,
        currentEmail: email,
        status: status || 'Unknown',
        needsContact,
        needsEmail
      });
    }
  }

  console.log(`\n=== ENRICHMENT TARGETS ===`);
  console.log(`Total firms: ${rows.length - 1}`);
  console.log(`Need enrichment: ${targets.length}\n`);
  
  // Prioritize by need - firms with neither contact nor email first
  targets.sort((a, b) => {
    const aScore = (a.needsContact ? 2 : 0) + (a.needsEmail ? 1 : 0);
    const bScore = (b.needsContact ? 2 : 0) + (b.needsEmail ? 1 : 0);
    return bScore - aScore;
  });
  
  // Show first 15
  console.log('Top 15 priority enrichment targets:\n');
  targets.slice(0, 15).forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Contact: ${lead.currentContact || 'MISSING'}`);
    console.log(`   Email: ${lead.currentEmail || 'MISSING'}`);
    console.log(`   Website: ${lead.website}`);
    console.log(`   Needs: ${lead.needsContact ? 'Contact ' : ''}${lead.needsEmail ? 'Email' : ''}`);
    console.log('');
  });

  // Save to file
  fs.writeFileSync(
    'real-enrichment-targets-march6-306pm.json',
    JSON.stringify(targets.slice(0, 15), null, 2)
  );
  
  console.log('✓ Saved to real-enrichment-targets-march6-306pm.json');
}

findEnrichmentNeeds().catch(err => {
  console.error(err);
  process.exit(1);
});
