const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Second batch of updates - verified contacts from official sources
const updates = [
  {
    firm: 'Gauge Capital',
    contact: 'Andrew Peix',
    title: 'Partner, Business Development',
    email: 'apeix@gaugecapital.com',
    linkedin: '',
    status: 'Enriched',
    notes: 'Email verified from gaugecapital.com press releases'
  },
  {
    firm: 'Riverside Partners',
    contact: 'Michelle Noon',
    title: 'General Partners',
    email: 'mnoon@riversidepartners.com',
    linkedin: '',
    status: 'Enriched',
    notes: 'Email verified from riversidepartners.com press release'
  },
  {
    firm: 'Kudu Investment Management',
    contact: 'Rob Jakacki',
    title: 'Managing Partner & CEO',
    email: '',
    linkedin: 'https://www.linkedin.com/in/rob-jakacki/',
    status: 'Partial',
    notes: 'LinkedIn profile confirmed, email not publicly available'
  },
  {
    firm: 'Long Ridge',
    contact: 'Kevin Bhatt',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/kevin-bhatt/',
    status: 'Partial',
    notes: 'Contact identified on long-ridge.com team page'
  },
  {
    firm: 'Millennium Bridge Capital',
    contact: 'Brian Knitt',
    title: 'Managing Director',
    email: '',
    linkedin: '',
    status: 'Partial',
    notes: 'Contact identified on millenniumbridge.com team page'
  },
  {
    firm: 'Newflow Partners',
    contact: 'Jason Levine',
    title: 'Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/jasonmlevine/',
    status: 'Partial',
    notes: 'Contact identified, email not publicly available'
  },
  {
    firm: 'Stellex Capital',
    contact: 'Ray Whiteman',
    title: 'Managing Partner',
    email: '',
    linkedin: '',
    status: 'Partial',
    notes: 'Managing Partner identified from Craft.co'
  },
  {
    firm: 'Clearlake Capital',
    contact: 'Jose Feliciano',
    title: 'Co-Founder & Managing Partner',
    email: '',
    linkedin: '',
    status: 'Partial',
    notes: 'Co-Managing Partner with Behdad Eghbali'
  },
  {
    firm: 'Access Holdings',
    contact: 'Kevin McAllister',
    title: 'Founder & Managing Partner',
    email: '',
    linkedin: '',
    status: 'Partial',
    notes: 'Contact identified on accessholdings.com'
  },
  {
    firm: 'Bregal Sagemount',
    contact: 'Gene Yoon',
    title: 'Managing Partner',
    email: '',
    linkedin: '',
    status: 'Partial',
    notes: 'Managing Partner, founded from Goldman Sachs SSG'
  }
];

(async () => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read the sheet
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:L'
    });
    
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in sheet');
      return;
    }
    
    // Find column indices
    const headers = rows[0];
    const firmCol = headers.indexOf('Company Name');
    const contactCol = headers.indexOf('Contact Name');
    const titleCol = headers.indexOf('Title');
    const emailCol = headers.indexOf('Email');
    const linkedinCol = headers.indexOf('LinkedIn');
    const statusCol = headers.indexOf('Status');
    const notesCol = headers.indexOf('Notes');
    
    console.log('Column indices:', {
      firmCol, contactCol, titleCol, emailCol, linkedinCol, statusCol, notesCol
    });
    
    // Build batch update requests
    const batchData = [];
    
    for (const update of updates) {
      // Find the row for this firm
      const rowIndex = rows.findIndex((row, idx) => 
        idx > 0 && row[firmCol] && row[firmCol].toLowerCase().includes(update.firm.toLowerCase())
      );
      
      if (rowIndex === -1) {
        console.log(`Firm not found: ${update.firm}`);
        continue;
      }
      
      console.log(`Updating ${update.firm} at row ${rowIndex + 1}`);
      
      // Update specific cells for this row
      if (contactCol >= 0 && update.contact) {
        batchData.push({
          range: `Sheet1!${String.fromCharCode(65 + contactCol)}${rowIndex + 1}`,
          values: [[update.contact]]
        });
      }
      if (titleCol >= 0 && update.title) {
        batchData.push({
          range: `Sheet1!${String.fromCharCode(65 + titleCol)}${rowIndex + 1}`,
          values: [[update.title]]
        });
      }
      if (emailCol >= 0 && update.email) {
        batchData.push({
          range: `Sheet1!${String.fromCharCode(65 + emailCol)}${rowIndex + 1}`,
          values: [[update.email]]
        });
      }
      if (linkedinCol >= 0 && update.linkedin) {
        batchData.push({
          range: `Sheet1!${String.fromCharCode(65 + linkedinCol)}${rowIndex + 1}`,
          values: [[update.linkedin]]
        });
      }
      if (statusCol >= 0 && update.status) {
        batchData.push({
          range: `Sheet1!${String.fromCharCode(65 + statusCol)}${rowIndex + 1}`,
          values: [[update.status]]
        });
      }
      if (notesCol >= 0 && update.notes) {
        batchData.push({
          range: `Sheet1!${String.fromCharCode(65 + notesCol)}${rowIndex + 1}`,
          values: [[update.notes]]
        });
      }
    }
    
    if (batchData.length === 0) {
      console.log('No updates to make');
      return;
    }
    
    // Execute batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: batchData
      }
    });
    
    console.log(`✅ Updated ${updates.length} firms in the sheet`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
