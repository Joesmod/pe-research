const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A2:K1000'
  });
  
  return response.data.values || [];
}

async function searchApolloContacts(companyDomain, companyName) {
  try {
    // Use correct API endpoint: /api/v1/mixed_people/api_search
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: companyDomain,
        person_titles: [
          'CEO', 'CTO', 'COO', 'CMO', 'CFO',
          'Managing Partner', 'Managing Director', 'General Partner',
          'Partner', 'Operating Partner', 'Investment Partner',
          'Director', 'VP Operations', 'VP Technology', 'VP Digital',
          'Head of Technology', 'Head of Operations', 'Head of Portfolio'
        ],
        page: 1,
        per_page: 10
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-api-key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Find best match - prioritize verified emails and senior titles
      const people = response.data.people;
      
      // Try to find someone with an email (even if needs reveal)
      const withEmail = people.filter(p => p.email && p.email.trim() !== '');
      const noGeneric = withEmail.filter(p => 
        !p.email.match(/^(info|sales|ir|contact|media|press|admin|support)@/)
      );
      
      const best = noGeneric.length > 0 ? noGeneric[0] : (withEmail.length > 0 ? withEmail[0] : people[0]);
      
      return {
        name: best.name || `${best.first_name} ${best.last_name}`,
        title: best.title,
        email: best.email,
        linkedinUrl: best.linkedin_url,
        personId: best.id,
        source: 'Apollo API',
        emailStatus: best.email_status
      };
    }
    return null;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error(`   ⚠️ Apollo error: ${errMsg}`);
    return null;
  }
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sheet1!C${update.row}:J${update.row}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            update.contactName,
            update.title,
            update.email,
            update.website || '',
            update.linkedinUrl || '',
            'Enriched',
            update.source,
            `Apollo enriched - ${new Date().toISOString().split('T')[0]}`
          ]]
        }
      });
      console.log(`✅ Row ${update.row} updated`);
    } catch (error) {
      console.error(`❌ Row ${update.row} update failed:`, error.message);
    }
  }
}

function extractDomain(website) {
  if (!website) return null;
  try {
    const url = website.startsWith('http') ? website : `http://${website}`;
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return null;
  }
}

async function enrichPEFirms() {
  console.log('🔍 Reading sheet for enrichment targets...\n');
  
  const rows = await readSheet();
  const targets = [];
  
  // Find firms needing enrichment: missing contact OR generic/empty email
  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const company = row[0];
    const contactName = row[2];
    const email = row[4];
    const website = row[5];
    const status = row[7];
    
    // Skip dead/non-PE firms
    if (status && (status.includes('Dead') || status.includes('Not a PE'))) return;
    
    const needsContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|media|press|admin|support)@/);
    const missingEmail = !email || email.trim() === '';
    
    if ((needsContact || hasGenericEmail || missingEmail) && website && company) {
      const domain = extractDomain(website);
      if (domain) {
        targets.push({ row: rowNum, company, domain, website, currentEmail: email });
      }
    }
  });
  
  console.log(`Found ${targets.length} firms needing enrichment`);
  console.log(`Enriching top 12...\n`);
  
  const toEnrich = targets.slice(0, 12);
  const updates = [];
  
  for (const target of toEnrich) {
    console.log(`🔎 ${target.company} (${target.domain})`);
    
    const contact = await searchApolloContacts(target.domain, target.company);
    
    if (contact && contact.name) {
      console.log(`   ✅ ${contact.name} - ${contact.title}`);
      if (contact.email) {
        console.log(`   📧 ${contact.email}`);
      } else {
        console.log(`   📧 (no email - needs enrichment call)`);
      }
      
      updates.push({
        row: target.row,
        company: target.company,
        contactName: contact.name,
        title: contact.title,
        email: contact.email || '',
        linkedinUrl: contact.linkedinUrl || '',
        website: target.website,
        source: 'Apollo API'
      });
    } else {
      console.log(`   ❌ No contact found`);
    }
    
    // Rate limit: 2s between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Enriched ${updates.length} / ${toEnrich.length} firms\n`);
  
  if (updates.length > 0) {
    console.log('📝 Updating sheet...\n');
    await updateSheet(updates);
    console.log(`✅ Done! ${updates.length} leads enriched.`);
  } else {
    console.log('⚠️ No successful enrichments.');
  }
  
  return updates;
}

enrichPEFirms().catch(console.error);
