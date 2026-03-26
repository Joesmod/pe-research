const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

// Enrichments researched on March 15, 2026
const enrichments = [
  {
    company: 'Littlejohn & Co',
    contact: 'Antonio Miranda',
    title: 'Managing Partner',
    email: 'amiranda@littlejohnllc.com',
    linkedin: 'https://www.linkedin.com/in/antonio-miranda-2',
    source: 'RocketReach email pattern (first_initial+last@littlejohnllc.com 99%)',
    notes: 'Promoted to Managing Partner Nov 2024'
  },
  {
    company: 'Pritzker Private Capital',
    contact: 'Michael Nelson',
    title: 'Managing Partner & Head of Investing',
    email: 'mnelson@ppcpartners.com',
    linkedin: 'https://www.linkedin.com/in/michael-nelson-2',
    source: 'RocketReach pattern confirmed',
    notes: 'Joined 2012, previously Wind Point Partners'
  },
  {
    company: 'Mason Wells',
    contact: 'Tom Smith',
    title: 'Chairman',
    email: 'tsmith@masonwells.com',
    linkedin: 'https://www.linkedin.com/in/tom-smith-20b1115',
    source: 'RocketReach email pattern (first_initial+last@masonwells.com 96.9%)',
    notes: 'Chairman & Executive Managing Director'
  },
  {
    company: 'The CapStreet Group',
    contact: 'Neil Kallmeyer',
    title: 'Managing Partner',
    email: 'nkallmeyer@capstreet.com',
    linkedin: 'https://www.linkedin.com/in/neil-kallmeyer-682693136',
    source: 'RocketReach email pattern (first_initial+last@capstreet.com 88.7%)',
    notes: 'Houston-based, Cornell MBA'
  },
  {
    company: 'Mountaingate Capital',
    contact: 'Bennett Thompson',
    title: 'Co-Founder, Managing Director',
    email: 'bthompson@mountaingate.com',
    linkedin: 'https://theorg.com/org/mountaingate-capital/org-chart/bennett-thompson',
    source: 'RocketReach email pattern (first_initial+last@mountaingate.com 96%)',
    notes: 'Denver-based, founder-friendly PE'
  },
  {
    company: 'Mountaingate Capital',
    contact: 'Bruce Rogers',
    title: 'Co-Founder, Managing Director',
    email: 'brogers@mountaingate.com',
    linkedin: 'https://contactout.com/Mountaingate-Capital-4606',
    source: 'RocketReach email pattern (first_initial+last@mountaingate.com 96%)',
    notes: 'Denver-based, founder-friendly PE'
  },
  {
    company: 'Greenbriar Equity Group',
    contact: 'Niall McComiskey',
    title: 'Managing Partner',
    email: 'nmccomiskey@greenbriarequity.com',
    linkedin: 'https://www.linkedin.com/in/niall-mccomiskey',
    source: 'RocketReach email pattern (first_initial+last@greenbriarequity.com 96.4%)',
    notes: 'Greenwich CT, sector-focused mid-market PE'
  },
  {
    company: 'TSG Consumer Partners',
    contact: 'Hadley Mullin',
    title: 'Senior Managing Director',
    email: 'hmullin@tsgconsumer.com',
    linkedin: 'https://www.acg.org/speakers/hadley-mullin',
    source: 'LeadIQ email pattern confirmed (first_initial+last@tsgconsumer.com)',
    notes: 'Promoted to Senior MD Sept 2014, $9B AUM'
  },
  {
    company: 'Trilantic Capital Partners',
    contact: 'Jon Mattson',
    title: 'Managing Partner',
    email: 'jmattson@trilanticpartners.com',
    linkedin: 'https://rocketreach.co/jon-mattson-email_8476267',
    source: 'RocketReach email pattern (first_initial+last@trilanticpartners.com 56.1%)',
    notes: 'North America focused'
  },
  {
    company: 'Trilantic Capital Partners',
    contact: 'Danny James',
    title: 'CEO & Managing Partner',
    email: 'djames@trilanticpartners.com',
    linkedin: 'https://theorg.com/org/trilantic-capital-partners/org-chart/danny-james',
    source: 'RocketReach email pattern (first_initial+last@trilanticpartners.com 56.1%)',
    notes: 'CEO & Managing Partner of Trilantic North America'
  },
  {
    company: 'Resilience Capital Partners',
    contact: 'Steve Rosen',
    title: 'Co-Founder, Chairman',
    email: 'srosen@resiliencecapital.com',
    linkedin: 'https://resiliencecapital.com/team/steve-rosen',
    source: 'Growjo verified, RocketReach pattern confirmed (first_initial+last)',
    notes: 'Co-founded 2001, also Zanite Corp & Gammite Ventures'
  },
  {
    company: 'Resilience Capital Partners',
    contact: 'Bassem Mansour',
    title: 'Co-Founder, Co-CEO',
    email: 'bmansour@resiliencecapital.com',
    linkedin: 'https://resiliencecapital.com/about-us',
    source: 'Crunchbase contact email verified',
    notes: 'Co-founded 2001, Cleveland-based'
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // First, read the current sheet to find matching rows
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:K',
    });

    const rows = readResponse.data.values || [];
    const updates = [];

    console.log(`\n🔍 Scanning ${rows.length} rows for matches...\n`);

    // For each enrichment, find the matching row by company name
    enrichments.forEach(enrichment => {
      const matchingRowIndex = rows.findIndex((row, index) => {
        if (index === 0) return false; // Skip header
        const firmName = row[0] || '';
        return firmName.toLowerCase().includes(enrichment.company.toLowerCase()) ||
               enrichment.company.toLowerCase().includes(firmName.toLowerCase());
      });

      if (matchingRowIndex > 0) {
        const rowNumber = matchingRowIndex + 1;
        console.log(`✓ Found ${enrichment.company} at row ${rowNumber}`);
        
        // Prepare update: columns are A=Firm, B=Website, C=Contact, D=Title, E=Email, F=LinkedIn, G=Location, H=Focus, I=AUM, J=Status, K=Notes
        updates.push({
          range: `Sheet1!C${rowNumber}:K${rowNumber}`,
          values: [[
            enrichment.contact,           // C: Contact Name
            enrichment.title,              // D: Position/Title
            enrichment.email,              // E: Email
            enrichment.linkedin,           // F: LinkedIn URL
            rows[matchingRowIndex][6] || '', // G: Keep existing Location
            rows[matchingRowIndex][7] || '', // H: Keep existing Focus
            rows[matchingRowIndex][8] || '', // I: Keep existing AUM
            'Enriched',                    // J: Status
            `${enrichment.notes} | Source: ${enrichment.source} | Enriched: ${new Date().toISOString().split('T')[0]}`  // K: Notes
          ]]
        });
      } else {
        console.log(`⚠ No match found for ${enrichment.company} - will add as new row`);
        
        // Add as new row at the end
        updates.push({
          range: 'Sheet1!A:K',
          values: [[
            enrichment.company,
            '',  // Website (empty for now)
            enrichment.contact,
            enrichment.title,
            enrichment.email,
            enrichment.linkedin,
            '',  // Location (unknown)
            '',  // Focus (unknown)
            '',  // AUM (unknown)
            'Enriched',
            `${enrichment.notes} | Source: ${enrichment.source} | Enriched: ${new Date().toISOString().split('T')[0]}`
          ]]
        });
      }
    });

    if (updates.length === 0) {
      console.log('\n⚠ No updates to make.');
      return;
    }

    console.log(`\n📝 Updating ${updates.length} rows...\n`);

    // Execute batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates,
      },
    });

    console.log(`✅ Successfully enriched ${updates.length} leads!\n`);
    
    enrichments.forEach(e => {
      console.log(`  • ${e.contact} (${e.title}) at ${e.company}`);
      console.log(`    📧 ${e.email}`);
      console.log(`    🔗 ${e.linkedin}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error updating sheet:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

updateSheet();
