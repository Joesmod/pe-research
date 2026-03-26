const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichment data from research - 3:16 AM CST run
const enrichments = [
  {
    firmName: 'Ample Bright Capital',
    contactName: 'Veena Anand',
    title: 'Co-Founder & Managing Partner',
    email: 'veena@amplebrightcapital.com',
    linkedin: 'https://www.linkedin.com/company/ample-bright-capital',
    status: 'Enriched',
    notes: 'Email verified from official website contact page'
  },
  {
    firmName: 'Soundcore Capital Partners',
    contactName: 'Jarrett Turner',
    title: 'Founder & Managing Partner',
    email: 'jturner@soundcorecap.com',
    linkedin: 'https://www.linkedin.com/in/jarrett-turner-107ba822/',
    status: 'Enriched',
    notes: 'Email verified from LinkedIn post (SuperReturn conference announcement)'
  },
  {
    firmName: 'New Water Capital',
    contactName: 'Jason Neimark',
    title: 'Partner & Founder',
    email: 'jneimark@newwatercap.com',
    linkedin: 'https://www.linkedin.com/in/jason-neimark-16748856/',
    status: 'Enriched',
    notes: 'Email pattern j******@newwatercap.com from RocketReach, inferred as jneimark@'
  },
  {
    firmName: 'Ronin Equity Partners',
    contactName: 'Jesse Yao',
    title: 'Managing Partner',
    email: 'jyao@roninequitypartners.com',
    linkedin: 'https://www.linkedin.com/company/ronin-equity-partners',
    status: 'Enriched',
    notes: 'Email pattern j******@roninequitypartners.com from RocketReach, inferred as jyao@'
  },
  {
    firmName: 'Ronin Equity Partners',
    contactName: 'David Feierstein',
    title: 'Co-Founder & Managing Partner',
    email: 'dfeierstein@roninequitypartners.com',
    linkedin: 'https://www.roninequitypartners.com/david-feierstein',
    status: 'Enriched',
    notes: 'Email inferred from firm pattern (first initial + last name)'
  },
  {
    firmName: 'Salt Creek Capital',
    contactName: 'Dan Mytels',
    title: 'Managing Partner',
    email: 'dmytels@saltcreekcap.com',
    linkedin: 'https://www.linkedin.com/in/danmytels/',
    status: 'Enriched',
    notes: 'Email pattern d******@saltcreekcap.com from RocketReach, inferred as dmytels@'
  },
  {
    firmName: 'Pamlico Capital',
    contactName: 'Scott Perper',
    title: 'Partner (Head of Firm)',
    email: '',
    linkedin: 'https://www.linkedin.com/in/scott-perper-7a10b019/',
    status: 'Needs Email',
    notes: 'Managing Partner identified from Wikipedia and team page, no direct email found'
  },
  {
    firmName: 'Atlantic Street Capital',
    contactName: 'Peter Shabecoff',
    title: 'Co-CEO & Founder',
    email: '',
    linkedin: 'https://www.linkedin.com/in/shabecoff-peter-0617005/',
    status: 'Needs Email',
    notes: 'Co-CEO/Founder role confirmed from Bloomberg and firm website, no direct email found'
  },
  {
    firmName: 'Peak Rock Capital',
    contactName: 'Anthony DiSimone',
    title: 'Chief Executive Officer',
    email: '',
    linkedin: 'https://www.linkedin.com/pub/dir/Anthony/Disimone',
    status: 'Needs Email',
    notes: 'CEO confirmed from Bloomberg and firm press releases, no direct email found'
  },
  {
    firmName: 'Charlesbank Capital Partners',
    contactName: 'Sandor Hau',
    title: 'Managing Director & President, Credit',
    email: 'shau@charlesbank.com',
    linkedin: 'https://www.linkedin.com/search/results/all/?keywords=Sandor%20Hau%20Charlesbank',
    status: 'Enriched',
    notes: 'Email pattern s******@charlesbank.com from RocketReach, inferred as shau@'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read current sheet to find rows to update
  const readResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });

  const rows = readResponse.data.values || [];
  const updates = [];

  // Column mapping (0-indexed): A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9, K=10
  // A=Firm Name, B=Website, C=Contact Name, D=Title, E=Email, F=LinkedIn, G=Status, H=Notes, I=AUM, J=Location, K=Focus

  enrichments.forEach(enrichment => {
    // Find row with matching firm name
    const rowIndex = rows.findIndex((row, idx) => 
      idx > 0 && row[0] && row[0].toLowerCase().includes(enrichment.firmName.toLowerCase())
    );

    if (rowIndex > 0) {
      const row = rows[rowIndex];
      const range = `Sheet1!C${rowIndex + 1}:H${rowIndex + 1}`; // C to H columns

      const values = [
        enrichment.contactName,
        enrichment.title,
        enrichment.email,
        enrichment.linkedin,
        enrichment.status,
        enrichment.notes
      ];

      updates.push({ range, values: [values] });
      console.log(`Update for ${enrichment.firmName} at row ${rowIndex + 1}`);
    } else {
      console.log(`No row found for ${enrichment.firmName} - will append new row`);
      // Append as new row if not found
      const appendRange = 'Sheet1!A:K';
      const appendValues = [
        enrichment.firmName,
        '', // Website - to be filled
        enrichment.contactName,
        enrichment.title,
        enrichment.email,
        enrichment.linkedin,
        enrichment.status,
        enrichment.notes,
        '', // AUM
        '', // Location
        '' // Focus
      ];
      
      updates.push({ 
        range: appendRange, 
        values: [appendValues],
        append: true 
      });
    }
  });

  // Execute batch update
  if (updates.length > 0) {
    for (const update of updates) {
      if (update.append) {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: update.range,
          valueInputOption: 'RAW',
          resource: { values: update.values }
        });
      } else {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: update.range,
          valueInputOption: 'RAW',
          resource: { values: update.values }
        });
      }
    }

    console.log(`\n✅ Successfully updated ${updates.length} rows in the sheet`);
  }
}

updateSheet().catch(console.error);
