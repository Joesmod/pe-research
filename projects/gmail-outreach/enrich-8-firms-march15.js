const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const targetFirms = [
  { rowNum: 1081, company: 'Ridgemont Equity Partners', contact: 'John Shimp' },
  { rowNum: 1082, company: 'Wind Point Partners', contact: '' },
  { rowNum: 1083, company: 'Serent Capital', contact: 'Kevin Frick' },
  { rowNum: 1084, company: 'Sverica Capital Management', contact: 'George J. Aggouras' },
  { rowNum: 1085, company: 'American Securities LLC', contact: 'Michael Fisch' },
  { rowNum: 1235, company: 'The Riverside Company', contact: 'Stewart Kohl' },
  { rowNum: 1236, company: 'Abry Partners', contact: '' },
  { rowNum: 1237, company: 'Caltius Equity Partners', contact: '' }
];

const enrichmentLog = [];
let auth, sheets;

async function initialize() {
  auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  sheets = google.sheets({ version: 'v4', auth });
}

async function readFirmData(rowNum) {
  const range = `Sheet1!A${rowNum}:O${rowNum}`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range
  });
  
  const row = response.data.values ? response.data.values[0] : [];
  return {
    company: row[0] || '',
    website: row[1] || '',
    currentContact: row[2] || '',
    currentTitle: row[3] || '',
    currentEmail: row[4] || '',
    currentLinkedIn: row[6] || ''
  };
}

async function searchApollo(firmName, website, existingContact) {
  try {
    console.log(`  🔎 Searching Apollo for ${firmName}...`);
    
    // Extract domain from website
    let domain = '';
    if (website) {
      domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    } else {
      // Try to guess domain from company name
      const cleanName = firmName.toLowerCase()
        .replace(/\s+(llc|l\.l\.c\.|inc|incorporated|partners|partner|equity|capital|management|llp|lp)$/gi, '')
        .replace(/\s+/g, '');
      domain = `${cleanName}.com`;
    }
    
    console.log(`  Domain: ${domain}`);
    
    // If we have an existing contact name, try to find their email
    if (existingContact) {
      console.log(`  Looking for existing contact: ${existingContact}`);
      
      const personSearchPayload = {
        q_organization_domains: domain,
        person_names: [existingContact],
        per_page: 3
      };
      
      try {
        const personResp = await axios.post(
          'https://api.apollo.io/api/v1/mixed_people/search',
          personSearchPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': APOLLO_API_KEY
            }
          }
        );
        
        if (personResp.data.people && personResp.data.people.length > 0) {
          const person = personResp.data.people[0];
          
          // Enrich to get full email
          const enrichResp = await axios.post(
            'https://api.apollo.io/v1/people/match',
            { id: person.id },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': APOLLO_API_KEY
              }
            }
          );
          
          const enriched = enrichResp.data.person;
          
          if (enriched && enriched.email) {
            return {
              name: enriched.name,
              title: enriched.title || '',
              email: enriched.email,
              linkedin: enriched.linkedin_url || '',
              source: `Apollo API - Matched ${existingContact}`
            };
          }
        }
      } catch (err) {
        console.log(`  ⚠️  Could not find ${existingContact}, searching for other contacts...`);
      }
    }
    
    // If existing contact not found OR no existing contact, search for decision-makers
    const titleSets = [
      ['CEO', 'CTO', 'COO', 'Managing Partner', 'General Partner'],
      ['Partner', 'Operating Partner', 'Managing Director'],
      ['VP Operations', 'VP Technology', 'VP Digital', 'Director of Technology', 'Director of Operations'],
      ['Head of Technology', 'Head of Value Creation', 'Head of Portfolio Operations']
    ];
    
    for (const titles of titleSets) {
      const searchPayload = {
        q_organization_domains: domain,
        person_titles: titles,
        per_page: 5
      };
      
      try {
        const searchResponse = await axios.post(
          'https://api.apollo.io/api/v1/mixed_people/search',
          searchPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': APOLLO_API_KEY
            }
          }
        );
        
        if (searchResponse.data.people && searchResponse.data.people.length > 0) {
          const person = searchResponse.data.people[0];
          
          // Enrich to get full email
          const enrichResponse = await axios.post(
            'https://api.apollo.io/v1/people/match',
            { id: person.id },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': APOLLO_API_KEY
              }
            }
          );
          
          const enrichedPerson = enrichResponse.data.person;
          
          if (enrichedPerson && enrichedPerson.email) {
            return {
              name: enrichedPerson.name,
              title: enrichedPerson.title || '',
              email: enrichedPerson.email,
              linkedin: enrichedPerson.linkedin_url || '',
              source: `Apollo API - ${titles.join(', ')}`
            };
          }
        }
      } catch (err) {
        console.log(`  No results for titles: ${titles.join(', ')}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return null;
  } catch (error) {
    console.error(`  ❌ Apollo error for ${firmName}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function updateSheet(rowNum, contact, title, email, linkedin, notes) {
  try {
    const updates = [];
    
    // Column indices (0-based): C=Contact Name, D=Title, E=Email, G=LinkedIn, N=Notes
    if (contact) updates.push({ range: `Sheet1!C${rowNum}`, values: [[contact]] });
    if (title) updates.push({ range: `Sheet1!D${rowNum}`, values: [[title]] });
    if (email) updates.push({ range: `Sheet1!E${rowNum}`, values: [[email]] });
    if (linkedin) updates.push({ range: `Sheet1!G${rowNum}`, values: [[linkedin]] });
    
    // Update notes (Col I = index 8)
    const noteText = `${notes} (Enriched ${new Date().toISOString().split('T')[0]} via Apollo API cron)`;
    updates.push({ range: `Sheet1!I${rowNum}`, values: [[noteText]] });
    
    // Update Status to "Enriched" (Col H = index 7)
    updates.push({ range: `Sheet1!H${rowNum}`, values: [['Enriched']] });
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'USER_ENTERED'
      }
    });
    
    console.log(`  ✅ Updated row ${rowNum}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to update row ${rowNum}:`, error.message);
    return false;
  }
}

async function run() {
  try {
    console.log('🚀 PE Research & Enrichment - March 15, 2026 8:07 AM');
    console.log('Target: 8 firms needing enrichment');
    console.log('');
    
    await initialize();
    
    let enriched = 0;
    let failed = 0;
    
    for (const firm of targetFirms) {
      console.log(`\n[${enriched + failed + 1}/${targetFirms.length}] ${firm.company} (Row ${firm.rowNum})`);
      
      // Read current firm data from sheet
      const firmData = await readFirmData(firm.rowNum);
      console.log(`  Current: Contact="${firmData.currentContact}" | Email="${firmData.currentEmail}"`);
      console.log(`  Website: ${firmData.website || '(none)'}`);
      
      const result = await searchApollo(firm.company, firmData.website, firmData.currentContact);
      
      if (result) {
        console.log(`  ✨ Found: ${result.name} - ${result.title}`);
        console.log(`  📧 Email: ${result.email}`);
        
        const updated = await updateSheet(
          firm.rowNum,
          result.name,
          result.title,
          result.email,
          result.linkedin,
          result.source
        );
        
        if (updated) {
          enriched++;
          enrichmentLog.push({
            company: firm.company,
            rowNum: firm.rowNum,
            name: result.name,
            title: result.title,
            email: result.email,
            source: result.source
          });
        } else {
          failed++;
        }
      } else {
        console.log(`  ⚠️  No contact found via Apollo`);
        failed++;
      }
      
      // Rate limiting between firms
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 ENRICHMENT SUMMARY - March 15, 2026 8:07 AM');
    console.log('='.repeat(70));
    console.log(`✅ Successfully enriched: ${enriched}`);
    console.log(`⚠️  Failed/not found: ${failed}`);
    console.log(`📝 Total processed: ${targetFirms.length}`);
    console.log('');
    
    if (enrichmentLog.length > 0) {
      console.log('🎯 Enriched firms:');
      enrichmentLog.forEach(e => {
        console.log(`  • Row ${e.rowNum}: ${e.company}`);
        console.log(`    ${e.name} (${e.title}) - ${e.email}`);
      });
    }
    
    // Save log
    const logFile = path.join(__dirname, `CRON-ENRICHMENT-2026-03-15-0807AM.json`);
    fs.writeFileSync(logFile, JSON.stringify(enrichmentLog, null, 2));
    console.log(`\n💾 Log saved: ${logFile}`);
    
    // Create completion report
    const reportFile = path.join(__dirname, `CRON-COMPLETION-2026-03-15-0807AM.md`);
    const report = `# PE Research & Enrichment - Cron Completion Report
**Date:** March 15, 2026, 8:07 AM (America/Chicago)
**Session:** cron:8fbfb70e-b09d-4ab1-9906-ab0a33373945

## Summary
- **Total processed:** ${targetFirms.length} firms
- **Successfully enriched:** ${enriched}
- **Failed/not found:** ${failed}

## Enriched Firms
${enrichmentLog.map(e => `
### ${e.company} (Row ${e.rowNum})
- **Contact:** ${e.name}
- **Title:** ${e.title}
- **Email:** ${e.email}
- **Source:** ${e.source}
`).join('\n')}

## Notes
- All enrichments performed via Apollo API
- Generic emails (info@, ir@) replaced with direct contact emails where found
- Sheet updated with Status="Enriched" and timestamped notes

## Next Steps
- **SECONDARY TASK:** Add 3-5 new mid-market PE firms ($500M-$5B AUM, services-heavy) if time permits
- GitHub: Update dossiers in pe-research/PE-firms/ and commit/push changes
`;
    
    fs.writeFileSync(reportFile, report);
    console.log(`📄 Report saved: ${reportFile}`);
    
    return { enriched, failed, total: targetFirms.length };
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

run().then(results => {
  console.log('\n🎉 Enrichment complete!');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Enrichment failed:', err.message);
  process.exit(1);
});
