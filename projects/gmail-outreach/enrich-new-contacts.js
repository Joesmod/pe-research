const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function enrichLeads() {
  const sheets = await getClient();
  
  // New contacts to append (firms already in sheet but need additional decision-makers)
  const newContacts = [
    ['American Industrial Partners', 'https://www.americanindustrial.com', 'Lawrence Steyn', 'Partner, Business Development', '', 'https://linkedin.com/in/lawrencesteyn', 'Industrial Manufacturing', '', 'Enriched', 'BD partner found on official team page americanindustrial.com/team. Email pattern likely firstname@americanindustrial.com per existing contact. NYC-based. 2026-03-09 cron enrichment'],
    ['American Industrial Partners', 'https://www.americanindustrial.com', 'Jamie Tam', 'Partner, Business Development', '', '', 'Industrial Manufacturing', '', 'Enriched', 'BD partner found on official team page americanindustrial.com/team. NYC-based. 2026-03-09 cron enrichment'],
    ['American Industrial Partners', 'https://www.americanindustrial.com', 'Daryl Yap', 'Partner, Business Development', '', '', 'Industrial Manufacturing', '', 'Enriched', 'BD partner found on official team page americanindustrial.com/team. NYC-based. 2026-03-09 cron enrichment'],
    ['Renovus Capital Partners', 'https://renovuscapital.com', 'Jason Tanker', 'Managing Director', '', 'https://linkedin.com/in/jtanker', 'Knowledge-Based Services', '', 'Enriched', 'Managing Director, Technology Services practice. Press release: renovuscapital.com/team-promotions. Wayne PA. $2B+ AUM. 2026-03-09 cron enrichment'],
    ['Vistria Group', 'https://vistria.com', 'Martin Nesbitt', 'Co-Founder, Co-CEO, Co-Chairman', '', '', 'Healthcare, Education', '', 'Enriched', 'Co-founder with Kip Kirkpatrick. Chicago-based. $8B+ AUM. Healthcare/education/financial services/housing sectors. 2026-03-09 cron enrichment'],
    ['Gemspring Capital', 'https://www.gemspring.com', 'Charles Fraas', 'Managing Director', '', '', 'Business Services', '', 'Enriched', 'Managing Director at Gemspring. Found on Crunchbase. Westport CT. $3.5B+ AUM. 2026-03-09 cron enrichment'],
    ['Quad-C Management', 'https://www.quadcmanagement.com', 'Joseph April', 'Managing Director, Portfolio Optimization', '', '', 'Business Services, Healthcare', '', 'Enriched', 'MD Portfolio Optimization. Charlottesville VA. $1.7B Fund X. Founded 1989. 50+ companies since inception. 2026-03-09 cron enrichment'],
    ['Water Street Healthcare Partners', 'https://www.waterstreet.com', 'Timothy Dugan', 'Founder', '', 'https://linkedin.com/in/tim-dugan', 'Healthcare Services', '', 'Enriched', 'Founded Water Street in 2005 with healthcare executives. Chicago. Healthcare-only focus. Official LinkedIn: /in/tim-dugan. 2026-03-09 cron enrichment']
  ];

  console.log(`Appending ${newContacts.length} new contacts...`);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: newContacts },
  });
  
  console.log(`✅ Successfully appended ${newContacts.length} enriched contacts`);
  console.log('\nEnriched firms:');
  console.log('- American Industrial Partners (3 BD partners)');
  console.log('- Renovus Capital Partners (1 MD)');
  console.log('- Vistria Group (1 co-founder)');
  console.log('- Gemspring Capital (1 MD)');
  console.log('- Quad-C Management (1 MD)');
  console.log('- Water Street Healthcare Partners (1 founder)');
}

enrichLeads().catch(console.error);
