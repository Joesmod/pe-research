const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SHEET_NAME = 'Sheet1';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Read current data to find row numbers
  const readResult = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:K`,
  });

  const rows = readResult.data.values || [];
  
  // Find firms by name
  const firmRows = {};
  const firms = [
    'Basis Vectors Capital',
    'Lead Capital Partners',
    'CAZ Investments',
    'Alpha Partners',
    'Afore Capital',
    '1315 Capital',
    'Apogem Capital',
    'Arctos Partners',
    'Avestria Ventures',
    'AXA Venture Partners'
  ];
  
  for (let i = 0; i < rows.length; i++) {
    const companyName = rows[i][0] || '';
    for (const firm of firms) {
      if (companyName.includes(firm)) {
        firmRows[firm] = i + 1; // +1 for 1-indexed sheets
        break;
      }
    }
  }

  const updates = [];

  // Basis Vectors Capital - Ambarish Gupta, CEO/Founder
  if (firmRows['Basis Vectors Capital']) {
    const row = firmRows['Basis Vectors Capital'];
    updates.push({ range: `${SHEET_NAME}!C${row}`, values: [['Ambarish Gupta']] });
    updates.push({ range: `${SHEET_NAME}!D${row}`, values: [['CEO, Founder']] });
    updates.push({ range: `${SHEET_NAME}!F${row}`, values: [['https://www.linkedin.com/in/ambarishngupta/']] });
    updates.push({ range: `${SHEET_NAME}!J${row}`, values: [['Research - Needs Email']] });
    updates.push({ range: `${SHEET_NAME}!K${row}`, values: [['Founded 2021, NYC. 5 portfolio companies. Deep Value Creation model for B2B SaaS. Team: Manish Agarwal (VP Revenue), Geoff Smith (CMO), Yara Chepa (Investment Associate). Domain: basisvectors.com. Email pattern not verified - contact page available.']] });
  }

  // Lead Capital Partners - Pryor Smartt, Managing Partner
  if (firmRows['Lead Capital Partners']) {
    const row = firmRows['Lead Capital Partners'];
    updates.push({ range: `${SHEET_NAME}!C${row}`, values: [['Pryor Smartt']] });
    updates.push({ range: `${SHEET_NAME}!D${row}`, values: [['Managing Partner']] });
    updates.push({ range: `${SHEET_NAME}!F${row}`, values: [['https://www.linkedin.com/in/pryor-smartt-7714892b/']] });
    updates.push({ range: `${SHEET_NAME}!J${row}`, values: [['Research - Needs Email']] });
    updates.push({ range: `${SHEET_NAME}!K${row}`, values: [['Healthcare-focused PE, Nashville. Founded 2011. Lower middle market, $125M fund. ZoomInfo showed pattern p***@leadcp.com. Also: Erick Clifford (Managing Partner). Domain: leadcp.com.']] });
  }

  // CAZ Investments - Mark Wade, Partner
  if (firmRows['CAZ Investments']) {
    const row = firmRows['CAZ Investments'];
    updates.push({ range: `${SHEET_NAME}!C${row}`, values: [['Mark Wade']] });
    updates.push({ range: `${SHEET_NAME}!D${row}`, values: [['Partner']] });
    updates.push({ range: `${SHEET_NAME}!F${row}`, values: [['https://www.linkedin.com/in/mark-wade-caia-334b951b/']] });
    updates.push({ range: `${SHEET_NAME}!J${row}`, values: [['Research - Needs Email']] });
    updates.push({ range: `${SHEET_NAME}!K${row}`, values: [['Houston-based. $1.6B AUM. GP stakes, private credit, co-investments. Facilitates family office/RIA co-investments. Domain: cazinvestments.com. Email pattern not verified from public sources.']] });
  }

  // Alpha Partners - Steve Brotman, Managing Partner/Founder
  if (firmRows['Alpha Partners']) {
    const row = firmRows['Alpha Partners'];
    updates.push({ range: `${SHEET_NAME}!C${row}`, values: [['Steve Brotman']] });
    updates.push({ range: `${SHEET_NAME}!D${row}`, values: [['Managing Partner, Founder']] });
    updates.push({ range: `${SHEET_NAME}!F${row}`, values: [['https://www.linkedin.com/in/stevebrotman/']] });
    updates.push({ range: `${SHEET_NAME}!J${row}`, values: [['Research - Needs Email']] });
    updates.push({ range: `${SHEET_NAME}!K${row}`, values: [['Founded 2013, NYC. Partners with VCs instead of competing. Team: Gal Gitter (Partner), Steve Gentili (VP), Sean O\'Brien (CFO). ZoomInfo showed pattern s***@alphapartners.com. Domain: alphapartners.com.']] });
  }

  // Afore Capital - Anamitra Banerji & Gaurav Jain, Co-founders/Managing Partners
  if (firmRows['Afore Capital']) {
    const row = firmRows['Afore Capital'];
    updates.push({ range: `${SHEET_NAME}!C${row}`, values: [['Anamitra Banerji']] });
    updates.push({ range: `${SHEET_NAME}!D${row}`, values: [['Co-founder, Managing Partner']] });
    updates.push({ range: `${SHEET_NAME}!F${row}`, values: [['https://www.linkedin.com/in/anamitra/']] });
    updates.push({ range: `${SHEET_NAME}!J${row}`, values: [['Research - Needs Email']] });
    updates.push({ range: `${SHEET_NAME}!K${row}`, values: [['$500M Pre-Seed VC, $500K-$2M checks. SF-based. Co-founders: Anamitra Banerji (former Twitter PM, Android founding PM) & Gaurav Jain. ContactOut showed ******@afore.vc pattern. Team: Derrick Li (Principal), Kayla Kavanaugh, Jack McClelland, Laura Du (Investors).']] });
  }

  // 1315 Capital - Adele Oliva, Founding Partner
  if (firmRows['1315 Capital']) {
    const row = firmRows['1315 Capital'];
    updates.push({ range: `${SHEET_NAME}!C${row}`, values: [['Adele Oliva']] });
    updates.push({ range: `${SHEET_NAME}!D${row}`, values: [['Founding Partner']] });
    updates.push({ range: `${SHEET_NAME}!F${row}`, values: [['https://www.linkedin.com/in/adelecoliva/']] });
    updates.push({ range: `${SHEET_NAME}!J${row}`, values: [['Research - Needs Email']] });
    updates.push({ range: `${SHEET_NAME}!K${row}`, values: [['Philadelphia. Healthcare growth equity, $1B+ AUM. Commercial-stage healthcare products/services/wellness. 20+ years healthcare investing. ZoomInfo showed a***@1315capital.com pattern. Domain: 1315capital.com.']] });
  }

  // Apogem Capital - Todd Milligan, Managing Director
  if (firmRows['Apogem Capital']) {
    const row = firmRows['Apogem Capital'];
    updates.push({ range: `${SHEET_NAME}!C${row}`, values: [['Todd Milligan']] });
    updates.push({ range: `${SHEET_NAME}!D${row}`, values: [['Managing Director, Co-head RidgeLake Partners']] });
    updates.push({ range: `${SHEET_NAME}!F${row}`, values: [['https://www.linkedin.com/in/todd-milligan/']] });
    updates.push({ range: `${SHEET_NAME}!J${row}`, values: [['Research - Needs Email']] });
    updates.push({ range: `${SHEET_NAME}!K${row}`, values: [['GP stakes strategy via RidgeLake Partners. Closed $1.1B inaugural fund 2025. Partnership between Apogem Capital and OA Private Capital. Middle market focus. Domain: apogemcapital.com. Email pattern not verified.']] });
  }

  // Arctos Partners - Ian Charles & David O'Connor, Managing Partners
  if (firmRows['Arctos Partners']) {
    const row = firmRows['Arctos Partners'];
    updates.push({ range: `${SHEET_NAME}!C${row}`, values: [['Ian Charles']] });
    updates.push({ range: `${SHEET_NAME}!D${row}`, values: [['Managing Partner']] });
    updates.push({ range: `${SHEET_NAME}!F${row}`, values: [['https://www.linkedin.com/company/arctos-partners/']] });
    updates.push({ range: `${SHEET_NAME}!J${row}`, values: [['Research - Needs Email']] });
    updates.push({ range: `${SHEET_NAME}!K${row}`, values: [['Sports-focused PE. Founded 2019, Dallas. Passive minority stakes in pro sports franchises. Co-Managing Partners: Ian Charles & David O\'Connor. Large team - 60+ professionals. Domain: arctospartners.com. Email pattern not verified.']] });
  }

  // Avestria Ventures - Linda Greub, Managing Partner
  if (firmRows['Avestria Ventures']) {
    const row = firmRows['Avestria Ventures'];
    updates.push({ range: `${SHEET_NAME}!C${row}`, values: [['Linda Greub']] });
    updates.push({ range: `${SHEET_NAME}!D${row}`, values: [['Managing Partner']] });
    updates.push({ range: `${SHEET_NAME}!F${row}`, values: [['https://www.linkedin.com/company/avestria-ventures/']] });
    updates.push({ range: `${SHEET_NAME}!J${row}`, values: [['Research - Needs Email']] });
    updates.push({ range: `${SHEET_NAME}!K${row}`, values: [['SF Bay Area. Women\'s health & life sciences VC. Early stage, women-led focus. HBS classmates/colleagues. Team: Linda Greub CFA (Managing Partner), Tracy Dooley MD (Partner). Domain: avestria.vc. Contact form available.']] });
  }

  // AXA Venture Partners - Francois Robinet, Managing Partner
  if (firmRows['AXA Venture Partners']) {
    const row = firmRows['AXA Venture Partners'];
    updates.push({ range: `${SHEET_NAME}!C${row}`, values: [['Francois Robinet']] });
    updates.push({ range: `${SHEET_NAME}!D${row}`, values: [['Managing Partner']] });
    updates.push({ range: `${SHEET_NAME}!F${row}`, values: [['https://www.linkedin.com/in/francois-robinet/']] });
    updates.push({ range: `${SHEET_NAME}!J${row}`, values: [['Research - Needs Email']] });
    updates.push({ range: `${SHEET_NAME}!K${row}`, values: [['Founded 2015, Paris. AXA Group\'s VC arm. €1.6B AUM (€1.1B direct, €500M fund-of-funds). Former CEO of AXA Rosenberg, Chief Risk Officer AXA Group. Domain: axavp.com. Email pattern not verified.']] });
  }

  // Execute all updates
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates,
      },
    });
    console.log(`✓ Successfully enriched ${updates.length / 5} firms (${updates.length} cell updates)`);
    console.log('Firms updated:');
    Object.keys(firmRows).forEach(firm => {
      console.log(`  - ${firm} (row ${firmRows[firm]})`);
    });
  } else {
    console.log('⚠ No matching firms found in sheet');
  }
}

updateSheet().catch(console.error);
