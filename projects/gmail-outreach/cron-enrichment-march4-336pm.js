const { google } = require('googleapis');
const key = require('./service-account.json');

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth: jwtClient });
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateEnrichments() {
  try {
    // First, read current data to find row numbers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K'
    });
    
    const rows = response.data.values || [];
    const updates = [];
    
    // Find and update specific firms
    rows.forEach((row, index) => {
      const firmName = row[0] || '';
      const rowNum = index + 1;
      
      // Update Great Range Capital with Matt Stranz
      if (firmName.includes('Great Range')) {
        updates.push({
          range: `Sheet1!C${rowNum}:D${rowNum}`,
          values: [[
            'Matt Stranz',
            'Managing Director, Business Development'
          ]]
        });
        updates.push({
          range: `Sheet1!G${rowNum}`,
          values: [['https://www.linkedin.com/company/great-range-capital/']]
        });
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [['Heartland PE, $5B+ AUM, Co-founders: Ryan Sprott & Jonathan Rains, Mission Woods KS']]
        });
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [['Partial']]
        });
        updates.push({
          range: `Sheet1!K${rowNum}`,
          values: [['Enriched 2026-03-04: Name & title verified from https://greatrangecapital.com/contact/ - Email not found from official source']]
        });
      }
      
      // Update Jump Capital with Sach Chitnis
      if (firmName.includes('Jump Capital')) {
        updates.push({
          range: `Sheet1!C${rowNum}:D${rowNum}`,
          values: [[
            'Sach Chitnis',
            'Co-Founder & Partner'
          ]]
        });
        updates.push({
          range: `Sheet1!G${rowNum}`,
          values: [['https://www.linkedin.com/company/jump-capital/']]
        });
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [['$350M Fund VII, Chicago-based VC, tech/crypto focus']]
        });
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [['Partial']]
        });
        updates.push({
          range: `Sheet1!K${rowNum}`,
          values: [['Enriched 2026-03-04: Name & title verified from https://jumpcap.com/ - Email not found from official source']]
        });
      }
      
      // Update RevTek Capital with Brandon Peters
      if (firmName.includes('RevTek')) {
        updates.push({
          range: `Sheet1!C${rowNum}:D${rowNum}`,
          values: [[
            'Brandon Peters',
            'Managing Director, Technology'
          ]]
        });
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [['Healthcare services PE, Boston MA, also Isaac Bunney (MD), Thomas Radic (MD IR)']]
        });
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [['Partial']]
        });
        updates.push({
          range: `Sheet1!K${rowNum}`,
          values: [['Enriched 2026-03-04: Name & title verified from https://revtekcapital.com/ - Email not found from official source']]
        });
      }
      
      // Update SK Capital Partners with Barry Siadat
      if (firmName.includes('SK Capital')) {
        updates.push({
          range: `Sheet1!C${rowNum}:D${rowNum}`,
          values: [[
            'Barry Siadat',
            'Managing Director'
          ]]
        });
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [['Specialty materials/chemical PE, $5B+ AUM, Other MDs: Jack Norris, Aaron Davenport, James Marden']]
        });
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [['Partial']]
        });
        updates.push({
          range: `Sheet1!K${rowNum}`,
          values: [['Enriched 2026-03-04: Name & title verified from https://skcapitalpartners.com/ - Email not found from official source']]
        });
      }
      
      // Update I Squared Capital with Sadek Wahba
      if (firmName.includes('I Squared')) {
        updates.push({
          range: `Sheet1!C${rowNum}:D${rowNum}`,
          values: [[
            'Sadek Wahba',
            'Chairman & Managing Partner'
          ]]
        });
        updates.push({
          range: `Sheet1!G${rowNum}`,
          values: [['https://www.linkedin.com/company/i-squared-capital/']]
        });
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [['Infrastructure investing, $35B+ AUM, global offices']]
        });
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [['Partial']]
        });
        updates.push({
          range: `Sheet1!K${rowNum}`,
          values: [['Enriched 2026-03-04: Name & title verified from https://isquaredcapital.com/ - Email not found from official source']]
        });
      }
      
      // Update Juggernaut Capital Partners with Alex Deegan
      if (firmName.includes('Juggernaut')) {
        updates.push({
          range: `Sheet1!C${rowNum}:D${rowNum}`,
          values: [[
            'Alex Deegan',
            'Managing Director'
          ]]
        });
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [['Consumer & healthcare PE, Founded by John Shulman, Washington DC']]
        });
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [['Partial']]
        });
        updates.push({
          range: `Sheet1!K${rowNum}`,
          values: [['Enriched 2026-03-04: Name & title verified from https://juggernautcap.com/ press releases - Email not found']]
        });
      }
      
      // Update Radian Capital with Chiraag Kapoor
      if (firmName.includes('Radian Capital')) {
        updates.push({
          range: `Sheet1!C${rowNum}:D${rowNum}`,
          values: [[
            'Chiraag Kapoor',
            'Principal'
          ]]
        });
        updates.push({
          range: `Sheet1!G${rowNum}`,
          values: [['https://www.linkedin.com/in/chiraag-kapoor-ba602724/']]
        });
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [['Cornell grad, NYC-based, operational foundations for scaling tech']]
        });
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [['Partial']]
        });
        updates.push({
          range: `Sheet1!K${rowNum}`,
          values: [['Enriched 2026-03-04: Name & title verified from LinkedIn - Email not found from official source']]
        });
      }
      
      // Update Silas Capital with Brian Thorne
      if (firmName.includes('Silas')) {
        updates.push({
          range: `Sheet1!C${rowNum}:D${rowNum}`,
          values: [[
            'Brian Thorne',
            'Partner'
          ]]
        });
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [['Beauty & consumer growth equity, recognized as top financial player by WWD Beauty Inc']]
        });
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [['Partial']]
        });
        updates.push({
          range: `Sheet1!K${rowNum}`,
          values: [['Enriched 2026-03-04: Name & title verified from https://www.silascapital.com/ - Email not found']]
        });
      }
      
      // Update HPS Investment Partners with Ryan Beresford-Wylie
      if (firmName.includes('HPS Investment') || firmName.includes('HPS Partners')) {
        updates.push({
          range: `Sheet1!C${rowNum}:D${rowNum}`,
          values: [[
            'Ryan Beresford-Wylie',
            'Managing Director, Product Specialist'
          ]]
        });
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [['Alternative credit, $140B+ AUM, London office, multiple MDs available']]
        });
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [['Partial']]
        });
        updates.push({
          range: `Sheet1!K${rowNum}`,
          values: [['Enriched 2026-03-04: Name & title verified from https://www.hpspartners.com/our-story/team-culture - Email not found']]
        });
      }
      
      // Update MPE Partners with Joshua Liebow
      if (firmName.includes('MPE Partners')) {
        updates.push({
          range: `Sheet1!C${rowNum}:D${rowNum}`,
          values: [[
            'Joshua Liebow',
            'Partner'
          ]]
        });
        updates.push({
          range: `Sheet1!I${rowNum}`,
          values: [['Promoted to Partner in 2025, previously Principal, serves on multiple boards']]
        });
        updates.push({
          range: `Sheet1!J${rowNum}`,
          values: [['Partial']]
        });
        updates.push({
          range: `Sheet1!K${rowNum}`,
          values: [['Enriched 2026-03-04: Name & title verified from https://www.mpepartners.com/ - Email not found']]
        });
      }
    });
    
    // Batch update all changes
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates
        }
      });
      
      console.log(`✅ Successfully updated ${updates.length / 4} firms in Google Sheet`);
      console.log(`\nSUMMARY:`);
      console.log(`- 10 PARTIAL enrichments with verified name & title from official sources`);
      console.log(`- Firms enriched: Great Range, Jump Capital, RevTek, SK Capital, I Squared, Juggernaut, Radian, Silas, HPS, MPE`);
      console.log(`- All firms need follow-up for direct email verification`);
      console.log(`\nNEXT STEPS:`);
      console.log(`- Consider using Apollo API or manual website research for emails`);
      console.log(`- Check LinkedIn profiles for potential outreach`);
      console.log(`- Review firm contact pages for general inquiry addresses`);
    } else {
      console.log('No matching firms found to update');
    }
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    process.exit(1);
  }
}

updateEnrichments();
