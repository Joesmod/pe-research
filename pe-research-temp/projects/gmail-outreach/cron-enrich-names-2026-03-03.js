// Cron enrichment job - Enrich existing names with emails
// March 3rd, 2026 - 6:36 AM
const https = require('https');
const { google } = require('googleapis');

const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

function apolloEnrich(firstName, lastName, companyName, domain) {
  const body = JSON.stringify({
    api_key: APOLLO_KEY,
    first_name: firstName,
    last_name: lastName,
    organization_name: companyName,
    domain: domain,
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.apollo.io',
      path: '/api/v1/people/match',
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

function parseName(contactName) {
  if (!contactName || contactName === 'Not identified') return null;
  
  // Handle "Name / Name" format - take first one
  const primary = contactName.split('/')[0].trim();
  
  // Remove titles
  const withoutTitles = primary.split(' ').filter(p => !['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.'].includes(p));
  
  if (withoutTitles.length < 2) return null;
  
  // Handle middle names/initials - take first and last
  const firstName = withoutTitles[0];
  const lastName = withoutTitles[withoutTitles.length - 1];
  
  return { firstName, lastName, fullName: `${firstName} ${lastName}` };
}

async function main() {
  console.log('PE LEAD ENRICHMENT - NAME-BASED ENRICHMENT');
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

  // Find leads with contact names but generic/missing emails
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

    // We have a contact name but need an email
    const hasName = contact && contact !== 'Not identified';
    const needsEmail = isGenericEmail(email);

    if (hasName && needsEmail && website) {
      const parsed = parseName(contact);
      if (parsed) {
        targets.push({ 
          row: i + 1, 
          company, 
          contact, 
          email, 
          website,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          fullName: parsed.fullName
        });
      }
    }
  }

  console.log(`Found ${targets.length} leads with names needing email enrichment\n`);
  console.log('========================================\n');

  const results = [];
  let enriched = 0, errors = 0;

  for (const target of targets) {
    console.log(`[${target.row}] ${target.company}`);
    console.log(`  Name: ${target.fullName}`);
    console.log(`  Current email: ${target.email || '(none)'}`);

    const domain = extractDomain(target.website);
    if (!domain) {
      console.log(`  ❌ Invalid website URL\n`);
      continue;
    }

    try {
      const apolloRes = await apolloEnrich(
        target.firstName,
        target.lastName,
        target.company,
        domain
      );
      
      enriched++;
      await sleep(700);

      if (apolloRes.person && apolloRes.person.email) {
        const foundEmail = apolloRes.person.email;
        const foundTitle = apolloRes.person.title || '';
        const linkedin = apolloRes.person.linkedin_url || '';
        const emailStatus = apolloRes.person.email_status || 'unknown';

        console.log(`  ✅ FOUND EMAIL: ${foundEmail}`);
        console.log(`     Status: ${emailStatus}`);
        if (foundTitle) console.log(`     Title: ${foundTitle}`);
        if (linkedin) console.log(`     LinkedIn: ${linkedin}`);
        
        // Only use verified or likely emails
        if (emailStatus === 'verified' || emailStatus === 'likely' || emailStatus === 'guessed') {
          results.push({
            row: target.row,
            company: target.company,
            contact: target.fullName,
            title: foundTitle,
            email: foundEmail,
            linkedin: linkedin,
            status: emailStatus
          });

          // Update the sheet
          const updates = [];
          
          // Update Email
          updates.push({
            range: `Sheet1!${String.fromCharCode(65 + cols['Email'])}${target.row}`,
            values: [[foundEmail]]
          });
          
          // Update Title if we have it and it's empty
          if (foundTitle && !rows[target.row - 1][cols['Title']]) {
            updates.push({
              range: `Sheet1!${String.fromCharCode(65 + cols['Title'])}${target.row}`,
              values: [[foundTitle]]
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
            values: [[note + `Apollo.io ${emailStatus} ${new Date().toISOString().split('T')[0]}`]]
          });

          await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SHEET_ID,
            resource: { valueInputOption: 'RAW', data: updates }
          });
          
          console.log(`  📝 Sheet updated\n`);
        } else {
          console.log(`  ⚠️  Email status '${emailStatus}' not trusted, skipping\n`);
        }
        
      } else {
        console.log(`  ⚠️  No match found\n`);
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
    console.log(`  ${r.contact} - ${r.title || '(no title)'}`);
    console.log(`  ${r.email} [${r.status}]`);
  });
  
  console.log('\n✅ Cron job complete');
}

main().catch(console.error);
