const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const RANGE = 'Sheet1!A:K';

// Initialize Google Sheets
const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

async function searchApolloContact(companyName) {
  try {
    console.log(`\n🔍 Searching Apollo for: ${companyName}`);
    
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      q_organization_name: companyName,
      person_titles: [
        'CEO', 'CTO', 'COO', 'CMO', 'CFO',
        'Partner', 'Managing Partner', 'Operating Partner', 'General Partner',
        'Managing Director', 'Director',
        'VP', 'Vice President',
        'Head of', 'Business Development'
      ],
      per_page: 10,
      page: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });
    
    if (response.data.people && response.data.people.length > 0) {
      // Filter for people with verified emails
      const peopleWithEmails = response.data.people.filter(p => 
        p.email && 
        !p.email.toLowerCase().startsWith('info@') &&
        !p.email.toLowerCase().startsWith('sales@') &&
        !p.email.toLowerCase().startsWith('ir@')
      );
      
      if (peopleWithEmails.length > 0) {
        const best = peopleWithEmails[0];
        console.log(`✅ Found: ${best.name} (${best.title}) - ${best.email}`);
        return {
          name: best.name,
          title: best.title || '',
          email: best.email,
          linkedin: best.linkedin_url || '',
          source: 'Apollo API'
        };
      }
    }
    
    console.log(`❌ No contacts found for ${companyName}`);
    return null;
  } catch (err) {
    console.error(`Error searching ${companyName}:`, err.response?.data || err.message);
    return null;
  }
}

async function updateSheetRow(rowIndex, contactData) {
  try {
    const updates = [];
    
    // Column C: Contact Name
    if (contactData.name) {
      updates.push({
        range: `Sheet1!C${rowIndex}`,
        values: [[contactData.name]]
      });
    }
    
    // Column D: Title
    if (contactData.title) {
      updates.push({
        range: `Sheet1!D${rowIndex}`,
        values: [[contactData.title]]
      });
    }
    
    // Column E: Email
    if (contactData.email) {
      updates.push({
        range: `Sheet1!E${rowIndex}`,
        values: [[contactData.email]]
      });
    }
    
    // Column G: LinkedIn
    if (contactData.linkedin) {
      updates.push({
        range: `Sheet1!G${rowIndex}`,
        values: [[contactData.linkedin]]
      });
    }
    
    // Column J: Status
    updates.push({
      range: `Sheet1!J${rowIndex}`,
      values: [['Enriched - Apollo']]
    });
    
    // Batch update
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          data: updates,
          valueInputOption: 'RAW'
        }
      });
      console.log(`✅ Updated row ${rowIndex}`);
    }
  } catch (error) {
    console.error(`Error updating row ${rowIndex}:`, error.message);
  }
}

async function createDossier(company, contactData) {
  try {
    const slug = company.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const dossierDir = `../pe-research/PE-firms/${slug}`;
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dossierDir)) {
      fs.mkdirSync(dossierDir, { recursive: true });
    }
    
    const dossierPath = `${dossierDir}/DOSSIER.md`;
    
    // Read existing or create new
    let content = '';
    if (fs.existsSync(dossierPath)) {
      content = fs.readFileSync(dossierPath, 'utf8');
    } else {
      content = `# ${company}\n\n`;
    }
    
    // Add contact info if not already present
    if (contactData.name && !content.includes(contactData.name)) {
      const contactSection = `\n## Contacts\n\n### ${contactData.name}\n- **Title:** ${contactData.title}\n- **Email:** ${contactData.email}\n- **LinkedIn:** ${contactData.linkedin || 'N/A'}\n- **Source:** ${contactData.source}\n- **Date Added:** ${new Date().toISOString().split('T')[0]}\n\n`;
      
      if (content.includes('## Contacts')) {
        content = content.replace('## Contacts', contactSection + '\n## Previous Contacts');
      } else {
        content += contactSection;
      }
    }
    
    fs.writeFileSync(dossierPath, content);
    console.log(`📝 Updated dossier: ${dossierPath}`);
  } catch (error) {
    console.error(`Error creating dossier for ${company}:`, error.message);
  }
}

async function commitToGit() {
  try {
    console.log('\n📦 Committing changes to GitHub...');
    process.chdir('../pe-research');
    
    execSync('git add PE-firms/');
    execSync(`git commit -m "Enrichment update: ${new Date().toISOString()}"`);
    execSync('git push');
    
    console.log('✅ Changes pushed to GitHub');
  } catch (error) {
    console.error('Git error:', error.message);
  }
}

async function enrichLeads() {
  try {
    console.log('🚀 Starting PE lead enrichment...\n');
    
    // Read sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    
    // Find leads needing enrichment (not dead, empty contact or generic email)
    const needsEnrichment = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const firm = row[0] || '';
      const contactName = row[2] || '';
      const email = row[4] || '';
      const status = row[9] || '';
      
      // Skip dead leads
      if (status.toLowerCase().includes('dead')) {
        continue;
      }
      
      // Check if needs enrichment
      const hasGenericEmail = email && (
        email.toLowerCase().startsWith('info@') || 
        email.toLowerCase().startsWith('sales@') || 
        email.toLowerCase().startsWith('ir@') ||
        email.toLowerCase().startsWith('contact@')
      );
      const needsEnrich = !contactName || 
                          contactName === 'Not identified' || 
                          contactName === 'Principal' ||
                          contactName === 'Founder & CEO' ||
                          hasGenericEmail || 
                          !email;
      
      if (needsEnrich) {
        needsEnrichment.push({
          row: i + 1,
          firm,
          contactName,
          email,
          status
        });
      }
    }
    
    console.log(`Found ${needsEnrichment.length} leads needing enrichment`);
    console.log(`Enriching first 12 leads...\n`);
    
    let enriched = 0;
    const targetLeads = needsEnrichment.slice(0, 12);
    
    for (const lead of targetLeads) {
      console.log(`\n[${enriched + 1}/${targetLeads.length}] Processing: ${lead.firm}`);
      
      // Search Apollo
      const contactData = await searchApolloContact(lead.firm);
      
      if (contactData) {
        // Update sheet
        await updateSheetRow(lead.row, contactData);
        
        // Update dossier
        await createDossier(lead.firm, contactData);
        
        enriched++;
      }
      
      // Rate limit: wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n✅ Enrichment complete: ${enriched}/${targetLeads.length} leads updated`);
    
    // Commit to GitHub
    if (enriched > 0) {
      await commitToGit();
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

enrichLeads();
