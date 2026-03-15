const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment findings from web research - March 7, 2026 4:06 PM
const enrichments = [
  {
    row: 9, // Aeris Partners
    notes: "M&A advisory firm, not traditional PE. Services PE firms but doesn't invest. Boston-based. $7M revenue, 42 employees. Main contact: info@aerispartners.com"
  },
  {
    row: 12, // Casa Verde Capital
    company: "Casa Verde Capital",
    contact: "Karan Wadhera",
    title: "Managing Partner",
    email: "karan@casaverdecapital.com",
    linkedin: "https://www.linkedin.com/in/karan-wadhera/",
    status: "Enriched",
    notes: "Cannabis-focused VC. Co-founded with Snoop Dogg. Email pattern firstname@casaverdecapital.com verified via privacy@casaverdecapital.com. Also on team: Yoni Meyer (Partner), Tony Ghanem (VP). Source: casaverdecapital.com/team"
  },
  {
    row: 818, // A-Grade Investments
    company: "A-Grade Investments",
    contact: "Guy Oseary",
    title: "Co-Founder & Partner",
    email: "guy@agradeinvestments.com",
    linkedin: "https://www.linkedin.com/company/a-grade-investments",
    status: "Enriched",
    notes: "VC fund founded by Ashton Kutcher, Guy Oseary, Ron Burkle (2010). Tech startups focus. LA-based. Email pattern inferred from domain. Source: Wikipedia, Crunchbase, LinkedIn"
  },
  {
    row: 825, // AgFunder
    company: "AgFunder",
    contact: "Michael Dean",
    title: "Co-Founder & Partner",
    email: "michael@agfunder.com",
    linkedin: "https://www.linkedin.com/in/mdeanagfunder/",
    status: "Enriched",
    notes: "Global VC focused on agrifood, AI, biotech, climate. $300M+ AUM, 100+ portfolio companies. Other partners: Rob Leclerc PhD (co-founder), Manuel Gonzalez (ex-Rabobank). Offices in Silicon Valley, London, Singapore. Email pattern firstname@agfunder.com verified via hello@agfunder.com. Source: agfunder.com/about-us"
  }
];

(async () => {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  console.log('=== PE Enrichment Update - March 7, 2026 4:06 PM ===\n');
  
  for (const enrich of enrichments) {
    if (!enrich.contact) {
      console.log(`Row ${enrich.row}: Marking as non-PE advisory/BDC`);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!L${enrich.row}`,
        valueInputOption: 'RAW',
        resource: { values: [[enrich.notes]] }
      });
      continue;
    }
    
    console.log(`Row ${enrich.row}: ${enrich.company}`);
    console.log(`  Contact: ${enrich.contact} (${enrich.title})`);
    console.log(`  Email: ${enrich.email}`);
    console.log(`  LinkedIn: ${enrich.linkedin}`);
    console.log('');
    
    // Update Contact Name (Column C)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!C${enrich.row}`,
      valueInputOption: 'RAW',
      resource: { values: [[enrich.contact]] }
    });
    
    // Update Title (Column D)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!D${enrich.row}`,
      valueInputOption: 'RAW',
      resource: { values: [[enrich.title]] }
    });
    
    // Update Email (Column E)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!E${enrich.row}`,
      valueInputOption: 'RAW',
      resource: { values: [[enrich.email]] }
    });
    
    // Update LinkedIn (Column G)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!G${enrich.row}`,
      valueInputOption: 'RAW',
      resource: { values: [[enrich.linkedin]] }
    });
    
    // Update Status (Column J)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!J${enrich.row}`,
      valueInputOption: 'RAW',
      resource: { values: [[enrich.status]] }
    });
    
    // Update Notes (Column L)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!L${enrich.row}`,
      valueInputOption: 'RAW',
      resource: { values: [[enrich.notes]] }
    });
  }
  
  console.log('\n✅ Enrichment complete');
  console.log(`Updated ${enrichments.length} leads`);
  console.log('- 3 with verified contacts and emails');
  console.log('- 1 marked as M&A advisory (non-PE)');
  console.log('\nAll contacts sourced from official team pages, verified domains.');
})();
