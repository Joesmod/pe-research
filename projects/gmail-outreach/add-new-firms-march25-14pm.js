const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// New mid-market PE firms to add ($500M-$5B AUM, services-heavy)
const newFirms = [
  {
    company: 'Lightyear Capital',
    website: 'https://www.lycap.com',
    notes: 'Sector-specialist PE firm ~$5B+ AUM. Invests at nexus of financial services, technology, healthcare, and business services. Founded 2002. 50+ investments since 2000.'
  },
  {
    company: 'Huron Capital Partners',
    website: 'https://www.huroncapital.com',
    notes: 'Detroit-based PE firm (founded 1999) focused on lower-middle market. Specializes in business services and healthcare sectors. Buy-and-build strategy in fragmented services sectors. 130+ company investments.'
  },
  {
    company: 'HGGC',
    website: 'https://www.hggc.com',
    notes: 'Mid-market PE firm ~$7B AUM. Focus on technology, business services, healthcare services, and financial services. Structured equity and control-oriented investments.'
  },
  {
    company: 'Arsenal Capital Partners',
    website: 'https://www.arsenalcapital.com',
    notes: 'NY-based PE firm specializing in healthcare and industrial/specialty materials sectors. Mid-market focus.'
  },
  {
    company: 'Behrman Capital',
    website: 'https://www.behrmancap.com',
    notes: 'NY-based PE firm focused on middle-market companies in industrial and business services sectors.'
  }
];

async function enrichPerson(personId) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/people/match',
      {
        id: personId,
        reveal_personal_emails: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.person) {
      const p = response.data.person;
      return {
        name: `${p.first_name} ${p.last_name}`,
        title: p.title,
        email: p.email,
        linkedin: p.linkedin_url,
        verified: p.email_status === 'verified'
      };
    }

    return null;
  } catch (error) {
    console.error(`Enrichment error:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function searchApolloContacts(company) {
  try {
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/search',
      {
        q_organization_name: company,
        person_titles: [
          'CEO', 'Chief Executive Officer',
          'Managing Partner', 'Managing Director', 'Partner', 'General Partner',
          'Principal', 'President', 'COO', 'Chief Operating Officer',
          'CTO', 'Chief Technology Officer', 'CFO',
          'Founder'
        ],
        page: 1,
        per_page: 3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      const enriched = [];
      for (const person of response.data.people) {
        if (person.email) {
          const full = await enrichPerson(person.id);
          if (full && full.email && !full.email.includes('@apollo.io')) {
            enriched.push(full);
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
      return enriched;
    }

    return [];
  } catch (error) {
    console.error(`Apollo search error for ${company}:`, error.response?.data?.message || error.message);
    return [];
  }
}

async function addFirmToSheet(sheets, firm, rowIndex) {
  try {
    // Search Apollo for contacts
    console.log(`\nSearching Apollo for ${firm.company}...`);
    const contacts = await searchApolloContacts(firm.company);
    
    let contactName = '';
    let title = '';
    let email = '';
    let linkedin = '';
    let status = 'Needs Research';
    let notes = firm.notes;
    
    if (contacts.length > 0) {
      console.log(`Found ${contacts.length} contacts:`);
      contacts.forEach((c, idx) => {
        console.log(`  ${idx + 1}. ${c.name} - ${c.title}`);
        console.log(`     ${c.email} ${c.verified ? '✓' : ''}`);
      });
      
      // Pick best contact
      const best = contacts.find(c => c.verified) || contacts[0];
      contactName = best.name;
      title = best.title;
      email = best.email;
      linkedin = best.linkedin;
      status = 'Enriched';
      notes = `${firm.notes} Apollo API verified (${new Date().toISOString().split('T')[0]}) - ${contacts.length} decision-makers found.`;
      
      console.log(`\n✅ Enriched: ${best.name} (${best.title}) - ${best.email}`);
    } else {
      console.log('❌ No contacts found in Apollo - manual research needed');
    }
    
    // Add to sheet
    const updates = [
      { range: `Sheet1!A${rowIndex}`, values: [[firm.company]] },
      { range: `Sheet1!B${rowIndex}`, values: [[firm.website]] },
      { range: `Sheet1!C${rowIndex}`, values: [[contactName]] },
      { range: `Sheet1!D${rowIndex}`, values: [[title]] },
      { range: `Sheet1!E${rowIndex}`, values: [[email]] },
      { range: `Sheet1!F${rowIndex}`, values: [[firm.website]] },  // Website again in column F
      { range: `Sheet1!G${rowIndex}`, values: [[linkedin]] },
      { range: `Sheet1!H${rowIndex}`, values: [[status]] },
      { range: `Sheet1!I${rowIndex}`, values: [[notes]] }
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    return { success: true, enriched: contacts.length > 0 };
  } catch (error) {
    console.error(`Error adding ${firm.company}:`, error.message);
    return { success: false, enriched: false };
  }
}

async function main() {
  console.log('🫡 Adding New Mid-Market PE Firms (March 25, 2026 - 2:16 PM CST)\n');
  console.log('Target: 5 new firms ($500M-$5B AUM, services-heavy)\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Get current row count
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:A',
  });
  
  const currentRows = (response.data.values || []).length;
  console.log(`Current sheet has ${currentRows} rows\n`);
  
  let added = 0;
  let enriched = 0;
  
  for (let i = 0; i < newFirms.length; i++) {
    const firm = newFirms[i];
    const nextRow = currentRows + i + 1;
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Adding Row ${nextRow}: ${firm.company}`);
    console.log(`Website: ${firm.website}`);
    
    const result = await addFirmToSheet(sheets, firm, nextRow);
    
    if (result.success) {
      added++;
      if (result.enriched) enriched++;
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n🫡 NEW FIRMS ADDED: ${added}/${newFirms.length}`);
  console.log(`Enriched with contacts: ${enriched}`);
  console.log(`Need manual research: ${added - enriched}\n`);
}

main().catch(console.error);
