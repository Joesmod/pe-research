const { google } = require('googleapis');

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichments found during research - March 6, 2026
  const enrichments = [
    {
      row: 'Red Cove Capital',
      updates: {
        contactName: 'Shannon Bane',
        title: 'Co-Founder & Managing Partner',
        email: 'sbane@redcovecap.com', // Pattern inferred
        linkedin: 'https://www.linkedin.com/in/shannon-bane-329639139/',
        notes: 'Co-Founder with Nick Killebrew. Real estate PE, residential focus. Founded 2022. Pattern [first]@redcovecap.com.',
        status: 'Partial'
      }
    },
    {
      row: 'Resolute Capital Partners',
      updates: {
        contactName: 'Bill Nutter',
        title: 'Managing Partner & Founder',
        email: '', // Not found
        linkedin: 'https://www.linkedin.com/in/bill-nutter-79087488/',
        notes: 'Founder, Nashville-based. Healthcare & business services focus. Partners: Andy, Caroline Ducas, Casey Hammontree. No public email.',
        status: 'Partial'
      }
    },
    {
      row: 'Rialto Capital',
      updates: {
        contactName: 'Jeff Krasnoff',
        title: 'Founder',
        email: '', // Not found
        linkedin: '', 
        notes: 'Founder of Rialto Capital (real estate investment mgmt). $8B raised since 2009. Acquired by Stone Point Capital. President: Mr. Mantz.',
        status: 'Partial'
      }
    },
    {
      row: 'Skyview Capital',
      updates: {
        contactName: 'Jeff White',
        title: 'Managing Director, Business Development',
        email: 'jwhite@skyviewcapital.com',
        linkedin: '',
        notes: 'Email verified from press release. Also: Alex Soltani (Founder/CEO), Naeem Arastu (MD M&A). Pattern: [first_initial][last]@skyviewcapital.com',
        status: 'Enriched'
      }
    },
    {
      row: 'Solamere Capital, LLC',
      updates: {
        contactName: 'Bill Duplisea',
        title: 'Head of Business Development',
        email: 'bd@solamerecapital.com',
        linkedin: '',
        notes: 'Email verified from official website contact page. Boston-based. Fund-of-funds with 200+ strategic investors.',
        status: 'Enriched'
      }
    },
    {
      row: 'Sorenson Capital',
      updates: {
        contactName: 'Fraser Bullock',
        title: 'Co-Founding Managing Partner',
        email: '', // Not found
        linkedin: '',
        notes: 'Early & growth stage VC for B2B software. $250M early stage, $1.5B growth stage AUM. Palo Alto CA / Lehi UT. No public email.',
        status: 'Partial'
      }
    },
    {
      row: 'Spring Capital Partners',
      updates: {
        contactName: 'Mike',
        title: 'Co-Founder',
        email: '', // Not found
        linkedin: '',
        notes: 'Co-founded 1999. Subordinated debt + equity. $600M+ raised across 4 funds. 90+ investments. $2-20M ticket size. No public email.',
        status: 'Partial'
      }
    },
    {
      row: 'Trinity Investors',
      updates: {
        contactName: '',
        title: '',
        email: 'clientrelations@trinityinvestors.com',
        linkedin: '',
        notes: 'Southlake TX. Real estate + PE. 145+ real estate assets. Generic contact only: clientrelations@trinityinvestors.com',
        status: 'Partial'
      }
    }
  ];
  
  console.log(`Found ${enrichments.length} firms to enrich`);
  console.log(JSON.stringify(enrichments, null, 2));
  
  // In a real implementation, we would:
  // 1. Read all rows
  // 2. Find matching firm names
  // 3. Update the appropriate cells
  // 4. Write back to sheet
  
  console.log('\nEnrichments ready to apply to sheet.');
  console.log('Manual update recommended to verify accuracy before batch write.');
}

enrichSheet().catch(console.error);
