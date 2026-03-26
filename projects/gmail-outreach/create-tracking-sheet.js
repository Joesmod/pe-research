const fs = require('fs');
const {google} = require('googleapis');

const CREDS_PATH = __dirname + '/service-account.json';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async () => {
  // Load sent emails
  const sentEmails = JSON.parse(fs.readFileSync('sent-emails.json'));
  
  // Filter out lemwarmup and test emails
  const realOutreach = sentEmails.filter(email => {
    const subject = email.subject || '';
    const to = email.to || '';
    
    // Skip lemwarmup, Apollo testers, and internal emails
    if (subject.includes('lemwarmup')) return false;
    if (to.includes('apollomailtester')) return false;
    if (to.includes('@hellogumbo.com')) return false;
    if (to.includes('aljensen92@gmail.com')) return false;
    
    return true;
  });
  
  console.log(`Filtered to ${realOutreach.length} real outreach emails (from ${sentEmails.length} total)`);
  
  // Parse into tracking rows
  const rows = realOutreach.map(email => {
    const to = email.to || '';
    const emailMatch = to.match(/<(.+?)>/);
    const emailAddr = emailMatch ? emailMatch[1] : to.split('<')[0].trim();
    const nameMatch = to.match(/^(.+?)\s*</);
    const contactName = nameMatch ? nameMatch[1].trim() : '';
    
    const domain = emailAddr.split('@')[1] || '';
    const company = domain.replace(/\.com|\.io|\.net|partners|capital|equity/gi, '').trim();
    
    const dateStr = email.date || '';
    const parsedDate = new Date(dateStr);
    const formattedDate = parsedDate.toISOString().split('T')[0];
    
    return [
      formattedDate,           // Date
      company,                 // Company (inferred from domain)
      contactName,             // Contact Name
      emailAddr,               // Email
      email.subject || '',     // Subject
      'Sent'                   // Status
    ];
  });
  
  // Sort by date (newest first)
  rows.sort((a, b) => b[0].localeCompare(a[0]));
  
  // Add header row
  const headers = ['Date', 'Company', 'Contact', 'Email', 'Subject', 'Status'];
  const allRows = [headers, ...rows];
  
  console.log(`\nCreating tracking sheet with ${rows.length} rows...`);
  
  // Auth with service account
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});
  
  // Create new sheet
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      requests: [{
        addSheet: {
          properties: {
            title: 'Outreach Log',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      }]
    }
  });
  
  console.log('✅ Created "Outreach Log" sheet');
  
  // Write data
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Outreach Log!A1',
    valueInputOption: 'RAW',
    resource: {
      values: allRows
    }
  });
  
  console.log(`✅ Wrote ${rows.length} outreach emails to tracking sheet`);
  console.log(`\nSheet URL: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`);
  
  // Show summary
  console.log(`\nSummary:`);
  console.log(`- Total sent emails: ${sentEmails.length}`);
  console.log(`- Real PE outreach: ${rows.length}`);
  console.log(`- Lemwarmup/test emails: ${sentEmails.length - rows.length}`);
  
})().catch(e => console.error('Error:', e.message));
