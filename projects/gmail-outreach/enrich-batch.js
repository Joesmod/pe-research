const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

// Enrichment data - each entry has firm name and contact details
const ENRICHMENTS = [
  {
    firm: 'Renovus Capital Partners',
    contact: 'Brad Whitman',
    title: 'Founding Partner',
    email: 'brad.whitman@renovuscapital.com',
    linkedin: 'https://www.linkedin.com/in/bradley-whitman/',
    notes: 'Email pattern verified via atif.gilani@renovuscapital.com. Co-founder with Atif Gilani and Jesse Serventi.'
  },
  {
    firm: 'Rockwood Equity Partners',
    contact: 'Joe Merrill',
    title: 'Managing Partner',
    email: 'jmerrill@rockwoodequity.com',
    linkedin: 'https://www.linkedin.com/in/joe-merrill/',
    notes: 'Email pattern verified via Kate Faust (kfaust@rockwoodequity.com). Leads Denver office.'
  },
  {
    firm: 'Clearview Capital',
    contact: 'William Case',
    title: 'Managing Partner',
    email: 'wcase@clearviewcap.com',
    linkedin: 'https://www.linkedin.com/in/william-case/',
    notes: 'Email pattern verified via ebrunner@clearviewcap.com found on contact page.'
  },
  {
    firm: 'Clearview Capital',
    contact: 'Matthew Blevins',
    title: 'Managing Partner',
    email: 'mblevins@clearviewcap.com',
    linkedin: 'https://www.linkedin.com/in/matthew-blevins/',
    notes: 'Email pattern verified. Listed as Managing Partner on team page.'
  },
  {
    firm: 'Waud Capital Partners',
    contact: 'Reeve Waud',
    title: 'Founder & Managing Partner',
    email: 'rwaud@waudcapital.com',
    linkedin: 'https://www.linkedin.com/in/reeve-waud-90b77712/',
    notes: 'Founder of Waud Capital (est. 1993). RocketReach verified pattern.'
  },
  {
    firm: 'Banner Capital',
    contact: 'Tanner Ainge',
    title: 'Founder & CEO',
    email: 'tainge@banner.ventures',
    linkedin: 'https://www.linkedin.com/in/tainge/',
    notes: 'Founder of Banner Capital Management. RocketReach verified. Lehi, Utah based.'
  },
  {
    firm: 'AUA Private Equity Partners',
    contact: 'Andy Unanue',
    title: 'Founder & Managing Partner',
    email: 'andy.unanue@auaequity.com',
    linkedin: 'https://www.linkedin.com/in/andycobra/',
    notes: 'Email pattern verified via press releases (sean.gagnon@, charles.devries@). Former COO of Goya Foods.'
  },
  {
    firm: 'Trivest Partners',
    contact: 'Chris Weldon',
    title: 'Managing Partner, Mid-Market',
    email: 'cweldon@trivest.com',
    linkedin: 'https://www.linkedin.com/in/chris-weldon/',
    notes: 'Email pattern verified via cberton@trivest.com. Manages mid-market investments.'
  },
  {
    firm: 'Trivest Partners',
    contact: 'Forest Wester',
    title: 'Managing Partner, Discovery',
    email: 'fwester@trivest.com',
    linkedin: 'https://www.linkedin.com/in/forest-wester/',
    notes: 'Email pattern verified. Manages Discovery fund.'
  },
  {
    firm: 'Trivest Partners',
    contact: 'Jamie Elias',
    title: 'Managing Partner, General Counsel',
    email: 'jelias@trivest.com',
    linkedin: 'https://www.linkedin.com/in/jamie-elias/',
    notes: 'Email pattern verified. General Counsel and Managing Partner.'
  },
  {
    firm: 'Gryphon Investors',
    contact: 'R. David Andrews',
    title: 'Founder & Co-CEO',
    email: 'david.andrews@gryphon-inv.com',
    linkedin: 'https://www.linkedin.com/in/r-david-andrews/',
    notes: 'Founder and Co-CEO. Email pattern inferred from standard PE naming conventions - NOT VERIFIED. Research further before use.'
  },
  {
    firm: 'Gryphon Investors',
    contact: 'Nicholas Orum',
    title: 'Co-CEO & Co-CIO',
    email: 'nicholas.orum@gryphon-inv.com',
    linkedin: 'https://www.linkedin.com/in/nicholas-orum/',
    notes: 'Co-CEO and Co-CIO. Email pattern inferred - NOT VERIFIED. Research further before use.'
  }
];

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function batchEnrich() {
  const sheets = await getClient();
  
  // First, read all rows to find which ones to update
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
  });
  
  const rows = readRes.data.values || [];
  if (rows.length === 0) {
    console.log('Sheet is empty');
    return;
  }
  
  // Sheet has NO header row - data starts at row 1
  // Column structure (0-indexed):
  // 0: Company Name
  // 1: Website/NotebookLM
  // 2: Contact Name
  // 3: Position/Title
  // 4: Email
  // 5: Additional website
  // 6: LinkedIn URL
  // 7: Status
  // 8: Notes
  
  const firmNameCol = 0;
  const websiteCol = 1;
  const contactCol = 2;
  const titleCol = 3;
  const emailCol = 4;
  const extraCol = 5;
  const linkedinCol = 6;
  const statusCol = 7;
  const notesCol = 8;
  
  console.log(`Found ${rows.length} rows in sheet`);
  console.log(`Using columns: Firm=A(0), Contact=C(2), Title=D(3), Email=E(4), LinkedIn=G(6)`);
  
  const updates = [];
  const today = new Date().toISOString().split('T')[0];
  
  // For each enrichment, find matching row(s) and prepare update
  for (const enrich of ENRICHMENTS) {
    let foundExactMatch = false;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const firmName = (row[firmNameCol] || '').trim();
      const existingContact = (row[contactCol] || '').trim();
      const existingEmail = (row[emailCol] || '').trim();
      
      // Skip rows with empty firm names
      if (!firmName) continue;
      
      // Check if firm name matches
      const firmMatches = firmName.toLowerCase().includes(enrich.firm.toLowerCase()) ||
                         enrich.firm.toLowerCase().includes(firmName.toLowerCase());
      
      if (firmMatches) {
        // Check if this exact contact already exists
        if (existingContact === enrich.contact) {
          console.log(`⊙ Row ${i+1}: ${enrich.firm} - ${enrich.contact} already exists, skipping`);
          foundExactMatch = true;
          break;
        }
        
        // Check if this row needs enrichment (empty contact or generic email)
        const hasGenericEmail = existingEmail.match(/@?(info|sales|ir|contact|investor)@/);
        const needsContact = !existingContact || hasGenericEmail;
        
        if (needsContact) {
          foundExactMatch = true;
          const rowNum = i + 1; // 1-indexed for sheets
          
          // Prepare row data
          const updatedRow = [...row];
          const minCols = 12; // Ensure at least 12 columns
          while (updatedRow.length < minCols) updatedRow.push('');
          
          updatedRow[contactCol] = enrich.contact;
          updatedRow[titleCol] = enrich.title;
          updatedRow[emailCol] = enrich.email;
          updatedRow[linkedinCol] = enrich.linkedin || '';
          updatedRow[statusCol] = 'Enriched';
          
          // Append to existing notes
          const existing = updatedRow[notesCol] || '';
          updatedRow[notesCol] = existing ? `${existing} | ${enrich.notes}` : enrich.notes;
          
          updates.push({
            range: `Sheet1!A${rowNum}`,
            values: [updatedRow]
          });
          
          console.log(`✓ Queued update for row ${rowNum}: ${enrich.firm} - ${enrich.contact} (replacing ${existingContact || 'empty'})`);
          break; // Only update first matching row for each enrichment
        }
      }
    }
    
    // If no match found, append as new row
    if (!foundExactMatch) {
      const newRow = new Array(12).fill('');
      newRow[firmNameCol] = enrich.firm;
      newRow[websiteCol] = ''; // Will need to be filled manually
      newRow[contactCol] = enrich.contact;
      newRow[titleCol] = enrich.title;
      newRow[emailCol] = enrich.email;
      newRow[linkedinCol] = enrich.linkedin || '';
      newRow[statusCol] = 'Enriched';
      newRow[notesCol] = enrich.notes;
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [newRow] },
      });
      
      console.log(`✓ Appended new row: ${enrich.firm} - ${enrich.contact}`);
    }
  }
  
  // Execute batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });
    console.log(`\n✅ Successfully updated ${updates.length} rows`);
  } else {
    console.log('\n✅ No updates needed (all rows already enriched)');
  }
}

batchEnrich().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
