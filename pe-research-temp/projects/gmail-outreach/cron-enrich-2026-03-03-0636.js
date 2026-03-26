// Cron enrichment job - March 3rd, 2026 - 6:36 AM
const https = require('https');
const { google } = require('googleapis');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function apolloSearchPeople(domain, orgName, titles) {
  const body = JSON.stringify({
    api_key: APOLLO_KEY,
    q_organization_domains: domain,
    person_titles: titles,
    page: 1,
    per_page: 10,
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.apollo.io',
      path: '/api/v1/mixed_people/search',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${data.slice(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const GENERIC_PREFIXES = ['info@','ir@','deals@','contact@','epteam@','press@','business@','media@','compliance@','boston@','charlotte@','london@','pr@'];

function isGenericEmail(email) {
  if (!email) return true;
  const lower = email.toLowerCase();
  return GENERIC_PREFIXES.some(p => lower.startsWith(p));
}

function extractDomain(website) {
  if (!website) return null;
  try { return new URL(website).hostname.replace('www.', ''); } catch { return null; }
}

async function main() {
  console.log('PE LEAD ENRICHMENT CRON JOB');
  console.log('Date: Tuesday, March 3rd, 2026 - 6:36 AM CST\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: __dirname + '/service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read the full sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:L600',
  });
  const rows = res.data.values;
  const header = rows[0];
  const cols = {};
  header.forEach((h, i) => cols[h] = i);

  console.log(`Loaded ${rows.length - 1} leads from sheet\n`);

  // Find leads needing enrichment (no contact name or generic email)
  const targets = [];
  for (let i = 1; i < rows.length && targets.length < 15; i++) {
    const row = rows[i];
    const company = (row[cols['Company Name']] || '').trim();
    const contact = (row[cols['Contact Name']] || '').trim();
    const email = (row[cols['Email']] || '').trim();
    const website = (row[cols['Website']] || '').trim();
    const status = (row[cols['Status']] || '').trim();

    // Skip already contacted or bad statuses
    if (status.includes('Contacted') || status.includes('Rejected') || status.includes('Dead')) continue;

    // Need enrichment if: no contact name OR generic email
    const needsContact = !contact || contact === 'Not identified';
    const needsEmail = isGenericEmail(email);

    if ((needsContact || needsEmail) && website) {
      targets.push({ row: i + 1, company, contact, email, website, needsContact, needsEmail });
    }
  }

  console.log(`Found ${targets.length} leads needing enrichment\n`);
  console.log('========================================\n');

  const results = [];
  let enriched = 0, errors = 0;

  for (const target of targets) {
    console.log(`[${target.row}] ${target.company}`);
    console.log(`  Current: ${target.contact || '(no contact)'} — ${target.email || '(no email)'}`);

    const domain = extractDomain(target.website);
    if (!domain) {
      console.log(`  ❌ Invalid website URL\n`);
      continue;
    }

    try {
      // Search for relevant contacts at this firm
      const searchRes = await apolloSearchPeople(domain, target.company, [
        'CEO', 'CTO', 'COO', 'CFO', 'CMO',
        'Managing Partner', 'Managing Director', 'General Partner',
        'Partner', 'Principal',
        'Vice President', 'VP', 'SVP',
        'Director', 'Head of',
        'Business Development', 'Investor Relations',
        'Value Creation', 'Portfolio Operations'
      ]);
      
      enriched++;
      await sleep(600);

      if (searchRes.people && searchRes.people.length > 0) {
        // Filter for people with verified emails
        const withEmail = searchRes.people.filter(p => p.email && !isGenericEmail(p.email));
        
        if (withEmail.length > 0) {
          // Prioritize by seniority
          const prioritized = withEmail.sort((a, b) => {
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            
            // C-level highest priority
            if (titleA.includes('ceo') || titleA.includes('chief')) return -1;
            if (titleB.includes('ceo') || titleB.includes('chief')) return 1;
            
            // Managing partners/directors next
            if (titleA.includes('managing')) return -1;
            if (titleB.includes('managing')) return 1;
            
            // Partners next
            if (titleA.includes('partner')) return -1;
            if (titleB.includes('partner')) return 1;
            
            // VPs
            if (titleA.includes('vice president') || titleA.includes(' vp')) return -1;
            if (titleB.includes('vice president') || titleB.includes(' vp')) return 1;
            
            return 0;
          });

          const best = prioritized[0];
          const foundName = `${best.first_name} ${best.last_name}`;
          const foundTitle = best.title || '';
          const foundEmail = best.email;
          const linkedin = best.linkedin_url || '';

          console.log(`  ✅ FOUND: ${foundName}`);
          console.log(`     Title: ${foundTitle}`);
          console.log(`     Email: ${foundEmail}`);
          if (linkedin) console.log(`     LinkedIn: ${linkedin}`);
          
          results.push({
            row: target.row,
            company: target.company,
            contact: foundName,
            title: foundTitle,
            email: foundEmail,
            linkedin: linkedin
          });

          // Update the sheet
          const updates = [];
          
          // Update Contact Name
          if (target.needsContact || !target.contact) {
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + cols['Contact Name'])}${target.row}`,
              values: [[foundName]]
            });
          }
          
          // Update Title
          updates.push({
            range: `Sheet1!${String.fromCharCode(65 + cols['Title'])}${target.row}`,
            values: [[foundTitle]]
          });
          
          // Update Email
          if (target.needsEmail) {
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + cols['Email'])}${target.row}`,
              values: [[foundEmail]]
            });
          }
          
          // Update LinkedIn if we have it
          if (linkedin) {
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + cols['LinkedIn'])}${target.row}`,
              values: [[linkedin]]
            });
          }
          
          // Update Status
          updates.push({
            range: `Sheet1!${String.fromCharCode(65 + cols['Status'])}${target.row}`,
            values: [['Enriched']]
          });

          // Add note
          const currentNotes = (rows[target.row - 1][cols['Notes']] || '');
          const note = currentNotes ? currentNotes + ' | ' : '';
          updates.push({
            range: `Sheet1!${String.fromCharCode(65 + cols['Notes'])}${target.row}`,
            values: [[note + `Apollo.io verified ${new Date().toISOString().split('T')[0]}`]]
          });

          await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SHEET_ID,
            resource: { valueInputOption: 'RAW', data: updates }
          });
          
          console.log(`  📝 Sheet updated\n`);
          
        } else {
          console.log(`  ⚠️  Found ${searchRes.people.length} people but no verified emails\n`);
        }
      } else {
        console.log(`  ⚠️  No contacts found at this domain\n`);
      }
      
    } catch (err) {
      errors++;
      console.error(`  ❌ ERROR: ${err.message}\n`);
      
      if (err.message.includes('429') || err.message.includes('rate')) {
        console.log('  Rate limited, waiting 30s...');
        await sleep(30000);
      }
    }
  }

  console.log('\n========================================');
  console.log('ENRICHMENT SUMMARY');
  console.log('========================================');
  console.log(`Leads processed: ${targets.length}`);
  console.log(`API calls made: ${enriched}`);
  console.log(`Successfully enriched: ${results.length}`);
  console.log(`Errors: ${errors}`);
  console.log('\nEnriched leads:');
  results.forEach(r => {
    console.log(`\n${r.company} (Row ${r.row})`);
    console.log(`  ${r.contact} - ${r.title}`);
    console.log(`  ${r.email}`);
  });
  
  console.log('\n✅ Cron job complete');
}

main().catch(console.error);
