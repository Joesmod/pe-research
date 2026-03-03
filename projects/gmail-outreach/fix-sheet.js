const {google} = require('googleapis');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const sid = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Update Kian Capital at row 216
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'B216:M216',
    valueInputOption: 'RAW',
    requestBody: { values: [[
      'David Duke',
      'Partner, Business Development',
      'dduke@kiancapital.com',
      'https://www.kiancapital.com',
      'https://www.linkedin.com/company/kian-capital-partners-llc',
      'Consumer, Services, Value-Added Distribution, Specialty Manufacturing',
      'Eden Brothers, PARC Auto, Labor Law Center, Diamond Landscaping',
      'Enriched',
      '',
      'Atlanta GA. $1B+ capital under management. LMM. Inc Founder-Friendly 5 yrs. David Duke (Partner BD, dduke@kiancapital.com) verified from BusinessWire (PARC Auto Aug 2023, Diamond Landscaping Jun 2024, Eden Brothers Jan 2025). Phone: 470.823.3008. Co-founded by John Kessler. 100+ yrs collective experience. 4 core sectors. 2026-02-15 enrichment.',
      'https://www.businesswire.com/news/home/20250109225085/en/',
      '7'
    ]] }
  });
  console.log('Updated Kian Capital at row 216');

  // Mark row 324 (Kian Capital duplicate) 
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'K324',
    valueInputOption: 'RAW',
    requestBody: { values: [['DUPLICATE of row 216. See row 216 for full enriched data.']] }
  });

  // Mark row 327 (Prospect Partners duplicate)
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: 'K327',
    valueInputOption: 'RAW',
    requestBody: { values: [['DUPLICATE of rows 109, 304, 310. See row 109 for full enriched data.']] }
  });

  console.log('Marked duplicates');
  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
