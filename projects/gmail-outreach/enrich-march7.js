const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function enrichLeads() {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Row 811: Wildcat Capital Management
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C811:J811',
    valueInputOption: 'RAW',
    resource: {
      values: [[
        'Len Potter',
        'President & Chief Investment Officer',
        'lpotter@wildcatcap.com',
        'https://www.wildcatcap.com',
        'https://www.linkedin.com/in/len-potter-55985313',
        'Multi-sector single-family office',
        'Founded 2011 by David Bonderman (TPG Capital founder). $1B+ AUM. Email verified via ContactOut and Equilar. Source: wildcatcap.com/team + ContactOut (2026-03-07)',
        'Enriched'
      ]]
    }
  });
  console.log('✅ Updated Wildcat Capital Management (Row 811)');
  
  // Row 817: 777 Partners - Mark as Dead
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!J817',
    valueInputOption: 'RAW',
    resource: {
      values: [['Dead - SEC charged with fraud Oct 2025, founders resigned May 2024']]
    }
  });
  console.log('✅ Marked 777 Partners as Dead (Row 817)');
  
  // Row 821: ACRE
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C821:J821',
    valueInputOption: 'RAW',
    resource: {
      values: [[
        'Les Menkes',
        'Founding Partner',
        'les@acremgt.com',
        'https://www.acremgt.com',
        'https://www.linkedin.com/in/les-menkes-30273885',
        'Real estate equity & debt',
        'Asia Capital Real Estate - global offices NYC/Miami/Singapore. Email verified via ContactOut. Source: acremgt.com/about/team + ContactOut (2026-03-07)',
        'Enriched'
      ]]
    }
  });
  console.log('✅ Updated ACRE (Row 821)');
  
  // Row 822: Aduro Advisors - Mark as Dead
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!J822',
    valueInputOption: 'RAW',
    resource: {
      values: [['Dead - Fund administrator (services PE firms), not a PE firm']]
    }
  });
  console.log('✅ Marked Aduro Advisors as Dead (Row 822)');
  
  // Row 833: Anzu Partners
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C833:J833',
    valueInputOption: 'RAW',
    resource: {
      values: [[
        'David Michael',
        'Managing Partner',
        'dmichael@anzupartners.com',
        'https://www.anzupartners.com',
        'https://www.linkedin.com/in/dmichael',
        'Industrial tech, life sciences',
        'VC firm with 50+ team members. $190M Fund II (2020). Email inferred from RocketReach pattern. Co-Managing Partners: David Michael, David Seldin, Whitney Haring-Smith. Source: anzupartners.com/team + RocketReach (2026-03-07)',
        'Enriched'
      ]]
    }
  });
  console.log('✅ Updated Anzu Partners (Row 833)');
  
  // Row 835: Arctos
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C835:J835',
    valueInputOption: 'RAW',
    resource: {
      values: [[
        'Ian Charles',
        'Co-Managing Partner & Founder',
        '',
        'https://www.arctospartners.com',
        'https://www.linkedin.com/in/iancharles',
        'Sports franchises, PE funds',
        'Leading sports-focused PE firm. $3B+ Fund I. Co-Managing Partners: Ian Charles & David O\'Connor. No direct emails found (high-profile firm). Director of IR: Megan Salvadore. Source: arctospartners.com/team + LinkedIn (2026-03-07)',
        'Partial'
      ]]
    }
  });
  console.log('✅ Updated Arctos (Row 835)');
  
  // Row 836: Argand Partners
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!C836:J836',
    valueInputOption: 'RAW',
    resource: {
      values: [[
        'Heather Faust',
        'Managing Partner & Co-Founder',
        'hfaust@argandequity.com',
        'https://www.argandequity.com',
        'https://www.linkedin.com/in/heather-faust',
        'Industrials, energy, consumer, manufacturing',
        'Mid-market PE firm. Founded by former Castle Harlan team. Email publicly listed on Argand website. Co-Founder: Howard D. Morgan. Heather named to M&A Most Influential Women 2024. Source: argandequity.com/heather-faust (2026-03-07)',
        'Enriched'
      ]]
    }
  });
  console.log('✅ Updated Argand Partners (Row 836)');
  
  // Row 808: UNC Kenan-Flagler - Mark as Dead
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!J808',
    valueInputOption: 'RAW',
    resource: {
      values: [['Dead - Student-run PE fund, team rotates annually, not suitable for outreach']]
    }
  });
  console.log('✅ Marked UNC Kenan-Flagler as Dead (Row 808)');
  
  console.log('\n🎉 Successfully enriched 5 PE firms and marked 3 as Dead!');
}

enrichLeads().catch(console.error);
