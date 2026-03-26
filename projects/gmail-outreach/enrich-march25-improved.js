const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs').promises;

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Try Apollo with simpler query format
async function searchApolloSimple(company, domain) {
  try {
    const cleanDomain = domain.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    
    const response = await axios.post(
      'https://api.apollo.io/v1/mixed_people/search',
      {
        api_key: APOLLO_API_KEY,
        q_organization_domains: [cleanDomain],
        person_seniorities: ['founder', 'c_suite', 'partner', 'vp'],
        page: 1,
        per_page: 10
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.data?.people?.length > 0) {
      return response.data.people
        .filter(p => p.email)
        .map(p => ({
          name: p.name,
          title: p.title,
          email: p.email,
          linkedin: p.linkedin_url,
          verified: p.email_status === 'verified',
          source: 'Apollo API'
        }));
    }
  } catch (error) {
    console.log(`   Apollo API failed: ${error.response?.data?.message || error.message}`);
  }
  return [];
}

// Try alternate Apollo enrichment endpoint
async function enrichApolloOrg(domain) {
  try {
    const cleanDomain = domain.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    
    const response = await axios.post(
      'https://api.apollo.io/v1/organizations/enrich',
      {
        api_key: APOLLO_API_KEY,
        domain: cleanDomain
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.data?.organization?.people?.length > 0) {
      return response.data.organization.people
        .filter(p => p.email && (p.title?.toLowerCase().includes('partner') || 
                                  p.title?.toLowerCase().includes('ceo') ||
                                  p.title?.toLowerCase().includes('president') ||
                                  p.title?.toLowerCase().includes('director')))
        .map(p => ({
          name: p.name,
          title: p.title,
          email: p.email,
          linkedin: p.linkedin_url,
          verified: true,
          source: 'Apollo Org Enrich'
        }));
    }
  } catch (error) {
    console.log(`   Apollo Org Enrich failed: ${error.response?.status || error.message}`);
  }
  return [];
}

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:I',
  });
  
  return { sheets: google.sheets({ version: 'v4', auth }), rows: response.data.values || [] };
}

async function updateSheetRow(sheets, rowIndex, contactName, title, email, linkedin, notes) {
  try {
    const updates = [
      { range: `Sheet1!C${rowIndex}`, values: [[contactName]] },
      { range: `Sheet1!D${rowIndex}`, values: [[title]] },
      { range: `Sheet1!E${rowIndex}`, values: [[email]] },
      { range: `Sheet1!G${rowIndex}`, values: [[linkedin || '']] },
      { range: `Sheet1!H${rowIndex}`, values: [['Enriched']] },
      { range: `Sheet1!I${rowIndex}`, values: [[notes]] }
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    return true;
  } catch (error) {
    console.error(`   Error updating row ${rowIndex}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🫡 PE Research & Enrichment - Improved Multi-Source Approach\n');
  console.log('Reading sheet...\n');
  
  const { sheets, rows } = await getSheetData();
  
  // Find targets
  const targets = [];
  for (let i = 1; i < rows.length && targets.length < 15; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    if (!company || !website || status.toLowerCase().includes('dead') || status.toLowerCase().includes('not pe')) {
      continue;
    }
    
    const needsEnrichment = (
      !contactName || 
      !email || 
      email.startsWith('info@') || 
      email.startsWith('sales@') || 
      email.startsWith('ir@') ||
      email.startsWith('contact@') ||
      status.toLowerCase().includes('needs email')
    ) && !status.toLowerCase().includes('enriched');
    
    if (needsEnrichment) {
      targets.push({ 
        company, 
        website, 
        rowIndex: i + 1, 
        currentContact: contactName, 
        currentEmail: email,
        currentStatus: status
      });
    }
  }
  
  console.log(`Found ${targets.length} firms needing enrichment\n`);
  
  if (targets.length === 0) {
    console.log('✓ Sheet is fully enriched. No action needed.');
    return;
  }
  
  let enriched = 0;
  const results = [];
  
  for (const target of targets.slice(0, 10)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${target.company} (Row ${target.rowIndex})`);
    console.log(`Website: ${target.website}`);
    console.log(`Status: ${target.currentStatus}`);
    
    let contacts = [];
    
    // Try Apollo People Search
    console.log('Trying Apollo People Search...');
    contacts = await searchApolloSimple(target.company, target.website);
    
    if (contacts.length === 0) {
      // Try Apollo Org Enrichment
      console.log('Trying Apollo Organization Enrichment...');
      contacts = await enrichApolloOrg(target.website);
    }
    
    if (contacts.length > 0) {
      console.log(`\n✓ Found ${contacts.length} contacts:`);
      contacts.forEach((c, idx) => {
        console.log(`  ${idx + 1}. ${c.name} - ${c.title}`);
        console.log(`     ${c.email} ${c.verified ? '✓ verified' : ''} [${c.source}]`);
      });
      
      const best = contacts.find(c => c.verified) || contacts[0];
      
      const notes = `${best.source} - ${new Date().toISOString().split('T')[0]}. ${contacts.length} decision-makers found.`;
      
      const success = await updateSheetRow(
        sheets,
        target.rowIndex,
        best.name,
        best.title,
        best.email,
        best.linkedin,
        notes
      );
      
      if (success) {
        console.log(`\n✅ ENRICHED: ${best.name} (${best.title}) - ${best.email}`);
        enriched++;
        results.push({ company: target.company, success: true, contact: best });
      }
    } else {
      console.log('❌ No contacts found via Apollo');
      results.push({ company: target.company, success: false, reason: 'No Apollo results' });
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n🫡 Enrichment complete: ${enriched}/${targets.length} firms enriched`);
  
  // Save results
  await fs.writeFile(
    'enrichment-results-' + Date.now() + '.json',
    JSON.stringify(results, null, 2)
  );
}

main().catch(console.error);
