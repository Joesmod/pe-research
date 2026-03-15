const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// My enrichments from this cron run
const enrichments = [
  {
    firmName: "Sentinel Capital Partners",
    contactName: "Eric Bommer",
    title: "Managing Partner",
    email: "bommer@sentinelpartners.com",
    linkedin: "https://www.linkedin.com/in/eric-bommer-36670b8a",
    status: "Enriched",
    notes: "First hire 1997, 27+ yrs at Sentinel. Brown Univ. Source: sentinelpartners.com + RocketReach"
  },
  {
    firmName: "Bertram Capital",
    contactName: "Jeff Drazan",
    title: "Founder & Managing Partner",
    email: "jdrazan@bertramcapital.com",
    linkedin: "https://www.linkedin.com/in/jeff-drazan-61196/",
    status: "Enriched",
    notes: "Founded 2006. Scaled from $250M to $1.6B Fund V. Source: bertramcapital.com"
  },
  {
    firmName: "Silver Oak Services Partners",
    contactName: "Gregory M. Barr",
    title: "Co-Founder & Managing Partner",
    email: "gbarr@silveroaksp.com",
    linkedin: "https://www.linkedin.com/in/gregory-barr-45102314",
    status: "Enriched",
    notes: "Co-Managing Partner with Dan Gill. $500M Fund IV. Source: RocketReach + press"
  },
  {
    firmName: "Frontenac Company",
    contactName: "Ronald Kuehl",
    title: "Managing Partner",
    email: "rkuehl@frontenac.com",
    linkedin: "https://www.linkedin.com/company/frontenac-company",
    status: "Enriched",
    notes: "Chicago PE, 50+ yrs. Managing Partner. Source: frontenac.com + Kona Equity"
  },
  {
    firmName: "Millennium Bridge Capital",
    contactName: "John Fitzgerald",
    title: "Managing Director & Co-Founder",
    email: "jfitzgerald@mbclp.com",
    linkedin: "https://www.millenniumbridge.com/team/john-fitzgerald/",
    status: "Enriched",
    notes: "Co-founded 2003. 40+ yrs PE & law. Denver CO. Source: millenniumbridge.com"
  },
  {
    firmName: "Pritzker Private Capital",
    contactName: "Michael Nelson",
    title: "Managing Partner & Head of Investing",
    email: "mnelson@ppcpartners.com",
    linkedin: "https://theorg.com/org/pritzker-private-capital/org-chart/michael-nelson",
    status: "Enriched",
    notes: "Joined 2012. Ex-Flexpoint Ford, Genstar. Harvard MBA. Source: ppcpartners.com"
  },
  {
    firmName: "Palladium Equity Partners",
    contactName: "Justin R. Green",
    title: "Partner, Co-Head of Flagship Funds",
    email: "jgreen@palladiumequity.com",
    linkedin: "https://www.linkedin.com/in/justin-green-070b814/",
    status: "Enriched",
    notes: "Co-Head with Daniel Ilundain. ~$3B AUM. Source: SignalHire + LinkedIn"
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read current sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J',
    });
    
    const rows = response.data.values;
    const updates = [];
    
    for (const enrichment of enrichments) {
      for (let i = 1; i < rows.length; i++) {
        const firmName = rows[i][0] || '';
        if (firmName === enrichment.firmName) {
          const rowNum = i + 1;
          // Columns: A=Firm, B=Website, C=Contact, D=Title, E=Email, F=LinkedIn, G=Status, H=Notes
          updates.push({
            range: `Sheet1!C${rowNum}:H${rowNum}`,
            values: [[
              enrichment.contactName,
              enrichment.title,
              enrichment.email,
              enrichment.linkedin,
              enrichment.status,
              enrichment.notes
            ]]
          });
          console.log(`Queued update for row ${rowNum}: ${enrichment.firmName}`);
          break;
        }
      }
    }
    
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: updates
        }
      });
      console.log(`\n✅ Successfully updated ${updates.length} firms in the sheet`);
    } else {
      console.log('No matching firms found to update');
    }
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    throw error;
  }
}

updateSheet();
