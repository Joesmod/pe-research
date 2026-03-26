const path = require('path');
const https = require('https');
const http = require('http');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchUrl(url, maxLen = 50000, timeoutMs = 8000) {
  return new Promise((resolve) => {
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html', 'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: timeoutMs
      }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let loc = res.headers.location;
          if (loc.startsWith('/')) { const u = new URL(url); loc = u.origin + loc; }
          return fetchUrl(loc, maxLen, timeoutMs).then(resolve);
        }
        if (res.statusCode !== 200) { resolve(''); return; }
        let b = ''; 
        res.on('data', c => { b += c; if (b.length > maxLen) { res.destroy(); }});
        res.on('end', () => resolve(b.slice(0, maxLen)));
        res.on('error', () => resolve(''));
      });
      req.on('error', () => resolve(''));
      req.on('timeout', () => { req.destroy(); resolve(''); });
    } catch(e) { resolve(''); }
  });
}

function extractText(html) {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ').trim();
}

function parseLinkedIn(html, name) {
  const text = extractText(html);
  const notes = [];
  const lastName = name.split(' ').pop();
  
  // About/bio
  const aboutMatch = text.match(/About\s+([\s\S]{30,800}?)(?:Experience|Education|Activity|Patents|Licenses)/i);
  if (aboutMatch) {
    const bio = aboutMatch[1].trim().slice(0, 400);
    if (bio.length > 30 && !bio.match(/sign in|join now/i)) notes.push(`Bio: ${bio}`);
  }
  
  // Patents = tech-minded
  if ((text.match(/patent/gi) || []).length > 2) notes.push('Has patents (tech-minded)');
  
  // Education keywords
  const eduMatch = text.match(/(?:MBA|Harvard|Stanford|Wharton|MIT|Columbia|Yale|Princeton|Northwestern|Duke|Cornell|Georgetown|UChicago|Berkeley|Booth|Kellogg|Oxford|Cambridge|NYU Stern|Ross|Haas|Tuck|Darden|McCombs|Anderson|Fuqua)/gi);
  if (eduMatch) notes.push(`Edu: ${[...new Set(eduMatch.map(e => e.trim()))].join(', ')}`);
  
  // Recent activity topics
  const actParts = text.split(/(?:Liked by|Posted by|Shared by)/i).slice(1, 4);
  if (actParts.length) {
    const topics = actParts.map(a => a.slice(0, 150).trim()).filter(a => a.length > 20);
    if (topics.length) notes.push(`Recent interests: ${topics.join(' // ').slice(0, 400)}`);
  }
  
  // Check for AI/technology/digital mentions in the page
  const aiMentions = text.match(/(?:artificial intelligence|machine learning|digital transformation|AI |data analytics|automation|cloud|SaaS|technology transformation)/gi);
  if (aiMentions && aiMentions.length > 0) {
    notes.push(`AI/Tech mentions: ${[...new Set(aiMentions.map(m=>m.trim()))].slice(0,5).join(', ')}`);
  }
  
  return notes;
}

async function main() {
  // Get all contacts
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Contacts!A:H' });
  const rows = res.data.values || [];
  
  if (!rows[0][7] || rows[0][7] !== 'Research Notes') {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID, range: 'Contacts!H1',
      valueInputOption: 'RAW', requestBody: { values: [['Research Notes']] }
    });
  }

  const contacts = [];
  rows.slice(1).forEach((row, idx) => {
    const score = parseInt(row[1]);
    if (isNaN(score) || score < 5) return;
    const hasNotes = row[7] && row[7].trim().length > 10;
    if (!hasNotes) {
      contacts.push({
        rowIdx: idx + 2, company: row[0] || '', score,
        name: row[2] || '', title: row[3] || '',
        linkedin: row[6] || '',
      });
    }
  });

  contacts.sort((a, b) => b.score - a.score);
  console.log(`${contacts.length} contacts to research`);
  console.log(`9: ${contacts.filter(c=>c.score===9).length} | 8: ${contacts.filter(c=>c.score===8).length} | 7: ${contacts.filter(c=>c.score===7).length} | 6: ${contacts.filter(c=>c.score===6).length} | 5: ${contacts.filter(c=>c.score===5).length}`);

  let done = 0, enriched = 0, failed = 0;
  const startTime = Date.now();
  const batchSize = 10;
  let batch = [];

  for (const contact of contacts) {
    try {
      let notes = 'No public data found';
      
      if (contact.linkedin) {
        const html = await fetchUrl(contact.linkedin);
        if (html.length > 100) {
          const parsed = parseLinkedIn(html, contact.name);
          if (parsed.length > 0) {
            notes = parsed.join(' | ').slice(0, 1500);
          }
        }
      }
      
      batch.push({ range: `Contacts!H${contact.rowIdx}`, values: [[notes]] });
      if (notes !== 'No public data found') enriched++; else failed++;
      done++;

      if (batch.length >= batchSize) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: { valueInputOption: 'RAW', data: batch }
        });
        batch = [];
        const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
        console.log(`${done}/${contacts.length} | enriched: ${enriched} | no data: ${failed} [${elapsed}m]`);
      }

      await sleep(500); // polite rate limiting for LinkedIn
    } catch(e) {
      console.error(`Err ${contact.name}: ${e.message}`);
      batch.push({ range: `Contacts!H${contact.rowIdx}`, values: [['Error']] });
      failed++; done++;
    }
  }

  if (batch.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: batch }
    });
  }

  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n=== DONE === ${done} processed | ${enriched} enriched | ${failed} no data [${elapsed}m]`);
}

main().catch(e => console.error('FATAL:', e));
