const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment data from research
const enrichments = [
  {
    row: 762,
    company: 'Manulife | Comvest Credit Partners',
    contact: 'David Gibson',
    title: 'Managing Director',
    email: '', // Not found
    linkedin: 'https://www.linkedin.com/in/david-gibson-350b878/',
    status: 'Partial',
    notes: 'Contact found via team page; no direct email published. Alternative: Chris O\'Donnell (MD)'
  },
  {
    row: 778,
    company: 'Pzena Investment Management',
    contact: 'Evan Fire',
    title: 'Managing Partner',
    email: '', // Not found  
    linkedin: 'https://www.linkedin.com/in/evankfire/',
    status: 'Partial',
    notes: 'Managing Partner found; general email: compliance@pzena.com. Alternative: Richard Pzena (Founder/Co-CIO)'
  },
  {
    row: 785,
    company: 'Riverwood Capital',
    contact: 'Francisco Alvarez-Demalde',
    title: 'Co-Founder, Managing Partner',
    email: '', // Not found
    linkedin: 'https://www.linkedin.com/company/riverwood-capital',
    status: 'Partial',
    notes: 'Co-Founder identified; no direct email published. Alternative: Jeff Parks (Co-Founder, Managing Partner)'
  },
  {
    row: 790,
    company: 'Sageview Capital',
    contact: 'Scott Stuart',
    title: 'Founding Partner',
    email: '', // Not found
    linkedin: 'https://www.linkedin.com/in/scott-stuart-58aba918/',
    status: 'Partial',
    notes: 'Founding Partner found; no direct email published'
  }
];

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`Updating ${enrichments.length} leads...`);

  for (const enrich of enrichments) {
    const rowIdx = enrich.row;
    
    // Column indices: A=Company, C=Contact, D=Title, E=Email, G=LinkedIn, L=Notes, J=Status
    const updates = [];
    
    // Update Contact Name (column C)
    if (enrich.contact) {
      updates.push({
        range: `Sheet1!C${rowIdx}`,
        values: [[enrich.contact]]
      });
    }
    
    // Update Title (column D)
    if (enrich.title) {
      updates.push({
        range: `Sheet1!D${rowIdx}`,
        values: [[enrich.title]]
      });
    }
    
    // Update LinkedIn (column G)
    if (enrich.linkedin) {
      updates.push({
        range: `Sheet1!G${rowIdx}`,
        values: [[enrich.linkedin]]
      });
    }
    
    // Update Status (column J)
    if (enrich.status) {
      updates.push({
        range: `Sheet1!J${rowIdx}`,
        values: [[enrich.status]]
      });
    }
    
    // Update Notes (column L)
    if (enrich.notes) {
      updates.push({
        range: `Sheet1!L${rowIdx}`,
        values: [[enrich.notes]]
      });
    }

    // Batch update this row
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      console.log(`✓ Updated row ${rowIdx}: ${enrich.company} - ${enrich.contact}`);
    }
  }

  console.log(`\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Updated ${enrichments.length} leads with contact information`);
  console.log(`\nNOTE: Direct emails not found for these contacts.`);
  console.log(`Next steps: Use Apollo.io or LinkedIn Sales Navigator for email verification.`);
}

main().catch(console.error);
