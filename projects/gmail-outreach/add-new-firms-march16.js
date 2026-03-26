/**
 * Add New PE Firms - March 16, 2026 9:37 PM
 * Add 3-5 new mid-market PE firms ($500M-$5B AUM, services-heavy)
 */

const { google } = require('googleapis');
const path = require('path');
const fetch = require('node-fetch');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');
const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';

const COL = {
  COMPANY: 0,
  WEBSITE: 1,
  CONTACT: 2,
  TITLE: 3,
  EMAIL: 4,
  LINKEDIN: 6,
  STATUS: 7,
  NOTES: 8,
};

const newFirms = [
  {
    name: 'Svoboda Capital Partners',
    domain: 'svoco.com',
    website: 'https://svoco.com',
    sector: 'Professional Services, Industrial & Commercial Services, Transportation & Logistics',
    notes: 'Chicago-based middle market. Business services focus.',
  },
  {
    name: 'May River Capital',
    domain: 'mayrivercapital.com',
    website: 'https://mayrivercapital.com',
    sector: 'Industrial, Business Services',
    notes: 'Chicago-based. Lower middle-market industrial growth businesses.',
  },
  {
    name: 'CIVC Partners',
    domain: 'civc.com',
    website: 'https://www.civc.com',
    sector: 'Business Services',
    notes: 'Chicago-based middle-market. Pure business services focus.',
  },
  {
    name: 'New Harbor Capital',
    domain: 'newharborcap.com',
    website: 'https://www.newharborcap.com',
    sector: 'Business Services, Manufacturing, Distribution',
    notes: 'Chicago-based. Lower middle-market specialist.',
  },
];

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function checkIfExists(sheets, companyName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:A',
  });
  
  const companies = (res.data.values || []).map(row => (row[0] || '').trim().toLowerCase());
  return companies.includes(companyName.toLowerCase());
}

async function apolloSearch(domain, companyName) {
  console.log(`  🔍 Apollo: ${domain}`);
  
  const body = {
    api_key: APOLLO_API_KEY,
    q_organization_domains: [domain],
    person_titles: [
      'Managing Partner', 'Managing Director', 'General Partner', 'Operating Partner',
      'Co-Founder', 'Founder', 'President',
      'CTO', 'CIO', 'Chief Technology', 'Chief Information',
      'VP Technology', 'VP Operations', 'VP Digital',
      'Director Technology', 'Director Operations', 'Director Digital',
      'Head of Technology', 'Head of Operations',
    ],
    page: 1,
    per_page: 10,
  };
  
  const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apollo ${res.status}: ${text.substring(0, 200)}`);
  }
  
  const data = await res.json();
  const people = data.people || [];
  
  if (people.length === 0) {
    console.log(`    ❌ No results`);
    return null;
  }
  
  // Return first person with email
  for (const person of people) {
    if (person.email) {
      console.log(`    ✅ ${person.name} (${person.title}) - ${person.email}`);
      return {
        name: person.name || '',
        title: person.title || '',
        email: person.email || '',
        linkedin: person.linkedin_url || '',
        source: 'Apollo API',
      };
    }
  }
  
  console.log(`    ⚠️  Found ${people.length} people but no emails`);
  return null;
}

async function addNewFirms() {
  const sheets = await getSheets();
  
  console.log(`📊 Adding ${newFirms.length} new PE firms...\n`);
  
  const rowsToAdd = [];
  let addedCount = 0;
  
  for (const firm of newFirms) {
    console.log(`\n🏢 ${firm.name}`);
    
    // Check if already exists
    const exists = await checkIfExists(sheets, firm.name);
    if (exists) {
      console.log(`  ⏭️  Already in sheet, skipping`);
      continue;
    }
    
    try {
      // Search for contact via Apollo
      const contact = await apolloSearch(firm.domain, firm.name);
      
      if (contact) {
        const timestamp = new Date().toISOString().split('T')[0];
        const newRow = [
          firm.name,                                    // Company Name
          firm.website,                                 // Website
          contact.name,                                 // Contact
          contact.title,                                // Title
          contact.email,                                // Email
          '',                                           // (empty column)
          contact.linkedin,                             // LinkedIn
          'Enriched',                                   // Status
          `${firm.notes} Found via ${contact.source}. ${timestamp} cron research.`, // Notes
          'Researched',                                 // Status2
          '',                                           // Last Contacted
          '',                                           // Notes2
          firm.website,                                 // Company Info URL
          '',                                           // Gumbo Score
        ];
        
        rowsToAdd.push(newRow);
        addedCount++;
        console.log(`  ✅ ADDED`);
      } else {
        // Add without contact (manual research needed)
        const newRow = [
          firm.name,
          firm.website,
          '',                                           // Contact
          '',                                           // Title
          '',                                           // Email
          '',
          '',                                           // LinkedIn
          'Needs Manual Research',                      // Status
          firm.notes,                                   // Notes
          'Research',
          '',
          '',
          firm.website,
          '',
        ];
        
        rowsToAdd.push(newRow);
        addedCount++;
        console.log(`  ⚠️  ADDED (no contact found - needs manual research)`);
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 1500));
      
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }
  
  // Append new rows
  if (rowsToAdd.length > 0) {
    console.log(`\n💾 Appending ${rowsToAdd.length} new firms to sheet...`);
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: CRM_SHEET_ID,
      range: 'Sheet1!A:N',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rowsToAdd,
      },
    });
    
    console.log(`✅ New firms added!`);
  }
  
  // Summary
  console.log(`\n📊 NEW FIRMS SUMMARY`);
  console.log(`─`.repeat(50));
  console.log(`  Firms checked: ${newFirms.length}`);
  console.log(`  Successfully added: ${addedCount}`);
  console.log(`─`.repeat(50));
  
  return { addedCount };
}

addNewFirms().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
