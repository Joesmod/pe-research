const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function enrichManualMarch7() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // First read the sheet to find the row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = response.data.values;
  const updates = [];
  
  const enrichments = [
    {
      company: '1315 Capital',
      name: 'Adele Oliva',
      title: 'Founding Partner',
      email: 'adele.oliva@1315capital.com',
      linkedin: 'https://www.linkedin.com/in/adelecoliva/',
      notes: 'Email pattern from public press releases. Healthcare growth equity & buyouts. $1B+ AUM.',
      source: 'EMM directory, press releases'
    },
    {
      company: 'Altimeter Capital',
      name: 'Brad Gerstner',
      title: 'Founder & CEO',
      email: 'brad@altimeter.com',
      linkedin: 'https://www.linkedin.com/in/bradgerstner/',
      notes: 'Email verified from ContactOut. Tech-focused growth equity.',
      source: 'ContactOut, public'
    },
    {
      company: 'Author Capital',
      name: 'Duane Jackson',
      title: 'Founder & Managing Partner',
      email: 'djackson@authorcapital.com',
      linkedin: 'https://www.linkedin.com/in/dujackson/',
      notes: 'Email from EMM public directory. Chicago-based PE.',
      source: 'EMM public directory'
    },
    {
      company: 'Avenue Capital Group',
      name: 'Sonia Gardner',
      title: 'Co-Founder, President & Managing Partner',
      email: 'sgardner@avenuecapital.com',
      linkedin: 'https://www.linkedin.com/in/sonia-gardner-812a801ba/',
      notes: 'Email pattern from RocketReach. $12B+ distressed/credit firm founded 1995.',
      source: 'RocketReach pattern'
    },
    {
      company: 'SpaceFund',
      name: 'Meagan Crawford',
      title: 'Co-Founder & Managing Partner',
      email: 'meagan@spacefund.com',
      linkedin: 'https://www.linkedin.com/in/meagancrawford/',
      notes: 'Email from EMM public directory. Space tech VC, Houston-based.',
      source: 'EMM public directory'
    },
    {
      company: 'The Westly Group',
      name: 'Steve Westly',
      title: 'Founder & Managing Partner',
      email: 'steve.westly@westlygroup.com',
      linkedin: 'https://www.linkedin.com/in/stevewestly/',
      notes: 'Email publicly stated on LinkedIn profile. Clean tech/sustainable energy VC.',
      source: 'Public LinkedIn'
    },
    {
      company: 'Tola Capital',
      name: 'Sheila Gulati',
      title: 'Co-Founder & Managing Director',
      email: 'sheila@tolacapital.com',
      linkedin: 'https://www.linkedin.com/in/sheilagulati/',
      notes: 'Email pattern from RocketReach. B2B software growth equity, $230M fund.',
      source: 'RocketReach pattern'
    },
    {
      company: 'Yellow Wood Partners',
      name: 'Dana Schmaltz',
      title: 'Managing Partner',
      email: 'dschmaltz@yellowwoodpartners.com',
      linkedin: 'https://www.linkedin.com/in/dana-schmaltz-a1a56918/',
      notes: 'Email pattern from RocketReach. Consumer-focused PE, Boston-based.',
      source: 'RocketReach pattern'
    },
    {
      company: '3 Rivers Capital',
      name: 'Dale Buckwalter',
      title: 'Co-Founder & Managing Partner',
      email: 'buckwalter@3riverscap.com',
      linkedin: 'https://www.linkedin.com/in/dalebuckwalter3rc/',
      notes: 'Email pattern from Salesgear. Pittsburgh-based PE.',
      source: 'Salesgear pattern'
    },
    {
      company: 'Wildcat Capital Management',
      name: 'Len Potter',
      title: 'Founder, CEO & CIO',
      email: 'lpotter@wildcatcap.com',
      linkedin: 'https://www.linkedin.com/in/len-potter-55985313/',
      notes: 'Email from company website team page. Founded 2011, previously Soros Fund Mgmt.',
      source: 'Company website'
    }
  ];
  
  // Find rows for each company
  for (const enrichment of enrichments) {
    const rowIndex = rows.findIndex((row, idx) => 
      idx > 0 && row[0] && row[0].toLowerCase().includes(enrichment.company.toLowerCase())
    );
    
    if (rowIndex > 0) {
      const rowNum = rowIndex + 1;
      console.log(`Found ${enrichment.company} at row ${rowNum}`);
      
      // Update the row (columns C-J: Contact Name, Title, Email, Website, LinkedIn, Sectors, Notes, Status)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!C${rowNum}:J${rowNum}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            enrichment.name,
            enrichment.title,
            enrichment.email,
            rows[rowIndex][1] || '', // Keep existing website
            enrichment.linkedin,
            rows[rowIndex][7] || '', // Keep existing sectors
            enrichment.notes,
            'Enriched'
          ]]
        }
      });
      
      console.log(`✅ Updated ${enrichment.company} (Row ${rowNum})`);
      updates.push(enrichment.company);
    } else {
      console.log(`❌ Could not find ${enrichment.company} in sheet`);
    }
  }
  
  console.log(`\n🎉 Successfully enriched ${updates.length} PE firms!`);
  console.log('Updated:', updates.join(', '));
}

enrichManualMarch7().catch(console.error);
