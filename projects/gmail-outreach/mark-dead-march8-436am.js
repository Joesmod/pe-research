const { google } = require('googleapis');

// Mark non-PE firms as Dead based on research 2026-03-08

const deadLeads = [
  { row: 834, company: 'Arcis Golf', reason: 'Golf course operator (PE portfolio company), not a PE firm. Backed by Fortress/Atairos.' },
  { row: 819, company: 'Accelerize 360', reason: 'Salesforce consulting partner. Data analytics services, not PE.' },
  { row: 838, company: 'Atlanta Tech Village', reason: 'Coworking space and startup incubator, not a PE firm.' },
  { row: 826, company: 'Alari Search, LLC', reason: 'Executive search/recruiting firm. Services PE but does not invest.' },
  { row: 827, company: 'AlchemistX', reason: 'Technology accelerator program, not a PE firm.' },
  { row: 830, company: 'All Raise', reason: 'Non-profit supporting women in VC/startups. Not an investment firm.' },
  { row: 837, company: 'Ascension Advisory', reason: 'M&A and strategic advisory firm, not a PE investor.' },
  { row: 840, company: 'Atlas Search', reason: 'Executive search and recruiting firm for PE/VC. Not an investor.' },
  { row: 816, company: '414 Capital', reason: 'M&A advisory/investment banking (Mexico). Services PE but does not invest.' }
];

async function markDeadLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('🗑️  Marking non-PE firms as Dead...\n');
  
  for (const lead of deadLeads) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!C${lead.row}:J${lead.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'Not a PE Firm',
            '',
            '',
            '',
            '',
            '',
            lead.reason,
            'Dead - Not PE'
          ]]
        }
      });
      console.log(`✅ Row ${lead.row}: ${lead.company} → Dead`);
    } catch (error) {
      console.error(`❌ Failed row ${lead.row}:`, error.message);
    }
  }
  
  console.log(`\n✅ Marked ${deadLeads.length} non-PE firms as Dead`);
}

markDeadLeads().catch(console.error);
