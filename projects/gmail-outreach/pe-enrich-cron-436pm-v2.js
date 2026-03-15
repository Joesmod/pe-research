const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Read the sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('No data found');
    return;
  }

  const headers = rows[0];
  
  // Find indices for key columns
  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');
  
  // Scan for leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    // Skip if no company name
    if (!company || company.trim() === '') continue;
    
    // Skip if status is Sent, Dead, or Enriched
    if (status === 'Sent' || status === 'Dead' || status === 'Enriched') continue;
    
    // Check if needs enrichment
    const noContact = !contact || contact.trim() === '';
    const genericEmail = email && email.match(/^(info@|sales@|ir@|contact@|admin@)/i);
    const noEmail = !email || email.trim() === '';
    const staleContact = contact === 'Jacob Zodikoff'; // This appears to be placeholder data
    
    if (noContact || genericEmail || noEmail || staleContact) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact: staleContact ? '' : contact,
        email: genericEmail ? '' : email,
        status,
        website,
        reason: noContact || staleContact ? 'Missing/stale contact' : (noEmail ? 'Missing email' : 'Generic email')
      });
    }
  }
  
  console.log(`\n=== Found ${needsEnrichment.length} leads needing enrichment ===\n`);
  
  // Prioritize: websites with domains > no website
  const withWebsite = needsEnrichment.filter(t => t.website && t.website.startsWith('http'));
  const withoutWebsite = needsEnrichment.filter(t => !t.website || !t.website.startsWith('http'));
  
  const targets = [...withWebsite, ...withoutWebsite].slice(0, 15);
  
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. Row ${t.rowIndex}: ${t.company}`);
    console.log(`   Contact: ${t.contact || '(empty)'}`);
    console.log(`   Email: ${t.email || '(empty)'}`);
    console.log(`   Reason: ${t.reason}`);
    console.log(`   Website: ${t.website || '(none)'}\n`);
  });
  
  fs.writeFileSync('enrich-targets-march7-436pm-v2.json', JSON.stringify(targets, null, 2));
  console.log(`\nSaved ${targets.length} targets to enrich-targets-march7-436pm-v2.json`);
  console.log(`Total needing enrichment: ${needsEnrichment.length}`);
  
})().catch(console.error);
