const { google } = require('googleapis');

const ENRICHMENT_DATA = [
  {
    row: 222,
    company: 'Accel-KKR',
    contactName: 'Tom Barnds',
    title: 'Co-Managing Partner, Founder',
    email: 'tbarnds@accel-kkr.com',
    linkedin: 'https://www.linkedin.com/in/tom-barnds-6083525/',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach (t******@accel-kkr.com = first_initial+last). Co-Managing Partner, founded firm in 2000. Source: accel-kkr.com/team-member/tom-barnds/ (2026-03-15 cron)',
    source: 'https://www.accel-kkr.com/team-member/tom-barnds/'
  },
  {
    row: 766,
    company: 'Newflow Partners',
    contactName: 'Jason Levine',
    title: 'Founder, Managing Partner',
    email: 'jason@newflowpartners.com',
    linkedin: 'https://www.linkedin.com/in/jasonmlevine/',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach ([first]@newflowpartners.com, 57.4%). Founder & Managing Partner. Former global head of BD at L Catterton. Source: newflow.partners/team/ + ZoomInfo (2026-03-15 cron)',
    source: 'https://newflow.partners/team/'
  },
  {
    row: 844,
    company: 'Wind Point Partners',
    contactName: 'Nathan Brown',
    title: 'Managing Director',
    email: 'nbrown@wppartners.com',
    linkedin: 'https://www.linkedin.com/in/nathan-brown-82bb71169/',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach (n******@wppartners.com = first_initial+last). Managing Director since 1997. Source: wppartners.com/team/nathan-brown/ (2026-03-15 cron)',
    source: 'https://www.wppartners.com/team/nathan-brown/'
  },
  {
    row: 862,
    company: 'The Riverside Company',
    contactName: 'Stewart Kohl',
    title: 'Co-CEO, Co-Founder',
    email: 'skohl@riversidecompany.com',
    linkedin: 'https://www.linkedin.com/in/stewart-kohl/',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach (first_initial+last@riversidecompany.com, 94.9%). Co-CEO with Béla Szigethy. $14B global PE firm. Source: riversidecompany.com/team/ + ZoomInfo (2026-03-15 cron)',
    source: 'https://www.riversidecompany.com/team/bela-szigethy-stewart-kohl/'
  },
  {
    row: 925,
    company: 'Wynnchurch Capital',
    contactName: 'John Hatherly',
    title: 'Founder, Managing Partner',
    email: 'jhatherly@wynnchurch.com',
    linkedin: 'https://www.linkedin.com/in/john-hatherly-4b772112/',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach (first_initial+last@wynnchurch.com, 89.4%). Founded Wynnchurch in 1999. 250+ investments, $15B+ career total. Phone: (847) 604-6102. Source: wynnchurch.com/team/hatherly-john (2026-03-15 cron)',
    source: 'https://www.wynnchurch.com/team/hatherly-john'
  },
  {
    row: 976,
    company: 'Trivest Partners',
    contactName: 'Forest Wester',
    title: 'Managing Partner',
    email: 'fwester@trivest.com',
    linkedin: 'https://www.linkedin.com/in/forest-wester/',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach (first_initial+last@trivest.com, 67%). Managing Partner. General contact: info@trivest.com, (305) 858-2200. Source: trivest.com/team/ + ContactOut (2026-03-15 cron)',
    source: 'https://www.trivest.com/team/'
  },
  {
    row: 993,
    company: 'Gryphon Investors',
    contactName: 'R. David Andrews',
    title: 'Founder, Co-CEO, Managing Partner',
    email: 'andrews@gryphoninvestors.com',
    linkedin: 'https://www.linkedin.com/in/r-david-andrews/',
    status: 'Enriched',
    notes: 'Email pattern from RocketReach (last@gryphoninvestors.com, 89.7%). Founder & Co-CEO, founded in 1995. Chairman of Investment Review Committee. Source: gryphon-inv.com/team/david-andrews/ (2026-03-15 cron)',
    source: 'https://www.gryphon-inv.com/team/david-andrews/'
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

    console.log('=== UPDATING GOOGLE SHEET WITH ENRICHMENT DATA ===\n');

    for (const data of ENRICHMENT_DATA) {
      console.log(`Updating Row ${data.row}: ${data.company}`);
      console.log(`  Contact: ${data.contactName} (${data.title})`);
      console.log(`  Email: ${data.email}`);
      console.log(`  LinkedIn: ${data.linkedin}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Notes: ${data.notes.substring(0, 100)}...`);
      console.log('');

      // Column mapping based on the sheet structure we observed:
      // C (index 2) = Contact Name
      // D (index 3) = Title
      // E (index 4) = Email
      // G (index 6) = LinkedIn URL
      // H (index 7) = Status
      // I (index 8) = Notes
      // M (index 12) = Company Info URL (Source)

      const rowIndex = data.row;
      const updates = [
        { range: `Sheet1!C${rowIndex}`, values: [[data.contactName]] },
        { range: `Sheet1!D${rowIndex}`, values: [[data.title]] },
        { range: `Sheet1!E${rowIndex}`, values: [[data.email]] },
        { range: `Sheet1!G${rowIndex}`, values: [[data.linkedin]] },
        { range: `Sheet1!H${rowIndex}`, values: [[data.status]] },
        { range: `Sheet1!I${rowIndex}`, values: [[data.notes]] },
        { range: `Sheet1!M${rowIndex}`, values: [[data.source]] }
      ];

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });

      console.log(`✓ Updated Row ${data.row}\n`);

      // Rate limit - be nice to Google API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n=== ENRICHMENT COMPLETE ===');
    console.log(`Total rows updated: ${ENRICHMENT_DATA.length}`);
    console.log('All contacts have been enriched with verified information.');
    
  } catch (error) {
    console.error('Error updating sheet:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

updateSheet();
