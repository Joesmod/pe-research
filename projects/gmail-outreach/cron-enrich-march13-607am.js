const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function main() {
  // Authenticate with service account
  const auth = new google.auth.GoogleAuth({
    keyFile: './service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📊 Reading sheet...');
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('❌ No data found');
    return;
  }

  const headers = rows[0];
  console.log('Headers:', headers);

  const companyIdx = headers.indexOf('Company Name');
  const contactIdx = headers.indexOf('Contact Name');
  const emailIdx = headers.indexOf('Email');
  const titleIdx = headers.indexOf('Title');
  const linkedinIdx = headers.indexOf('LinkedIn');
  const statusIdx = headers.indexOf('Status');
  const notesIdx = headers.indexOf('Notes');
  const websiteIdx = headers.indexOf('Website');

  // Find rows needing enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';

    // Skip if already enriched, sent, or dead
    if (status === 'Sent' || status === 'Dead' || status === 'Enriched') continue;

    // Needs enrichment if contact empty OR email is generic
    const isGeneric = email.match(/^(info|sales|ir|contact|hello|support)@/i);
    
    if (!contact || !email || isGeneric) {
      needsEnrichment.push({
        rowIndex: i + 1,
        company,
        contact,
        email,
        website,
        reason: !contact ? 'no_contact' : isGeneric ? 'generic_email' : 'no_email'
      });
    }
  }

  console.log(`\n📋 Found ${needsEnrichment.length} leads needing enrichment`);
  console.log(`Targeting first 12 for this run\n`);

  const target = needsEnrichment.slice(0, 12);
  const updates = [];
  const enrichmentLog = [];

  for (const lead of target) {
    console.log(`\n🔍 Researching: ${lead.company}`);
    console.log(`   Reason: ${lead.reason}`);
    console.log(`   Current contact: ${lead.contact || '(empty)'}`);
    console.log(`   Current email: ${lead.email || '(empty)'}`);

    try {
      // Try Apollo enrichment
      const domain = lead.website ? lead.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : null;
      
      if (!domain) {
        console.log('   ⚠️  No website domain found');
        enrichmentLog.push({ company: lead.company, status: 'no_domain', contact: null, email: null });
        continue;
      }

      // First try to get organization
      const orgUrl = `https://api.apollo.io/v1/organizations/enrich?api_key=${APOLLO_API_KEY}&domain=${encodeURIComponent(domain)}`;
      const orgRes = await fetch(orgUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!orgRes.ok) {
        console.log(`   ❌ Org lookup failed: ${orgRes.status}`);
        enrichmentLog.push({ company: lead.company, status: 'org_not_found', contact: null, email: null });
        continue;
      }

      const orgData = await orgRes.json();
      const orgId = orgData.organization?.id;

      if (!orgId) {
        console.log('   ❌ Organization not found in Apollo');
        enrichmentLog.push({ company: lead.company, status: 'org_not_found', contact: null, email: null });
        continue;
      }

      // Now search for people at this org
      const searchUrl = `https://api.apollo.io/v1/mixed_people/search`;
      const payload = {
        api_key: APOLLO_API_KEY,
        organization_ids: [orgId],
        person_titles: [
          'CEO', 'CTO', 'COO', 'CMO', 'CFO',
          'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
          'Director', 'VP', 'Head of', 'President'
        ],
        page: 1,
        per_page: 5
      };

      const apolloRes = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payload)
      });

      if (!apolloRes.ok) {
        console.log(`   ❌ People search failed: ${apolloRes.status}`);
        enrichmentLog.push({ company: lead.company, status: 'search_error', contact: null, email: null });
        continue;
      }

      const data = await apolloRes.json();
      const people = data.people || [];

      if (people.length === 0) {
        console.log('   ❌ No contacts found via Apollo');
        enrichmentLog.push({ company: lead.company, status: 'no_results', contact: null, email: null });
        continue;
      }

      // Pick best contact
      const best = people[0];
      const name = best.name || '';
      const title = best.title || '';
      const email = best.email || '';
      const linkedin = best.linkedin_url || '';

      if (!email || email.match(/^(info|sales|ir|contact)@/i)) {
        console.log('   ⚠️  Found contact but no verified direct email');
        enrichmentLog.push({ company: lead.company, status: 'no_direct_email', contact: name, email: null });
        continue;
      }

      console.log(`   ✅ Found: ${name}`);
      console.log(`      Title: ${title}`);
      console.log(`      Email: ${email}`);
      console.log(`      LinkedIn: ${linkedin || '(none)'}`);

      updates.push({
        rowIndex: lead.rowIndex,
        contact: name,
        title,
        email,
        linkedin,
        status: 'Enriched',
        notes: `Enriched via Apollo 2026-03-13`
      });

      enrichmentLog.push({
        company: lead.company,
        status: 'success',
        contact: name,
        title,
        email,
        linkedin
      });

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1200));

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      enrichmentLog.push({ company: lead.company, status: 'error', error: error.message });
    }
  }

  // Write updates to sheet
  if (updates.length > 0) {
    console.log(`\n📝 Writing ${updates.length} updates to sheet...`);

    for (const update of updates) {
      const range = `Sheet1!${update.rowIndex}:${update.rowIndex}`;
      const values = rows[update.rowIndex - 1];
      
      values[contactIdx] = update.contact;
      values[titleIdx] = update.title;
      values[emailIdx] = update.email;
      values[linkedinIdx] = update.linkedin;
      values[statusIdx] = update.status;
      values[notesIdx] = update.notes;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values: [values] }
      });
    }

    console.log('✅ Sheet updated');
  }

  // Save log
  fs.writeFileSync(
    './enrichment-results-march13-607am.json',
    JSON.stringify(enrichmentLog, null, 2)
  );

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total needing enrichment: ${needsEnrichment.length}`);
  console.log(`   Processed: ${target.length}`);
  console.log(`   Successfully enriched: ${updates.length}`);
  console.log(`   Failed: ${target.length - updates.length}`);
  console.log(`\n✅ Enrichment complete`);
}

main().catch(console.error);
