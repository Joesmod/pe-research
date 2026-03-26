const { google } = require('googleapis');
const path = require('path');

async function updateEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join('C:', 'Users', 'aljen', '.openclaw', 'workspace-jim', 'projects', 'gmail-outreach', 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get current data first
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:L',
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  // Find column indices
  const companyCol = 0; // A
  const contactCol = 2; // C (Contact Name)
  const titleCol = 3; // D (Title/Position)
  const emailCol = 4; // E (Email)
  const linkedinCol = 6; // G (LinkedIn)
  const statusCol = 9; // J (Status)
  const notesCol = 11; // L (Notes)
  
  // Enrichments to add
  const enrichments = [
    {
      company: 'Invision Capital',
      contact: 'Robert Castillo',
      title: 'Managing Director',
      email: 'RCastillo@invcg.com',
      linkedin: 'https://www.linkedin.com/company/invision-capital',
      status: 'Enriched',
      notes: 'Source: Official website (invcg.com/team) - verified 2026-03-11'
    },
    {
      company: 'Ocean Avenue Capital Partners',
      contact: 'Jeff Ennis',
      title: 'Founding Partner',
      email: 'jennis@oceanavenuecapital.com',
      linkedin: 'https://www.linkedin.com/company/ocean-avenue-capital-partners-lp',
      status: 'Enriched',
      notes: 'Source: Official website (oceanavenuecapital.com/our-team) - verified 2026-03-11'
    },
    {
      company: 'Ocean Avenue Capital Partners',
      contact: 'Duran Curis',
      title: 'Founding Partner, CFA',
      email: 'dcuris@oceanavenuecapital.com',
      linkedin: 'https://www.linkedin.com/company/ocean-avenue-capital-partners-lp',
      status: 'Enriched',
      notes: 'Source: Official website (oceanavenuecapital.com/our-team) - verified 2026-03-11'
    },
    {
      company: 'Ocean Avenue Capital Partners',
      contact: 'Pete Notz',
      title: 'Partner',
      email: 'pnotz@oceanavenuecapital.com',
      linkedin: 'https://www.linkedin.com/company/ocean-avenue-capital-partners-lp',
      status: 'Enriched',
      notes: 'Source: Official website (oceanavenuecapital.com/our-team) - verified 2026-03-11'
    },
    {
      company: 'Silver Oak Services Partners',
      contact: 'Daniel M. Gill',
      title: 'Co-Founder & Managing Partner',
      email: '', // No direct email found, only info@silveroaksp.com
      linkedin: 'https://www.linkedin.com/company/silver-oak-services-partners-llc',
      status: 'Partial',
      notes: 'Source: silveroaksp.com/team - verified name/title, no direct email found (generic: info@silveroaksp.com) - verified 2026-03-11'
    },
    {
      company: 'Silver Oak Services Partners',
      contact: 'Gregory M. Barr',
      title: 'Co-Founder & Managing Partner',
      email: '', // No direct email found
      linkedin: 'https://www.linkedin.com/company/silver-oak-services-partners-llc',
      status: 'Partial',
      notes: 'Source: silveroaksp.com/team - verified name/title, no direct email found (generic: info@silveroaksp.com) - verified 2026-03-11'
    }
  ];
  
  // Find rows to update
  const updates = [];
  
  for (const enrichment of enrichments) {
    // Find the row for this company
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][companyCol] === enrichment.company) {
        // Check if this exact contact already exists
        const existingContact = rows[i][contactCol];
        if (!existingContact || existingContact === enrichment.contact || existingContact.includes('info@') || existingContact.includes('contact@')) {
          rowIndex = i;
          break;
        }
      }
    }
    
    if (rowIndex === -1) {
      // Company not found or all contacts filled - add new row
      rowIndex = rows.length;
      rows.push(new Array(headers.length).fill(''));
      rows[rowIndex][companyCol] = enrichment.company;
    }
    
    // Update the row
    const row = rows[rowIndex];
    row[contactCol] = enrichment.contact;
    row[titleCol] = enrichment.title;
    if (enrichment.email) row[emailCol] = enrichment.email;
    if (enrichment.linkedin) row[linkedinCol] = enrichment.linkedin;
    row[statusCol] = enrichment.status;
    row[notesCol] = enrichment.notes;
    
    updates.push({
      range: `Sheet1!A${rowIndex + 1}:L${rowIndex + 1}`,
      values: [row]
    });
  }
  
  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`Updated ${updates.length} rows in the spreadsheet.`);
  } else {
    console.log('No updates needed.');
  }
}

updateEnrichments().catch(console.error);
