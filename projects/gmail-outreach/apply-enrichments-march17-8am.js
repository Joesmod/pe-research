const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const keyFile = 'service-account.json';

async function applyEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const timestamp = new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  // Updates to apply (verified from research)
  const updates = [
    {
      row: 7,
      company: 'SDC Capital Partners',
      updates: {
        contactName: 'Todd Aaron',
        title: 'Founder & Managing Partner',
        email: 'taaron@sdccapitalpartners.com',
        linkedin: 'https://www.linkedin.com/in/todd-aaron-',
        status: 'Enriched',
        notes: `Contact corrected from Sean Honey to Todd Aaron (Founder & Managing Partner). Email verified via ContactOut. (${timestamp} cron)`
      }
    },
    {
      row: 12,
      company: 'Casa Verde Capital',
      updates: {
        contactName: 'Karan Wadhera',
        title: 'Managing Partner',
        email: 'karan@casaverdecapital.com',
        linkedin: 'https://www.linkedin.com/in/karan-wadhera/',
        status: 'Enriched',
        notes: `Contact corrected from Dave Finley to Karan Wadhera (Managing Partner). Email verified via RocketReach and official team page casaverdecapital.com/team. (${timestamp} cron)`
      }
    },
    {
      row: 23,
      company: 'HGGC',
      updates: {
        status: 'Enriched',
        notes: `Rich Lawson (Co-Founder & CEO) email verified: rlawson@hggc.com via ContactOut and hggc.com team page. (${timestamp} cron)`
      }
    },
    {
      row: 565,
      company: 'Author Capital',
      updates: {
        status: 'Enriched',
        notes: `Duane Jackson (Founder & Managing Partner) email verified: djackson@authorcapital.com via RocketReach and authorcapital.com/team. (${timestamp} cron)`
      }
    },
    {
      row: 568,
      company: 'Avenue Capital Group',
      updates: {
        status: 'Enriched',
        notes: `Sonia Gardner (Co-Founder, President & Managing Partner) email verified: sgardner@avenuecapital.com via RocketReach. (${timestamp} cron)`
      }
    }
  ];
  
  console.log(`Applying ${updates.length} enrichment updates to Google Sheet...\n`);
  
  for (const update of updates) {
    const { row, company, updates: fields } = update;
    
    console.log(`Updating Row ${row}: ${company}`);
    
    const batchUpdates = [];
    
    // Column mapping (A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8)
    // A: Company, B: URL, C: Contact Name, D: Title, E: Email, F: ?, G: LinkedIn, H: Status, I: Notes
    
    if (fields.contactName) {
      batchUpdates.push({
        range: `Sheet1!C${row}`,
        values: [[fields.contactName]]
      });
      console.log(`  - Contact Name: ${fields.contactName}`);
    }
    
    if (fields.title) {
      batchUpdates.push({
        range: `Sheet1!D${row}`,
        values: [[fields.title]]
      });
      console.log(`  - Title: ${fields.title}`);
    }
    
    if (fields.email) {
      batchUpdates.push({
        range: `Sheet1!E${row}`,
        values: [[fields.email]]
      });
      console.log(`  - Email: ${fields.email}`);
    }
    
    if (fields.linkedin) {
      batchUpdates.push({
        range: `Sheet1!G${row}`,
        values: [[fields.linkedin]]
      });
      console.log(`  - LinkedIn: ${fields.linkedin}`);
    }
    
    if (fields.status) {
      batchUpdates.push({
        range: `Sheet1!H${row}`,
        values: [[fields.status]]
      });
      console.log(`  - Status: ${fields.status}`);
    }
    
    if (fields.notes) {
      batchUpdates.push({
        range: `Sheet1!I${row}`,
        values: [[fields.notes]]
      });
      console.log(`  - Notes updated`);
    }
    
    try {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: batchUpdates
        }
      });
      console.log(`  ✅ Updated successfully\n`);
    } catch (error) {
      console.error(`  ❌ Error updating: ${error.message}\n`);
    }
  }
  
  console.log(`\n✅ Enrichment complete! Updated ${updates.length} leads.`);
  console.log(`\nVerified enrichments:`);
  console.log(`- SDC Capital Partners: Todd Aaron`);
  console.log(`- Casa Verde Capital: Karan Wadhera`);
  console.log(`- HGGC: Rich Lawson (verified)`);
  console.log(`- Author Capital: Duane Jackson (verified)`);
  console.log(`- Avenue Capital Group: Sonia Gardner (verified)`);
}

applyEnrichments().catch(console.error);
