/**
 * PE Research & Enrichment - Hourly Cron
 * Find 10-15 leads needing enrichment in Sheet1
 * Use web search to find decision-makers with verified emails
 */

const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function findLeadsNeedingEnrichment() {
  const sheets = await getSheets();
  
  // Read Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) return [];
  
  const headers = rows[0];
  const needsEnrichment = [];
  
  // Identify column indices
  const companyIdx = headers.findIndex(h => h && h.toLowerCase().includes('company'));
  const websiteIdx = headers.findIndex(h => h && (h.toLowerCase().includes('website') || h.toLowerCase().includes('notebooklm')));
  const contactIdx = headers.findIndex(h => h && h.toLowerCase().includes('contact') && !h.toLowerCase().includes('last'));
  const emailIdx = headers.findIndex(h => h && h.toLowerCase() === 'email');
  const statusIdx = headers.findIndex(h => h && h.toLowerCase() === 'status');
  
  console.log(`Column mapping: Company=${companyIdx}, Website=${websiteIdx}, Contact=${contactIdx}, Email=${emailIdx}, Status=${statusIdx}`);
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const website = row[websiteIdx] || '';
    const contactName = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    
    // Skip completed/dead leads
    if (['Dead', 'Bounced', 'Sent', 'Replied', 'Scheduled'].includes(status)) {
      continue;
    }
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') || 
      email.includes('contact@')
    );
    
    const needsContact = !contactName || contactName.trim() === '';
    const needsRealEmail = !email || email.trim() === '' || hasGenericEmail;
    
    if (needsContact || needsRealEmail) {
      needsEnrichment.push({
        rowIndex: i + 1, // 1-indexed
        company,
        website,
        contactName,
        email,
        status,
        needsContact,
        needsRealEmail
      });
    }
  }
  
  return needsEnrichment.slice(0, 15);
}

async function main() {
  console.log('🫡 PE Research & Enrichment - 8:07 AM CST\n');
  
  const leads = await findLeadsNeedingEnrichment();
  
  console.log(`✅ Found ${leads.length} leads needing enrichment\n`);
  
  if (leads.length === 0) {
    console.log('All leads are enriched!');
    return;
  }
  
  leads.forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.company || '(no company name)'} (Row ${lead.rowIndex})`);
    console.log(`   Website: ${lead.website || '(none)'}`);
    console.log(`   Current: ${lead.contactName || '(empty)'} / ${lead.email || '(empty)'}`);
    console.log(`   Needs: ${lead.needsContact ? 'Contact' : ''} ${lead.needsRealEmail ? 'Email' : ''}\n`);
  });
  
  console.log('💡 Ready for manual enrichment via web_search');
  console.log('Search for: CEO, CTO, COO, Managing Partner, Operating Partner, VP Tech, VP Operations, etc.');
  console.log('Verify emails from: official team pages, press releases, conference bios, official PDFs');
  console.log('\nNext: Use OpenClaw web_search to research each firm');
}

main().catch(console.error);
