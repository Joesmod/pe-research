const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function checkSheetStatus() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  
  let totalFirms = 0;
  let enriched = 0;
  let notEnriched = 0;
  let dead = 0;
  let notPE = 0;
  let needsVerification = [];
  let couldImprove = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    
    const company = row[0] || '';
    const website = row[1] || '';
    const contact = row[2] || '';
    const title = row[3] || '';
    const email = row[4] || '';
    const linkedIn = row[6] || '';
    const status = row[7] || '';
    const notes = row[8] || '';

    // Skip rows without a company name
    if (!company || company.trim() === '') continue;

    totalFirms++;

    if (status && status.toLowerCase().includes('dead')) {
      dead++;
      continue;
    }

    if (status && status.toLowerCase().includes('not pe')) {
      notPE++;
      continue;
    }

    if (status && status.toLowerCase().includes('enriched')) {
      enriched++;
    } else {
      notEnriched++;
    }

    // Check for potential improvements
    const noLinkedIn = !linkedIn || linkedIn.trim() === '';
    const noWebsite = !website || website.trim() === '';
    const shortNotes = !notes || notes.length < 20;
    const noTitle = !title || title.trim() === '';

    if (noLinkedIn || shortNotes || noTitle) {
      couldImprove.push({
        rowNum,
        company,
        website,
        contact,
        title,
        email,
        linkedIn,
        status,
        notes,
        improvements: [
          noLinkedIn ? 'Missing LinkedIn' : null,
          noTitle ? 'Missing Title' : null,
          shortNotes ? 'Minimal Notes' : null
        ].filter(Boolean)
      });
    }

    // Check email pattern validity
    if (email && contact && !email.toLowerCase().includes(contact.split(' ')[0].toLowerCase().substring(0, 3))) {
      needsVerification.push({
        rowNum,
        company,
        contact,
        email,
        reason: 'Email pattern mismatch with contact name'
      });
    }
  }

  console.log('\n📊 PE RESEARCH SHEET STATUS\n');
  console.log('=' .repeat(80));
  console.log(`\n✅ OVERALL STATS:`);
  console.log(`  Total PE Firms: ${totalFirms}`);
  console.log(`  Enriched: ${enriched} (${(enriched/totalFirms*100).toFixed(1)}%)`);
  console.log(`  Not Enriched: ${notEnriched} (${(notEnriched/totalFirms*100).toFixed(1)}%)`);
  console.log(`  Dead: ${dead}`);
  console.log(`  Not PE: ${notPE}`);

  console.log(`\n🎯 ENRICHMENT QUALITY:`);
  console.log(`  Could improve metadata: ${couldImprove.length}`);
  console.log(`  Need verification: ${needsVerification.length}`);

  if (couldImprove.length > 0) {
    console.log(`\n📝 FIRMS THAT COULD BE IMPROVED (showing first 10):\n`);
    couldImprove.slice(0, 10).forEach((firm, idx) => {
      console.log(`${idx + 1}. Row ${firm.rowNum}: ${firm.company}`);
      console.log(`   Contact: ${firm.contact}`);
      console.log(`   Improvements needed: ${firm.improvements.join(', ')}`);
      console.log('');
    });
  }

  if (needsVerification.length > 0) {
    console.log(`\n⚠️  EMAILS NEEDING VERIFICATION (showing first 5):\n`);
    needsVerification.slice(0, 5).forEach((item, idx) => {
      console.log(`${idx + 1}. Row ${item.rowNum}: ${item.company}`);
      console.log(`   Contact: ${item.contact}`);
      console.log(`   Email: ${item.email}`);
      console.log(`   Issue: ${item.reason}`);
      console.log('');
    });
  }

  console.log('=' .repeat(80));
  
  return {
    totalFirms,
    enriched,
    notEnriched,
    dead,
    notPE,
    couldImprove,
    needsVerification
  };
}

checkSheetStatus().catch(console.error);
