// PE Research & Enrichment - Friday 5:37 PM
const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');

async function enrichLeads() {
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  // Read the main sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:O',
  });

  const rows = response.data.values || [];
  if (rows.length < 2) {
    console.log('No data found');
    return;
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  console.log(`\n=== PE Research & Enrichment - ${new Date().toLocaleString()} ===\n`);
  console.log(`Total rows: ${dataRows.length}`);
  console.log(`Headers: ${headers.join(' | ')}\n`);

  // Find indices
  const companyIdx = headers.indexOf('Company');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const statusIdx = headers.indexOf('Status');
  const websiteIdx = headers.indexOf('Website');
  const titleIdx = headers.indexOf('Title');
  const linkedinIdx = headers.indexOf('LinkedIn URL');

  // Identify enrichment needs
  const needsEnrichment = [];
  
  dataRows.forEach((row, idx) => {
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';

    // Skip if already Dead, Contacted, or not a real company
    if (!company || status === 'Dead' || status === 'Contacted' || status === 'Replied') {
      return;
    }

    // Check if needs enrichment
    const hasGenericEmail = email && /^(info@|contact@|sales@|ir@|investor@|hello@|admin@)/i.test(email);
    const noContact = !contact || contact.trim() === '';
    const noEmail = !email || email.trim() === '';

    if (noContact || noEmail || hasGenericEmail) {
      needsEnrichment.push({
        rowIndex: idx + 2, // +2 because of header and 0-index
        company,
        contact,
        email,
        status,
        website,
        reason: noContact ? 'No contact' : (noEmail ? 'No email' : 'Generic email')
      });
    }
  });

  console.log(`\n🔍 Found ${needsEnrichment.length} leads needing enrichment:\n`);
  
  // Show first 15
  const targetLeads = needsEnrichment.slice(0, 15);
  targetLeads.forEach((lead, i) => {
    console.log(`${i+1}. Row ${lead.rowIndex}: ${lead.company}`);
    console.log(`   Contact: ${lead.contact || '(empty)'}`);
    console.log(`   Email: ${lead.email || '(empty)'}`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log('');
  });

  console.log(`\n📊 Summary:`);
  console.log(`- Total needing enrichment: ${needsEnrichment.length}`);
  console.log(`- Targeted for this run: ${targetLeads.length}`);
  console.log(`\n✅ Next: Manually research these ${targetLeads.length} firms to find verified contacts\n`);

  return { targetLeads, headers, companyIdx, contactIdx, emailIdx, titleIdx, linkedinIdx, statusIdx };
}

enrichLeads().catch(console.error);
