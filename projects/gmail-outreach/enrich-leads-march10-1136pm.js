const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function extractLeadsNeedingEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values;
  const headers = rows[0];
  
  const companyIdx = 0; // Company Name
  const contactIdx = 2; // Contact Name
  const emailIdx = 4; // Email
  const websiteIdx = 5; // Website
  const linkedinIdx = 6; // LinkedIn
  const statusIdx = 9; // Status
  const notesIdx = 11; // Notes

  const needsEnrichment = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const website = row[websiteIdx] || '';
    const linkedin = row[linkedinIdx] || '';
    const status = row[statusIdx] || '';
    const notes = row[notesIdx] || '';
    
    // Skip if status is "Dead Lead" or empty company
    if (status === 'Dead Lead' || !company.trim()) continue;
    
    // Need enrichment if:
    // 1. No contact name, OR
    // 2. No email OR generic email
    const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'hello@', 'support@'];
    const hasGenericEmail = genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix));
    
    if (!contact.trim() || !email.trim() || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // Excel row number (1-indexed, +1 for header)
        company,
        contact,
        email,
        website,
        linkedin,
        status,
        notes,
        reason: !contact.trim() ? 'Missing contact name' : 
                !email.trim() ? 'Missing email' : 'Generic email'
      });
    }
  }

  console.log(`\n🎯 Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  // Save to file
  const outputPath = path.join(__dirname, 'enrichment-targets-march10-1136pm.json');
  fs.writeFileSync(outputPath, JSON.stringify(needsEnrichment, null, 2));
  
  // Print detailed list
  console.log('📋 Leads requiring enrichment:\n');
  needsEnrichment.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log(`   Current contact: ${lead.contact || '(none)'}`);
    console.log(`   Current email: ${lead.email || '(none)'}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   LinkedIn: ${lead.linkedin || '(none)'}`);
    console.log('');
  });

  console.log(`\n✅ Saved ${needsEnrichment.length} leads to ${outputPath}`);
  return needsEnrichment;
}

extractLeadsNeedingEnrichment()
  .catch(err => console.error('❌ Error:', err));
