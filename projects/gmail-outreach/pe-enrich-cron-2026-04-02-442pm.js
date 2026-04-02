const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A2:Z500';

// Apollo API key from TOOLS.md
const APOLLO_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });
  
  return res.data.values || [];
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [update.values]
      }
    });
  }
}

function needsEnrichment(row, index) {
  const companyName = row[0] || '';
  const contactName = row[2] || '';
  const email = row[4] || '';
  const status = row[7] || '';
  
  // Skip if already enriched or dead
  if (status.toLowerCase().includes('dead') || status.toLowerCase() === 'enriched') {
    return false;
  }
  
  // Needs enrichment if:
  // 1. No contact name
  // 2. Generic email (info@, sales@, ir@, contact@, inquiries@, etc.)
  const genericPrefixes = ['info@', 'sales@', 'ir@', 'contact@', 'inquiries@', 'investor@', 'general@'];
  const hasGenericEmail = genericPrefixes.some(prefix => email.toLowerCase().startsWith(prefix));
  
  const needsWork = !contactName || hasGenericEmail || !email;
  
  if (needsWork) {
    console.log(`Row ${index + 2} needs enrichment: ${companyName} | Contact: ${contactName || 'EMPTY'} | Email: ${email || 'EMPTY'}`);
  }
  
  return needsWork;
}

async function apolloSearch(companyName, domain) {
  // Try Apollo people search for the company
  const url = 'https://api.apollo.io/v1/mixed_people/search';
  
  const searchPayload = {
    api_key: APOLLO_KEY,
    q_organization_name: companyName,
    page: 1,
    per_page: 10,
    person_titles: [
      'CEO', 'CTO', 'COO', 'CFO', 'CMO',
      'Managing Partner', 'Operating Partner', 'General Partner', 'Partner',
      'Managing Director', 'Director',
      'VP', 'Vice President',
      'Head of'
    ]
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(searchPayload)
    });
    
    if (!response.ok) {
      console.error(`Apollo API error for ${companyName}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.people && data.people.length > 0) {
      // Sort by seniority - prefer C-level, then Partners, then VPs
      const prioritized = data.people.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        
        const scoreA = 
          (titleA.includes('ceo') || titleA.includes('founder')) ? 100 :
          titleA.includes('partner') ? 90 :
          (titleA.includes('cto') || titleA.includes('coo') || titleA.includes('cfo')) ? 80 :
          titleA.includes('director') ? 70 :
          titleA.includes('vp') || titleA.includes('vice president') ? 60 : 50;
        
        const scoreB = 
          (titleB.includes('ceo') || titleB.includes('founder')) ? 100 :
          titleB.includes('partner') ? 90 :
          (titleB.includes('cto') || titleB.includes('coo') || titleB.includes('cfo')) ? 80 :
          titleB.includes('director') ? 70 :
          titleB.includes('vp') || titleB.includes('vice president') ? 60 : 50;
        
        return scoreB - scoreA;
      });
      
      const person = prioritized[0];
      
      return {
        name: person.name || '',
        title: person.title || '',
        email: person.email || '',
        linkedin: person.linkedin_url || '',
        source: 'Apollo API'
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching Apollo for ${companyName}:`, error.message);
    return null;
  }
}

async function enrichRow(row, rowIndex) {
  const companyName = row[0] || '';
  const website = row[1] || '';
  const currentContact = row[2] || '';
  const currentTitle = row[3] || '';
  const currentEmail = row[4] || '';
  
  console.log(`\n🔍 Enriching: ${companyName}`);
  
  // Extract domain from website
  let domain = '';
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`);
    domain = url.hostname.replace('www.', '');
  } catch (e) {
    console.log(`Could not parse domain from: ${website}`);
  }
  
  // Search Apollo
  const apolloResult = await apolloSearch(companyName, domain);
  
  if (apolloResult && apolloResult.email) {
    console.log(`✅ Found via Apollo: ${apolloResult.name} (${apolloResult.title}) - ${apolloResult.email}`);
    
    return {
      contactName: apolloResult.name,
      title: apolloResult.title,
      email: apolloResult.email,
      linkedin: apolloResult.linkedin,
      status: 'Enriched',
      notes: `Apollo API (enriched) - verified ${new Date().toISOString().split('T')[0]}`
    };
  }
  
  console.log(`❌ No direct email found for ${companyName}`);
  return null;
}

async function main() {
  console.log('🚀 PE Research & Enrichment - Hourly Cron');
  console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}\n`);
  
  const rows = await getSheetData();
  console.log(`📊 Loaded ${rows.length} rows from sheet\n`);
  
  const needsWork = [];
  rows.forEach((row, index) => {
    if (needsEnrichment(row, index)) {
      needsWork.push({ row, index });
    }
  });
  
  console.log(`\n🎯 Found ${needsWork.length} leads needing enrichment`);
  console.log(`📋 Processing first 15...\n`);
  
  const toProcess = needsWork.slice(0, 15);
  const updates = [];
  let enriched = 0;
  
  for (const { row, index } of toProcess) {
    const result = await enrichRow(row, index);
    
    if (result) {
      enriched++;
      
      const rowNum = index + 2; // +2 because sheet is 1-indexed and we skip header
      updates.push({
        range: `Sheet1!C${rowNum}:H${rowNum}`,
        values: [result.contactName, result.title, result.email, result.linkedin || row[5] || '', result.status, result.notes]
      });
      
      console.log(`📝 Queued update for row ${rowNum}`);
    }
    
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Apply all updates
  if (updates.length > 0) {
    console.log(`\n💾 Writing ${updates.length} updates to sheet...`);
    await updateSheet(updates);
    console.log(`✅ Sheet updated successfully`);
  }
  
  console.log(`\n📊 ENRICHMENT SUMMARY`);
  console.log(`   Total needing enrichment: ${needsWork.length}`);
  console.log(`   Processed: ${toProcess.length}`);
  console.log(`   Successfully enriched: ${enriched}`);
  console.log(`   Remaining: ${needsWork.length - toProcess.length}`);
  
  // Save detailed log
  const report = {
    timestamp: new Date().toISOString(),
    totalNeeded: needsWork.length,
    processed: toProcess.length,
    enriched: enriched,
    remaining: needsWork.length - toProcess.length,
    updates: updates.map(u => u.range)
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    `enrichment-report-${Date.now()}.json`,
    JSON.stringify(report, null, 2)
  );
  
  console.log(`\n📄 Detailed report saved`);
}

main().catch(console.error);
