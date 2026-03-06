const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

// Enrichment data: firm name -> new data
const enrichments = {
  'Sverica Capital Management': {
    'Contact Name': 'Jordan Richards',
    'Title': 'Managing Partner',
    'Email': 'jordan@sverica.com',
    'LinkedIn URL': 'https://www.linkedin.com/company/sverica-capital-management',
    'Status': 'Enriched',
    'Notes': '2026-03-06: Managing Partner (Austin) verified from sverica.com/team. Email pattern: First@sverica.com. Also: Dave Finley (MP Boston), Frank Young (MP SF). $2B AUM, lower middle market PE.'
  },
  'Chicago Pacific Founders': {
    'Contact Name': 'Mary Tolan',
    'Title': 'Co-Founder & Managing Partner',
    'Email': 'mtolan@cpfounders.com',
    'LinkedIn URL': 'https://www.linkedin.com/in/mary-tolan',
    'Status': 'Enriched',
    'Notes': '2026-03-06: Co-Founder & MP verified from cpfounders.com. Founded R1 RCM in 2003. Email verified via ContactOut. Also: R.J. Gupta (Founding Partner). $2B+ AUM healthcare services PE.'
  },
  'NexPhase Capital': {
    'Contact Name': 'Lex Leeming',
    'Title': 'Partner & Head of Business Development',
    'Email': 'lleeming@nexphase.com',
    'LinkedIn URL': 'https://www.linkedin.com/company/nexphase-capital-lp',
    'Status': 'Enriched',
    'Notes': '2026-03-06: Partner & Head of BD verified from PRNewswire press release (Oct 2023). Email published: lleeming@nexphase.com. Also: Ariana Scotti (VP/Head of IR, ascotti@nexphase.com). $2.6B capital raised, 100+ investments. Thematic/operationally-focused PE.'
  },
  'Tower Arch Capital': {
    'Contact Name': 'Rhett Neuenschwander',
    'Title': 'Partner',
    'Email': 'rneuenschwander@towerarch.com',
    'LinkedIn URL': 'https://www.linkedin.com/in/rhett-neuenschwander',
    'Status': 'Enriched',
    'Notes': '2026-03-06: Partner verified from towerarch.com/team. Stanford MBA. Email pattern verified via ZoomInfo. Also: David Parkin (Partner), David Calder (Partner). Lower middle market PE, founder-friendly.'
  },
  'MCM Capital Partners': {
    'Contact Name': 'Mark Mansour',
    'Title': 'Senior Managing Partner',
    'Email': 'mmansour@mcmcapital.com',
    'LinkedIn URL': 'https://www.linkedin.com/in/mark-mansour-4638393',
    'Status': 'Enriched',
    'Notes': '2026-03-06: Senior Managing Partner verified from mcmcapital.com/team. Email pattern verified via RocketReach ([first_initial][last]@mcmcapital.com). Also: Harry Shimp, Gregory Ott, Kevin Hayes. Cleveland-based lower middle market PE.'
  },
  'Argonaut Private Equity': {
    'Contact Name': 'Steve Mitchell',
    'Title': 'CEO & Managing Director',
    'Email': 'smitchell@argonautpe.com',
    'LinkedIn URL': 'https://www.linkedin.com/in/steve-mitchell-831b1050',
    'Status': 'Enriched',
    'Notes': '2026-03-06: CEO & Managing Director verified from argonautpe.com. Joined 2004, 15+ years MD, $1.5B+ direct investment. Email pattern verified via RocketReach. Fund IV closed at $400M. Denver-based.'
  },
  'Centre Partners': {
    'Contact Name': 'Bruce Pollack',
    'Title': 'Managing Partner',
    'Email': 'bpollack@centrepartners.com',
    'LinkedIn URL': 'https://www.linkedin.com/in/bruce-pollack-54295910',
    'Status': 'Enriched',
    'Notes': '2026-03-06: Managing Partner verified from press releases (centrepartners.com). Joined 1991. Email pattern verified via ZoomInfo. Founded 1986, $2B+ invested in 70+ transactions. NY & LA offices. Consumer & healthcare focus.'
  },
  'Great Range Capital': {
    'Contact Name': 'Ryan Sprott',
    'Title': 'Managing Partner',
    'Email': 'rsprott@greatrangecapital.com',
    'LinkedIn URL': 'https://www.linkedin.com/in/ryan-sprott-07159412',
    'Status': 'Enriched',
    'Notes': '2026-03-06: Co-founder & Managing Partner verified from greatrangecapital.com. Prior: DLJ Merchant Banking (Credit Suisse), $10B+ PE capital. Email pattern verified via RocketReach. Midwest-focused PE.'
  },
  'Primus Capital': {
    'Contact Name': 'Phil Molner',
    'Title': 'Managing Partner',
    'Email': 'pmolner@primuscapital.com',
    'LinkedIn URL': 'https://www.linkedin.com/company/primus-capital-funds',
    'Status': 'Enriched',
    'Notes': '2026-03-06: Managing Partner verified from press releases. Email pattern: [F][Last]@primuscapital.com (88% via LeadIQ). Also: Ron Hess (MD). Founded 1983, healthcare IT, fintech, software focus. Cleveland & Atlanta.'
  }
};

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function enrichLeads() {
  const sheets = await getClient();
  
  // Read all rows
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  // Find column indices
  const colIndices = {};
  header.forEach((col, idx) => { colIndices[col] = idx; });
  
  const updates = [];
  
  // Find matching firms and prepare updates
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const companyName = (row[colIndices['Company Name']] || '').trim();
    
    // Check if this firm matches any enrichment (normalize names)
    let enrichment = null;
    let matchedName = null;
    
    for (const firmName of Object.keys(enrichments)) {
      if (companyName.includes(firmName) || firmName.includes(companyName)) {
        enrichment = enrichments[firmName];
        matchedName = firmName;
        break;
      }
    }
    
    if (enrichment) {
      const rowNum = i + 1; // 1-indexed for sheets
      const currentContact = (row[colIndices['Contact Name']] || '').trim();
      const currentEmail = (row[colIndices['Email']] || '').trim();
      
      // Skip if already has good contact data (not Jacob Zodikoff placeholder)
      if (currentContact && currentContact !== 'Jacob Zodikoff' && currentEmail && !currentEmail.includes('jacob')) {
        console.log(`⊘ Skipping ${companyName} (row ${rowNum}) - already enriched with ${currentContact}`);
        continue;
      }
      
      // Build update for columns C through L
      const updates_data = [
        enrichment['Contact Name'],
        enrichment['Title'],
        enrichment['Email'],
        row[colIndices['Website']] || '',
        enrichment['LinkedIn URL'] || row[colIndices['LinkedIn URL']] || '',
        row[colIndices['Focus']] || '',
        enrichment['Status'],
        enrichment['Notes'],
        row[colIndices['Location']] || '',
        row[colIndices['Notes2']] || ''
      ];
      
      updates.push({
        range: `Sheet1!C${rowNum}:L${rowNum}`,
        values: [updates_data]
      });
      
      console.log(`✓ Prepared update for ${companyName} (row ${rowNum}) -> ${enrichment['Contact Name']}`);
    }
  }
  
  if (updates.length === 0) {
    console.log('No matching firms found to enrich.');
    return;
  }
  
  // Batch update all rows
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates
    }
  });
  
  console.log(`\n✅ Successfully enriched ${updates.length} leads!`);
}

enrichLeads().catch(e => { console.error('Error:', e.message); process.exit(1); });
