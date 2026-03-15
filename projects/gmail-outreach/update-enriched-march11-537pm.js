const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const findings = JSON.parse(fs.readFileSync('enrichment-findings-march11-537pm.json', 'utf8'));

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📊 Updating Google Sheet with enrichment findings...\n');

  const updates = [];

  for (const item of findings) {
    const finding = item.finding;
    
    console.log(`Row ${item.row}: ${item.company}`);
    console.log(`  ✅ ${finding.name} - ${finding.title}`);
    console.log(`  📧 ${finding.email}`);
    console.log(`  🔗 ${finding.linkedin}`);
    console.log(`  Source: ${finding.source}\n`);

    // Column indices (A=0, B=1, etc.):
    // C=Contact Name, D=Title, E=Email, G=LinkedIn, L=Notes, J=Status
    
    const rowNum = item.row;
    
    // Update Contact Name (C)
    updates.push({
      range: `Sheet1!C${rowNum}`,
      values: [[finding.name]]
    });

    // Update Title (D)
    updates.push({
      range: `Sheet1!D${rowNum}`,
      values: [[finding.title]]
    });

    // Update Email (E)
    updates.push({
      range: `Sheet1!E${rowNum}`,
      values: [[finding.email]]
    });

    // Update LinkedIn (G)
    updates.push({
      range: `Sheet1!G${rowNum}`,
      values: [[finding.linkedin]]
    });

    // Update Notes (L)
    const notes = `Research ${new Date().toISOString().split('T')[0]}: ${finding.notes} (${finding.source})`;
    updates.push({
      range: `Sheet1!L${rowNum}`,
      values: [[notes]]
    });

    // Update Status (J)
    updates.push({
      range: `Sheet1!J${rowNum}`,
      values: [['Enriched']]
    });
  }

  // Batch update
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });

  console.log('\n✅ Sheet updated successfully!');
  console.log(`📝 Updated ${findings.length} leads with verified contacts`);
  
  // Summary
  console.log('\n📊 Summary:');
  findings.forEach(f => {
    console.log(`  • ${f.company}: ${f.finding.name} <${f.finding.email}>`);
  });
}

main().catch(console.error);
