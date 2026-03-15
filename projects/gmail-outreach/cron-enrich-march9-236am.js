const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const DOSSIER_PATH = '../../pe-research/PE-firms';

// Initialize Google Sheets
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Read the sheet
async function readSheet(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N', // Extended range to cover all columns
  });
  return res.data.values || [];
}

// Search Apollo for contacts
async function searchApollo(firmName, domain = null) {
  try {
    const searchParams = {
      person_titles: [
        'Partner',
        'Managing Partner',
        'Managing Director',
        'General Partner',
        'Operating Partner',
        'CEO',
        'Chief Executive Officer',
        'President',
        'COO',
        'Chief Operating Officer',
        'CTO',
        'Chief Technology Officer',
        'VP Operations',
        'Vice President Operations',
        'VP Technology',
        'Vice President Technology',
        'VP Digital',
        'Director Operations',
        'Director Technology',
        'Director Digital',
        'Director Business Development',
        'Head of Operations',
        'Head of Technology',
        'Head of Digital',
        'Head of Value Creation'
      ],
      person_seniorities: ['partner', 'c_suite', 'vp', 'director'],
      per_page: 10
    };
    
    if (domain) {
      searchParams.organization_domains = [domain];
    } else {
      searchParams.q_organization_name = firmName;
    }

    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      searchParams,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': APOLLO_API_KEY
        },
        timeout: 10000
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Filter out generic emails and prioritize verified
      const validContacts = response.data.people.filter(p => {
        if (!p.email) return false;
        const email = p.email.toLowerCase();
        return !email.startsWith('info@') && 
               !email.startsWith('sales@') && 
               !email.startsWith('ir@') &&
               !email.startsWith('contact@') &&
               !email.startsWith('hello@');
      });
      
      // Sort: verified first, then by seniority
      validContacts.sort((a, b) => {
        if (a.email_status === 'verified' && b.email_status !== 'verified') return -1;
        if (b.email_status === 'verified' && a.email_status !== 'verified') return 1;
        const seniorTitles = ['CEO', 'Managing Partner', 'Managing Director', 'CFO', 'COO'];
        const aIsSenior = seniorTitles.some(t => (a.title || '').includes(t));
        const bIsSenior = seniorTitles.some(t => (b.title || '').includes(t));
        if (aIsSenior && !bIsSenior) return -1;
        if (bIsSenior && !aIsSenior) return 1;
        return 0;
      });

      return validContacts.slice(0, 3); // Top 3 contacts
    }
    return [];
  } catch (error) {
    console.error(`Apollo error for ${firmName}:`);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    return [];
  }
}

// Extract domain from website
function extractDomain(website) {
  if (!website) return null;
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return null;
  }
}

// Update sheet row
async function updateSheetRow(sheets, rowIndex, updates) {
  const updateRequests = [];
  for (const [col, value] of Object.entries(updates)) {
    updateRequests.push({
      range: `Sheet1!${col}${rowIndex}`,
      values: [[value]]
    });
  }
  
  if (updateRequests.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        data: updateRequests,
        valueInputOption: 'RAW'
      }
    });
  }
}

// Update or create dossier
function updateDossier(firmName, contactData) {
  try {
    const dossierDir = path.resolve(__dirname, DOSSIER_PATH);
    if (!fs.existsSync(dossierDir)) {
      console.log(`⚠️  Dossier directory not found: ${dossierDir}`);
      return;
    }
    
    const sanitizedName = firmName.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-');
    const dossierFile = path.join(dossierDir, `${sanitizedName}.md`);
    
    let content = '';
    if (fs.existsSync(dossierFile)) {
      content = fs.readFileSync(dossierFile, 'utf8');
    } else {
      content = `# ${firmName}\n\n## Overview\n[To be researched]\n\n`;
    }
    
    // Add contacts section if not present
    if (!content.includes('## Key Contacts')) {
      content += `\n## Key Contacts\n`;
    }
    
    // Append new contact (avoid duplicates)
    const contactEntry = `\n### ${contactData.name}\n- **Title:** ${contactData.title}\n- **Email:** ${contactData.email}\n- **LinkedIn:** ${contactData.linkedin || 'N/A'}\n- **Source:** Apollo.io (${contactData.emailStatus})\n- **Date Added:** ${new Date().toISOString().split('T')[0]}\n`;
    
    if (!content.includes(contactData.email)) {
      content += contactEntry;
      fs.writeFileSync(dossierFile, content);
      console.log(`✓ Updated dossier: ${sanitizedName}.md`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Dossier error for ${firmName}:`, error.message);
    return false;
  }
}

// Main enrichment function
async function enrichLeads() {
  console.log('='.repeat(70));
  console.log('PE RESEARCH & ENRICHMENT - Hourly Cron');
  console.log('Time:', new Date().toISOString());
  console.log('='.repeat(70));
  
  const sheets = await getSheets();
  const rows = await readSheet(sheets);
  
  if (rows.length <= 1) {
    console.log('No data found in sheet.');
    return;
  }
  
  const headers = rows[0];
  console.log(`\nSheet columns: ${headers.join(', ')}\n`);
  
  // Find column indices
  const colMap = {
    company: headers.findIndex(h => h && h.toLowerCase().includes('company')),
    contact: headers.findIndex(h => h && h.toLowerCase().includes('contact')),
    title: headers.findIndex(h => h && h.toLowerCase().includes('title') || h.toLowerCase().includes('position')),
    email: headers.findIndex(h => h && h.toLowerCase().includes('email')),
    linkedin: headers.findIndex(h => h && h.toLowerCase().includes('linkedin')),
    website: headers.findIndex(h => h && h.toLowerCase().includes('website')),
    status: headers.findIndex(h => h && h.toLowerCase().includes('status')),
    notes: headers.findIndex(h => h && h.toLowerCase().includes('notes'))
  };
  
  console.log('Column mapping:', colMap);
  console.log('');
  
  // Find leads needing enrichment
  const toEnrich = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[colMap.company] || '';
    const contact = row[colMap.contact] || '';
    const email = row[colMap.email] || '';
    const status = row[colMap.status] || '';
    
    // Skip if already enriched, dead, or sent
    if (status === 'Enriched' || status.includes('Dead') || status === 'Sent' || status === 'Replied') {
      continue;
    }
    
    // Check if needs enrichment
    const needsEnrichment = !contact || 
                           email.startsWith('info@') || 
                           email.startsWith('sales@') || 
                           email.startsWith('ir@') ||
                           email.startsWith('contact@') ||
                           !email;
    
    if (needsEnrichment && company) {
      toEnrich.push({
        rowIndex: i + 1, // 1-indexed for sheets
        company,
        website: row[colMap.website] || ''
      });
    }
  }
  
  console.log(`Found ${toEnrich.length} leads needing enrichment.`);
  console.log(`Will process up to 15 leads this run.\n`);
  
  const enrichBatch = toEnrich.slice(0, 15);
  const results = {
    enriched: 0,
    notFound: 0,
    errors: 0,
    dossiersUpdated: 0
  };
  
  for (const lead of enrichBatch) {
    console.log(`\n[${ enrichBatch.indexOf(lead) + 1}/${enrichBatch.length}] ${lead.company}`);
    console.log('-'.repeat(60));
    
    try {
      const domain = extractDomain(lead.website);
      const contacts = await searchApollo(lead.company, domain);
      
      if (contacts.length > 0) {
        const bestContact = contacts[0];
        console.log(`✓ Found: ${bestContact.first_name} ${bestContact.last_name}`);
        console.log(`  Title: ${bestContact.title || 'N/A'}`);
        console.log(`  Email: ${bestContact.email} (${bestContact.email_status})`);
        console.log(`  LinkedIn: ${bestContact.linkedin_url || 'N/A'}`);
        
        // Update sheet
        const updates = {
          [String.fromCharCode(65 + colMap.contact)]: `${bestContact.first_name} ${bestContact.last_name}`,
          [String.fromCharCode(65 + colMap.title)]: bestContact.title || '',
          [String.fromCharCode(65 + colMap.email)]: bestContact.email,
          [String.fromCharCode(65 + colMap.linkedin)]: bestContact.linkedin_url || '',
          [String.fromCharCode(65 + colMap.status)]: 'Enriched',
          [String.fromCharCode(65 + colMap.notes)]: `Apollo: ${bestContact.email_status} | ${new Date().toISOString().split('T')[0]}`
        };
        
        await updateSheetRow(sheets, lead.rowIndex, updates);
        results.enriched++;
        
        // Update dossier
        const dossierUpdated = updateDossier(lead.company, {
          name: `${bestContact.first_name} ${bestContact.last_name}`,
          title: bestContact.title,
          email: bestContact.email,
          linkedin: bestContact.linkedin_url,
          emailStatus: bestContact.email_status
        });
        if (dossierUpdated) results.dossiersUpdated++;
        
      } else {
        console.log('✗ No contacts found');
        results.notFound++;
        
        // Mark as researched
        const updates = {
          [String.fromCharCode(65 + colMap.notes)]: `Apollo: No contacts found | ${new Date().toISOString().split('T')[0]}`
        };
        await updateSheetRow(sheets, lead.rowIndex, updates);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      results.errors++;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('ENRICHMENT COMPLETE');
  console.log('='.repeat(70));
  console.log(`✓ Enriched: ${results.enriched}`);
  console.log(`✗ Not found: ${results.notFound}`);
  console.log(`⚠️  Errors: ${results.errors}`);
  console.log(`📄 Dossiers updated: ${results.dossiersUpdated}`);
  console.log('='.repeat(70));
  
  // Save completion report
  const report = {
    timestamp: new Date().toISOString(),
    processed: enrichBatch.length,
    results
  };
  
  fs.writeFileSync(
    `CRON-COMPLETION-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}.md`,
    `# PE Enrichment Cron Report\n\n**Time:** ${new Date().toISOString()}\n\n## Results\n- **Processed:** ${enrichBatch.length}\n- **Enriched:** ${results.enriched}\n- **Not Found:** ${results.notFound}\n- **Errors:** ${results.errors}\n- **Dossiers Updated:** ${results.dossiersUpdated}\n\n## Next Actions\n- ${toEnrich.length - enrichBatch.length} leads still need enrichment\n- Next cron run will process the next batch\n`
  );
}

enrichLeads().catch(console.error);
