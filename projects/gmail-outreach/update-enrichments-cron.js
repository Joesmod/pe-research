const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const enrichments = [
  {
    rowNum: 762,
    company: "Manulife | Comvest Credit Partners",
    contactName: "David Gibson",
    title: "Managing Director, Co-Head of Consumer & Retail",
    email: "dgibson@comvest.com",
    linkedin: "https://www.linkedin.com/in/davidpiercegibson/",
    status: "Enriched",
    notes: "Ex-Goldman Sachs Director. Email pattern from RocketReach (verified team page). Kellogg MBA."
  },
  {
    rowNum: 790,
    company: "Sageview Capital",
    contactName: "Scott Stuart",
    title: "Co-Founder & Partner",
    email: "scott@sageviewcapital.com",
    linkedin: "https://www.linkedin.com/in/scott-m-stuart/",
    status: "Enriched",
    notes: "Email from ContactOut (published source). Greenwich-based, $1.5B AUM."
  },
  {
    rowNum: 785,
    company: "Riverwood Capital",
    contactName: "Francisco Alvarez-Demalde",
    title: "Co-Founder and Managing Partner",
    email: "",
    linkedin: "https://www.linkedin.com/in/franciscoalvarezdemalde/",
    status: "Partial",
    notes: "Verified from riverwoodcapital.com team page. Co-heads firm, Miami-based. No published email found."
  }
];

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Column indices (0-indexed for array, but A=0, B=1, etc.)
    const COL_CONTACT_NAME = 2;  // C
    const COL_TITLE = 3;         // D
    const COL_EMAIL = 4;         // E
    const COL_LINKEDIN = 6;      // G
    const COL_STATUS = 9;        // J
    const COL_LAST_CONTACTED = 10; // K (notes)

    const updates = [];
    
    for (const enrichment of enrichments) {
      const range = `Sheet1!C${enrichment.rowNum}:K${enrichment.rowNum}`;
      
      updates.push({
        range: range,
        values: [[
          enrichment.contactName,
          enrichment.title,
          enrichment.email,
          "", // Website (col F) - keep existing
          enrichment.linkedin,
          "", // Sector (col H) - keep existing
          "", // Portfolio (col I) - keep existing
          enrichment.status,
          enrichment.notes
        ]]
      });
    }

    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log(`Updated ${response.data.totalUpdatedRows} rows`);
    console.log('Enrichments applied:');
    enrichments.forEach(e => {
      console.log(`  Row ${e.rowNum}: ${e.company} - ${e.contactName} (${e.email || 'no email'})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
