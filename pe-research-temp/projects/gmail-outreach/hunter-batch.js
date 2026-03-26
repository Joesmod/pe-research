// Batch Hunter.io email finder for leads missing emails
const https = require('https');
const { google } = require('googleapis');

const API_KEY = 'f9f608d7a2a76885122f0e8a2f6d3430d5242313';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function hunterFind(domain, firstName, lastName) {
  let path = `/email-finder?domain=${encodeURIComponent(domain)}`;
  if (firstName) path += `&first_name=${encodeURIComponent(firstName)}`;
  if (lastName) path += `&last_name=${encodeURIComponent(lastName)}`;
  path += `&api_key=${API_KEY}`;
  return new Promise((resolve, reject) => {
    https.get(`https://api.hunter.io/v2${path}`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function hunterSearch(domain, limit = 5) {
  const path = `/domain-search?domain=${encodeURIComponent(domain)}&limit=${limit}&api_key=${API_KEY}`;
  return new Promise((resolve, reject) => {
    https.get(`https://api.hunter.io/v2${path}`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
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
  
  // Read all data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:L200',
  });
  const rows = res.data.values;
  const header = rows[0];
  const emailCol = header.indexOf('Email');
  const nameCol = header.indexOf('Contact Name');
  const websiteCol = header.indexOf('Website');
  const companyCol = header.indexOf('Company Name');
  const notesCol = header.indexOf('Notes');
  
  console.log(`Total rows: ${rows.length - 1}`);
  
  const results = [];
  let searchCount = 0;
  const MAX_SEARCHES = 48; // save 2 for manual use
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const email = (row[emailCol] || '').trim();
    const contact = (row[nameCol] || '').trim();
    const website = (row[websiteCol] || '').trim();
    const company = (row[companyCol] || '').trim();
    
    // Skip if already has a real email (not info@ or generic)
    if (email && !email.startsWith('info@') && !email.startsWith('IR@') && 
        !email.startsWith('deals@') && !email.startsWith('contact') &&
        !email.startsWith('epteam@') && !email.startsWith('press@') &&
        !email.startsWith('business') && !email.startsWith('media@') &&
        !email.endsWith('@sardverb.com') && !email.endsWith('@prosek.com') &&
        !email.endsWith('@edelman.com') && !email.endsWith('@finnpartners.com')) {
      continue;
    }
    
    if (!website) continue;
    if (searchCount >= MAX_SEARCHES) {
      console.log(`\nHit search limit (${MAX_SEARCHES}). Stopping.`);
      break;
    }
    
    // Extract domain from website
    let domain;
    try {
      domain = new URL(website).hostname.replace('www.', '');
    } catch { continue; }
    
    // Parse contact name
    let firstName = '', lastName = '';
    if (contact) {
      // Handle "Name1 / Name2" format - use first person
      const primary = contact.split('/')[0].trim();
      const parts = primary.split(' ').filter(p => !['Dr.', 'Mr.', 'Mrs.', 'Ms.'].includes(p));
      if (parts.length >= 2) {
        firstName = parts[0];
        lastName = parts[parts.length - 1];
      }
    }
    
    console.log(`\n[${i}] ${company} (${domain}) — searching for ${firstName} ${lastName}...`);
    
    try {
      let found = null;
      
      // Try email-finder first if we have a name
      if (firstName && lastName) {
        const result = await hunterFind(domain, firstName, lastName);
        searchCount++;
        if (result.data && result.data.email && result.data.confidence > 0) {
          found = { email: result.data.email, confidence: result.data.confidence, method: 'finder' };
          console.log(`  FOUND: ${found.email} (confidence: ${found.confidence})`);
        } else {
          console.log(`  No result from finder`);
        }
      } else {
        // Domain search if no name
        const result = await hunterSearch(domain, 3);
        searchCount++;
        if (result.data && result.data.emails && result.data.emails.length > 0) {
          const best = result.data.emails.sort((a, b) => b.confidence - a.confidence)[0];
          found = { email: best.value, confidence: best.confidence, method: 'domain-search', name: `${best.first_name} ${best.last_name}`, position: best.position };
          console.log(`  FOUND via domain search: ${found.email} (${found.name}, ${found.position}, confidence: ${found.confidence})`);
        } else {
          console.log(`  No results from domain search`);
        }
      }
      
      if (found) {
        results.push({ row: i + 1, company, ...found });
        
        // Update sheet immediately
        const updates = [];
        if (!email || email.startsWith('info@') || email.startsWith('IR@') || email.startsWith('deals@') || email.startsWith('contact') || email.startsWith('epteam@') || email.startsWith('press@') || email.startsWith('business') || email.startsWith('media@')) {
          updates.push({
            range: `Sheet1!${String.fromCharCode(65 + emailCol)}${i + 1}`,
            values: [[found.email]]
          });
        }
        // Append hunter info to notes
        const currentNotes = (row[notesCol] || '');
        const hunterNote = ` Hunter.io ${found.method}: ${found.email} (confidence: ${found.confidence}). 2026-02-16.`;
        updates.push({
          range: `Sheet1!${String.fromCharCode(65 + notesCol)}${i + 1}`,
          values: [[currentNotes + hunterNote]]
        });
        
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: { valueInputOption: 'RAW', data: updates }
        });
        console.log(`  Updated sheet row ${i + 1}`);
      }
      
      await sleep(1200); // rate limit
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Searches used: ${searchCount}`);
  console.log(`Emails found: ${results.length}`);
  results.forEach(r => console.log(`  ${r.company}: ${r.email} (${r.confidence}%)`));
}

main().catch(console.error);
