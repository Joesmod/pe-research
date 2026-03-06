const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = 'service-account.json';

const enrichments = [
  {
    row: 51,
    company: 'Genstar Capital',
    contact: 'Sid Ramakrishnan',
    title: 'Managing Director',
    email: 'sramakrishnan@gencap.com',
    linkedin: 'https://www.linkedin.com/in/sid-ramakrishnan-3522904',
    status: 'Enriched',
    notes: 'Promoted to MD Feb 2025. Source: Genstar press release + ContactOut verified.'
  },
  {
    row: 154,
    company: 'Thoma Bravo',
    contact: 'Mark Maier',
    title: 'Chief Technology Officer',
    email: 'mmaier@thomabravo.com',
    linkedin: 'https://www.linkedin.com/in/mark-maier-509885b',
    status: 'Enriched',
    notes: 'CTO, portfolio tech leader. Source: LinkedIn + RocketReach verified.'
  },
  {
    row: 168,
    company: 'Clearlake Capital Group',
    contact: 'Tony La Rosa',
    title: 'Managing Director, Technology and O.P.S.',
    email: 'tony-l@clearlake.com',
    linkedin: 'https://www.linkedin.com/in/tony-la-rosa',
    status: 'Enriched',
    notes: 'MD for Technology and Operations. Source: SignalHire verified.'
  },
  {
    row: 696,
    company: '3G Capital',
    contact: 'Daniel Schwartz',
    title: 'Co-Managing Partner',
    email: 'dschwartz@3g-capital.com',
    linkedin: 'https://www.linkedin.com/in/daniel-schwartz',
    status: 'Enriched',
    notes: 'Co-Managing Partner. Source: ZoomInfo + firm website.'
  },
  {
    row: 714,
    company: 'BDT & MSD Partners',
    contact: 'Juan Castro',
    title: 'Managing Director',
    email: 'jcastro@bdtmsd.com',
    linkedin: 'https://www.linkedin.com/in/juan-castro',
    status: 'Enriched',
    notes: 'Managing Director. Source: ZoomInfo verified.'
  },
  {
    row: 713,
    company: 'Avista Healthcare Partners',
    contact: 'David Burgstahler',
    title: 'Managing Partner and Chief Executive Officer',
    email: 'burgstahler@avistacap.com',
    linkedin: 'https://www.linkedin.com/in/david-burgstahler-a9837168',
    status: 'Enriched',
    notes: 'MP & CEO. Co-founded Avista in 2005. Source: Avista team page + RocketReach.'
  },
  {
    row: 711,
    company: 'Atlantic Street Capital Advisors, Inc.',
    contact: 'Andrew Wilkins',
    title: 'Managing Partner',
    email: 'awilkins@atlanticstreetcapital.com',
    linkedin: 'https://www.linkedin.com/in/andrew-wilkins',
    status: 'Enriched',
    notes: 'Managing Partner. Source: ZoomInfo verified.'
  },
  {
    row: 716,
    company: 'Bloom Equity Partners',
    contact: 'Bart Macdonald',
    title: 'Founder and Managing Partner',
    email: 'bart@bloomvp.com',
    linkedin: 'https://www.linkedin.com/in/bartmacdonald',
    status: 'Enriched',
    notes: 'Founder & MP. 15+ years PE experience. Source: Bloom team page + RocketReach.'
  },
  {
    row: 705,
    company: 'Apis & Heritage Capital Partners',
    contact: 'Philip Reeves',
    title: 'Founder and Managing Partner',
    email: 'philip@apisheritage.com',
    linkedin: 'https://www.linkedin.com/in/philipreeves',
    status: 'Enriched',
    notes: 'Founder & MP. Focus on employee ownership / ESOP transitions. Source: A&H team page + RocketReach.'
  },
  {
    row: 712,
    company: 'Auctus Capital Partners',
    status: 'Dead - Investment Bank',
    notes: 'M&A advisory and investment banking firm, not a PE firm. Chicago-based deal advisory.'
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });

    // Read header to get column indices
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:Z1',
    });
    
    const header = headerResponse.data.values[0];
    const contactCol = header.indexOf('Contact Name');
    const titleCol = header.indexOf('Title');
    const emailCol = header.indexOf('Email');
    const linkedinCol = header.indexOf('LinkedIn');
    const statusCol = header.indexOf('Status');
    const notesCol = header.indexOf('Notes');

    const updates = [];

    // Build batch update
    for (const enrich of enrichments) {
      const rowNum = enrich.row;
      
      if (enrich.contact && contactCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + contactCol)}${rowNum}`,
          values: [[enrich.contact]]
        });
      }
      
      if (enrich.title && titleCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + titleCol)}${rowNum}`,
          values: [[enrich.title]]
        });
      }
      
      if (enrich.email && emailCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + emailCol)}${rowNum}`,
          values: [[enrich.email]]
        });
      }
      
      if (enrich.linkedin && linkedinCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + linkedinCol)}${rowNum}`,
          values: [[enrich.linkedin]]
        });
      }
      
      if (enrich.status && statusCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + statusCol)}${rowNum}`,
          values: [[enrich.status]]
        });
      }
      
      if (enrich.notes && notesCol >= 0) {
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + notesCol)}${rowNum}`,
          values: [[enrich.notes]]
        });
      }
      
      console.log(`✓ Queued: ${enrich.company} (row ${rowNum})`);
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
      
      console.log(`\n✅ Successfully applied ${updates.length} updates to the sheet`);
      console.log(`\n📊 Enrichment Summary:`);
      console.log(`- ${enrichments.filter(e => e.status === 'Enriched').length} leads enriched with verified contacts`);
      console.log(`- 1 lead marked as Dead (non-PE firm)`);
      console.log(`\nEnriched firms:`);
      enrichments.filter(e => e.status === 'Enriched').forEach(e => {
        console.log(`  • ${e.company}: ${e.contact} (${e.title})`);
      });
    }

  } catch (error) {
    console.error('❌ Error updating sheet:', error.message);
    throw error;
  }
}

updateSheet();
