const https = require('https');
const {google} = require('googleapis');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Well-known PE firms to enrich
const TARGET_FIRMS = [
  { rowIndex: 865, company: 'Mainsail Partners', website: 'https://mainsailpartners.com' },
  { rowIndex: 866, company: 'ParkerGale Capital', website: 'https://www.parkergale.com' },
  { rowIndex: 867, company: 'Peak Rock Capital', website: 'https://www.peakrockcapital.com' },
  { rowIndex: 868, company: 'Accel-KKR', website: 'https://www.accel-kkr.com' },
  { rowIndex: 858, company: 'CIVC Partners', website: 'https://www.civc.com' },
  { rowIndex: 860, company: 'CCMP Capital', website: 'https://www.ccmpcapital.com' },
  { rowIndex: 861, company: 'Wynnchurch Capital', website: 'https://www.wynnchurch.com' },
  { rowIndex: 870, company: 'Carousel Capital', website: 'https://www.carouselcapital.com' },
  { rowIndex: 872, company: 'Salt Creek Capital', website: 'https://saltcreekcap.com' },
  { rowIndex: 842, company: 'Wind Point Partners', website: 'https://www.windpointpartners.com' },
  { rowIndex: 843, company: 'American Industrial Partners', website: 'https://www.americanindustrial.com' },
  { rowIndex: 329, company: 'Pritzker Group Private Capital', website: 'https://www.pritzkergroup.com' }
];

function apolloPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'api.apollo.io', path, method: 'POST',
      headers: { 'x-api-key': APOLLO_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(new Error(d)); } });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function findContact(companyName) {
  try {
    // CAST A WIDE NET - search for ANY decision-maker
    const titles = [
      'Chief Technology Officer', 'CTO',
      'Chief Operating Officer', 'COO',
      'Chief Executive Officer', 'CEO',
      'Chief Marketing Officer', 'CMO',
      'Chief Financial Officer', 'CFO',
      'Managing Partner', 'General Partner', 'Operating Partner', 'Partner',
      'Managing Director',
      'Director of Technology', 'Technology Director',
      'VP Technology', 'VP of Technology', 'Vice President Technology',
      'VP Operations', 'VP of Operations', 'Vice President Operations',
      'VP Digital', 'VP Digital Transformation',
      'VP Business Development', 'VP of Business Development',
      'Head of Technology', 'Head of Tech',
      'Head of Operations', 'Head of Portfolio Operations',
      'Head of Value Creation',
      'Head of Business Development',
      'Director of Operations', 'Director Operations',
      'Director of Business Development', 'Director Business Development',
      'Director of Digital', 'Digital Director',
      'Director of Marketing', 'Marketing Director'
    ];
    
    const searchRes = await apolloPost('/v1/mixed_people/search', {
      q_organization_name: companyName,
      person_titles: titles,
      page: 1, per_page: 15
    });
    
    if (!searchRes.people || searchRes.people.length === 0) return null;
    
    // Pick best candidate: prefer has email, prefer senior titles
    let candidate = null;
    
    // Priority 1: C-level or Partner with email
    candidate = searchRes.people.find(p => 
      p.email && (
        /^(CTO|CEO|COO|CMO|CFO|Chief)/i.test(p.title || '') ||
        /Partner/i.test(p.title || '')
      )
    );
    
    // Priority 2: VP or Director with email
    if (!candidate) {
      candidate = searchRes.people.find(p => 
        p.email && /^(VP|Vice President|Director|Head of)/i.test(p.title || '')
      );
    }
    
    // Priority 3: Any with email
    if (!candidate) {
      candidate = searchRes.people.find(p => p.email);
    }
    
    // Priority 4: Any contact (will try to enrich)
    if (!candidate) {
      candidate = searchRes.people[0];
    }
    
    if (!candidate) return null;
    
    // If no email yet, try to enrich
    if (!candidate.email && candidate.id) {
      await sleep(500);
      const matchRes = await apolloPost('/v1/people/match', { id: candidate.id, reveal_personal_emails: false });
      if (matchRes.person) candidate = matchRes.person;
    }
    
    return {
      name: candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim(),
      title: candidate.title || '',
      email: candidate.email || null,
      linkedin: candidate.linkedin_url || ''
    };
  } catch (err) {
    console.error(`  Apollo Error: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🫡 PE Enrichment - Known Major Firms\n');
  console.log(`Targeting ${TARGET_FIRMS.length} well-known PE firms...\n`);
  
  const auth = new google.auth.GoogleAuth({ keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  let enriched = 0, noResults = 0;
  const enrichedList = [];
  
  for (let idx = 0; idx < TARGET_FIRMS.length; idx++) {
    const target = TARGET_FIRMS[idx];
    const { rowIndex, company, website } = target;
    
    console.log(`[${idx+1}/${TARGET_FIRMS.length}] ${company}`);
    console.log(`  Website: ${website || 'N/A'}`);
    
    try {
      const contact = await findContact(company);
      
      if (!contact || !contact.email) {
        console.log(`  ❌ No verified contact found`);
        noResults++;
        await sleep(1500);
        continue;
      }
      
      console.log(`  ✅ ${contact.name}`);
      console.log(`     ${contact.title}`);
      console.log(`     ${contact.email}`);
      if (contact.linkedin) console.log(`     ${contact.linkedin}`);
      
      // Update sheet - columns B (name), C (title), D (email)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!B${rowIndex}:D${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[contact.name, contact.title, contact.email]] }
      });
      
      // Update LinkedIn if available (column F)
      if (contact.linkedin) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!F${rowIndex}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[contact.linkedin]] }
        });
      }
      
      // Update status (column I) and notes (column K)
      const today = new Date().toISOString().slice(0, 10);
      const note = `Apollo enriched ${today}. ${contact.title} via API.`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!I${rowIndex}:K${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [['Enriched', '', note]] }
      });
      
      enriched++;
      enrichedList.push({ company, contact: contact.name, title: contact.title, email: contact.email });
      
      await sleep(1500);
      
    } catch (err) {
      console.error(`  ⚠️ ERROR: ${err.message}`);
      await sleep(2000);
    }
    
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log('📊 KNOWN FIRMS ENRICHMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Enriched: ${enriched}`);
  console.log(`No results: ${noResults}`);
  console.log('');
  
  if (enriched > 0) {
    console.log('✅ Successfully Enriched:');
    enrichedList.forEach(item => {
      console.log(`  • ${item.company}`);
      console.log(`    ${item.contact} | ${item.title}`);
      console.log(`    ${item.email}`);
      console.log('');
    });
  }
  
  console.log('🫡 Known firms enrichment complete.');
}

main().catch(console.error);
