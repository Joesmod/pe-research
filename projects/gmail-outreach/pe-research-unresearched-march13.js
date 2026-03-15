const { google } = require('googleapis');
const fs = require('fs');

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A1:O1000'
  });
  
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  
  const headers = rows[0];
  const firmCol = headers.indexOf('Company Name');
  const contactCol = headers.indexOf('Contact Name');
  const titleCol = headers.indexOf('Title');
  const emailCol = headers.indexOf('Email');
  const websiteCol = headers.indexOf('Website');
  const linkedinCol = headers.indexOf('LinkedIn');
  const statusCol = headers.indexOf('Status');
  const notesCol = headers.indexOf('Notes');
  const sectorCol = headers.indexOf('Sector Focus');
  
  const unresearched = [];
  const partial = [];
  const noStatus = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmCol] || '';
    const contact = row[contactCol] || '';
    const title = row[titleCol] || '';
    const email = row[emailCol] || '';
    const website = row[websiteCol] || '';
    const linkedin = row[linkedinCol] || '';
    const status = row[statusCol] || '';
    const notes = row[notesCol] || '';
    const sector = row[sectorCol] || '';
    
    if (!firm) continue;
    
    if (status === 'New - Unresearched') {
      unresearched.push({
        rowNum: i + 1,
        firm,
        contact,
        title,
        email,
        website,
        linkedin,
        status,
        notes,
        sector
      });
    } else if (status === 'Partial' || status === 'Research - Needs Email') {
      partial.push({
        rowNum: i + 1,
        firm,
        contact,
        title,
        email,
        website,
        linkedin,
        status,
        notes,
        sector
      });
    } else if (!status && !contact) {
      noStatus.push({
        rowNum: i + 1,
        firm,
        contact,
        title,
        email,
        website,
        linkedin,
        status,
        notes,
        sector
      });
    }
  }
  
  console.log('🎯 PE Firms Needing Enrichment');
  console.log('='.repeat(130));
  console.log(`\n📊 Status Breakdown:`);
  console.log(`  "New - Unresearched": ${unresearched.length}`);
  console.log(`  "Partial" / "Research - Needs Email": ${partial.length}`);
  console.log(`  No Status + Empty Contact: ${noStatus.length}`);
  console.log(`  Total needing work: ${unresearched.length + partial.length + noStatus.length}\n`);
  
  const allTargets = [...unresearched, ...partial, ...noStatus];
  const toEnrich = allTargets.slice(0, 15);
  
  console.log(`\n🔍 Top 15 Firms to Enrich:`);
  console.log('='.repeat(130));
  
  toEnrich.forEach((lead, idx) => {
    console.log(`\n${idx + 1}. Row ${lead.rowNum}: ${lead.firm}`);
    console.log(`   Status: ${lead.status || '(none)'}`);
    console.log(`   Contact: '${lead.contact}' | Title: '${lead.title}'`);
    console.log(`   Email: '${lead.email}'`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    if (lead.linkedin) console.log(`   LinkedIn: ${lead.linkedin}`);
    if (lead.sector) console.log(`   Sector: ${lead.sector}`);
    if (lead.notes) console.log(`   Notes: ${lead.notes}`);
  });
  
  console.log('\n' + '='.repeat(130));
  console.log(`\n✅ Will research ${toEnrich.length} firms (prioritizing "New - Unresearched")`);
  
  // Save list
  fs.writeFileSync('pe-research-targets-march13-937am.json', JSON.stringify(toEnrich, null, 2));
  console.log(`✅ Saved targets to pe-research-targets-march13-937am.json`);
  
})().catch(console.error);
