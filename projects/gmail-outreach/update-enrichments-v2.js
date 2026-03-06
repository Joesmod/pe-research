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
  // Notes removed since there's no Notes column - store in separate file
  const enrichments = {
    'Red Cove Capital': {
      contactName: 'Shannon Bane',
      title: 'Co-Founder & Managing Partner',
      email: 'sbane@redcovecap.com',
      linkedin: 'https://www.linkedin.com/in/shannon-bane-329639139/',
      status: 'Enriched'
    },
    'Resolute Capital Partners': {
      contactName: 'Bill Nutter',
      title: 'Managing Partner & Founder',
      linkedin: 'https://www.linkedin.com/in/bill-nutter-79087488/',
      status: 'Partial'
    },
    'Rialto Capital': {
      contactName: 'Jeff Krasnoff',
      title: 'Founder',
      status: 'Partial'
    },
    'Skyview Capital': {
      contactName: 'Jeff White',
      title: 'Managing Director, Business Development',
      email: 'jwhite@skyviewcapital.com',
      status: 'Enriched'
    },
    'Solamere Capital, LLC': {
      contactName: 'Bill Duplisea',
      title: 'Head of Business Development',
      email: 'bd@solamerecapital.com',
      status: 'Enriched'
    },
    'Sorenson Capital': {
      contactName: 'Fraser Bullock',
      title: 'Co-Founding Managing Partner',
      status: 'Partial'
    },
    'Spring Capital Partners': {
      contactName: 'Mike',
      title: 'Co-Founder',
      status: 'Partial'
    },
    'Trinity Investors': {
      email: 'clientrelations@trinityinvestors.com',
      status: 'Partial'
    },
    'Wildcat Capital Management': {
      contactName: 'David Bonderman',
      title: 'Founder',
      status: 'Partial'
    },
    'Winona Capital Management': {
      contactName: 'Laird Koldyke',
      title: 'Managing Director',
      status: 'Partial'
    },
    'Victoria Capital Partners': {
      contactName: 'Mr. García',
      title: 'Chairman & Managing Partner',
      email: 'admin@victoriacp.com',
      status: 'Partial'
    },
    '25madison': {
      contactName: 'Steven Price',
      title: 'Managing Partner, CEO',
      email: 'team@25madison.com',
      status: 'Partial'
    }
  };
  
  // Find and update rows
  const updates = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firmName = row[colIndices['Company Name']] || row[0];
    
    if (enrichments[firmName]) {
      const enrichment = enrichments[firmName];
      const rowNumber = i + 1;
      
      console.log(`\nUpdating row ${rowNumber}: ${firmName}`);
      
      // Prepare updates for this row
      for (const [field, value] of Object.entries(enrichment)) {
        if (!value) continue;
        
        let colIdx;
        switch(field) {
          case 'contactName':
            colIdx = colIndices['Contact Name'];
            break;
          case 'title':
            colIdx = colIndices['Title'];
            break;
          case 'email':
            colIdx = colIndices['Email'];
            break;
          case 'linkedin':
            colIdx = colIndices['LinkedIn'];
            break;
          case 'status':
            colIdx = colIndices['Status'];
            break;
          default:
            continue;
        }
        
        if (colIdx === undefined) {
          console.log(`  Skipping ${field} - column not found`);
          continue;
        }
        
        const colLetter = String.fromCharCode(65 + colIdx);
        
        updates.push({
          range: `Sheet1!${colLetter}${rowNumber}`,
          values: [[value]]
        });
        
        console.log(`  ${field}: ${value} (col ${colLetter})`);
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
  
  // Save enrichment log with full notes
  const detailedNotes = {
    'Red Cove Capital': 'Co-Founder with Nick Killebrew. Real estate PE (residential). Founded 2022. Email pattern [first]@domain. Source: redcovecap.com + LinkedIn 2026-03-06',
    'Resolute Capital Partners': 'Founder, Nashville. Healthcare & business services. Partners: Andy, Caroline Ducas, Casey Hammontree. No public email found. Source: resolutecap.com 2026-03-06',
    'Rialto Capital': 'Founder of Rialto Capital (real estate investment mgmt). $8B raised since 2009. Acquired by Stone Point Capital. President: Mr. Mantz. No public email. Source: rialtocapital.com 2026-03-06',
    'Skyview Capital': 'Email verified from press release. Also: Alex Soltani (Founder/CEO), Naeem Arastu (MD M&A). Pattern: [first_initial][last]@domain. Source: skyviewcapital.com press 2026-03-06',
    'Solamere Capital, LLC': 'Email verified from official website contact page. Boston-based. Fund-of-funds with 200+ strategic investors. Source: solamerecapital.com 2026-03-06',
    'Sorenson Capital': 'Early & growth stage VC for B2B software. $250M early stage, $1.5B growth stage AUM. Palo Alto CA / Lehi UT. No public email. Source: sorensoncapital.com 2026-03-06',
    'Spring Capital Partners': 'Co-founded 1999. Subordinated debt + equity. $600M+ raised across 4 funds. 90+ investments. $2-20M ticket. No public email. Source: springcap.com 2026-03-06',
    'Trinity Investors': 'Southlake TX. Real estate + PE. 145+ real estate assets. Generic contact only: clientrelations@. Source: trinityinvestors.com 2026-03-06',
    'Wildcat Capital Management': 'Single-family office for David Bonderman. Founded 2011. CFO: Sherri Conn. Generic contact: info@wildcatcap.com. Source: wildcatcap.com 2026-03-06',
    'Winona Capital Management': 'Consumer brands/retail focus. Source: winonacapital.com press releases 2026-03-06. No direct email.',
    'Victoria Capital Partners': 'South America focused PE. 19+ years working together. Generic contact: admin@. Source: victoriacp.com 2026-03-06',
    '25madison': 'Venture studio. NYC + Miami. Partner: John Daly (Ventures). Generic contact: team@. Source: 25madison.com 2026-03-06'
  };
  
  const log = {
    date: '2026-03-06',
    time: '13:09 CST',
    enriched: Object.keys(enrichments).length,
    fullyEnriched: 3, // Red Cove, Skyview, Solamere have both name + direct email
    partiallyEnriched: 9,
    firms: Object.keys(enrichments).map(name => ({
      name,
      ...enrichments[name],
      notes: detailedNotes[name]
    }))
  };
  
  fs.writeFileSync('enrichment-log-2026-03-06.json', JSON.stringify(log, null, 2));
  console.log('\n📝 Log saved to enrichment-log-2026-03-06.json');
  console.log(`\nSummary: ${log.fullyEnriched} fully enriched, ${log.partiallyEnriched} partial`);
}

updateEnrichments().catch(console.error);
