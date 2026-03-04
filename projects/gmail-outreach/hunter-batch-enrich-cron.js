// Hunter.io Batch Enrichment for PE Leads (Cron Job)
// Date: March 3rd, 2026 - 8:06 AM
const https = require('https');
const { google } = require('googleapis');

const HUNTER_KEY = 'f9f608d7a2a76885122f0e8a2f6d3430d5242313';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function hunterFind(domain, firstName, lastName) {
  let path = `/email-finder?domain=${encodeURIComponent(domain)}`;
  if (firstName) path += `&first_name=${encodeURIComponent(firstName)}`;
  if (lastName) path += `&last_name=${encodeURIComponent(lastName)}`;
  path += `&api_key=${HUNTER_KEY}`;
  
  return new Promise((resolve, reject) => {
    https.get(`https://api.hunter.io/v2${path}`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${data.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: __dirname + '/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Enrichment targets from analysis
  const targets = [
    { row: 5, firm: 'Regal Healthcare Capital Partners', contact: 'Jon Santemma', domain: 'regalhcp.com' },
    { row: 6, firm: 'Regal Healthcare Capital Partners', contact: 'Terry Wang', domain: 'regalhcp.com' },
    { row: 7, firm: 'SDC Capital Partners', contact: 'Doug Kaden', domain: 'sdccapitalpartners.com' },
    { row: 8, firm: 'Rockbridge Growth Equity, LLC', contact: 'Spencer Hughes', domain: 'rbequity.com' },
    { row: 9, firm: 'Aeris Partners', contact: 'David Joncas', domain: 'aerispartners.com' },
    { row: 10, firm: 'Alvarez & Marsal Capital', contact: 'Jack McCarthy', domain: 'a-mcapital.com' },
    { row: 11, firm: 'Blue Star Innovation Partners', contact: 'Rob Wechsler', domain: 'bluestarinnovationpartners.com' },
    { row: 12, firm: 'Casa Verde Capital', contact: 'Karan Wadhera', domain: 'casaverdecapital.com' },
    { row: 13, firm: 'Cornell Capital', contact: 'Henry Cornell', domain: 'cornellcapllc.com' },
  ];

  console.log(`Hunter.io Batch Enrichment - ${new Date().toISOString()}\n`);
  
  let found = 0, notFound = 0;
  const results = [];

  for (const t of targets) {
    const [firstName, ...lastParts] = t.contact.split(' ');
    const lastName = lastParts.join(' ');
    
    console.log(`[${t.row}] ${t.firm} - ${t.contact}`);
    
    try {
      const res = await hunterFind(t.domain, firstName, lastName);
      
      if (res.data && res.data.email) {
        const email = res.data.email;
        const confidence = res.data.confidence || 'N/A';
        const sources = res.data.sources ? res.data.sources.map(s => s.domain).slice(0, 2).join(', ') : '';
        
        console.log(`  ✅ FOUND: ${email} (confidence: ${confidence})`);
        console.log(`  Sources: ${sources}\n`);
        
        found++;
        results.push({ ...t, email, confidence, sources });
        
        // Update sheet
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!D${t.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[email]] }
        });
        
        // Update status to "Enriched - Hunter.io"
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!I${t.row}`,
          valueInputOption: 'RAW',
          resource: { values: [['Enriched - Hunter.io']] }
        });
        
        // Add notes with source
        const note = `Hunter.io: ${email} (${confidence}% confidence, sources: ${sources}) - ${new Date().toISOString().split('T')[0]}`;
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!K${t.row}`,
          valueInputOption: 'RAW',
          resource: { values: [[note]] }
        });
        
        console.log(`  Sheet updated row ${t.row}\n`);
        
      } else {
        console.log(`  ❌ Not found\n`);
        notFound++;
      }
      
      await sleep(1000); // Rate limiting
      
    } catch (err) {
      console.error(`  ERROR: ${err.message}\n`);
      notFound++;
      if (err.message.includes('429')) {
        console.log('Rate limited, waiting 10s...');
        await sleep(10000);
      }
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Searches attempted: ${targets.length}`);
  console.log(`Emails found: ${found}`);
  console.log(`Not found: ${notFound}`);
  console.log(`Success rate: ${(found / targets.length * 100).toFixed(1)}%`);
  
  if (results.length > 0) {
    console.log('\n=== ENRICHED CONTACTS ===');
    results.forEach(r => {
      console.log(`${r.firm}: ${r.contact} → ${r.email} (${r.confidence}%)`);
    });
  }
  
  console.log('\nCron job complete.');
}

main().catch(console.error);
