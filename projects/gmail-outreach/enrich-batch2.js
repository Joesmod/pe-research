const { google } = require('googleapis');

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I'
  });
  
  const rows = response.data.values;
  const updates = [];
  
  // Find and update specific rows
  rows.forEach((row, index) => {
    const rowNum = index + 1;
    const companyName = row[0] || '';
    
    // Gemspring Capital - Add Bret Wiener (VERIFIED EMAIL from official PDF)
    if (companyName.includes('Gemspring Capital') && (!row[2] || row[2].trim().length === 0)) {
      updates.push({
        range: `Sheet1!C${rowNum}:I${rowNum}`,
        values: [['Bret Wiener', 'Founder & CEO', 'bret@gemspring.com', 'https://www.gemspring.com', 'https://www.linkedin.com/company/gemspring-capital', 'Enriched', 'VERIFIED email from official PDF (gemspring.com/brochure). Also: Matt Shuman MD matt@gemspring.com, Connor O\'Byrne Dir connor@gemspring.com. Westport CT-based, $1.1B+ AUM, consumer/tech/business services. (2026-03-25 cron)']]
      });
    }
    
    // Brockway Moran & Partners - Add Rick Brockway or Craig Moran
    if (companyName.includes('Brockway Moran') && (!row[2] || row[2].trim().length === 0)) {
      updates.push({
        range: `Sheet1!C${rowNum}:I${rowNum}`,
        values: [['Rick Brockway', 'Founder & Managing Partner', 'rbrockway@brockwaymoran.com', 'https://www.brockwaymoran.com', 'https://www.linkedin.com/company/brockway-moran-&-partners', 'Enriched', 'Co-founder w/ Craig Moran cmoran@brockwaymoran.com. Email pattern inferred. 30+ yrs PE experience. Boca Raton FL. Phone 561-750-2000. NOTE: 26-year run 1998-2024 may indicate winding down. (2026-03-25 cron)']]
      });
    }
    
    // Resilience Capital Partners - Add Steven Rosen or Bassem Mansour
    if (companyName.includes('Resilience Capital Partners') && (!row[2] || row[2].trim().length === 0)) {
      updates.push({
        range: `Sheet1!C${rowNum}:I${rowNum}`,
        values: [['Bassem Mansour', 'CEO & Co-Founder', 'bmansour@resiliencecapital.com', 'https://resiliencecapital.com', 'https://www.linkedin.com/in/bassemmansour', 'Enriched', 'Co-founded 2001 with Steven Rosen (Chairman). Email pattern inferred from domain. Cleveland-based, $675M+ AUM. Manufacturing/business services/distribution focus. Also: Robert Widen (Partner). (2026-03-25 cron)']]
      });
    }
    
    // Centre Partners - Add general contact
    if (companyName.includes('Centre Partners') && (!row[2] || row[2].trim().length === 0)) {
      updates.push({
        range: `Sheet1!C${rowNum}:I${rowNum}`,
        values: [['', '', 'info@centrepartners.com', 'https://www.centrepartners.com', '', 'Needs Enrichment', 'NYC-based (780 3rd Ave, 41st Fl). 40+ yr track record, $2.7B invested, 92 platform cos. Consumer products/healthcare services focus. Phone 212-332-5800. Need specific partner contact. (2026-03-25 cron)']]
      });
    }
    
  });
  
  console.log(`Found ${updates.length} updates to make in batch 2`);
  
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        data: updates,
        valueInputOption: 'RAW'
      }
    });
    console.log('Successfully updated sheet with batch 2 enrichments');
  } else {
    console.log('No matching rows found for batch 2 - check company names');
  }
}

enrichLeads().catch(err => {
  console.error('Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
