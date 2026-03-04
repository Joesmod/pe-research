const axios = require('axios');
const { google } = require('googleapis');

const HUNTER_API_KEY = 'f9f608d7a2a76885122f0e8a2f6d3430d5242313';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function searchHunter(domain, firstName, lastName) {
  try {
    const url = `https://api.hunter.io/v2/email-finder?domain=${domain}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${HUNTER_API_KEY}`;
    
    const response = await axios.get(url);
    
    if (response.data.data && response.data.data.email) {
      return {
        email: response.data.data.email,
        score: response.data.data.score,
        sources: response.data.data.sources
      };
    }
    
    return null;
  } catch (error) {
    console.error(`  ❌ Hunter error:`, error.response?.data?.errors || error.message);
    return null;
  }
}

async function domainSearch(domain) {
  try {
    const url = `https://api.hunter.io/v2/domain-search?domain=${domain}&limit=10&api_key=${HUNTER_API_KEY}`;
    
    const response = await axios.get(url);
    
    if (response.data.data && response.data.data.emails) {
      return response.data.data.emails;
    }
    
    return [];
  } catch (error) {
    console.error(`  ❌ Hunter domain search error:`, error.response?.data?.errors || error.message);
    return [];
  }
}

function extractDomain(website) {
  try {
    const url = new URL(website);
    return url.hostname.replace('www.', '');
  } catch {
    return website.replace(/https?:\/\//g, '').replace('www.', '').split('/')[0];
  }
}

async function enrichFirm(row, company, website) {
  console.log(`\n=== Enriching: ${company} (Row ${row}) ===`);
  
  if (!website) {
    console.log('  ❌ No website provided');
    return null;
  }
  
  const domain = extractDomain(website);
  console.log(`  Domain: ${domain}`);
  
  // Try domain search first to find decision-makers
  console.log('  Searching domain for contacts...');
  const emails = await domainSearch(domain);
  
  if (emails.length === 0) {
    console.log('  ❌ No emails found on domain');
    return null;
  }
  
  console.log(`  Found ${emails.length} email(s) on domain`);
  
  // Filter for senior roles
  const seniorRoles = ['partner', 'ceo', 'chief executive', 'managing', 'coo', 'chief operating', 'cto', 'chief technology'];
  
  const seniorContact = emails.find(e => 
    e.position && seniorRoles.some(role => e.position.toLowerCase().includes(role))
  );
  
  const contact = seniorContact || emails[0];
  
  if (contact.value) {
    console.log(`  ✅ Found: ${contact.first_name} ${contact.last_name}`);
    console.log(`     Title: ${contact.position || 'N/A'}`);
    console.log(`     Email: ${contact.value}`);
    console.log(`     Confidence: ${contact.confidence}%`);
    console.log(`     LinkedIn: ${contact.linkedin || 'N/A'}`);
    
    return {
      row,
      company,
      contactName: `${contact.first_name} ${contact.last_name}`,
      title: contact.position || '',
      email: contact.value,
      linkedin: contact.linkedin || '',
      status: 'Enriched - Hunter.io',
      confidence: contact.confidence
    };
  }
  
  console.log('  ❌ No suitable contact found');
  return null;
}

async function updateSheet(enrichments) {
  if (enrichments.length === 0) {
    console.log('\n❌ No enrichments to update');
    return;
  }
  
  const sheets = await getSheets();
  
  for (const enrich of enrichments) {
    // Update contact details
    const range = `Sheet1!B${enrich.row}:F${enrich.row}`;
    const values = [[
      enrich.contactName,
      enrich.title,
      enrich.email,
      '', // Keep existing website
      enrich.linkedin
    ]];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });
    
    // Update status
    const statusRange = `Sheet1!I${enrich.row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: statusRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[enrich.status]] }
    });
    
    console.log(`  ✅ Updated sheet row ${enrich.row}`);
  }
}

async function main() {
  console.log('🚀 PE Enrichment Cron - Hunter.io Edition\n');
  console.log('Time:', new Date().toISOString());
  console.log('');
  
  // Start with firms that have websites
  const targets = [
    { row: 500, company: 'Aurora Capital Partners', website: 'http://www.auroracap.com' },
    { row: 525, company: 'Levine Leichtman Capital Partners', website: 'http://www.llcp.com' },
    { row: 556, company: 'AI Fund', website: 'http://www.aifund.ai' },
  ];
  
  const enrichments = [];
  
  for (const target of targets) {
    const result = await enrichFirm(target.row, target.company, target.website);
    if (result) {
      enrichments.push(result);
    }
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n\n📊 ENRICHMENT SUMMARY`);
  console.log(`   Researched: ${targets.length} firms`);
  console.log(`   Enriched: ${enrichments.length} firms`);
  console.log(`   Success rate: ${Math.round(enrichments.length / targets.length * 100)}%`);
  
  if (enrichments.length > 0) {
    console.log('\n💾 Updating Google Sheet...');
    await updateSheet(enrichments);
    console.log('\n✅ Sheet update complete!');
    
    console.log('\n📝 ENRICHED CONTACTS:');
    enrichments.forEach((e, i) => {
      console.log(`\n${i + 1}. ${e.company} (Row ${e.row})`);
      console.log(`   Contact: ${e.contactName}`);
      console.log(`   Title: ${e.title}`);
      console.log(`   Email: ${e.email}`);
      console.log(`   Confidence: ${e.confidence}%`);
    });
  } else {
    console.log('\n⚠️ No enrichments found this run.');
    console.log('Next run will target different firms.');
  }
  
  console.log('\n\n---');
  console.log('Run completed:', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
}

main().catch(console.error);
