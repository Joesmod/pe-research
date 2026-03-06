const { google } = require('googleapis');
const path = require('path');

// Service account authentication
const KEYFILE = path.join(__dirname, 'service-account.json');
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:Z';

// Enriched contacts to add/update
const enrichedContacts = [
  {
    firmName: 'Norwest Venture Partners',
    website: 'https://www.norwest.com',
    contactName: 'Jon Kossow',
    title: 'Managing Partner',
    email: 'jkossow@nvp.com',
    linkedin: 'https://www.linkedin.com/in/jon-kossow',
    sectorFocus: 'Growth equity, information services, software, internet',
    status: 'Enriched',
    notes: 'Email verified via ContactOut'
  },
  {
    firmName: 'Altamont Capital Partners',
    website: 'https://www.altamontcapital.com',
    contactName: 'Keoni Schwartz',
    title: 'Co-Founder and Managing Director',
    email: 'kschwartz@altamontcapital.com',
    linkedin: 'https://www.linkedin.com/in/keoni-schwartz-15a47a14',
    sectorFocus: 'Business Services, Financial Services',
    status: 'Enriched',
    notes: 'Email verified via ContactOut + RocketReach'
  },
  {
    firmName: 'Vistria Group',
    website: 'https://vistria.com',
    contactName: 'Kip Kirkpatrick',
    title: 'Co-Founder and Co-Chief Executive Officer',
    email: 'kkirkpatrick@vistria.com',
    linkedin: 'https://www.linkedin.com/in/kip-kirkpatrick-309689147',
    sectorFocus: 'Healthcare, Education, Financial Services, Housing',
    status: 'Enriched',
    notes: 'Chicago-based. Email verified via ContactOut'
  },
  {
    firmName: 'Edison Partners',
    website: 'https://www.edisonpartners.com',
    contactName: 'Chris Sugden',
    title: 'Managing Partner',
    email: 'csugden@edisonpartners.com',
    linkedin: 'https://www.linkedin.com/in/christopherssugden',
    sectorFocus: 'Growth equity, B2B technology',
    status: 'Enriched',
    notes: 'Email pattern confirmed via RocketReach'
  }
];

async function updateSheet() {
  console.log('PE ENRICHMENT - SHEET UPDATE');
  console.log('============================\n');

  try {
    // Authenticate
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Read current sheet data
    console.log('📖 Reading current sheet data...');
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE
    });

    const rows = readResponse.data.values || [];
    const headers = rows[0];
    
    console.log(`   Found ${rows.length} total rows\n`);

    // Find column indices
    const colIndexes = {
      firmName: headers.indexOf('Company/Firm Name'),
      website: headers.indexOf('Website'),
      contactName: headers.indexOf('Contact Name'),
      title: headers.indexOf('Title'),
      email: headers.indexOf('Email'),
      linkedin: headers.indexOf('LinkedIn URL'),
      sectorFocus: headers.indexOf('Sector Focus'),
      status: headers.indexOf('Status'),
      notes: headers.indexOf('Notes')
    };

    console.log('📝 Column Mapping:');
    Object.entries(colIndexes).forEach(([key, idx]) => {
      console.log(`   ${key}: Column ${String.fromCharCode(65 + idx)} (index ${idx})`);
    });
    console.log();

    // Update rows for each enriched contact
    const updates = [];
    
    for (const contact of enrichedContacts) {
      // Find the row for this firm
      const rowIndex = rows.findIndex(row => 
        row[colIndexes.firmName] && 
        row[colIndexes.firmName].toLowerCase().includes(contact.firmName.toLowerCase())
      );

      if (rowIndex === -1) {
        console.log(`⚠️  ${contact.firmName} - NOT FOUND in sheet, skipping`);
        continue;
      }

      console.log(`✅ ${contact.firmName} - Found at row ${rowIndex + 1}`);
      
      // Prepare the update
      const row = rows[rowIndex];
      row[colIndexes.contactName] = contact.contactName;
      row[colIndexes.title] = contact.title;
      row[colIndexes.email] = contact.email;
      row[colIndexes.linkedin] = contact.linkedin;
      row[colIndexes.status] = contact.status;
      row[colIndexes.notes] = contact.notes;

      // Add to batch update
      updates.push({
        range: `Sheet1!A${rowIndex + 1}:Z${rowIndex + 1}`,
        values: [row]
      });

      console.log(`   Contact: ${contact.contactName}`);
      console.log(`   Title: ${contact.title}`);
      console.log(`   Email: ${contact.email}`);
      console.log(`   Status: ${contact.status}\n`);
    }

    if (updates.length === 0) {
      console.log('❌ No updates to perform');
      return;
    }

    // Execute batch update
    console.log(`\n🚀 Updating ${updates.length} rows...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log('✅ Sheet updated successfully!\n');
    console.log('ENRICHMENT COMPLETE');
    console.log('===================');
    console.log(`Updated: ${updates.length} firms`);
    console.log(`Timestamp: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);

  } catch (error) {
    console.error('❌ Error updating sheet:', error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error('  -', err.message));
    }
    process.exit(1);
  }
}

updateSheet();
