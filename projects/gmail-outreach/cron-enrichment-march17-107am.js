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
  if (rows.length === 0) {
    return { headers: [], data: [] };
  }
  
  const headers = rows[0];
  const data = rows.slice(1).map((row, idx) => ({
    rowIndex: idx + 2,
    values: row,
  }));
  
  return { headers, data };
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
        'CFO', 'Chief Financial Officer',
        'Managing Partner', 'Managing Director',
        'Operating Partner', 'General Partner',
        'Partner', 'Principal',
        'VP Technology', 'VP Operations', 'VP Product',
        'Director of Technology', 'Director of Operations',
        'Head of Technology', 'Head of Value Creation',
      ],
      organization_domains: companyDomain ? [companyDomain] : undefined,
      q_organization_name: companyDomain ? undefined : companyName,
      page: 1,
      per_page: 10,
    };
    
    const result = await apolloRequest('mixed_people/search', searchPayload);
    
    if (result && result.people && result.people.length > 0) {
      // Return the first relevant contact
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
  
  // Extract domain from URL
  let domain = '';
  if (companyUrl) {
    try {
      const urlObj = new URL(companyUrl);
      domain = urlObj.hostname.replace(/^www\./, '');
    } catch (e) {
      console.log(`  Invalid URL: ${companyUrl}`);
    }
  }
  
  // Search Apollo
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
  console.log('PE Research & Enrichment - Hourly Cron');
  console.log('=========================================\n');
  console.log(new Date().toISOString());
  
  const { headers, data } = await readSheet();
  
  // Find header indices
  const headerIdx = {
    company: headers.findIndex(h => h && h.toLowerCase().includes('company')),
    notebookLM: headers.findIndex(h => h && h.toLowerCase() === 'notebooklm'),
    contact: headers.findIndex(h => h && h.toLowerCase().includes('andrew nikou')),
    title: headers.findIndex(h => h && h.toLowerCase().includes('founder')),
    email: headers.findIndex(h => h && h.toLowerCase().includes('anikou')),
    website: headers.findIndex(h => h && h.toLowerCase().includes('opengate')),
    linkedin: headers.findIndex(h => h && h.toLowerCase().includes('linkedin')),
    status: headers.findIndex(h => h && h.toLowerCase().includes('enriched')),
    notes: headers.findIndex(h => h && h.toLowerCase().includes('email verified')),
    statusCol: headers.findIndex(h => h && h.toLowerCase() === 'status'),
  };
  
  console.log('Column indices:', headerIdx);
  
  // Find rows needing enrichment
  const needsEnrichment = data.filter(row => {
    const contact = (row.values[headerIdx.contact] || '').trim();
    const email = (row.values[headerIdx.email] || '').trim();
    const status = (row.values[headerIdx.status] || '').toLowerCase();
    const statusCol = (row.values[headerIdx.statusCol] || '').toLowerCase();
    
    const hasNoContact = !contact || contact === '';
    const hasGenericEmail = email && (email.startsWith('info@') || email.startsWith('sales@') || email.startsWith('ir@') || email.startsWith('contact@'));
    const isNotDead = statusCol !== 'dead';
    const isNotEnriched = status !== 'enriched';
    
    return isNotDead && isNotEnriched && (hasNoContact || hasGenericEmail);
  });
  
  console.log(`\nTotal rows needing enrichment: ${needsEnrichment.length}`);
  console.log(`Enriching first 12 rows...\n`);
  
  const toEnrich = needsEnrichment.slice(0, 12);
  let enriched = 0;
  
  for (const row of toEnrich) {
    const company = row.values[headerIdx.company] || '';
    const website = row.values[headerIdx.website] || '';
    
    if (!company) continue;
    
    const result = await enrichLead(company, website);
    
    if (result) {
      // Update the row
      const newValues = [...row.values];
      
      // Ensure array is long enough
      while (newValues.length < Math.max(...Object.values(headerIdx)) + 1) {
        newValues.push('');
      }
      
      newValues[headerIdx.contact] = result.name;
      newValues[headerIdx.title] = result.title;
      newValues[headerIdx.email] = result.email;
      newValues[headerIdx.linkedin] = result.linkedinUrl;
      newValues[headerIdx.status] = 'Enriched';
      newValues[headerIdx.notes] = `Contact found via ${result.source}. ${new Date().toISOString().split('T')[0]}`;
      newValues[headerIdx.statusCol] = 'Enriched';
      
      await updateRow(row.rowIndex, newValues);
      enriched++;
      
      console.log(`  ✓ Updated row ${row.rowIndex}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.log(`\n=========================================`);
  console.log(`Enrichment Complete`);
  console.log(`Enriched: ${enriched} / ${toEnrich.length}`);
  console.log(`Remaining: ${needsEnrichment.length - toEnrich.length}`);
}

main().catch(console.error);
