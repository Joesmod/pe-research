// Priority Hunter batch - maximize 15 remaining searches
// Strategy: email-finder for named contacts, domain-search for unnamed
const https = require('https');
const { google } = require('googleapis');

const API_KEY = 'f9f608d7a2a76885122f0e8a2f6d3430d5242313';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function hunterReq(path) {
  const url = `https://api.hunter.io/v2${path}${path.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

function hunterVerify(email) {
  return hunterReq(`/email-verifier?email=${encodeURIComponent(email)}`);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const auth = new google.auth.GoogleAuth({ keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A1:L200' });
  const rows = res.data.values;
  const h = rows[0];
  const cols = { email: h.indexOf('Email'), name: h.indexOf('Contact Name'), website: h.indexOf('Website'), 
                 company: h.indexOf('Company Name'), title: h.indexOf('Title'), notes: h.indexOf('Notes') };
  
  const genericPrefixes = ['info@','ir@','deals@','contact','epteam@','press@','business','media@'];
  
  // Build priority list: firms with named decision-makers first
  const withName = [], withoutName = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const email = (r[cols.email] || '').trim().toLowerCase();
    const website = (r[cols.website] || '').trim();
    const contact = (r[cols.name] || '').trim();
    const company = (r[cols.company] || '').trim();
    
    const isGeneric = !email || genericPrefixes.some(p => email.startsWith(p));
    if (!isGeneric || !website) continue;
    
    let domain;
    try { domain = new URL(website).hostname.replace('www.', ''); } catch { continue; }
    
    const entry = { row: i, company, contact, domain, email };
    
    // Parse name
    if (contact && !contact.startsWith('Not ')) {
      const primary = contact.split('/')[0].trim();
      const parts = primary.split(' ').filter(p => !['Dr.','Mr.','Mrs.','Ms.'].includes(p));
      if (parts.length >= 2) {
        entry.firstName = parts[0];
        entry.lastName = parts[parts.length - 1];
        withName.push(entry);
        continue;
      }
    }
    withoutName.push(entry);
  }
  
  console.log(`With named contacts: ${withName.length}`);
  console.log(`Without named contacts: ${withoutName.length}`);
  
  const MAX_SEARCHES = 14; // keep 1 buffer
  let searchCount = 0;
  const results = [];
  const toVerify = [];
  
  // Phase 1: email-finder for named contacts (1 search each)
  for (const entry of withName) {
    if (searchCount >= MAX_SEARCHES) break;
    
    console.log(`\n[Search ${searchCount+1}/${MAX_SEARCHES}] ${entry.company} (${entry.domain}) — ${entry.firstName} ${entry.lastName}`);
    
    try {
      const path = `/email-finder?domain=${encodeURIComponent(entry.domain)}&first_name=${encodeURIComponent(entry.firstName)}&last_name=${encodeURIComponent(entry.lastName)}`;
      const result = await hunterReq(path);
      searchCount++;
      
      if (result.data && result.data.email && result.data.confidence > 0) {
        console.log(`  ✓ ${result.data.email} (confidence: ${result.data.confidence})`);
        results.push({ ...entry, foundEmail: result.data.email, confidence: result.data.confidence, method: 'finder' });
        if (result.data.confidence < 90) {
          toVerify.push({ ...entry, foundEmail: result.data.email });
        }
      } else {
        console.log(`  ✗ No result`);
      }
      await sleep(1200);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }
  
  // Phase 2: domain-search for firms without names (uses remaining budget)
  for (const entry of withoutName) {
    if (searchCount >= MAX_SEARCHES) break;
    
    console.log(`\n[Search ${searchCount+1}/${MAX_SEARCHES}] ${entry.company} (${entry.domain}) — domain search`);
    
    try {
      const result = await hunterReq(`/domain-search?domain=${encodeURIComponent(entry.domain)}&limit=5`);
      searchCount++;
      
      if (result.data && result.data.emails && result.data.emails.length > 0) {
        // Find decision-makers
        const titles = ['partner', 'managing director', 'principal', 'founder', 'ceo', 'president', 'director'];
        const sorted = result.data.emails.sort((a, b) => {
          const aScore = titles.some(t => (a.position || '').toLowerCase().includes(t)) ? 100 : 0;
          const bScore = titles.some(t => (b.position || '').toLowerCase().includes(t)) ? 100 : 0;
          return (bScore + b.confidence) - (aScore + a.confidence);
        });
        const best = sorted[0];
        console.log(`  ✓ ${best.value} — ${best.first_name} ${best.last_name} (${best.position || 'no title'}, confidence: ${best.confidence})`);
        results.push({ ...entry, foundEmail: best.value, confidence: best.confidence, method: 'domain-search',
          foundName: `${best.first_name} ${best.last_name}`, foundTitle: best.position });
      } else {
        console.log(`  ✗ No results`);
      }
      await sleep(1200);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }
  
  // Phase 3: Verify high-value finds (use remaining verifications)
  console.log(`\n=== VERIFICATION PHASE ===`);
  let verifyCount = 0;
  const MAX_VERIFY = 25; // save 5 buffer
  
  for (const r of results) {
    if (verifyCount >= MAX_VERIFY) break;
    console.log(`\nVerifying: ${r.foundEmail}`);
    try {
      const vr = await hunterVerify(r.foundEmail);
      verifyCount++;
      if (vr.data) {
        r.verified = vr.data.status;
        r.verifyScore = vr.data.score;
        console.log(`  ${vr.data.status} (score: ${vr.data.score})`);
      }
      await sleep(1200);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }
  
  // Phase 4: Update sheet with verified results only
  console.log(`\n=== UPDATING SHEET ===`);
  const verified = results.filter(r => r.verified === 'valid' || r.verified === 'accept_all' || (r.confidence >= 90 && !r.verified));
  
  for (const r of verified) {
    const rowIdx = r.row + 1; // 1-indexed sheet row
    const currentRow = rows[r.row];
    const updates = [];
    
    // Update email
    updates.push({ range: `Sheet1!${String.fromCharCode(65 + cols.email)}${rowIdx}`, values: [[r.foundEmail]] });
    
    // Update contact name if found via domain-search
    if (r.foundName && !(currentRow[cols.name] || '').trim()) {
      updates.push({ range: `Sheet1!${String.fromCharCode(65 + cols.name)}${rowIdx}`, values: [[r.foundName]] });
    }
    if (r.foundTitle && !(currentRow[cols.title] || '').trim()) {
      updates.push({ range: `Sheet1!${String.fromCharCode(65 + cols.title)}${rowIdx}`, values: [[r.foundTitle]] });
    }
    
    // Update notes
    const currentNotes = (currentRow[cols.notes] || '');
    const note = ` [Hunter ${r.method} 2026-02-16: ${r.foundEmail}, confidence ${r.confidence}${r.verified ? ', verified: ' + r.verified : ''}]`;
    updates.push({ range: `Sheet1!${String.fromCharCode(65 + cols.notes)}${rowIdx}`, values: [[currentNotes + note]] });
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: { valueInputOption: 'RAW', data: updates }
    });
    console.log(`  Updated row ${rowIdx}: ${r.company} → ${r.foundEmail}`);
  }
  
  // Summary
  console.log(`\n========== SUMMARY ==========`);
  console.log(`Searches used: ${searchCount}`);
  console.log(`Verifications used: ${verifyCount}`);
  console.log(`Emails found: ${results.length}`);
  console.log(`Verified & updated: ${verified.length}`);
  console.log(`\nAll results:`);
  results.forEach(r => {
    const status = r.verified ? ` [${r.verified}, score: ${r.verifyScore}]` : ` [unverified]`;
    const updated = verified.includes(r) ? ' ✓ UPDATED' : ' ✗ SKIPPED';
    console.log(`  ${r.company}: ${r.foundEmail} (confidence: ${r.confidence})${status}${updated}`);
  });
}

main().catch(console.error);
