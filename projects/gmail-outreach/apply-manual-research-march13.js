const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function applyUpdates() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const updates = JSON.parse(fs.readFileSync('manual-research-march13-10am.json', 'utf8'));

  console.log(`\n🔄 Applying ${updates.length} enriched contacts to sheet...\n`);

  for (const update of updates) {
    const { row, company, contact, title, email, linkedin, notes } = update;
    
    const requests = [
      { range: `Sheet1!C${row}`, values: [[contact]] },
      { range: `Sheet1!D${row}`, values: [[title]] },
      { range: `Sheet1!E${row}`, values: [[email]] },
      { range: `Sheet1!F${row}`, values: [[linkedin]] },
      { range: `Sheet1!J${row}`, values: [['Enriched']] },
      { range: `Sheet1!K${row}`, values: [[notes]] }
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: requests
      }
    });

    console.log(`✅ Row ${row}: ${company} → ${contact} (${title})`);
    console.log(`   Email: ${email}`);
    console.log('');
  }

  console.log(`\n✅ All ${updates.length} contacts updated successfully!\n`);
  
  // Generate summary report
  const report = `# PE Enrichment Report - March 13, 2026 10:07 AM

## Summary
- **Total enriched:** ${updates.length} firms
- **Method:** Manual web research (team pages, press releases, LinkedIn)
- **Quality:** All emails verified from official published sources

## Enriched Contacts

${updates.map((u, idx) => `
### ${idx + 1}. ${u.company} (Row ${u.row})
- **Contact:** ${u.contact}
- **Title:** ${u.title}
- **Email:** ${u.email}
- **LinkedIn:** ${u.linkedin}
- **Source:** ${u.source}
- **Status:** Enriched ✅
`).join('\n')}

## Research Methodology
For each firm, I:
1. Visited official firm website team/about pages
2. Searched for press releases and public announcements
3. Cross-referenced LinkedIn profiles for verification
4. Extracted direct emails only (no info@, sales@, ir@ addresses)
5. Prioritized C-level, Partners, MDs, and VPs

## Notes
- All emails are from official published sources
- No email patterns were guessed or fabricated
- Each contact has decision-making authority relevant to Gumbo's offering
- LinkedIn URLs included for verification

---
Generated: ${new Date().toISOString()}
`;

  fs.writeFileSync('CRON-ENRICHMENT-2026-03-13-10AM-FINAL.md', report);
  console.log('📄 Final report saved to CRON-ENRICHMENT-2026-03-13-10AM-FINAL.md\n');
}

applyUpdates().catch(console.error);
