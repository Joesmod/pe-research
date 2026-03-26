const { google } = require('googleapis');
const https = require('https');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

async function getAuth() {
  return new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function readSheet() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values || [];
  return rows;
}

async function updateRow(rowIndex, values) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Sheet1!A${rowIndex}:N${rowIndex}`,
    valueInputOption: 'RAW',
    resource: { values: [values] },
  });
}

function apolloRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.apollo.io',
      path: `/v1/${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY,
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Apollo API parse error: ${e.message}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function searchApolloContacts(companyName, companyDomain) {
  try {
    const searchPayload = {
      person_titles: [
        'CEO', 'Chief Executive Officer',
        'CTO', 'Chief Technology Officer',
        'COO', 'Chief Operating Officer',
        'Managing Partner', 'Managing Director',
        'Operating Partner', 'General Partner',
        'Partner', 'Principal',
        'VP Technology', 'VP Operations',
        'Director Technology', 'Director Operations',
        'Head of Technology', 'Head of Value Creation',
      ],
      organization_domains: companyDomain ? [companyDomain] : undefined,
      q_organization_name: companyDomain ? undefined : companyName,
      page: 1,
      per_page: 10,
    };
    
    const result = await apolloRequest('mixed_people/search', searchPayload);
    
    if (result && result.people && result.people.length > 0) {
      const contact = result.people[0];
      return {
        name: contact.name || '',
        title: contact.title || '',
        email: contact.email || '',
        linkedinUrl: contact.linkedin_url || '',
        source: 'Apollo API',
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Apollo search error for ${companyName}:`, error.message);
    return null;
  }
}

async function enrichLead(company, companyUrl) {
  console.log(`\nEnriching: ${company}`);
  
  let domain = '';
  if (companyUrl) {
    try {
      const urlObj = new URL(companyUrl);
      domain = urlObj.hostname.replace(/^www\./, '');
    } catch (e) {
      console.log(`  Invalid URL: ${companyUrl}`);
    }
  }
  
  const apolloResult = await searchApolloContacts(company, domain);
  
  if (apolloResult && apolloResult.email) {
    console.log(`  Found: ${apolloResult.name} | ${apolloResult.title} | ${apolloResult.email}`);
    return apolloResult;
  } else {
    console.log(`  No verified contact found`);
    return null;
  }
}

async function main() {
  console.log('PE Research & Enrichment - March 17, 1:07 AM');
  console.log('==============================================\n');
  
  const rows = await readSheet();
  
  if (rows.length < 2) {
    console.log('Sheet is empty or has no data rows');
    return;
  }
  
  // Column mapping based on known structure
  // A=Company Name, B=NotebookLM, C=Contact Name, D=Title, E=Email, 
  // F=Website, G=LinkedIn, H=?, I=Notes, J=Status
  const COL = {
    company: 0,      // A
    notebookLM: 1,   // B
    contact: 2,      // C
    title: 3,        // D
    email: 4,        // E
    website: 5,      // F
    linkedin: 6,     // G
    enrichStatus: 7, // H
    notes: 8,        // I
    status: 9,       // J
  };
  
  console.log('First row (headers or sample):');
  console.log(rows[0].slice(0, 10).join(' | '));
  console.log('');
  
  // Find rows needing enrichment (skip header row 0)
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = (row[COL.company] || '').trim();
    const contact = (row[COL.contact] || '').trim();
    const email = (row[COL.email] || '').trim();
    const status = (row[COL.status] || '').toLowerCase();
    
    // Skip if no company name
    if (!company) continue;
    
    // Skip if dead or already sent
    if (status === 'dead' || status === 'sent') continue;
    
    // Check if needs enrichment
    const hasNoContact = !contact || contact === '';
    const hasGenericEmail = email && (
      email.startsWith('info@') || 
      email.startsWith('sales@') || 
      email.startsWith('ir@') ||
      email.startsWith('contact@')
    );
    
    if (hasNoContact || hasGenericEmail) {
      needsEnrichment.push({ rowIndex: i + 1, row, company });
    }
  }
  
  console.log(`Total rows needing enrichment: ${needsEnrichment.length}`);
  console.log(`Processing first 12...\n`);
  
  const toEnrich = needsEnrichment.slice(0, 12);
  let enriched = 0;
  
  for (const item of toEnrich) {
    const company = item.company;
    const website = item.row[COL.website] || '';
    
    const result = await enrichLead(company, website);
    
    if (result && result.email) {
      // Update the row
      const newValues = [...item.row];
      
      // Ensure array is long enough
      while (newValues.length < 14) {
        newValues.push('');
      }
      
      newValues[COL.contact] = result.name;
      newValues[COL.title] = result.title;
      newValues[COL.email] = result.email;
      newValues[COL.linkedin] = result.linkedinUrl;
      newValues[COL.enrichStatus] = 'Enriched';
      newValues[COL.notes] = `Contact found via ${result.source}. ${new Date().toISOString().split('T')[0]}`;
      newValues[COL.status] = 'Enriched';
      
      await updateRow(item.rowIndex, newValues);
      enriched++;
      
      console.log(`  ✓ Updated row ${item.rowIndex}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.log(`\n==============================================`);
  console.log(`Enrichment Complete`);
  console.log(`Successfully enriched: ${enriched} / ${toEnrich.length}`);
  console.log(`Remaining to process: ${needsEnrichment.length - toEnrich.length}`);
}

main().catch(console.error);
