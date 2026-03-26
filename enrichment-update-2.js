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
  
  // Enrichments to add (round 2)
  const enrichments = [
    {
      company: 'Pritzker Private Capital',
      contact: 'Michael Nelson',
      title: 'Managing Partner & Head of Investing',
      email: '', // Email pattern @ppcpartners.com confirmed, exact email not publicly listed
      linkedin: 'https://www.linkedin.com/company/pritzker-private-capital',
      status: 'Partial',
      notes: 'Source: ppcpartners.com/team - verified name/title. Email domain: @ppcpartners.com (pattern not confirmed without direct source) - verified 2026-03-11'
    },
    {
      company: 'Pritzker Private Capital',
      contact: 'Tony Pritzker',
      title: 'Chairman & CEO',
      email: '', // Email pattern @ppcpartners.com
      linkedin: 'https://www.linkedin.com/company/pritzker-private-capital',
      status: 'Partial',
      notes: 'Source: ppcpartners.com/team - verified name/title. Email domain: @ppcpartners.com (pattern not confirmed without direct source) - verified 2026-03-11'
    },
    {
      company: 'Millennium Bridge Capital',
      contact: 'John Fitzgerald',
      title: 'Managing Director & Co-Founder',
      email: '', // Email pattern @mbclp.com per ZoomInfo (not verified from official source)
      linkedin: 'https://www.linkedin.com/company/millennium-bridge-capital',
      status: 'Partial',
      notes: 'Source: millenniumbridge.com/team - verified name/title. Email domain @mbclp.com suggested by third-party but not verified on official site - verified 2026-03-11'
    },
    {
      company: 'Frontenac Company',
      contact: 'Walter Florence',
      title: 'Managing Partner',
      email: '', // Not found
      linkedin: 'https://www.linkedin.com/company/frontenac-company',
      status: 'Partial',
      notes: 'Source: Third-party directory - verified name/title, no direct email found - verified 2026-03-11'
    },
    {
      company: 'Frontenac Company',
      contact: 'Ronald Kuehl',
      title: 'Managing Partner',
      email: '', // Not found
      linkedin: 'https://www.linkedin.com/company/frontenac-company',
      status: 'Partial',
      notes: 'Source: Third-party directory - verified name/title, no direct email found - verified 2026-03-11'
    },
    {
      company: 'Prospect Capital Management',
      contact: 'John F. Barry',
      title: 'CEO',
      email: '', // Not verified from official source
      linkedin: 'https://www.linkedin.com/company/prospect-capital-management',
      status: 'Partial',
      notes: 'Source: LinkedIn, prospectcap.com - verified name/title, no direct email found - verified 2026-03-11'
    },
    {
      company: 'Palladium Equity Partners',
      contact: 'Justin R. Green',
      title: 'Co-Head of Funds & Head of Consumer',
      email: '', // Not found on official site
      linkedin: 'https://www.linkedin.com/company/palladium-equity-partners',
      status: 'Partial',
      notes: 'Source: palladiumequity.com/people - verified name/title, no direct email on website - verified 2026-03-11'
    },
    {
      company: 'Palladium Equity Partners',
      contact: 'Daniel Ilundain',
      title: 'President & Co-Head of Funds, CFA',
      email: '', // Not found
      linkedin: 'https://www.linkedin.com/company/palladium-equity-partners',
      status: 'Partial',
      notes: 'Source: palladiumequity.com/people - verified name/title, no direct email on website - verified 2026-03-11'
    }
  ];
  
  // Find rows to update
  const updates = [];
  
  for (const enrichment of enrichments) {
    // Find the row for this company or add new
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][companyCol] === enrichment.company) {
        const existingContact = rows[i][contactCol];
        // Only update if contact is empty or generic
        if (!existingContact || existingContact === enrichment.contact || existingContact.includes('info@') || existingContact.includes('contact@')) {
          rowIndex = i;
          break;
        }
      }
    }
    
    if (rowIndex === -1) {
      // Company not found - add new row
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
    console.log(`Updated ${updates.length} rows in the spreadsheet (Round 2).`);
  } else {
    console.log('No updates needed.');
  }
}

updateEnrichments().catch(console.error);
