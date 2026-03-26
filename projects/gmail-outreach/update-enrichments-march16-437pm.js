const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = path.join(__dirname, 'service-account.json');

async function getSheetClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function updateContacts() {
  const sheets = await getSheetClient();
  
  const enrichments = [
    {
      row: 49,
      email: 'Seth.Brody@apax.com',
      emailStatus: 'Pattern verified (84% conf - LeadIQ)',
      linkedin: 'https://www.linkedin.com/in/seth-brody-6721511/',
      notes: 'Partner, Global Head Operational Excellence. Email pattern First.Last@apax.com verified via LeadIQ. Source: apax.com official website. Enriched 2026-03-16 cron.'
    },
    {
      row: 689,
      email: 'slefkowitz@sagewindcapital.com',
      emailStatus: 'Pattern verified (75% conf - ContactOut)',
      linkedin: 'https://www.linkedin.com/in/steven-lefkowitz-7aa250a5/',
      notes: 'Co-Founder & CEO. Email pattern {first_initial}{last}@sagewindcapital.com verified via ContactOut. Source: sagewindcapital.com official website. Enriched 2026-03-16 cron.'
    },
    {
      row: 734,
      email: '',
      emailStatus: 'Dead - Acquired by Ares 2014',
      linkedin: '',
      notes: 'Keltic Financial Services LLC was acquired by Ares Management in June 2014. No longer an independent firm. Source: SEC filings + Ares Commercial Finance announcements. Marked dead 2026-03-16.'
    }
  ];
  
  console.log('📝 Updating Contacts sheet with enrichments...\n');
  
  for (const item of enrichments) {
    console.log(`Row ${item.row}: ${item.email || 'DEAD FIRM'}`);
    
    // Update Email (column E), Email Status (F), LinkedIn (G), Research Notes (H)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Contacts!E${item.row}:H${item.row}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[item.email, item.emailStatus, item.linkedin, item.notes]]
      }
    });
  }
  
  console.log('\n✅ Sheet updated successfully!');
  console.log('   - 2 emails enriched');
  console.log('   - 1 firm marked as dead');
}

updateContacts().catch(console.error);
