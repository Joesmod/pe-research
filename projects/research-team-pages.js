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

function fetchUrl(url, maxLen = 200000, timeoutMs = 12000) {
  return new Promise((resolve) => {
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        timeout: timeoutMs
      }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let loc = res.headers.location;
          if (loc.startsWith('/')) { try { const u = new URL(url); loc = u.origin + loc; } catch(e){} }
          return fetchUrl(loc, maxLen, timeoutMs).then(resolve);
        }
        if (res.statusCode !== 200) { resolve(''); return; }
        let b = '';
        res.on('data', c => { b += c; if (b.length > maxLen) res.destroy(); });
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
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}

function findPersonBio(text, name) {
  const lastName = name.split(' ').pop().toLowerCase();
  const firstName = name.split(' ')[0].toLowerCase();
  const textLower = text.toLowerCase();
  
  // Find the position of the person's name
  let idx = textLower.indexOf(name.toLowerCase());
  if (idx === -1) idx = textLower.indexOf(lastName);
  if (idx === -1) return null;
  
  // Extract ~500 chars around their name mention
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + 600);
  let bio = text.slice(start, end).trim();
  
  // Try to find education
  const eduMatch = bio.match(/(?:MBA|Harvard|Stanford|Wharton|MIT|Columbia|Yale|Princeton|Northwestern|Duke|Cornell|Georgetown|UChicago|Berkeley|Booth|Kellogg|Oxford|Cambridge|B\.?A\.?|B\.?S\.?|M\.?S\.?|Ph\.?D)/gi);
  const edu = eduMatch ? [...new Set(eduMatch)].join(', ') : '';
  
  // Check for AI/tech mentions
  const techMatch = bio.match(/(?:artificial intelligence|machine learning|digital transformation|AI|data analytics|automation|cloud|SaaS|technology|software|digital)/gi);
  const tech = techMatch ? [...new Set(techMatch)].join(', ') : '';
  
  return { bio: bio.slice(0, 500), edu, tech };
}

async function main() {
  // Get contacts and company websites
  const [contactsRes, firmsRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Contacts!A:H' }),
    sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:M' })
  ]);
  
  const contactRows = contactsRes.data.values || [];
  const firmRows = firmsRes.data.values || [];
  
  // Ensure Research Notes header
  if (!contactRows[0][7] || contactRows[0][7] !== 'Research Notes') {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID, range: 'Contacts!H1',
      valueInputOption: 'RAW', requestBody: { values: [['Research Notes']] }
    });
  }
  
  // Build company website map
  const companyWebsites = {};
  firmRows.slice(1).forEach(row => {
    if (row[0] && row[4]) companyWebsites[row[0].toLowerCase().trim()] = row[4].trim();
  });
  
  // Get contacts needing research, grouped by company
  const byCompany = {};
  contactRows.forEach((row, i) => {
    if (i === 0) return;
    const score = parseInt(row[1]);
    if (isNaN(score) || score < 7) return; // Score 7+ for now
    const hasNotes = row[7] && row[7].trim().length > 10;
    if (hasNotes) return;
    
    const co = (row[0] || '').trim();
    if (!byCompany[co]) byCompany[co] = { score, contacts: [] };
    byCompany[co].contacts.push({
      rowIdx: i + 1, name: row[2] || '', title: row[3] || '', li: row[6] || ''
    });
  });
  
  // Sort companies by score
  const companies = Object.entries(byCompany).sort((a,b) => b[1].score - a[1].score);
  console.log(`${companies.length} companies to research, ${companies.reduce((s,c)=>s+c[1].contacts.length,0)} contacts`);
  
  let totalDone = 0, totalEnriched = 0, totalFailed = 0;
  const startTime = Date.now();
  const batch = [];
  
  const teamPaths = ['/team', '/our-team', '/about', '/people', '/professionals', 
    '/leadership', '/about-us', '/who-we-are', '/about/team', '/about/leadership',
    '/team-members', '/about/people'];
  
  for (const [company, data] of companies) {
    const website = companyWebsites[company.toLowerCase()];
    if (!website) {
      // No website, mark as no data
      for (const c of data.contacts) {
        batch.push({ range: `Contacts!H${c.rowIdx}`, values: [['No company website']] });
        totalFailed++; totalDone++;
      }
      continue;
    }
    
    const base = website.replace(/\/$/, '');
    let teamText = '';
    
    // Try team pages
    for (const p of teamPaths) {
      const url = base + p;
      try {
        const html = await fetchUrl(url);
        if (html.length > 500) {
          const text = extractText(html);
          // Check if any contact names appear
          const hasNames = data.contacts.some(c => 
            c.name && text.toLowerCase().includes(c.name.split(' ').pop().toLowerCase())
          );
          if (hasNames) {
            teamText = text;
            console.log(`  Found team page: ${url} (${text.length} chars)`);
            break;
          }
        }
      } catch(e) {}
      await sleep(200);
    }
    
    // Also try individual profile pages
    for (const contact of data.contacts) {
      let notes = [];
      
      if (teamText && contact.name) {
        const info = findPersonBio(teamText, contact.name);
        if (info) {
          if (info.bio) notes.push(`Bio: ${info.bio}`);
          if (info.edu) notes.push(`Edu: ${info.edu}`);
          if (info.tech) notes.push(`Tech interests: ${info.tech}`);
        }
      }
      
      // Try individual profile URL on company site
      if (notes.length === 0 && contact.name) {
        const slug = contact.name.toLowerCase().replace(/\s+/g, '-');
        const profileUrls = [
          `${base}/team/${slug}`, `${base}/people/${slug}`,
          `${base}/professionals/${slug}`, `${base}/team-member/${slug}`
        ];
        for (const pUrl of profileUrls) {
          try {
            const html = await fetchUrl(pUrl, 100000, 6000);
            if (html.length > 500) {
              const text = extractText(html);
              if (text.toLowerCase().includes(contact.name.split(' ').pop().toLowerCase())) {
                const bio = text.slice(0, 800);
                notes.push(`Bio: ${bio}`);
                
                const eduMatch = bio.match(/(?:MBA|Harvard|Stanford|Wharton|MIT|Columbia|Yale|Princeton|Northwestern|Duke|Cornell|Georgetown|UChicago|Berkeley)/gi);
                if (eduMatch) notes.push(`Edu: ${[...new Set(eduMatch)].join(', ')}`);
                
                const techMatch = bio.match(/(?:artificial intelligence|machine learning|digital|AI|automation|technology|software|SaaS)/gi);
                if (techMatch) notes.push(`Tech: ${[...new Set(techMatch)].join(', ')}`);
                break;
              }
            }
          } catch(e) {}
          await sleep(200);
        }
      }
      
      const noteStr = notes.length > 0 ? notes.join(' | ').slice(0, 1500) : 'No public bio found';
      batch.push({ range: `Contacts!H${contact.rowIdx}`, values: [[noteStr]] });
      if (notes.length > 0) totalEnriched++; else totalFailed++;
      totalDone++;
    }
    
    // Flush batch periodically
    if (batch.length >= 20) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { valueInputOption: 'RAW', data: [...batch] }
      });
      batch.length = 0;
      const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
      console.log(`${totalDone} done | ${totalEnriched} enriched | ${totalFailed} no data [${elapsed}m]`);
    }
    
    await sleep(500);
  }
  
  // Flush remaining
  if (batch.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: [...batch] }
    });
  }
  
  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n=== DONE === ${totalDone} contacts | ${totalEnriched} enriched | ${totalFailed} no data [${elapsed}m]`);
}

main().catch(e => console.error('FATAL:', e));
