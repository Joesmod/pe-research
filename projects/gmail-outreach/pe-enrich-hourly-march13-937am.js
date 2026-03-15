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
  const statusCol = headers.indexOf('Status');
  const linkedinCol = headers.indexOf('LinkedIn');
  const notesCol = headers.indexOf('Notes');
  
  console.log(`📋 Column indices:`);
  console.log(`  Company: ${firmCol}, Contact: ${contactCol}, Title: ${titleCol}, Email: ${emailCol}`);
  console.log(`  Website: ${websiteCol}, Status: ${statusCol}, LinkedIn: ${linkedinCol}, Notes: ${notesCol}\n`);
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmCol] || '';
    const contact = row[contactCol] || '';
    const title = row[titleCol] || '';
    const email = row[emailCol] || '';
    const website = row[websiteCol] || '';
    const status = row[statusCol] || '';
    const linkedin = row[linkedinCol] || '';
    const notes = row[notesCol] || '';
    
    if (!firm) continue;
    
    // Skip "Dead" firms
    if (status.toLowerCase().includes('dead')) continue;
    if (status.toLowerCase().includes('not pe')) continue;
    
    // Skip if already sent
    if (status.toLowerCase().includes('sent')) continue;
    if (status.toLowerCase().includes('replied')) continue;
    
    const isGenericEmail = email && (
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('sales@') ||
      email.toLowerCase().includes('ir@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('inquiries@') ||
      email.toLowerCase().includes('hello@') ||
      email.toLowerCase().includes('team@') ||
      email.toLowerCase().includes('general@') ||
      email.toLowerCase().includes('admin@')
    );
    
    const isEmpty = !contact || !email;
    const hasWebsite = !!website;
    
    if ((isEmpty || isGenericEmail) && hasWebsite) {
      needsEnrichment.push({
        rowNum: i + 1,
        firm,
        contact,
        title,
        email,
        website,
        linkedin,
        status,
        notes,
        reason: isEmpty ? 'EMPTY' : 'GENERIC_EMAIL'
      });
    }
  }
  
  console.log(`🔍 Found ${needsEnrichment.length} firms needing enrichment\n`);
  console.log('='.repeat(130));
  
  const toEnrich = needsEnrichment.slice(0, 15);
  
  toEnrich.forEach((lead, idx) => {
    console.log(`\n${idx + 1}. Row ${lead.rowNum}: ${lead.firm} [${lead.reason}]`);
    console.log(`   Contact: '${lead.contact}' | Title: '${lead.title}'`);
    console.log(`   Email: '${lead.email}'`);
    console.log(`   Website: ${lead.website}`);
    if (lead.linkedin) console.log(`   LinkedIn: ${lead.linkedin}`);
    if (lead.status) console.log(`   Status: ${lead.status}`);
    if (lead.notes) console.log(`   Notes: ${lead.notes}`);
  });
  
  console.log('\n' + '='.repeat(130));
  console.log(`\n📊 Summary:`);
  console.log(`  Total active firms: ${rows.length - 1}`);
  console.log(`  Firms needing enrichment: ${needsEnrichment.length}`);
  console.log(`  Will research first 15`);
  
  // Save list for enrichment script
  fs.writeFileSync('enrichment-targets-march13-937am.json', JSON.stringify(toEnrich, null, 2));
  console.log(`\n✅ Saved targets to enrichment-targets-march13-937am.json`);
  
})().catch(console.error);
