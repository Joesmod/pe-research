const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Skip header row
  const data = rows.slice(1);

  // Column indices
  const companyIdx = 0;  // A: Company Name
  const websiteIdx = 1;  // B: Company Website
  const contactIdx = 2;  // C: Contact Name
  const titleIdx = 3;    // D: Title
  const emailIdx = 4;    // E: Email
  const statusIdx = 9;   // J: Status
  const notesIdx = 11;   // L: Notes
  const sourceIdx = 8;   // I: Source/Notes

  console.log(`\n📊 Total firms: ${data.length}`);

  // Find rows that could use better enrichment
  const candidates = [];

  data.forEach((row, idx) => {
    const company = row[companyIdx] || '';
    const website = row[websiteIdx] || '';
    const contact = row[contactIdx] || '';
    const title = row[titleIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const notes = row[notesIdx] || '';
    const source = row[sourceIdx] || '';

    // Skip dead leads or empty companies
    if (!company || status.toLowerCase().includes('dead')) return;

    const statusLower = status.toLowerCase();
    const notesLower = notes.toLowerCase();
    const sourceLower = source.toLowerCase();

    // Look for improvement opportunities:
    // 1. Status contains "inferred" or "pattern"
    // 2. Email contains generic domains or is missing
    // 3. Notes mention "pattern" or "inferred"
    // 4. No verified direct contact
    const needsImprovement = (
      statusLower.includes('inferred') ||
      statusLower.includes('pattern') ||
      notesLower.includes('pattern') ||
      notesLower.includes('inferred') ||
      sourceLower.includes('pattern') ||
      sourceLower.includes('inferred') ||
      !email ||
      email.toLowerCase().includes('info@') ||
      email.toLowerCase().includes('contact@') ||
      email.toLowerCase().includes('sales@') ||
      statusLower.includes('not published') ||
      statusLower.includes('research needed')
    );

    if (needsImprovement) {
      candidates.push({
        rowNum: idx + 2,
        company,
        website,
        contact,
        title,
        email,
        status,
        reason: []
      });

      const last = candidates[candidates.length - 1];
      if (statusLower.includes('inferred') || statusLower.includes('pattern')) {
        last.reason.push('Status shows inferred/pattern');
      }
      if (notesLower.includes('pattern') || notesLower.includes('inferred')) {
        last.reason.push('Notes mention pattern/inferred');
      }
      if (!email || email.toLowerCase().match(/(info|contact|sales|ir)@/)) {
        last.reason.push('Generic or missing email');
      }
      if (statusLower.includes('not published')) {
        last.reason.push('Email not published');
      }
    }
  });

  console.log(`\n🎯 Candidates for improvement: ${candidates.length}`);

  // Select first 15
  const targets = candidates.slice(0, 15);

  console.log(`\n📋 Top 15 targets:\n`);
  
  targets.forEach((lead, idx) => {
    console.log(`${idx + 1}. Row ${lead.rowNum}: ${lead.company}`);
    console.log(`   Website: ${lead.website || 'NONE'}`);
    console.log(`   Contact: ${lead.contact || 'EMPTY'}`);
    console.log(`   Email: ${lead.email || 'EMPTY'}`);
    console.log(`   Status: ${lead.status || 'NONE'}`);
    console.log(`   Reasons: ${lead.reason.join(', ')}`);
    console.log('');
  });

  // Save to JSON
  const fs = require('fs');
  fs.writeFileSync(
    'improvement-candidates-march13.json',
    JSON.stringify(targets, null, 2)
  );
  console.log('✅ Saved to improvement-candidates-march13.json\n');
}

main().catch(console.error);
