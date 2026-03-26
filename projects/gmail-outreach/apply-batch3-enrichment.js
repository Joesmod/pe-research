/**
 * Apply batch 3 PE enrichment updates
 * Roark Capital + verify Lee Equity
 */

const { google } = require('googleapis');
const path = require('path');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function applyUpdates() {
  const sheets = await getSheets();
  
  const enrichments = [
    {
      rowIndex: 27, // Roark Capital Group
      company: 'Roark Capital Group',
      contact: 'Neal Aronson',
      title: 'Founder and Managing Partner',
      email: 'naronson@roarkcapital.com',
      linkedin: 'https://www.linkedin.com/in/neal-aronson',
      status: 'Enriched',
      notes: 'Email verified from official roarkcapital.com/ourteam page. Founder (2001), Investment Committee member. Also: Stephen Aronson (MD/General Counsel, saronson@roarkcapital.com), Paul Aglialoro (Director BD, paglialoro@roarkcapital.com). Atlanta. (2026-03-17 cron)'
    },
    {
      rowIndex: 35, // Lee Equity Partners
      company: 'Lee Equity Partners',
      contact: 'Paul Murray',
      title: 'Chief Technology Officer / Chief Security Officer',
      email: 'pmurray@leeequity.com',
      linkedin: 'https://www.linkedin.com/in/paul-murray-lee-equity',
      status: 'Enriched',
      notes: 'Email verified from leeequity.com/our-team. CTO/CSO (perfect for AI outreach). Also: Collins Ward (Partner, cward@leeequity.com), Mark Gormley (Partner, mgormley@leeequity.com), Benjamin Hochberg (Partner). NYC. (2026-03-17 cron)'
    }
  ];
  
  const updates = [];
  
  for (const e of enrichments) {
    console.log(`\n📝 Updating Row ${e.rowIndex}: ${e.company}`);
    console.log(`   → ${e.contact} (${e.title})`);
    console.log(`   → ${e.email}`);
    
    updates.push({
      range: `Sheet1!C${e.rowIndex}:E${e.rowIndex}`,
      values: [[e.contact, e.title, e.email]]
    });
    
    if (e.linkedin) {
      updates.push({
        range: `Sheet1!G${e.rowIndex}`,
        values: [[e.linkedin]]
      });
    }
    
    updates.push({
      range: `Sheet1!H${e.rowIndex}`,
      values: [[e.status]]
    });
    
    updates.push({
      range: `Sheet1!I${e.rowIndex}`,
      values: [[e.notes]]
    });
  }
  
  if (updates.length > 0) {
    console.log(`\n✅ Applying ${updates.length} updates to Google Sheet...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CRM_SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'RAW'
      }
    });
    
    console.log('✅ Updates applied successfully!');
  }
  
  console.log(`\n📊 Batch 3 Enrichment Summary:`);
  console.log(`  Firms enriched: ${enrichments.length}`);
  enrichments.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.company} → ${e.contact} (${e.email})`);
  });
  
  return enrichments;
}

applyUpdates().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
