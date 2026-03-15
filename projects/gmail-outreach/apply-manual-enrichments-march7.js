const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateRow(rowIndex, updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const updatePromises = [];
  
  if (updates.contactName) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.contactName]] }
      })
    );
  }
  
  if (updates.title) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!D${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.title]] }
      })
    );
  }
  
  if (updates.email) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!E${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.email]] }
      })
    );
  }
  
  if (updates.linkedIn) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!G${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.linkedIn]] }
      })
    );
  }
  
  if (updates.notes) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!L${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.notes]] }
      })
    );
  }
  
  if (updates.status) {
    updatePromises.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [[updates.status]] }
      })
    );
  }
  
  await Promise.all(updatePromises);
  console.log(`✅ Updated row ${rowIndex}`);
}

async function main() {
  console.log('=== Applying Manual Web Research Enrichments - March 7, 4:06 AM ===\n');
  
  const enrichments = [
    {
      row: 763,
      company: 'Mercury Fund',
      contactName: 'Blair Garrou',
      title: 'Managing Partner',
      email: 'blair@mercuryfund.com',
      linkedIn: 'https://www.linkedin.com/in/blairgarrou',
      notes: 'Verified from Mercury Fund website team page - Managing Partner, Co-founder. Email pattern confirmed.',
      status: 'Enriched'
    },
    {
      row: 799,
      company: 'STORY3 Capital Partners',
      contactName: 'Peter Comisar',
      title: 'Founder + Managing Partner',
      email: 'peter@story3capital.com',
      linkedIn: 'https://www.linkedin.com/in/peter-comisar-8873a935',
      notes: 'Verified from ContactOut + STORY3 website. Managing Partner + CEO.',
      status: 'Enriched'
    },
    {
      row: 794,
      company: 'Silver Oak Services Partners',
      contactName: 'Gregory M. Barr',
      title: 'Managing Partner',
      email: '', // Need to find
      linkedIn: '',
      notes: 'Identified from Silver Oak website - Managing Partner. Email needed.',
      status: 'Partial'
    }
  ];
  
  for (const item of enrichments) {
    console.log(`\n📝 Updating Row ${item.row}: ${item.company}`);
    console.log(`   Contact: ${item.contactName} - ${item.title}`);
    if (item.email) {
      console.log(`   Email: ${item.email}`);
    }
    console.log(`   Source: ${item.notes}`);
    
    await updateRow(item.row, {
      contactName: item.contactName,
      title: item.title,
      email: item.email || undefined,
      linkedIn: item.linkedIn || undefined,
      notes: item.notes,
      status: item.status
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=== Manual Enrichment Updates Complete ===');
  console.log(`✅ Updated: ${enrichments.filter(e => e.status === 'Enriched').length} fully enriched`);
  console.log(`⚠️ Partial: ${enrichments.filter(e => e.status === 'Partial').length} need more research`);
}

main().catch(console.error);
