const { google } = require('googleapis');
const fs = require('fs');

async function updateEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // First, read the current sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K'
  });
  
  const rows = response.data.values;
  const headers = rows[0];
  
  // Find column indices
  const colIndices = {};
  headers.forEach((header, idx) => {
    colIndices[header] = idx;
  });
  
  console.log('Column mapping:', colIndices);
  
  // Enrichments from research (March 6, 2026)
  const enrichments = {
    'Red Cove Capital': {
      contactName: 'Shannon Bane',
      title: 'Co-Founder & Managing Partner',
      email: 'sbane@redcovecap.com',
      linkedin: 'https://www.linkedin.com/in/shannon-bane-329639139/',
      notes: 'Co-Founder with Nick Killebrew. Real estate PE (residential). Founded 2022. Email pattern [first]@domain. Source: redcovecap.com + LinkedIn 2026-03-06',
      status: 'Partial'
    },
    'Resolute Capital Partners': {
      contactName: 'Bill Nutter',
      title: 'Managing Partner & Founder',
      linkedin: 'https://www.linkedin.com/in/bill-nutter-79087488/',
      notes: 'Founder, Nashville. Healthcare & business services. Partners: Andy, Caroline Ducas, Casey Hammontree. No public email found. Source: resolutecap.com 2026-03-06',
      status: 'Partial'
    },
    'Rialto Capital': {
      contactName: 'Jeff Krasnoff',
      title: 'Founder',
      notes: 'Founder of Rialto Capital (real estate investment mgmt). $8B raised since 2009. Acquired by Stone Point Capital. President: Mr. Mantz. No public email. Source: rialtocapital.com 2026-03-06',
      status: 'Partial'
    },
    'Skyview Capital': {
      contactName: 'Jeff White',
      title: 'Managing Director, Business Development',
      email: 'jwhite@skyviewcapital.com',
      notes: 'Email verified from press release. Also: Alex Soltani (Founder/CEO), Naeem Arastu (MD M&A). Pattern: [first_initial][last]@domain. Source: skyviewcapital.com press 2026-03-06',
      status: 'Enriched'
    },
    'Solamere Capital, LLC': {
      contactName: 'Bill Duplisea',
      title: 'Head of Business Development',
      email: 'bd@solamerecapital.com',
      notes: 'Email verified from official website contact page. Boston-based. Fund-of-funds with 200+ strategic investors. Source: solamerecapital.com 2026-03-06',
      status: 'Enriched'
    },
    'Sorenson Capital': {
      contactName: 'Fraser Bullock',
      title: 'Co-Founding Managing Partner',
      notes: 'Early & growth stage VC for B2B software. $250M early stage, $1.5B growth stage AUM. Palo Alto CA / Lehi UT. No public email. Source: sorensoncapital.com 2026-03-06',
      status: 'Partial'
    },
    'Spring Capital Partners': {
      contactName: 'Mike',
      title: 'Co-Founder',
      notes: 'Co-founded 1999. Subordinated debt + equity. $600M+ raised across 4 funds. 90+ investments. $2-20M ticket. No public email. Source: springcap.com 2026-03-06',
      status: 'Partial'
    },
    'Trinity Investors': {
      email: 'clientrelations@trinityinvestors.com',
      notes: 'Southlake TX. Real estate + PE. 145+ real estate assets. Generic contact only: clientrelations@. Source: trinityinvestors.com 2026-03-06',
      status: 'Partial'
    },
    'Wildcat Capital Management': {
      contactName: 'David Bonderman',
      title: 'Founder',
      notes: 'Single-family office for David Bonderman. Founded 2011. CFO: Sherri Conn. Generic contact: info@wildcatcap.com. Source: wildcatcap.com 2026-03-06',
      status: 'Partial'
    },
    'Winona Capital Management': {
      contactName: 'Laird Koldyke',
      title: 'Managing Director',
      notes: 'Consumer brands/retail focus. Source: winonacapital.com press releases 2026-03-06. No direct email.',
      status: 'Partial'
    },
    'Victoria Capital Partners': {
      contactName: 'Mr. García',
      title: 'Chairman & Managing Partner',
      email: 'admin@victoriacp.com',
      notes: 'South America focused PE. 19+ years working together. Generic contact: admin@. Source: victoriacp.com 2026-03-06',
      status: 'Partial'
    },
    '25madison': {
      contactName: 'Steven Price',
      title: 'Managing Partner, CEO',
      email: 'team@25madison.com',
      notes: 'Venture studio. NYC + Miami. Partner: John Daly (Ventures). Generic contact: team@. Source: 25madison.com 2026-03-06',
      status: 'Partial'
    }
  };
  
  // Find and update rows
  const updates = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[colIndices['Firm']] || row[0]; // Try 'Firm' column or first column
    
    if (enrichments[firmName]) {
      const enrichment = enrichments[firmName];
      const rowNumber = i + 1;
      
      console.log(`\nUpdating row ${rowNumber}: ${firmName}`);
      
      // Prepare updates for this row
      for (const [field, value] of Object.entries(enrichment)) {
        if (value) {
          let colLetter;
          switch(field) {
            case 'contactName':
              colLetter = String.fromCharCode(65 + colIndices['Contact Name'] || 2);
              break;
            case 'title':
              colLetter = String.fromCharCode(65 + colIndices['Title'] || 3);
              break;
            case 'email':
              colLetter = String.fromCharCode(65 + colIndices['Email'] || 4);
              break;
            case 'linkedin':
              colLetter = String.fromCharCode(65 + colIndices['LinkedIn'] || 5);
              break;
            case 'notes':
              colLetter = String.fromCharCode(65 + colIndices['Notes'] || 7);
              break;
            case 'status':
              colLetter = String.fromCharCode(65 + colIndices['Status'] || 8);
              break;
            default:
              continue;
          }
          
          updates.push({
            range: `Sheet1!${colLetter}${rowNumber}`,
            values: [[value]]
          });
          
          console.log(`  ${field}: ${value}`);
        }
      }
    }
  }
  
  if (updates.length > 0) {
    console.log(`\nApplying ${updates.length} updates...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    
    console.log('✅ Sheet updated successfully!');
  } else {
    console.log('No matching firms found in sheet.');
  }
  
  // Save enrichment log
  const log = {
    date: '2026-03-06',
    time: '13:06 CST',
    enriched: Object.keys(enrichments).length,
    firms: enrichments
  };
  
  fs.writeFileSync('enrichment-log-2026-03-06.json', JSON.stringify(log, null, 2));
  console.log('\n📝 Log saved to enrichment-log-2026-03-06.json');
}

updateEnrichments().catch(console.error);
