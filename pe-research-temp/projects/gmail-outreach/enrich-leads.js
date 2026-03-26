const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = 'service-account.json';

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
  });
  
  const rows = response.data.values || [];
  const header = rows[0];
  
  // Find column indices
  const companyCol = header.indexOf('Company');
  const contactCol = header.indexOf('Contact Name');
  const titleCol = header.indexOf('Position/Title');
  const emailCol = header.indexOf('Email');
  const linkedinCol = header.indexOf('LinkedIn URL');
  const statusCol = header.indexOf('Status');
  const notesCol = header.indexOf('Notes');

  const updates = [];

  // Process each row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const status = row[statusCol] || '';

    // Enrichment data based on research
    let enrichment = null;

    if (company === 'Silas Capital' && contact === 'Brian Thorne') {
      // Already has contact, add alternative contacts as new rows
      console.log(`✓ Silas Capital - Brian Thorne already enriched with brian@silascapital.com`);
      // Could add Carter Weiss and Frank T. Lin as additional rows
    }

    if (company === 'Star Mountain Capital') {
      enrichment = {
        contact: 'Jeff Feinberg',
        title: 'Managing Director and Strategic Portfolio Partner',
        notes: 'Joined Feb 2025 from A&M PE Services. 30+ years PE experience.'
      };
    }

    if (company === 'Clearhaven Partners') {
      enrichment = {
        contact: 'Michelle Noon',
        title: 'Founder and Managing Partner',
        email: 'mnoon@clearhavenpartners.com',
        linkedin: 'https://www.linkedin.com/in/michelle-noon-69701a1/',
        status: 'Enriched',
        notes: 'Software PE firm founded 2019. Source: LinkedIn + RocketReach'
      };
    }

    if (company === 'Spectrum Search Partners') {
      enrichment = {
        status: 'Dead - Not PE Firm',
        notes: 'Executive search/recruiting firm, not PE'
      };
    }

    if (company === 'Provident Healthcare Partners') {
      enrichment = {
        status: 'Dead - Investment Bank',
        notes: 'Healthcare M&A advisory/investment bank, not PE'
      };
    }

    if (company === 'AGC Partners') {
      enrichment = {
        status: 'Dead - Investment Bank',
        notes: 'Tech M&A advisory firm, not PE'
      };
    }

    if (company === 'Amity Search Partners') {
      enrichment = {
        status: 'Dead - Not PE Firm',
        notes: 'Executive search firm for PE, not PE itself'
      };
    }

    if (enrichment) {
      const rowNum = i + 1;
      
      if (enrichment.contact && contactCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(66 + contactCol)}${rowNum}`,
          values: [[enrichment.contact]]
        });
      }
      
      if (enrichment.title && titleCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(66 + titleCol)}${rowNum}`,
          values: [[enrichment.title]]
        });
      }
      
      if (enrichment.email && emailCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(66 + emailCol)}${rowNum}`,
          values: [[enrichment.email]]
        });
      }
      
      if (enrichment.linkedin && linkedinCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(66 + linkedinCol)}${rowNum}`,
          values: [[enrichment.linkedin]]
        });
      }
      
      if (enrichment.status && statusCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(66 + statusCol)}${rowNum}`,
          values: [[enrichment.status]]
        });
      }
      
      if (enrichment.notes && notesCol >= 0) {
        const existingNotes = row[notesCol] || '';
        const newNotes = existingNotes ? `${existingNotes}; ${enrichment.notes}` : enrichment.notes;
        updates.push({
          range: `Sheet1!${String.fromCharCode(66 + notesCol)}${rowNum}`,
          values: [[newNotes]]
        });
      }
      
      console.log(`✓ Enriched: ${company} (row ${rowNum})`);
    }
  }

  // Apply all updates
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    
    console.log(`\n✅ Applied ${updates.length} updates to the sheet`);
  } else {
    console.log('\n⚠ No updates to apply');
  }

  // Summary
  console.log('\n📊 Enrichment Summary:');
  console.log('- Clearhaven Partners: Added Michelle Noon (Founder/MP)');
  console.log('- Star Mountain Capital: Added Jeff Feinberg (MD)');
  console.log('- Marked 4 non-PE firms as Dead');
  console.log('\nTotal records enriched: 5');
}

enrichLeads().catch(console.error);
