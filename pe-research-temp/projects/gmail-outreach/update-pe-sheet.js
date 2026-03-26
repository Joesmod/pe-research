const {google} = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});

  // Updates: [row (1-indexed), column letter, value]
  const updates = [
    // Row 58 (Clearview Capital, 0-indexed row 57): Add verified email + update status
    {range: 'D58', values: [['jandersen@clearviewcap.com']]},
    {range: 'I58', values: [['Enriched']]},
    {range: 'K58', values: [['Stamford CT. LMM PE. 30+ year track record. James Andersen (Co-Founder/Co-MP). Email verified from PRNewswire (Novik Sales Corp, Aug 2014). Old Greenwich office. 150+ transactions. Offices in CA, NC, TN. 2026-02-14 enrichment.']]},

    // Row 20 (Palladium Equity, 0-indexed row 19): Add BD contact with verified email
    {range: 'B20', values: [['Erick Bronner']]},
    {range: 'C20', values: [['Managing Director, Fundraising & Investor Relations']]},
    {range: 'D20', values: [['ebronner@palladiumequity.com']]},
    {range: 'I20', values: [['Enriched']]},
    {range: 'K20', values: [['NYC/Stamford/Traverse City. $3B+ AUM. Erick Bronner (MD IR, ebronner@palladiumequity.com verified from PRNewswire Apr 2021). Daniel Ilundain promoted to President Jul 2024. Marcos Rodriguez (Founder/CEO). Sector heads: Alex Funk (Services), Rafael Ortiz (Healthcare). 2026-02-14 enrichment.']]},

    // Row 3 (Shore Capital, 0-indexed row 2): Add verified email contact
    {range: 'B3', values: [['AJ Gauthier']]},
    {range: 'C3', values: [['Business Development']]},
    {range: 'D3', values: [['agauthier@shorecp.com']]},
    {range: 'I3', values: [['Enriched']]},
    {range: 'K3', values: [['Chicago-based microcap PE. $17B AUM. Dedicated Operating Partners + Portfolio Performance Group. Inc. Founder-Friendly 6 yrs. AJ Gauthier email verified from BusinessWire (C2Dx/Cook Medical deal, Jan 2024). Also: rkenny@shorecp.com (Rory Kenny, from BusinessWire Oct 2015). Uses Edelman Smithfield for PR. 2026-02-14 enrichment.']]},

    // Row 21 (Charlesbank, 0-indexed row 20): Add verified email
    {range: 'B21', values: [['Maura Turner']]},
    {range: 'C21', values: [['Vice President, Communications & Investor Relations']]},
    {range: 'D21', values: [['mturner@charlesbank.com']]},
    {range: 'I21', values: [['Enriched']]},
    {range: 'K21', values: [['$23B total assets. Founded from Harvard endowment 1998. Boston/NYC. Michael Choe (MP/CEO). Maura Turner email verified from BusinessWire (VF Corp/Reef, Oct 2018; Ivanti, Mar 2021). Recent PR uses Prosek Partners. Sherif Barrad (Advisory Director of AI). 2026-02-14 enrichment.']]},
  ];

  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      requestBody: {values: update.values}
    });
    console.log(`Updated ${update.range}`);
  }

  console.log('All updates complete.');
}

main().catch(console.error);
