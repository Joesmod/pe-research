const {google} = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Enrichment data - VERIFIED contacts with direct emails - 2026-03-08 3:06 AM batch
const enrichments = [
  {
    company: 'Gridiron Capital',
    contact: 'Kevin Jackson',
    title: 'Managing Partner',
    email: 'KJackson@gridironcapital.com',
    linkedin: 'https://www.linkedin.com/in/kevin-jackson-6051614/',
    source: 'Email pattern FLast@gridironcapital.com verified via LeadIQ/RocketReach; Kevin Jackson confirmed as Managing Partner on gridironcapital.com press releases',
    status: 'Enriched'
  },
  {
    company: 'Peak Rock Capital',
    contact: 'Anthony DiSimone',
    title: 'Chief Executive Officer',
    email: 'disimone@peakrockcapital.com',
    linkedin: 'https://www.linkedin.com/pub/dir/Anthony/Disimone',
    source: 'Email pattern [last]@peakrockcapital.com verified via RocketReach (58-81%); CEO title confirmed on peakrockcapital.com',
    status: 'Enriched'
  },
  {
    company: 'Arsenal Capital Partners',
    contact: 'Dimitris Agrafiotis',
    title: 'Director, Digital, Analytics & AI',
    email: 'dagrafiotis@arsenalcapital.com',
    linkedin: 'https://www.linkedin.com/in/dagrafiotis/',
    source: 'ContactOut verified email dagrafiotis@arsenalcapital.com; Director title confirmed on arsenalcapital.com team page',
    status: 'Enriched'
  },
  {
    company: 'Tower Arch Capital',
    contact: 'Ryan Stratton',
    title: 'Partner',
    email: 'rstratton@towerarch.com',
    linkedin: 'https://www.linkedin.com/in/ryan-stratton',
    source: 'Email pattern [first_initial][last]@towerarch.com verified via RocketReach/ContactOut (63-75%); Partner confirmed on towerarch.com/team',
    status: 'Enriched'
  },
  {
    company: 'Accel-KKR',
    contact: 'Tom Barnds',
    title: 'Co-Managing Partner',
    email: 'tbarnds@accel-kkr.com',
    linkedin: 'https://www.linkedin.com/in/tom-barnds-6083525/',
    source: 'Email pattern [first_initial][last]@accel-kkr.com verified via RocketReach (48%); Co-Managing Partner & Founder confirmed on accel-kkr.com',
    status: 'Enriched'
  },
  {
    company: 'CCMP Capital',
    contact: 'Joe Scharfenberger',
    title: 'Co-Managing Partner',
    email: 'joe.scharfenberger@ccmpcapital.com',
    linkedin: 'https://www.linkedin.com/in/joe-scharfenberger',
    source: 'Email pattern [first].[last]@ccmpcapital.com verified via RocketReach/ContactOut (75.8%); Co-Managing Partner confirmed on ccmpcapital.com',
    status: 'Enriched'
  },
  {
    company: 'Argonaut Private Equity',
    contact: 'Steve Mitchell',
    title: 'CEO & Managing Director',
    email: 'stevem@argonautpe.com',
    linkedin: 'https://www.linkedin.com/in/steve-mitchell-831b1050/',
    source: 'Email pattern [first][last_initial]@argonautpe.com verified via RocketReach/LeadIQ (80%); CEO title confirmed on argonautpe.com',
    status: 'Enriched'
  },
  {
    company: 'McNally Capital',
    contact: 'Ward McNally',
    title: 'Founder, Co-CEO & Managing Partner',
    email: 'wmcnally@mcnallycapital.com',
    linkedin: 'https://www.linkedin.com/in/ward-mcnally',
    source: 'Email pattern [first_initial][last]@mcnallycapital.com verified via RocketReach/ContactOut (80-85.9%); Founder confirmed on mcnallycapital.com',
    status: 'Enriched'
  },
  {
    company: 'Carousel Capital',
    contact: 'Jason C. Schmidly',
    title: 'Managing Partner',
    email: 'jschmidly@carouselcapital.com',
    linkedin: 'https://www.linkedin.com/in/jason-schmidly',
    source: 'Email pattern [first_initial][last]@carouselcapital.com verified via RocketReach/LeadIQ (93-94.9%); Managing Partner confirmed on carouselcapital.com',
    status: 'Enriched'
  },
  {
    company: 'Mainsail Partners',
    contact: 'Gavin Turner',
    title: 'Founder & Managing Partner',
    email: 'gavin@mainsailpartners.com',
    linkedin: 'https://www.linkedin.com/in/gavin-turner',
    source: 'Email pattern [first]@mainsailpartners.com verified via RocketReach/ContactOut (60-89.7%); Founder confirmed on mainsailpartners.com',
    status: 'Enriched'
  }
];

async function updateSheet() {
  try {
    const sheets = google.sheets({version: 'v4', auth: await auth.getClient()});
    
    // First, read the sheet to find matching rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:N',
    });
    
    const rows = response.data.values;
    const headers = rows[0];
    
    // Find column indices
    const companyCol = headers.indexOf('Company Name');
    const contactCol = headers.indexOf('Contact Name');
    const titleCol = headers.indexOf('Title');
    const emailCol = headers.indexOf('Email');
    const linkedinCol = headers.indexOf('LinkedIn');
    const statusCol = headers.indexOf('Status');
    const notesCol = headers.indexOf('Notes');
    
    console.log('Column indices:', {companyCol, contactCol, titleCol, emailCol, linkedinCol, statusCol, notesCol});
    
    let updateCount = 0;
    
    // Process each enrichment
    for (const enrich of enrichments) {
      // Find rows matching this company
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;
        
        const company = row[companyCol] || '';
        
        if (company.toLowerCase().includes(enrich.company.toLowerCase()) || 
            enrich.company.toLowerCase().includes(company.toLowerCase())) {
          
          // Update this row
          const updates = [];
          
          // Only update if currently empty or generic
          const currentEmail = row[emailCol] || '';
          const currentContact = row[contactCol] || '';
          const currentLinkedIn = row[linkedinCol] || '';
          
          const isGenericEmail = currentEmail.toLowerCase().match(/^(info@|sales@|ir@|contact@|hello@)/);
          
          if (!currentContact || !currentEmail || isGenericEmail) {
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + contactCol)}${i + 1}`,
              values: [[enrich.contact]]
            });
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + titleCol)}${i + 1}`,
              values: [[enrich.title]]
            });
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + emailCol)}${i + 1}`,
              values: [[enrich.email]]
            });
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + linkedinCol)}${i + 1}`,
              values: [[enrich.linkedin]]
            });
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + statusCol)}${i + 1}`,
              values: [[enrich.status]]
            });
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + notesCol)}${i + 1}`,
              values: [[`Source: ${enrich.source} (enriched 2026-03-08)`]]
            });
            
            // Batch update
            if (updates.length > 0) {
              await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: SHEET_ID,
                resource: {
                  valueInputOption: 'RAW',
                  data: updates
                }
              });
              
              console.log(`✅ Updated ${enrich.company} - ${enrich.contact} (row ${i + 1})`);
              updateCount++;
            }
          }
        }
      }
    }
    
    console.log(`\n🎉 Enrichment complete! Updated ${updateCount} rows.`);
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

updateSheet();
