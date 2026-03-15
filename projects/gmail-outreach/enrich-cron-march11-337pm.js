const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function searchApolloForContacts(companyName, domain) {
  try {
    const url = 'https://api.apollo.io/api/v1/mixed_people/api_search';
    const body = {
      q_organization_name: companyName,
      page: 1,
      per_page: 10,
      person_titles: ['CEO', 'Chief Executive Officer', 'Managing Partner', 'General Partner', 'Operating Partner', 'Managing Director', 'Director', 'VP', 'Vice President', 'Head of', 'CTO', 'Chief Technology Officer', 'COO', 'Chief Operating Officer'],
    };

    if (domain) {
      body.q_organization_domains = [domain];
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`  ❌ Apollo API error: ${res.status} - ${errorText.substring(0, 200)}`);
      return [];
    }

    const data = await res.json();
    return (data.people || []).slice(0, 5); // Return top 5
  } catch (e) {
    console.error('  ❌ Apollo search error:', e.message);
    return [];
  }
}

async function findLeadsNeedingEnrichment() {
  const sheets = await getClient();
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
  });
  
  const rows = res.data.values || [];
  if (rows.length === 0) return [];
  
  const header = rows[0];
  const firmCol = header.indexOf('Company Name');
  const contactCol = header.indexOf('Contact Name');
  const emailCol = header.indexOf('Email');
  const domainCol = header.indexOf('Domain');
  const statusCol = header.indexOf('Status');
  
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const firm = row[firmCol] || '';
    const contact = row[contactCol] || '';
    const email = row[emailCol] || '';
    const domain = row[domainCol] || '';
    const status = row[statusCol] || '';
    
    // Skip if status is "Dead Lead" or "Not Interested"
    if (status === 'Dead Lead' || status === 'Not Interested') continue;
    
    // Needs enrichment if:
    // - No contact name, OR
    // - Email is generic (info@, sales@, ir@, contact@, admin@), OR
    // - Email is empty
    const isGenericEmail = !email || 
                          email.includes('info@') || 
                          email.includes('sales@') || 
                          email.includes('ir@') ||
                          email.includes('contact@') ||
                          email.includes('admin@');
    
    if (!contact || isGenericEmail) {
      needsEnrichment.push({
        rowIndex: i + 1,
        firm,
        contact,
        email,
        domain,
        row,
      });
    }
  }
  
  return needsEnrichment;
}

async function enrichLeads() {
  console.log('🔍 PE Research & Enrichment - Starting...\n');
  
  const leads = await findLeadsNeedingEnrichment();
  console.log(`Found ${leads.length} leads needing enrichment\n`);
  
  const toProcess = leads.slice(0, 15); // Process up to 15
  const enrichments = [];
  
  for (const lead of toProcess) {
    console.log(`\n🔎 Researching: ${lead.firm}`);
    
    // Search Apollo
    const contacts = await searchApolloForContacts(lead.firm, lead.domain);
    
    if (contacts.length > 0) {
      // Pick the highest-ranking contact (typically Managing Partner > Partner > VP)
      const best = contacts[0];
      const firstName = best.first_name || '';
      const lastName = best.last_name || best.last_name_obfuscated || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      // If Apollo doesn't provide email, try to construct it from the domain
      let email = best.email || '';
      if (!email && lead.domain && firstName && lastName) {
        // Try common patterns
        const domain = lead.domain.replace(/^www\./, '');
        const possibleEmails = [
          `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
          `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
          `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}@${domain}`,
        ];
        email = possibleEmails[0]; // Use first pattern, note as inferred
      }
      
      const enrichment = {
        rowIndex: lead.rowIndex,
        firm: lead.firm,
        contact: fullName,
        title: best.title || '',
        email: email,
        linkedin: best.linkedin_url || '',
        source: email.includes('inferred') ? 'Apollo API (email inferred)' : 'Apollo API',
      };
      
      enrichments.push(enrichment);
      console.log(`  ✅ Found: ${enrichment.contact} (${enrichment.title})`);
      if (enrichment.email) {
        console.log(`  📧 Email: ${enrichment.email}`);
      }
      if (enrichment.linkedin) {
        console.log(`  🔗 LinkedIn: ${enrichment.linkedin}`);
      }
    } else {
      console.log(`  ⚠️  No contacts found via Apollo`);
      enrichments.push({
        rowIndex: lead.rowIndex,
        firm: lead.firm,
        contact: '',
        title: '',
        email: '',
        linkedin: '',
        source: 'Not found',
      });
    }
    
    // Rate limit: wait 1 second between requests
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // Apply enrichments to the sheet
  await applyEnrichments(enrichments);
  
  // Save enrichment report
  const report = {
    timestamp: new Date().toISOString(),
    processed: enrichments.length,
    successful: enrichments.filter(e => e.contact).length,
    enrichments,
  };
  
  fs.writeFileSync(
    path.join(__dirname, `enrichment-report-${new Date().toISOString().split('T')[0]}.json`),
    JSON.stringify(report, null, 2)
  );
  
  console.log(`\n\n📊 Enrichment Summary:`);
  console.log(`   Processed: ${enrichments.length}`);
  console.log(`   Successful: ${enrichments.filter(e => e.contact).length}`);
  console.log(`   Failed: ${enrichments.filter(e => !e.contact).length}`);
}

async function applyEnrichments(enrichments) {
  const sheets = await getClient();
  
  // Get current header to find column indices
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:Z1',
  });
  
  const header = res.data.values[0] || [];
  const contactCol = header.indexOf('Contact Name');
  const titleCol = header.indexOf('Title');
  const emailCol = header.indexOf('Email');
  const linkedinCol = header.indexOf('LinkedIn');
  const statusCol = header.indexOf('Status');
  const notesCol = header.indexOf('Notes');
  
  for (const enrich of enrichments) {
    // Skip if we don't have meaningful data (need at least contact name)
    if (!enrich.contact || enrich.contact.trim().length < 3) {
      console.log(`  ⏭️  Skipping row ${enrich.rowIndex}: insufficient data`);
      continue;
    }
    
    const updates = [];
    const rowNum = enrich.rowIndex;
    
    if (contactCol >= 0 && enrich.contact) updates.push([contactCol, enrich.contact]);
    if (titleCol >= 0 && enrich.title) updates.push([titleCol, enrich.title]);
    if (emailCol >= 0 && enrich.email) updates.push([emailCol, enrich.email]);
    if (linkedinCol >= 0 && enrich.linkedin) updates.push([linkedinCol, enrich.linkedin]);
    if (statusCol >= 0 && (enrich.email || enrich.linkedin)) updates.push([statusCol, 'Enriched']);
    if (notesCol >= 0) {
      const note = `Source: ${enrich.source} | Researched ${new Date().toISOString().split('T')[0]}`;
      updates.push([notesCol, note]);
    }
    
    // Apply updates
    for (const [col, val] of updates) {
      const cellRange = `Sheet1!${String.fromCharCode(65 + col)}${rowNum}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: cellRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[val]] },
      });
    }
    
    console.log(`  ✅ Updated row ${rowNum}: ${enrich.contact} - ${enrich.title || 'No title'} - ${enrich.email || 'No email'}`);
  }
}

enrichLeads().catch(e => {
  console.error('\n❌ Error:', e.message);
  console.error(e.stack);
  process.exit(1);
});
