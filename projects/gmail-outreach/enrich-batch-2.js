const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SHEET_NAME = 'Sheet1';

// Enrichments - only verified information from official sources
// Rule: NEVER GUESS email patterns. Only use emails from official published sources.
const enrichments = [
  {
    firmName: 'Providence Equity Partners',
    contactName: 'R. Davis Noell',
    title: 'Senior Managing Director & Co-Head of North America',
    email: '', // No verified official source
    linkedin: 'https://www.linkedin.com/in/davis-noell-49671442/',
    notes: 'Senior MD from provequity.com/people/r-davis-noell',
    status: 'Enriched'
  },
  {
    firmName: 'Bruin Capital',
    contactName: 'George Pyne',
    title: 'Founder & CEO',
    email: '', // No verified official source
    linkedin: 'https://www.linkedin.com/in/georgepyne/',
    notes: 'Founder & CEO from bruincptl.com/team',
    status: 'Enriched'
  },
  {
    firmName: 'Butterfly Equity',
    contactName: 'Dustin Beck',
    title: 'Co-Founder & Co-CEO',
    email: '', // No verified official source
    linkedin: 'https://www.linkedin.com/in/dustinbeck/',
    notes: 'Co-Founder & Co-CEO from bfly.com/team/dustin-beck',
    status: 'Enriched'
  }
];

// Special case: Replace Jane Ingalls (media contact) with Blair Richardson (CEO) for all Bow River Capital entries
const bowRiverUpdate = {
  firmName: 'Bow River Capital',
  contactName: 'Blair Richardson',
  title: 'Founder & CEO',
  email: '', // No verified official source
  linkedin: 'https://www.linkedin.com/in/blair-richardson-a4755613/',
  notes: 'Founder & CEO from bowrivercapital.com',
  status: 'Enriched'
};

async function enrichLeads() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, 'service-account.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('Reading current sheet data...');
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:L`,
    });

    const rows = readResponse.data.values || [];
    if (rows.length === 0) {
      console.log('No data found in sheet.');
      return;
    }

    const updates = [];
    let enrichedCount = 0;
    const enrichedFirms = new Set();

    // Column indices (0-based)
    const firmNameCol = 0;
    const contactNameCol = 2;
    const titleCol = 3;
    const emailCol = 4;
    const linkedinCol = 6;
    const statusCol = 8;
    const notesCol = 11;

    // Process regular enrichments
    for (const enrichment of enrichments) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const firmName = row[firmNameCol] || '';
        const currentContact = row[contactNameCol] || '';
        const currentEmail = row[emailCol] || '';
        const currentStatus = row[statusCol] || '';
        
        if (currentStatus === 'Dead' || currentStatus === 'Not PE Firm') continue;
        
        if (firmName.toLowerCase().includes(enrichment.firmName.toLowerCase())) {
          // Skip if already has a person's name and non-generic email
          if (currentContact && 
              !currentContact.toLowerCase().includes('media') &&
              !currentContact.toLowerCase().includes('relations') &&
              !currentContact.toLowerCase().includes('investor relations') &&
              currentEmail && 
              !currentEmail.startsWith('info@') && 
              !currentEmail.startsWith('sales@') &&
              !currentEmail.startsWith('ir@') &&
              !currentEmail.startsWith('inquiries@') &&
              !currentEmail.startsWith('investors@')) {
            console.log(`Skipping ${firmName} row ${i+1} - already has good contact info`);
            continue;
          }

          console.log(`Enriching row ${i + 1}: ${firmName}`);
          
          updates.push({
            range: `${SHEET_NAME}!${getColumnLetter(contactNameCol)}${i + 1}`,
            values: [[enrichment.contactName]]
          });
          
          updates.push({
            range: `${SHEET_NAME}!${getColumnLetter(titleCol)}${i + 1}`,
            values: [[enrichment.title]]
          });
          
          if (enrichment.linkedin) {
            updates.push({
              range: `${SHEET_NAME}!${getColumnLetter(linkedinCol)}${i + 1}`,
              values: [[enrichment.linkedin]]
            });
          }
          
          updates.push({
            range: `${SHEET_NAME}!${getColumnLetter(statusCol)}${i + 1}`,
            values: [[enrichment.status]]
          });
          
          const currentNotes = row[notesCol] || '';
          const newNotes = currentNotes ? `${currentNotes}; ${enrichment.notes}` : enrichment.notes;
          updates.push({
            range: `${SHEET_NAME}!${getColumnLetter(notesCol)}${i + 1}`,
            values: [[newNotes]]
          });
          
          enrichedFirms.add(enrichment.firmName);
          enrichedCount++;
        }
      }
    }

    // Special handling: Replace all Jane Ingalls entries for Bow River Capital
    console.log('\nUpdating Bow River Capital entries (replacing media contact with CEO)...');
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firmName = row[firmNameCol] || '';
      const currentContact = row[contactNameCol] || '';
      const currentStatus = row[statusCol] || '';
      
      if (currentStatus === 'Dead' || currentStatus === 'Not PE Firm') continue;
      
      if (firmName.toLowerCase().includes('bow river capital') && 
          currentContact.toLowerCase().includes('jane ingalls')) {
        console.log(`Updating row ${i + 1}: ${firmName} (replacing ${currentContact})`);
        
        updates.push({
          range: `${SHEET_NAME}!${getColumnLetter(contactNameCol)}${i + 1}`,
          values: [[bowRiverUpdate.contactName]]
        });
        
        updates.push({
          range: `${SHEET_NAME}!${getColumnLetter(titleCol)}${i + 1}`,
          values: [[bowRiverUpdate.title]]
        });
        
        updates.push({
          range: `${SHEET_NAME}!${getColumnLetter(linkedinCol)}${i + 1}`,
          values: [[bowRiverUpdate.linkedin]]
        });
        
        updates.push({
          range: `${SHEET_NAME}!${getColumnLetter(statusCol)}${i + 1}`,
          values: [[bowRiverUpdate.status]]
        });
        
        const currentNotes = row[notesCol] || '';
        const newNotes = currentNotes ? `${currentNotes}; ${bowRiverUpdate.notes}` : bowRiverUpdate.notes;
        updates.push({
          range: `${SHEET_NAME}!${getColumnLetter(notesCol)}${i + 1}`,
          values: [[newNotes]]
        });
        
        enrichedFirms.add('Bow River Capital');
        enrichedCount++;
      }
    }

    // Execute batch update
    if (updates.length > 0) {
      console.log(`\nUpdating ${updates.length} cells for ${enrichedCount} rows across ${enrichedFirms.size} unique firms...`);
      
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates,
        },
      });

      console.log(`\n✅ Successfully enriched ${enrichedCount} leads`);
      console.log(`Firms enriched: ${Array.from(enrichedFirms).join(', ')}`);
      console.log('\n⚠️ Note: Email fields left blank where no verified direct emails found on official sources');
      console.log('Next step: Use Apollo.io API for verified email enrichment');
    } else {
      console.log('No updates needed - all firms already enriched');
    }

  } catch (error) {
    console.error('Error enriching leads:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

function getColumnLetter(colIndex) {
  let letter = '';
  let temp = colIndex;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

enrichLeads();
