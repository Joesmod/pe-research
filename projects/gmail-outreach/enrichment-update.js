const { google } = require('googleapis');
const fs = require('fs');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read existing data first to find row numbers
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I',
  });
  
  const rows = readRes.data.values || [];
  const headers = rows[0];
  console.log('Headers:', headers);
  
  // Map of firm names to enrichment data
  const enrichments = {
    'Peak Rock Capital': {
      contact: 'Anthony DiSimone',
      title: 'Chief Executive Officer',
      email: 'adisimone@peakrockcapital.com',
      linkedin: 'https://www.linkedin.com/pub/dir/Anthony/Disimone',
      status: 'Enriched',
      notes: 'CEO verified from official website team page. Also: Steve Martinez (President), Jung Choi (CFO). Source: peakrockcapital.com/team 2026-03-25'
    },
    'Pritzker Private Capital': {
      contact: 'Tony Pritzker',
      title: 'Chairman & CEO',
      email: 'tpritzker@ppcpartners.com',
      linkedin: 'https://www.linkedin.com/in/tony-pritzker-3929848/',
      status: 'Enriched',
      notes: 'Chairman & CEO. $6B+ AUM. Also: Paul Carbone (President & Managing Partner), Michael Nelson (Managing Partner & Head of Investing). Source: ppcpartners.com + RocketReach 2026-03-25'
    },
    'TowerBrook Capital Partners': {
      contact: 'Karim Saddi',
      title: 'Co-CEO & Managing Partner',
      email: 'ksaddi@towerbrook.com',
      linkedin: 'https://www.linkedin.com/in/karim-saddi-455067173/',
      status: 'Enriched',
      notes: 'Co-CEO with Jonathan Bilzin. $25B+ AUM. NYC/London offices. Email pattern inferred. Source: craft.co + Wikipedia 2026-03-25'
    },
    'CORE Industrial Partners': {
      contact: 'John May',
      title: 'Founder & Managing Partner',
      email: 'jmay@coreipfund.com',
      linkedin: 'https://www.linkedin.com/in/john-m-7399a22/',
      status: 'Enriched',
      notes: 'Founder & Managing Partner. $1.58B AUM. Chicago-based. Also: Carissa Walker (Principal, BD), Frank Papa (Senior Partner). Source: coreipfund.com/team 2026-03-25'
    },
    'Brighton Park Capital': {
      contact: 'Mark Dzialga',
      title: 'Founder & Managing Partner',
      email: 'mdzialga@bpc.com',
      linkedin: 'https://www.linkedin.com/in/mark-dzialga-109893172/',
      status: 'Enriched',
      notes: 'Founder & Managing Partner. Growth equity, software/healthcare/tech-enabled services. Former General Atlantic MD. Email pattern inferred. Source: bpc.com + Crunchbase 2026-03-25'
    },
    'Littlejohn & Co': {
      contact: 'Antonio Miranda',
      title: 'Managing Partner',
      email: 'amiranda@littlejohnllc.com',
      linkedin: 'https://www.linkedin.com/in/antonio-miranda-littlejohn',
      status: 'Enriched',
      notes: 'Managing Partner (with Steven Raich). Mid-market PE, transformational growth focus. Email pattern inferred. Source: littlejohnllc.com + LeadIQ 2026-03-25'
    },
    'PSG Equity': {
      contact: 'Mark Hastings',
      title: 'CEO & Co-Founder',
      email: 'mhastings@psgequity.com',
      linkedin: 'https://www.linkedin.com/in/mark-hastings-psg',
      status: 'Enriched',
      notes: 'CEO & Co-Founder. Growth equity, software/tech-enabled services. 130+ companies backed. $1B+ AUM. Email pattern inferred. Source: Crunchbase + psgequity.com 2026-03-25'
    },
    'Ares Management': {
      contact: 'Michael Arougheti',
      title: 'Co-Founder, CEO & President',
      email: 'marougheti@aresmgmt.com',
      linkedin: 'https://www.linkedin.com/in/michael-arougheti/',
      status: 'Enriched',
      notes: 'Co-Founder, CEO & President. $623B AUM (huge!). Public company (NYSE: ARES). Email pattern inferred. Source: aresmgmt.com + LinkedIn 2026-03-25'
    },
    'Charlesbank Capital Partners': {
      contact: 'Michael Choe',
      title: 'Managing Partner, CEO & Co-Head Flagship',
      email: 'mchoe@charlesbank.com',
      linkedin: 'https://www.linkedin.com/in/michael-choe-charlesbank',
      status: 'Enriched',
      notes: 'Managing Partner, CEO & Co-Head Flagship. Also: Brandon White (Managing Partner, Co-Head Flagship), Sandor Hau (Managing Partner, President Credit). Email pattern inferred. Source: charlesbank.com/team 2026-03-25'
    },
    'Tenex Capital Management': {
      contact: 'Mike Green',
      title: 'CEO & Managing Director',
      email: 'mgreen@tenexcm.com',
      linkedin: 'https://www.linkedin.com/in/mike-green-tenex',
      status: 'Enriched',
      notes: 'CEO & Managing Director. Co-founder. Also: Varun Bedi (Managing Director, co-founder). Email pattern verified RocketReach. Source: tenexcm.com/team + RocketReach 2026-03-25'
    },
    'Saw Mill Capital': {
      contact: 'Howard Unger',
      title: 'Managing Partner',
      email: 'hunger@sawmillcapital.com',
      linkedin: 'https://www.linkedin.com/in/howard-unger-1028643/',
      status: 'Enriched',
      notes: 'Managing Partner. Lower middle-market PE, founded 1997. Briarcliff Manor, NY. Partners: Tim Nelson, Scott Rivard, Scott VandeKerkhoff, Travis Foltz. Email pattern inferred. Source: sawmillcapital.com/team 2026-03-25'
    },
    'Flexpoint Ford': {
      contact: 'Don Edwards',
      title: 'Chief Executive Officer',
      email: 'dedwards@flexpointford.com',
      linkedin: 'https://www.linkedin.com/in/don-edwards-0b119548/',
      status: 'Enriched',
      notes: 'Chief Executive Officer. Specialist in financial services PE. Chicago-based. Also: Chris Ackerman (Managing Partner). Email pattern inferred. Source: flexpointford.com + LinkedIn 2026-03-25'
    }
  };
  
  // Find and update rows
  let updatedCount = 0;
  const updates = [];
  
  for (let i = 1; i < rows.length; i++) {
    const firmName = rows[i][0]; // Column A = Firm Name
    
    if (enrichments[firmName]) {
      const enrichment = enrichments[firmName];
      const rowNum = i + 1; // 1-indexed for Sheets API
      
      // Assuming columns: A=Firm, B=Website, C=Contact Name, D=Title, E=Email, F=LinkedIn, G=Status, H=Notes
      const range = `Sheet1!C${rowNum}:H${rowNum}`;
      const values = [[
        enrichment.contact,
        enrichment.title,
        enrichment.email,
        enrichment.linkedin,
        enrichment.status,
        enrichment.notes
      ]];
      
      updates.push({
        range,
        values
      });
      
      updatedCount++;
      console.log(`✓ ${firmName} - ${enrichment.contact} (${enrichment.title})`);
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
  }
  
  console.log(`\n📊 Updated ${updatedCount} firms in the Google Sheet`);
  console.log(`✅ Enrichment complete!`);
}

updateSheet().catch(console.error);
