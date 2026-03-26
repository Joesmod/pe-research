const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getAuth() {
  return new google.auth.GoogleAuth({
    keyFile: 'gmail-outreach/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function updateRow(rowIndex, values) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Sheet1!A${rowIndex}:N${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });
}

async function main() {
  // Row 380: SDC Capital Partners - Joshua Kurtz
  await updateRow(380, [
    "SDC Capital Partners",
    "",
    "Joshua Kurtz",
    "Chief Financial Officer and Chief Compliance Officer",
    "jkurtz@sdccapitalpartners.com",
    "https://sdccapitalpartners.com",
    "https://www.linkedin.com/in/joshua-kurtz-cpa",
    "Enriched",
    "Email published on SDC Terms of Use page (jkurtz@sdccapitalpartners.com). Also found Vladislava Rebeiz (Partner & General Counsel): vrebeiz@sdccapitalpartners.com on same page"
  ]);
  console.log("✓ Row 380 updated: SDC Capital Partners - Joshua Kurtz");

  // Row 507: Consonance Capital Partners - Mitchell Blutt
  await updateRow(507, [
    "Consonance Capital Partners",
    "",
    "Mitchell J. Blutt, MD",
    "Co-Founder & Managing Partner",
    "contactus@consonancecapital.com",
    "https://www.consonancecapitalpartners.com",
    "https://www.linkedin.com/company/consonance-capital-partners",
    "Enriched",
    "Generic email from contact page. Leadership: Mitchell Blutt MD, Benjamin Edmands, Stephen McKenna, Nancy-Ann DeParle. Phone: (212) 660-8060"
  ]);
  console.log("✓ Row 507 updated: Consonance Capital Partners - Mitchell Blutt (generic email)");

  console.log("\nEnrichment complete: 2 firms updated");
}

main().catch(console.error);
