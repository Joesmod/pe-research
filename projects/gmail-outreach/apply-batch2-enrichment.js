/**
 * Apply batch 2 PE enrichment updates
 * Based on dossiers and manual research
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
      rowIndex: 24, // Further Global Capital Management
      company: 'Further Global Capital Management',
      contact: 'Olivier Sarkozy',
      title: 'Founder & Managing Partner',
      email: 'osarkozy@furtherglobal.com',
      linkedin: 'https://www.linkedin.com/in/olivier-sarkozy',
      status: 'Enriched',
      notes: 'Email pattern from sheet notes. Founder/MP verified from furtherglobal.com/team. Former Carlyle MD. Also: Eric Leathers (Partner/CIO), Susan Ciccarone (Partner), Max Baumrin (Partner). (2026-03-17 cron)'
    },
    {
      rowIndex: 33, // Nautic Partners
      company: 'Nautic Partners',
      contact: 'Jim Beakey',
      title: 'Managing Director, Business Development',
      email: 'jbeakey@nautic.com',
      linkedin: 'https://nautic.com/team-members/james-beakey',
      status: 'Enriched',
      notes: 'Email from ContactOut, phone (401) 278-5678 verified from official nautic.com/contact/corporate. Also: Scott Quigley (Principal BD, 401-278-5421). Providence RI. (2026-03-17 cron)'
    },
    {
      rowIndex: 51, // Genstar Capital
      company: 'Genstar Capital',
      contact: 'J. Ryan Clark',
      title: 'President & Managing Director',
      email: 'rclark@gencap.com',
      linkedin: 'https://www.linkedin.com/in/ryan-clark-genstar',
      status: 'Enriched',
      notes: 'Email pattern inferred from gencap.com. President since 2015, outstanding investment track record. Also: Jean-Pierre Conte (Chairman/MP), Rob Rutledge (MD), Anthony Salewski (MD). San Francisco. (2026-03-17 cron)'
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
  
  console.log(`\n📊 Batch 2 Enrichment Summary:`);
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
