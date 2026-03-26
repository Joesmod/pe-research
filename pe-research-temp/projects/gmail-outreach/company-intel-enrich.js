const {google} = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'service-account.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Manual AUM data extracted from CRM notes (regex missed Unicode/special chars)
const aumData = {
  'Audax Private Equity': '$8B+ AUM',
  'The Vistria Group': '$10B+ AUM (Fund V, Jan 2025)',
  'Knox Lane': '$1B+ AUM (Fund II, Jul 2024)',
  'Linden Capital Partners': '$6.4B Fund VI (Apr 2025)',
  'Olympus Partners': '$5B+ AUM',
  'Kelso & Company': '$8.25B Fund XI (Oct 2023)',
  'Gauge Capital': '$2B+ capital managed',
  'Harvest Partners': '$5B+ AUM',
  'Tailwind Capital': '$5B+ AUM',
  'THL Partners': '$30B+ AUM',
  'New Mountain Capital': '$45B+ AUM',
  'Baymark Partners': 'Lower middle market',
  'ShoreView Industries': '$1.8B+ committed (Fund V, Sep 2024)',
  'JLL Partners': '$5B+ AUM',
  'Greater Sum Ventures': '$2.4B AUM',
  'Knox Capital': 'Lower middle market',
  'Trilantic North America': '$9.9B aggregate commitments',
  'HGGC': '$6B+ AUM',
  'Align Capital Partners': '$1B+ AUM',
  'Huron Capital': '$2B+ AUM',
  'Roark Capital Group': '$38B+ AUM',
  'Seidler Equity Partners': '$1B+ AUM',
  'Compass Group Equity Partners': '$1B+ (100+ transactions)',
  'Sentinel Capital Partners': '$5.2B+ raised since 1995',
  'Abry Partners': '$5B+ AUM',
  'Parthenon Capital Partners': '$5B+ AUM (Fund VII, Nov 2025)',
  'GTCR': '$40B+ AUM ($5.6B SGF II, Mar 2025)',
  'Lee Equity Partners': '$3B+ AUM',
  'Cressey & Company': '$2B+ AUM',
  'Amulet Capital': '$2.2B Fund III (Jul 2024)',
  'Vesey Street Capital Partners': '$1B+ AUM',
  'Ampersand Capital Partners': '$3B+ AUM',
  'Aldrich Capital Partners': '$500M+ AUM',
  'Sterling Partners': '$5B+ AUM',
  'MBF Healthcare Partners': '$1B+ AUM',
  'TA Associates': '$65B+ AUM',
  'IK Partners': '$15B+ AUM (European mid-market)',
  'Motive Partners': '$5B+ AUM',
  'Francisco Partners': '$45B+ AUM',
  'LLR Partners': '$6B+ AUM (Fund VII)'
};

// Additional tech signals from deeper reading
const techUpdates = {
  'Audax Private Equity': 'In-house Value Agenda portfolio support; Value Creation/Ops team',
  'Olympus Partners': 'Middle market LBOs with operational improvement focus',
  'Kelso & Company': 'ESOP pioneer (Louis Kelso); operational value creation',
  'ShoreView Industries': '100+ add-on acquisitions; M&A integration capability',
  'Trilantic North America': 'Control and significant minority investments',
  'HGGC': 'Co-founded by Steve Young; management partnership model',
  'Roark Capital Group': 'Franchise tech/operations; largest franchise-focused PE',
  'Seidler Equity Partners': 'Dual US/Australia operations',
  'Compass Group Equity Partners': 'Electronic mfg, industrial automation focus',
  'Sentinel Capital Partners': '$50-300M revenue targets; operational improvement',
  'Havencrest Capital Management': '31 operating partners; deep operational bench',
  'Lee Equity Partners': 'Thomas H. Lee legacy; financial/healthcare services',
  'Amulet Capital': 'Healthcare-exclusive; provider ecosystem focus',
  'Vesey Street Capital Partners': 'Healthcare-exclusive PE; ScribeAmerica platform',
  'Ampersand Capital Partners': 'Life sciences specialization; Boston/Amsterdam/London',
  'Sterling Partners': 'Education sector specialization',
  'MBF Healthcare Partners': 'Healthcare-exclusive; 20+ year track record'
};

// Recent news updates
const newsUpdates = {
  'Audax Private Equity': 'Active mid-market deal flow; healthcare services acquisitions',
  'Olympus Partners': 'Middle market buyouts focus; staffing industry activity',
  'HGGC': 'Sterling Brokers (Oct 2025); Equity Methods (Apr 2025)',
  'Roark Capital Group': 'Inspire Brands portfolio; Purpose Brands (fka WW) acquisition',
  'GTCR': '$5.6B Strategic Growth Fund II (Mar 2025); Leaders Strategy partnerships',
  'Parthenon Capital Partners': 'Fund VII closed Nov 2025; growth PE focus expanding',
  'Francisco Partners': 'Altera Digital Health (healthcare IT); Prosek PR relationship',
  'LLR Partners': 'Fund VII close (Apr 2025); Dylan Dempsey (Head of Data & Analytics)',
  'TA Associates': 'Global expansion; Strategic Resource Group value creation',
  'Motive Partners': 'IOI model (Investor, Operator, Innovator); Create team for tech transformation'
};

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});

  // Read current Company Intel sheet
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Company Intel!A1:H51'
  });
  const rows = r.data.values || [];

  // Update rows with enriched data
  for (let i = 1; i < rows.length; i++) {
    const company = rows[i][0];
    
    // Update AUM if missing
    if ((!rows[i][5] || rows[i][5] === '') && aumData[company]) {
      rows[i][5] = aumData[company];
    }
    
    // Update tech signals if "None detected"
    if (rows[i][6] === 'None detected' && techUpdates[company]) {
      rows[i][6] = techUpdates[company];
    }
    
    // Update recent news if missing
    if (rows[i][7] === 'No recent news found' && newsUpdates[company]) {
      rows[i][7] = newsUpdates[company];
    }
  }

  // Write updated data
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Company Intel!A1',
    valueInputOption: 'RAW',
    requestBody: { values: rows }
  });

  console.log(`Updated ${rows.length} rows with enriched AUM, tech signals, and news data`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
