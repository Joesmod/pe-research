const axios = require('axios');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const PE_RESEARCH_DIR = '../../pe-research/PE-firms';

// Column mapping (1-indexed for Google Sheets)
const COLS = {
  COMPANY: 1,      // A
  NOTEBOOKLM: 2,   // B
  CONTACT: 3,      // C
  TITLE: 4,        // D
  EMAIL: 5,        // E
  WEBSITE: 6,      // F
  LINKEDIN: 7,     // G
  SECTOR: 8,       // H
  PORTFOLIO: 9,    // I
  STATUS: 10,      // J
  NOTES: 11,       // K
  SOURCES: 12      // L
};

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:L'
  });
  
  return response.data.values || [];
}

function needsEnrichment(row, rowData) {
  if (row < 2) return false; // Skip header
  
  const [company, notebookLm, contact, title, email, website, linkedin, sector, portfolio, status] = rowData;
  
  if (!company || company.trim() === '') return false;
  
  // Already fully enriched
  if (contact && contact !== '' && email && email !== '' && 
      !email.startsWith('info@') && !email.startsWith('sales@') && 
      !email.startsWith('ir@') && !email.startsWith('contact@') &&
      !email.includes('Generic') && !email.includes('No Public')) {
    return false;
  }
  
  // Needs enrichment if:
  // 1. No contact name, OR
  // 2. No email, OR
  // 3. Generic/placeholder email
  return (!contact || contact === '' || 
          !email || email === '' || 
          email.startsWith('info@') || email.startsWith('sales@') || 
          email.startsWith('ir@') || email.startsWith('contact@'));
}

async function enrichPerson(personId) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/v1/people/match',
      { id: personId },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );
    
    return response.data.person || null;
  } catch (error) {
    console.error(`   ⚠️  Enrichment failed: ${error.message}`);
    return null;
  }
}

async function searchApollo(companyName, website) {
  try {
    console.log(`\n🔍 Searching Apollo: ${companyName}`);
    
    // Try to extract domain from website if available
    let domain = '';
    if (website && website !== 'No website' && website !== '') {
      domain = website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      console.log(`   Domain: ${domain}`);
    }
    
    // Cast wide net: try multiple title patterns
    const titleGroups = [
      // C-level
      ['CEO', 'Chief Executive Officer', 'COO', 'Chief Operating Officer', 'CTO', 'Chief Technology Officer'],
      // Partners
      ['Managing Partner', 'General Partner', 'Operating Partner', 'Partner', 'Managing Director'],
      // Directors & VPs
      ['Director', 'VP', 'Vice President'],
      // Heads
      ['Head of Value Creation', 'Head of Portfolio', 'Head of Technology', 'Head of Digital']
    ];
    
    for (const titles of titleGroups) {
      try {
        const payload = {
          person_titles: titles,
          per_page: 3,
          page: 1
        };
        
        // Add domain or organization name
        if (domain) {
          payload.q_organization_domains = domain;
        } else {
          payload.q_organization_name = companyName;
        }
        
        const searchResponse = await axios.post(
          'https://api.apollo.io/api/v1/mixed_people/api_search',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'X-Api-Key': APOLLO_API_KEY
            }
          }
        );

        const people = searchResponse.data.people || [];
        
        if (people.length === 0) {
          console.log(`   (no results for ${titles[0]}...)`);
          continue;
        }
        
        console.log(`   Found ${people.length} candidates, enriching...`);
        
        // Enrich each person to get full contact details
        for (const person of people) {
          if (person.has_email) {
            const enriched = await enrichPerson(person.id);
            
            if (enriched && enriched.email && 
                !enriched.email.startsWith('info@') && 
                !enriched.email.startsWith('sales@') && 
                !enriched.email.startsWith('ir@')) {
              
              console.log(`✅ Enriched: ${enriched.name} - ${enriched.title}`);
              console.log(`   Email: ${enriched.email}`);
              
              return {
                name: enriched.name,
                title: enriched.title || '',
                email: enriched.email,
                linkedin: enriched.linkedin_url || '',
                source: 'Apollo API - Enriched'
              };
            }
            
            // Small delay between enrichments
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      } catch (titleError) {
        console.log(`   (error for ${titles[0]}: ${titleError.message})`);
      }
      
      // Rate limit between title group searches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('⚠️  No verified contacts found');
    return null;
  } catch (error) {
    console.error(`❌ Apollo Error for ${companyName}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function webResearch(companyName, website) {
  // Placeholder for web research enrichment
  // In a full implementation, would scrape team pages, LinkedIn, press releases, etc.
  console.log(`🌐 Web research needed for ${companyName} (${website})`);
  return null;
}

async function updateSheet(updates) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  for (const update of updates) {
    try {
      // Batch update for efficiency
      const data = [
        { range: `Sheet1!C${update.row}`, values: [[update.name]] },
        { range: `Sheet1!D${update.row}`, values: [[update.title]] },
        { range: `Sheet1!E${update.row}`, values: [[update.email]] },
        { range: `Sheet1!G${update.row}`, values: [[update.linkedin]] },
        { range: `Sheet1!J${update.row}`, values: [['Enriched']] },
        { range: `Sheet1!L${update.row}`, values: [[update.source]] }
      ];

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: data
        }
      });

      console.log(`✅ Updated row ${update.row}: ${update.name}`);
    } catch (error) {
      console.error(`❌ Failed to update row ${update.row}:`, error.message);
    }
  }
}

async function updateDossier(company, enrichmentData) {
  // Create/update dossier file in pe-research repo
  const filename = company.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '.md';
  
  const dossierPath = path.join(PE_RESEARCH_DIR, filename);
  
  let content = `# ${company}\n\n`;
  content += `## Contact Information\n\n`;
  content += `- **Name:** ${enrichmentData.name}\n`;
  content += `- **Title:** ${enrichmentData.title}\n`;
  content += `- **Email:** ${enrichmentData.email}\n`;
  
  if (enrichmentData.linkedin) {
    content += `- **LinkedIn:** ${enrichmentData.linkedin}\n`;
  }
  
  content += `\n## Research Notes\n\n`;
  content += `**Source:** ${enrichmentData.source}\n`;
  content += `**Date Enriched:** ${new Date().toISOString().split('T')[0]}\n`;
  content += `\n---\n\n`;
  content += `*Enriched via Apollo API - PE Research & Enrichment Cron*\n`;
  
  try {
    fs.writeFileSync(dossierPath, content, 'utf8');
    console.log(`📄 Dossier updated: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to write dossier for ${company}:`, error.message);
  }
}

async function gitCommitAndPush() {
  const { execSync } = require('child_process');
  
  try {
    process.chdir(PE_RESEARCH_DIR);
    
    execSync('git add .');
    execSync(`git commit -m "PE enrichment update - ${new Date().toISOString().split('T')[0]}"`);
    execSync('git push');
    
    console.log('✅ Git: Committed and pushed dossier updates');
  } catch (error) {
    console.error('⚠️  Git operation failed:', error.message);
  }
}

async function main() {
  const startTime = Date.now();
  console.log('🚀 PE Research & Enrichment - Hourly Run');
  console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}\n`);

  // Step 1: Read sheet
  console.log('📊 Reading Google Sheet...');
  const rows = await readSheet();
  console.log(`   Found ${rows.length - 1} total firms\n`);

  // Step 2: Identify firms needing enrichment
  console.log('🔎 Identifying enrichment targets...');
  const targets = [];
  
  for (let i = 1; i < rows.length; i++) {
    if (needsEnrichment(i + 1, rows[i])) {
      const [company, notebookLm, contact, title, email, website] = rows[i];
      targets.push({
        row: i + 1,
        company: company,
        website: website || '',
        currentContact: contact || '',
        currentEmail: email || ''
      });
      
      if (targets.length >= 15) break; // Limit to 15 per run
    }
  }

  console.log(`   Identified ${targets.length} firms needing enrichment\n`);

  if (targets.length === 0) {
    console.log('✅ No firms need enrichment. Exiting.');
    return;
  }

  // Step 3: Enrich using Apollo
  console.log('🔍 Starting Apollo enrichment...\n');
  const updates = [];
  let successCount = 0;
  let failCount = 0;

  for (const target of targets) {
    console.log(`\n[${successCount + failCount + 1}/${targets.length}] ${target.company}`);
    
    const result = await searchApollo(target.company, target.website);
    
    if (result) {
      updates.push({
        row: target.row,
        company: target.company,
        ...result
      });
      successCount++;
    } else {
      failCount++;
      // Log for manual research
      console.log(`   → Manual research needed: ${target.website || 'No website'}`);
    }
    
    // Rate limit: 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Step 4: Update sheet
  console.log('\n\n📝 Updating Google Sheet...');
  if (updates.length > 0) {
    await updateSheet(updates);
  }

  // Step 5: Update dossiers
  console.log('\n📄 Updating PE Research dossiers...');
  for (const update of updates) {
    await updateDossier(update.company, update);
  }

  // Step 6: Git commit & push
  if (updates.length > 0) {
    console.log('\n🔄 Committing to GitHub...');
    await gitCommitAndPush();
  }

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total targets:      ${targets.length}`);
  console.log(`Successfully enriched: ${successCount}`);
  console.log(`Failed (manual needed): ${failCount}`);
  console.log(`Time elapsed:       ${elapsed}s`);
  console.log('='.repeat(60));

  if (updates.length > 0) {
    console.log('\n✅ ENRICHED CONTACTS:\n');
    updates.forEach((u, idx) => {
      console.log(`${idx + 1}. ${u.company}`);
      console.log(`   ${u.name} - ${u.title}`);
      console.log(`   ${u.email}`);
      if (u.linkedin) console.log(`   ${u.linkedin}`);
      console.log('');
    });
  }

  console.log('\n🎯 Enrichment complete!');
}

main().catch(console.error);
