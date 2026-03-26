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

function fetchPage(url, redirects = 3) {
  return new Promise((resolve) => {
    if (redirects <= 0) return resolve('');
    let resolved = false;
    const done = (val) => { if (!resolved) { resolved = true; resolve(val); } };
    const timeout = setTimeout(() => { done(''); }, 6000);
    try {
      const proto = url.startsWith('https') ? https : http;
      const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          clearTimeout(timeout);
          try {
            const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
            return resolve(fetchPage(loc, redirects - 1));
          } catch(e) { done(''); }
          return;
        }
        let b = '';
        res.on('data', c => { b += c; if (b.length > 200000) { res.destroy(); clearTimeout(timeout); done(b); } });
        res.on('end', () => { clearTimeout(timeout); done(b); });
        res.on('error', () => { clearTimeout(timeout); done(''); });
      });
      req.on('error', () => { clearTimeout(timeout); done(''); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timeout); done(''); });
      req.end();
    } catch(e) { clearTimeout(timeout); done(''); }
  });
}

function extractText(html) {
  // Strip scripts, styles, then tags
  let t = html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t.slice(0, 10000);
}

function extractIntel(text, firmName) {
  const lower = text.toLowerCase();
  
  // Sector detection
  const sectors = [];
  const sectorMap = {
    'healthcare': 'Healthcare', 'health care': 'Healthcare',
    'technology': 'Technology', 'software': 'Software/Technology',
    'industrials': 'Industrials', 'industrial': 'Industrials',
    'consumer': 'Consumer', 'retail': 'Consumer/Retail',
    'financial services': 'Financial Services', 'fintech': 'Fintech',
    'business services': 'Business Services', 'services': 'Business Services',
    'manufacturing': 'Manufacturing', 'aerospace': 'Aerospace & Defense',
    'defense': 'Aerospace & Defense', 'energy': 'Energy',
    'media': 'Media & Entertainment', 'entertainment': 'Media & Entertainment',
    'education': 'Education', 'edtech': 'Education/EdTech',
    'real estate': 'Real Estate', 'food': 'Food & Beverage',
    'beverage': 'Food & Beverage', 'logistics': 'Logistics & Distribution',
    'distribution': 'Distribution', 'telecom': 'Telecommunications',
    'infrastructure': 'Infrastructure', 'life sciences': 'Life Sciences',
    'pharma': 'Pharma', 'biotech': 'Biotech',
    'insurance': 'Insurance', 'government': 'Government Services',
    'environmental': 'Environmental Services', 'agriculture': 'Agriculture',
  };
  
  for (const [keyword, sector] of Object.entries(sectorMap)) {
    if (lower.includes(keyword) && !sectors.includes(sector)) {
      sectors.push(sector);
    }
  }
  
  // Try to extract description / portfolio info
  // Look for "about" section content or investment focus descriptions
  let portfolioInfo = '';
  
  // Find sentences about investments/portfolio/focus
  const sentences = text.split(/[.!]\s/);
  const relevant = sentences.filter(s => {
    const sl = s.toLowerCase();
    return (sl.includes('invest') || sl.includes('portfolio') || sl.includes('partner') || 
            sl.includes('focus') || sl.includes('strategy') || sl.includes('sector') ||
            sl.includes('billion') || sl.includes('million') || sl.includes('fund')) &&
           s.length > 30 && s.length < 500;
  }).slice(0, 3);
  
  if (relevant.length) {
    portfolioInfo = relevant.join('. ').slice(0, 400);
  }
  
  return {
    sectorFocus: sectors.slice(0, 6).join(', '),
    portfolioInfo: portfolioInfo
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:M' });
  const rows = res.data.values || [];
  const data = rows.slice(1);

  const needsIntel = [];
  data.forEach((row, idx) => {
    const hasContact = row[1] && row[1].trim();
    const hasSector = row[6] && row[6].trim();
    const hasPortfolio = row[7] && row[7].trim();
    const website = row[4] && row[4].trim();
    if (hasContact && (!hasSector || !hasPortfolio) && website) {
      needsIntel.push({ name: row[0], website, rowIdx: idx + 2 });
    }
  });

  const LIMIT = parseInt(process.argv[2]) || needsIntel.length;
  const batch = needsIntel.slice(0, LIMIT);
  console.log(`${needsIntel.length} firms need intel. Processing ${batch.length}...`);

  let enriched = 0, noData = 0, errors = 0;
  let batchUpdates = [];
  const startTime = Date.now();

  for (let i = 0; i < batch.length; i++) {
    const firm = batch[i];
    try {
      const html = await fetchPage(firm.website);
      if (!html || html.length < 100) { noData++; continue; }

      const text = extractText(html);
      const intel = extractIntel(text, firm.name);

      if (intel.sectorFocus || intel.portfolioInfo) {
        if (intel.sectorFocus) {
          batchUpdates.push({ range: `Sheet1!G${firm.rowIdx}`, values: [[intel.sectorFocus]] });
        }
        if (intel.portfolioInfo) {
          batchUpdates.push({ range: `Sheet1!H${firm.rowIdx}`, values: [[intel.portfolioInfo]] });
        }
        enriched++;
      } else {
        noData++;
      }

      // Batch write every 20 firms
      if (batchUpdates.length >= 40) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: { valueInputOption: 'RAW', data: batchUpdates }
        });
        batchUpdates = [];
      }

      if ((i + 1) % 25 === 0) {
        const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
        console.log(`[${elapsed}m] ${i+1}/${batch.length} | enriched: ${enriched} | no data: ${noData} | errors: ${errors}`);
      }

      await sleep(500); // polite crawling
    } catch (err) {
      errors++;
      if ((i + 1) % 25 === 0) console.error(`Error on ${firm.name}: ${err.message}`);
    }
  }

  // Flush remaining
  if (batchUpdates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: batchUpdates }
    });
  }

  // Final count
  const finalRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:H' });
  const finalData = (finalRes.data.values || []).slice(1);
  const total = finalData.length;
  const withSector = finalData.filter(r => r[6]?.trim()).length;
  const withPortfolio = finalData.filter(r => r[7]?.trim()).length;

  console.log(`\n=== DONE ===`);
  console.log(`Processed: ${batch.length} | Enriched: ${enriched} | No data: ${noData} | Errors: ${errors}`);
  console.log(`CRM: ${total} total firms | ${withSector} w/ sector (${Math.round(withSector/total*100)}%) | ${withPortfolio} w/ portfolio (${Math.round(withPortfolio/total*100)}%)`);
}

main().catch(console.error);
