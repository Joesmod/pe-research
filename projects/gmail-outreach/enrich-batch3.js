const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

// Third batch of enrichments
const ENRICHMENTS = [
  {
    firmName: 'Svoboda Capital Partners',
    contact: 'Thomas Brooker',
    title: 'Managing Director & Operating Partner',
    email: 'tbrooker@svoco.com',
    linkedin: '',
    notes: 'Email format: first_initial+last@svoco.com (89.8%) | Chicago-based, founded 1998 | Source: RocketReach, ZoomInfo',
  },
  {
    firmName: 'Francisco Partners',
    contact: 'Dipanjan Deb',
    title: 'Co-Founder & CEO',
    email: 'dipanjan.deb@franciscopartners.com',
    linkedin: 'https://www.linkedin.com/company/francisco-partners',
    notes: 'Email format: first.last@franciscopartners.com (61.9%) | Also known as DJ Deb | Co-Presidents: Ezra Perlman, Deep Shah | CIO: David Golob | Source: Wikipedia, LinkedIn',
  },
];

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function enrichLeads() {
  const sheets = await getClient();
  
  // Read the entire sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) {
    console.log('Sheet is empty');
    return;
  }
  
  const header = rows[0];
  
  // Find column indices
  const firmCol = header.indexOf('Company Name');
  const contactCol = header.indexOf('Contact Name');
  const titleCol = header.indexOf('Title');
  const emailCol = header.indexOf('Email');
  const linkedinCol = header.indexOf('LinkedIn');
  const statusCol = header.indexOf('Status');
  const notesCol = header.indexOf('Notes');
  
  console.log(`Found columns: Firm=${firmCol}, Contact=${contactCol}, Title=${titleCol}, Email=${emailCol}, LinkedIn=${linkedinCol}, Status=${statusCol}, Notes=${notesCol}`);
  
  let updatedCount = 0;
  
  // For each enrichment, find matching row(s) and update
  for (const enrich of ENRICHMENTS) {
    let foundMatch = false;
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firmName = row[firmCol] || '';
      const contactName = row[contactCol] || '';
      const email = row[emailCol] || '';
      
      // Match if same firm AND (no contact OR generic email)
      const isGenericEmail = !email || email.includes('info@') || email.includes('sales@') || email.includes('ir@');
      const needsEnrichment = firmName.includes(enrich.firmName) && (!contactName || isGenericEmail);
      
      if (needsEnrichment && !foundMatch) {
        // Update this row
        const rowNum = i + 1; // 1-indexed
        const updates = [];
        
        if (contactCol >= 0 && enrich.contact) updates.push([contactCol, enrich.contact]);
        if (titleCol >= 0 && enrich.title) updates.push([titleCol, enrich.title]);
        if (emailCol >= 0 && enrich.email) updates.push([emailCol, enrich.email]);
        if (linkedinCol >= 0 && enrich.linkedin) updates.push([linkedinCol, enrich.linkedin]);
        if (statusCol >= 0) updates.push([statusCol, 'Enriched']);
        if (notesCol >= 0 && enrich.notes) {
          const existingNotes = row[notesCol] || '';
          const newNotes = existingNotes ? `${existingNotes} | ${enrich.notes}` : enrich.notes;
          updates.push([notesCol, newNotes]);
        }
        
        // Apply updates
        for (const [col, val] of updates) {
          const cellRange = `Sheet1!${String.fromCharCode(65 + col)}${rowNum}`;
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: cellRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[val]] },
          });
        }
        
        console.log(`✅ Updated row ${rowNum}: ${enrich.firmName} - ${enrich.contact} (${enrich.title})`);
        updatedCount++;
        foundMatch = true;
        break;
      }
    }
    
    if (!foundMatch) {
      console.log(`ℹ️  No empty row found for ${enrich.firmName} - ${enrich.contact} (firm may already be enriched)`);
    }
  }
  
  console.log(`\n📊 Total enrichments applied: ${updatedCount}`);
}

enrichLeads().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
