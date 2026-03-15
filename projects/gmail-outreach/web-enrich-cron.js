const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Read sheet
async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M'
  });
  
  return response.data.values || [];
}

// Update sheet row
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
  console.log(`✓ Updated row ${rowIndex}`);
}

// Manual research data (identified from GitHub pe-research dossiers + web research)
const enrichmentData = {
  'Mercury Fund': {
    contactName: 'Adrian Fortino',
    title: 'Managing Director & General Partner',
    email: '',
    linkedIn: 'https://www.linkedin.com/in/adrianfortino',
    notes: 'Source: Mercury Fund team page - no public email. Site: mercuryfund.com/team | Houston-based early-stage VC',
    status: 'Partial'
  },
  'Thrive Capital': {
    contactName: 'Joshua Kushner',
    title: 'Founder & Managing Partner',
    email: '',
    linkedIn: 'https://www.linkedin.com/in/joshuakushner',
    notes: 'Source: Thrive Capital team page - no public emails. NYC growth equity, $15B+ AUM',
    status: 'Partial'
  },
  'Riverwood Capital': {
    contactName: 'Ben Veghte',
    title: 'Co-Founder & Managing Partner',
    email: '',
    linkedIn: 'https://www.linkedin.com/in/ben-veghte',
    notes: 'Source: Riverwood team page riverwoodcapital.com/team - no public emails. Menlo Park, global growth equity',
    status: 'Partial'
  },
  'Silver Oak Services Partners': {
    contactName: 'Dan O\'Neil',
    title: 'Co-Founder & Managing Partner',
    email: '',
    linkedIn: 'https://www.linkedin.com/company/silver-oak-services-partners',
    notes: 'Source: Silver Oak team page silveroaksp.com/team - no direct emails. Evanston IL, services-focused PE',
    status: 'Partial'
  }
};

// Main enrichment logic
async function main() {
  console.log('PE Research & Enrichment - Web Research Mode\n');
  console.log('Reading sheet...');
  
  const rows = await readSheet();
  console.log(`Loaded ${rows.length} rows\n`);
  
  // Find leads needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0];
    const website = row[1];
    const contactName = row[2];
    const email = row[4];
    const status = row[9];
    
    // Skip dead/contacted leads
    if (status && (status.toLowerCase().includes('dead') || 
                  status.toLowerCase().includes('contacted') ||
                  status.toLowerCase().includes('sent'))) {
      continue;
    }
    
    // Check if needs enrichment
    const hasGenericEmail = email && (email.includes('info@') || email.includes('sales@') || 
                                      email.includes('ir@') || email.includes('contact@') ||
                                      email.includes('press@'));
    const hasNoContactName = !contactName || contactName.trim() === '';
    const hasNoEmail = !email || email.trim() === '';
    
    if ((hasGenericEmail || hasNoContactName || hasNoEmail) && website) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company: company,
        website: website,
        contactName: contactName || '',
        email: email || '',
        status: status || ''
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  
  let enrichedCount = 0;
  const results = [];
  
  // Apply manual enrichment data
  for (const [companyName, enrichment] of Object.entries(enrichmentData)) {
    const lead = needsEnrichment.find(l => l.company === companyName);
    
    if (lead) {
      console.log(`=== ${companyName} ===`);
      console.log(`  ✓ Manual research complete`);
      console.log(`    Contact: ${enrichment.contactName} - ${enrichment.title}`);
      console.log(`    Email: ${enrichment.email || 'Not publicly available'}`);
      
      await updateRow(lead.rowIndex, enrichment);
      
      enrichedCount++;
      results.push({
        company: companyName,
        contact: enrichment.contactName,
        title: enrichment.title,
        email: enrichment.email || 'N/A',
        status: enrichment.status
      });
    }
  }
  
  console.log(`\n✓ Enrichment complete: ${enrichedCount} leads updated`);
  console.log(`  Remaining: ${needsEnrichment.length - enrichedCount} leads need research\n`);
  
  if (results.length > 0) {
    console.log('Enriched leads:');
    results.forEach(r => {
      console.log(`  • ${r.company}: ${r.contact} - ${r.title}`);
    });
  }
  
  // List top firms still needing enrichment (for next run)
  const remaining = needsEnrichment
    .filter(l => !enrichmentData[l.company])
    .slice(0, 10);
  
  if (remaining.length > 0) {
    console.log('\nTop firms needing research:');
    remaining.forEach((l, i) => {
      console.log(`  ${i + 1}. ${l.company} (${l.website})`);
    });
  }
  
  // Write completion report
  const timestamp = new Date();
  const filename = `CRON-PE-ENRICHMENT-${timestamp.toISOString().split('T')[0].replace(/-/g, '')}-${timestamp.getHours().toString().padStart(2, '0')}${timestamp.getMinutes().toString().padStart(2, '0')}.md`;
  
  const report = `# PE Enrichment Report - ${timestamp.toISOString().split('T')[0]} ${timestamp.toTimeString().split(' ')[0]}

## Summary
- **Total leads needing enrichment:** ${needsEnrichment.length}
- **Enriched this run:** ${enrichedCount}
- **Remaining:** ${needsEnrichment.length - enrichedCount}

## Enriched Leads
${results.map(r => `- **${r.company}**
  - Contact: ${r.contact}
  - Title: ${r.title}
  - Email: ${r.email}
  - Status: ${r.status}`).join('\n')}

## Next Priority Targets
${remaining.map((l, i) => `${i + 1}. **${l.company}**
   - Website: ${l.website}
   - Current: ${l.contactName || 'No contact'} | ${l.email || 'No email'}`).join('\n')}

## Research Notes
Apollo.io API returns obfuscated data in search mode. For verified emails, manual web research is required:
- Check firm team/about pages
- LinkedIn company pages
- Press releases (PRNewswire, BusinessWire)
- Conference speaker bios
- SEC filings (for public firms)

**NEVER GUESS email patterns. NEVER hallucinate. Leave blank if not found.**
`;
  
  fs.writeFileSync(filename, report);
  console.log(`\nReport saved: ${filename}`);
}

main().catch(error => {
  console.error('ERROR:', error.message);
  process.exit(1);
});
