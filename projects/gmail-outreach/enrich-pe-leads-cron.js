const { google } = require('googleapis');
const axios = require('axios');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Priority decision-maker titles (cast wide net)
const PRIORITY_TITLES = [
  // C-Suite
  'CEO', 'Chief Executive', 'President', 'Managing Director', 'COO', 'Chief Operating',
  'CTO', 'Chief Technology', 'CFO', 'Chief Financial', 'CMO', 'Chief Marketing',
  // Partners
  'Managing Partner', 'General Partner', 'Operating Partner', 'Senior Partner',
  'Partner', 'Founding Partner',
  // Directors & VPs
  'Director', 'Vice President', 'VP', 'Head of', 'SVP', 'Senior Vice President',
  // Value Creation & Ops
  'Value Creation', 'Portfolio Operations', 'Operating Executive', 'Venture Partner',
  'Business Development', 'BD', 'Digital Transformation', 'Technology Officer'
];

async function searchApolloContacts(companyDomain, firmName) {
  try {
    console.log(`  🔍 Searching Apollo for: ${firmName} (${companyDomain})`);
    
    // Try domain search first, fallback to name search
    const response = await axios.post('https://api.apollo.io/api/v1/mixed_people/api_search', {
      q_organization_name: firmName,
      person_titles: PRIORITY_TITLES,
      email_status: ['verified'],
      per_page: 10,
      page: 1
    }, {
      headers: { 
        'Content-Type': 'application/json', 
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      }
    });

    if (response.data && response.data.people && response.data.people.length > 0) {
      // Filter for people with verified emails
      const peopleWithEmails = response.data.people.filter(p => 
        p.email && p.email_status === 'verified' && 
        !p.email.startsWith('info@') && 
        !p.email.startsWith('sales@') &&
        !p.email.startsWith('ir@')
      );

      if (peopleWithEmails.length > 0) {
        // Prioritize by title seniority
        const sorted = peopleWithEmails.sort((a, b) => {
          const aTitle = (a.title || '').toLowerCase();
          const bTitle = (b.title || '').toLowerCase();
          
          if (aTitle.includes('ceo') || aTitle.includes('chief executive')) return -1;
          if (bTitle.includes('ceo') || bTitle.includes('chief executive')) return 1;
          if (aTitle.includes('managing partner') || aTitle.includes('general partner')) return -1;
          if (bTitle.includes('managing partner') || bTitle.includes('general partner')) return 1;
          if (aTitle.includes('partner')) return -1;
          if (bTitle.includes('partner')) return 1;
          return 0;
        });

        const best = sorted[0];
        return {
          name: best.name || `${best.first_name || ''} ${best.last_name || ''}`.trim(),
          title: best.title || '',
          email: best.email,
          linkedin: best.linkedin_url || '',
          source: 'Apollo API (verified)',
          timestamp: new Date().toISOString().split('T')[0]
        };
      }
    }
    return null;
  } catch (error) {
    console.error(`  ❌ Apollo API error for ${firmName}:`, error.response?.data || error.message);
    return null;
  }
}

async function enrichLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  console.log('📊 Headers:', headers.join(' | '));
  console.log(`\n📋 Total rows: ${rows.length - 1}\n`);

  // Find rows needing enrichment
  const needsEnrichment = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const company = row[0] || '';  // Column A
    const contact = row[2] || '';   // Column C
    const email = row[4] || '';     // Column E
    const website = row[5] || '';   // Column F
    const status = row[9] || '';    // Column J

    // Skip if already enriched with good contact
    if (status.includes('Enriched') && contact && email && 
        !email.startsWith('info@') && 
        !email.startsWith('sales@') &&
        !email.startsWith('ir@')) {
      continue;
    }

    // Need enrichment if: no contact name, no email, or generic email
    const needsWork = !contact || !email || 
                      email.startsWith('info@') || 
                      email.startsWith('sales@') ||
                      email.startsWith('ir@');

    if (needsWork && company) {
      needsEnrichment.push({
        rowIndex: i,
        company,
        contact,
        email,
        website,
        status
      });
    }
  }

  console.log(`🎯 Found ${needsEnrichment.length} firms needing enrichment\n`);

  if (needsEnrichment.length === 0) {
    console.log('✅ No firms need enrichment right now!');
    return;
  }

  // Enrich up to 15 firms
  const toEnrich = needsEnrichment.slice(0, 15);
  const updates = [];
  let enrichedCount = 0;

  for (const lead of toEnrich) {
    console.log(`\n📌 Row ${lead.rowIndex + 1}: ${lead.company}`);
    console.log(`   Current Contact: ${lead.contact || 'EMPTY'}`);
    console.log(`   Current Email: ${lead.email || 'EMPTY'}`);

    // Extract domain from website
    let domain = lead.website;
    if (domain) {
      domain = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
    } else {
      console.log('   ⚠️  No website URL - skipping');
      continue;
    }

    // Search Apollo
    const result = await searchApolloContacts(domain, lead.company);
    
    if (result) {
      console.log(`   ✅ Found: ${result.name} (${result.title})`);
      console.log(`   📧 Email: ${result.email}`);
      
      // Prepare update
      updates.push({
        rowIndex: lead.rowIndex,
        name: result.name,
        title: result.title,
        email: result.email,
        linkedin: result.linkedin,
        status: 'Enriched',
        notes: `${result.source} - ${result.timestamp}`
      });
      
      enrichedCount++;
      
      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1100));
    } else {
      console.log('   ⚠️  No verified contacts found');
    }
  }

  // Write updates back to sheet
  if (updates.length > 0) {
    console.log(`\n📝 Writing ${updates.length} updates to sheet...`);
    
    for (const update of updates) {
      const range = `Sheet1!C${update.rowIndex + 1}:L${update.rowIndex + 1}`;  // C to L
      const values = [[
        update.name,           // C: Contact Name
        update.title,          // D: Title
        update.email,          // E: Email
        '',                    // F: Website (leave existing)
        update.linkedin,       // G: LinkedIn
        '',                    // H: Sector Focus (leave existing)
        '',                    // I: Portfolio Companies (leave existing)
        update.status,         // J: Status
        '',                    // K: Last Contacted (leave existing)
        update.notes           // L: Notes
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        resource: { values }
      });
      
      console.log(`   ✓ Updated row ${update.rowIndex + 1}: ${update.name}`);
    }
  }

  console.log(`\n✅ Enrichment complete!`);
  console.log(`   Enriched: ${enrichedCount} firms`);
  console.log(`   Failed: ${toEnrich.length - enrichedCount} firms`);
}

enrichLeads().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
