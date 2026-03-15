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
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        q_organization_domains: companyDomain,
        page: 1,
        per_page: 10,
        person_titles: [
          'CEO', 'CTO', 'COO', 'CMO', 'CFO',
          'Managing Partner', 'Managing Director', 'General Partner',
          'Partner', 'Operating Partner', 'Investment Partner',
          'Director', 'VP Operations', 'VP Technology', 'VP Digital',
          'Head of Technology', 'Head of Operations', 'Head of Portfolio'
        ],
        contact_email_status: ['verified', 'likely', 'guessed']
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Prioritize verified emails
      const verified = response.data.people.filter(p => 
        p.email && 
        p.email_status === 'verified' &&
        !p.email.match(/^(info|sales|ir|contact|media|press|admin|support)@/)
      );
      
      if (verified.length > 0) {
        const best = verified[0];
        return {
          name: best.name,
          title: best.title,
          email: best.email,
          linkedinUrl: best.linkedin_url,
          source: 'Apollo Verified',
          emailStatus: best.email_status
        };
      }
      
      // Fallback to likely emails
      const likely = response.data.people.filter(p => 
        p.email && 
        (p.email_status === 'likely' || p.email_status === 'guessed') &&
        !p.email.match(/^(info|sales|ir|contact|media|press|admin|support)@/)
      );
      
      if (likely.length > 0) {
        const best = likely[0];
        return {
          name: best.name,
          title: best.title,
          email: best.email,
          linkedinUrl: best.linkedin_url,
          source: 'Apollo Likely',
          emailStatus: best.email_status
        };
      }
    }
    return null;
  } catch (error) {
    console.error(`Apollo error for ${companyName}:`, error.response?.data?.message || error.message);
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
            `Enriched via Apollo - ${update.emailStatus} - 2026-03-08`
          ]]
        }
      });
      console.log(`✅ Row ${update.row}: ${update.company} → ${update.contactName} (${update.email})`);
    } catch (error) {
      console.error(`Failed to update row ${update.row}:`, error.message);
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
  console.log('🔍 Reading Google Sheet for enrichment targets...\n');
  
  const rows = await readSheet();
  const targets = [];
  
  // Find firms needing enrichment
  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const company = row[0];
    const contactName = row[2];
    const email = row[4];
    const website = row[5];
    const status = row[7];
    
    // Skip if already dead/not PE
    if (status && status.includes('Dead')) return;
    if (status && status.includes('Not a PE')) return;
    
    // Target: Missing contact OR generic/missing email
    const needsContact = !contactName || contactName.trim() === '';
    const hasGenericEmail = email && email.match(/^(info|sales|ir|contact|media|press|admin|support)@/);
    const missingEmail = !email || email.trim() === '';
    
    if (needsContact || hasGenericEmail || missingEmail) {
      const domain = extractDomain(website);
      if (domain && company) {
        targets.push({
          row: rowNum,
          company,
          domain,
          currentContact: contactName,
          currentEmail: email,
          website
        });
      }
    }
  });
  
  console.log(`Found ${targets.length} firms needing enrichment`);
  console.log(`Enriching top 15...\n`);
  
  const toEnrich = targets.slice(0, 15);
  const updates = [];
  
  for (const target of toEnrich) {
    console.log(`\n🔎 ${target.company} (${target.domain})`);
    
    const contact = await searchApolloContacts(target.domain, target.company);
    
    if (contact) {
      console.log(`   ✅ ${contact.name} - ${contact.title}`);
      console.log(`   📧 ${contact.email} [${contact.emailStatus}]`);
      
      updates.push({
        row: target.row,
        company: target.company,
        contactName: contact.name,
        title: contact.title,
        email: contact.email,
        linkedinUrl: contact.linkedinUrl,
        website: target.website,
        source: contact.source,
        emailStatus: contact.emailStatus
      });
    } else {
      console.log(`   ❌ No contact found`);
    }
    
    // Rate limit: 1.5s between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Enriched ${updates.length} / ${toEnrich.length} firms\n`);
  
  if (updates.length > 0) {
    console.log('📝 Updating Google Sheet...\n');
    await updateSheet(updates);
    console.log(`\n✅ Done! ${updates.length} leads enriched.`);
  }
  
  return updates;
}

enrichPEFirms().catch(console.error);
