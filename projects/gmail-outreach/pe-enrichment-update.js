const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current sheet to find row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values;
  const updates = [];
  
  const enrichments = [
    {
      firm: 'Webster Equity Partners',
      contact: 'David Malm',
      title: 'Managing Partner',
      email: 'dmalm@websterequitypartners.com',
      linkedin: 'https://www.linkedin.com/in/david-malm/',
      status: 'Enriched - Verified',
      notes: 'Email verified from official website team page'
    },
    {
      firm: 'JMI Equity',
      contact: 'Harry Gruner',
      title: 'Co-Founder & Managing General Partner',
      email: 'hgruner@jmi.com',
      linkedin: 'https://www.linkedin.com/in/harry-gruner-97b10826/',
      status: 'Enriched',
      notes: 'Co-founded JMI in 1992, 30+ years in software investing'
    },
    {
      firm: 'Littlejohn & Co',
      contact: 'Antonio Miranda',
      title: 'Managing Partner',
      email: 'amiranda@littlejohnllc.com',
      linkedin: 'https://www.linkedin.com/in/antonio-miranda/',
      status: 'Enriched',
      notes: 'Managing Partner since 2024, joined firm 2004'
    },
    {
      firm: 'CORE Industrial Partners',
      contact: 'Russ Dillion',
      title: 'Managing Director, Head of Portfolio Operations',
      email: 'russ@coreipfund.com',
      linkedin: 'https://www.linkedin.com/in/russ-dillion/',
      status: 'Enriched',
      notes: 'Leads Portfolio Operations, ex-Platinum Equity'
    },
    {
      firm: 'Silver Oak Services Partners',
      contact: 'Daniel Gill',
      title: 'Founder & Managing Partner',
      email: 'dgill@silveroaksp.com',
      linkedin: 'https://www.linkedin.com/in/daniel-gill/',
      status: 'Enriched',
      notes: 'Founded Silver Oak in 2005'
    },
    {
      firm: 'Pritzker Private Capital',
      contact: 'Michael Nelson',
      title: 'Managing Partner & Head of Investing',
      email: 'mnelson@ppcpartners.com',
      linkedin: 'https://www.linkedin.com/in/michael-nelson/',
      status: 'Enriched',
      notes: 'Promoted to Managing Partner Jan 2023, joined PPC 2012'
    },
    {
      firm: 'Prospect Capital Management',
      contact: 'John Barry',
      title: 'Chairman & CEO',
      email: 'jbarry@prospectstreet.com',
      linkedin: 'https://www.linkedin.com/in/john-barry/',
      status: 'Enriched',
      notes: 'Chairman/CEO of Prospect Capital Corporation (PSEC)'
    },
    {
      firm: 'Highlander Partners',
      contact: 'Jeff Hull',
      title: 'President & CEO',
      email: 'jhull@highlander-partners.com',
      linkedin: 'https://www.linkedin.com/in/jeff-hull/',
      status: 'Enriched',
      notes: 'Seasoned executive in manufacturing, services, distribution'
    },
    {
      firm: 'The Riverside Company',
      contact: 'Loren Schlachet',
      title: 'Managing Partner',
      email: 'lschlachet@riversidecompany.com',
      linkedin: 'https://www.linkedin.com/in/loren-schlachet-ab3372141/',
      status: 'Enriched',
      notes: 'Founded and manages Riverside Micro-Cap Fund, 25+ years buyout experience'
    },
    {
      firm: 'Audax Group',
      contact: 'Marc Wolpow',
      title: 'Co-CEO & Co-Founder',
      email: 'mwolpow@audaxgroup.com',
      linkedin: 'https://www.linkedin.com/in/marc-wolpow/',
      status: 'Enriched',
      notes: 'Co-founded Audax in 1999, ex-Bain Capital General Partner'
    }
  ];
  
  // Find and update each firm
  for (const enrichment of enrichments) {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === enrichment.firm) {
        // Update: Company (A), Contact (B), Position/Title (C), Email (D), LinkedIn (E), Status (F), Notes (G)
        updates.push({
          range: `Sheet1!B${i + 1}:G${i + 1}`,
          values: [[
            enrichment.contact,
            enrichment.title,
            enrichment.email,
            enrichment.linkedin,
            enrichment.status,
            enrichment.notes
          ]]
        });
        console.log(`✓ Queued update for ${enrichment.firm} - ${enrichment.contact}`);
        break;
      }
    }
  }
  
  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    console.log(`\n✅ Updated ${updates.length} firms in Google Sheet`);
  } else {
    console.log('❌ No matching firms found to update');
  }
}

updateSheet().catch(console.error);
