const {google} = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'service-account.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});

  // Read CRM data
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:L60'
  });
  const rows = r.data.values || [];
  const header = rows[0];
  console.log('Header:', header.join(' | '));
  console.log(`Total rows: ${rows.length}`);

  // Parse each firm (rows 1-50, i.e. index 1-50)
  const intelRows = [['Company', 'CRM Row', 'Website', 'Portfolio Companies', 'Sector Focus', 'AUM/Fund Size', 'Tech Signals', 'Recent News']];

  for (let i = 1; i <= 50 && i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';
    const website = row[4] || '';
    const sectorFocus = row[6] || '';
    const portfolioCos = row[7] || '';
    const notes = row[10] || '';

    // Extract AUM from notes
    let aum = '';
    const aumMatch = notes.match(/\$[\d.]+[BMT]?\+?\s*(AUM|capital|Fund\s+\w+|managed|committed|raised)/i) 
      || notes.match(/(AUM|capital|managed|committed|raised)[^.]*\$[\d.]+[BMT]/i)
      || notes.match(/\$[\d.]+B/);
    if (aumMatch) aum = aumMatch[0].trim();

    // Extract tech signals
    let techSignals = '';
    const techTerms = [];
    if (/\bAI\b|artificial intelligence/i.test(notes)) techTerms.push('AI');
    if (/Chief AI Officer|CAO/i.test(notes)) techTerms.push('Chief AI Officer');
    if (/CTO|Chief Technology/i.test(notes)) techTerms.push('CTO');
    if (/digital\s*transformation/i.test(notes)) techTerms.push('Digital Transformation');
    if (/tech-enabled/i.test(notes + sectorFocus)) techTerms.push('Tech-enabled services');
    if (/Director of Technology|Head of Technology/i.test(notes)) techTerms.push('Head of Technology');
    if (/Data Science|Data & Analytics/i.test(notes)) techTerms.push('Data/Analytics');
    if (/software/i.test(sectorFocus)) techTerms.push('Software focus');
    if (/vertical SaaS|SaaS/i.test(notes)) techTerms.push('SaaS');
    if (/IT services/i.test(notes + sectorFocus)) techTerms.push('IT services');
    if (/fintech|insurance tech/i.test(notes + sectorFocus)) techTerms.push('Fintech');
    if (/healthcare IT|HCIT/i.test(notes + sectorFocus)) techTerms.push('Healthcare IT');
    if (/Value Creation|Portfolio Ops|Operating Partner/i.test(notes)) techTerms.push('Value Creation/Ops team');
    techSignals = techTerms.join('; ') || 'None detected';

    // Extract recent news
    let recentNews = '';
    const newsMatches = notes.match(/Recent[:\s]+[^.]+\./i);
    const fundMatches = notes.match(/Fund\s+[IVXLC]+[^.]*\d{4}[^.]*/i);
    const dealMatches = notes.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+202[456][^.]*\./g);
    const parts = [];
    if (newsMatches) parts.push(newsMatches[0]);
    if (fundMatches) parts.push(fundMatches[0]);
    if (!newsMatches && dealMatches) parts.push(...dealMatches.slice(0, 2));
    recentNews = parts.join(' | ').substring(0, 300) || 'No recent news found';

    intelRows.push([
      company,
      String(i + 1), // CRM row number (1-indexed, header is row 1)
      website,
      portfolioCos,
      sectorFocus,
      aum,
      techSignals,
      recentNews
    ]);
    console.log(`Parsed: ${company}`);
  }

  // Check if "Company Intel" sheet exists, create if not
  const meta = await sheets.spreadsheets.get({spreadsheetId: SHEET_ID});
  const existingSheets = meta.data.sheets.map(s => s.properties.title);
  
  if (!existingSheets.includes('Company Intel')) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          addSheet: { properties: { title: 'Company Intel' } }
        }]
      }
    });
    console.log('Created "Company Intel" sheet');
  }

  // Write data
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Company Intel!A1',
    valueInputOption: 'RAW',
    requestBody: { values: intelRows }
  });

  console.log(`\nWrote ${intelRows.length} rows (including header) to Company Intel sheet`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
