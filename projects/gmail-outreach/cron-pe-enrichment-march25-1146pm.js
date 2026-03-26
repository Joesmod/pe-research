const axios = require('axios');
const { google } = require('googleapis');

const APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw';
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function searchApolloContacts(company, website) {
  try {
    // Extract domain from website
    const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    // Use Apollo API with header auth
    const response = await axios.post(
      'https://api.apollo.io/api/v1/mixed_people/api_search',
      {
        q_organization_domains: [domain],
        page: 1,
        per_page: 15
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY
        }
      }
    );

    if (response.data && response.data.people && response.data.people.length > 0) {
      // CAST A WIDE NET: C-level, Partners, Directors, VPs, Heads of
      const decisionMakers = response.data.people.filter(p => {
        const title = (p.title || '').toLowerCase();
        return (
          title.includes('ceo') || title.includes('chief executive') ||
          title.includes('cto') || title.includes('chief technology') ||
          title.includes('coo') || title.includes('chief operating') ||
          title.includes('cmo') || title.includes('chief marketing') ||
          title.includes('cfo') || title.includes('chief financial') ||
          title.includes('partner') ||
          title.includes('principal') ||
          title.includes('managing director') ||
          title.includes('operating partner') ||
          title.includes('general partner') ||
          title.includes('director') ||
          title.includes('vp') || title.includes('vice president') ||
          title.includes('head of') ||
          title.includes('president')
        );
      });

      // Return contacts with emails
      return decisionMakers
        .filter(p => p.email && !p.email.includes('@apollo.io'))
        .map(p => ({
          name: `${p.first_name} ${p.last_name}`,
          title: p.title,
          email: p.email,
          linkedin: p.linkedin_url,
          verified: p.email_status === 'verified'
        }))
        .slice(0, 8);
    }

    return [];
  } catch (error) {
    console.error(`Apollo search error for ${company}:`, error.response?.data?.message || error.message);
    return [];
  }
}

async function getSheetData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:I',
  });
  
  return { sheets, rows: response.data.values || [] };
}

async function updateSheetRow(sheets, rowIndex, contactName, title, email, linkedin, notes) {
  try {
    const updates = [
      { range: `Sheet1!C${rowIndex}`, values: [[contactName]] },
      { range: `Sheet1!D${rowIndex}`, values: [[title]] },
      { range: `Sheet1!E${rowIndex}`, values: [[email]] },
      { range: `Sheet1!G${rowIndex}`, values: [[linkedin || '']] },
      { range: `Sheet1!H${rowIndex}`, values: [['Enriched']] },
      { range: `Sheet1!I${rowIndex}`, values: [[notes]] }
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    return true;
  } catch (error) {
    console.error(`Error updating row ${rowIndex}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🫡 PE Research & Enrichment - Hourly Run (Wed March 25, 2026 - 11:46 PM CST)\n');
  console.log('Task: Enrich 10-15 leads with empty Contact Name or generic/empty Email\n');
  
  const { sheets, rows } = await getSheetData();
  
  // Find firms needing enrichment
  const targets = [];
  for (let i = 1; i < rows.length && targets.length < 15; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contactName = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[7] || '').trim();
    
    // Skip if no company, dead/not PE, or already enriched
    if (!company || !website || status.toLowerCase().includes('dead') || status.toLowerCase().includes('not pe')) {
      continue;
    }
    
    // Target: No contact name OR empty/generic email
    const hasGenericEmail = email && (
      email.toLowerCase().startsWith('info@') || 
      email.toLowerCase().startsWith('sales@') || 
      email.toLowerCase().startsWith('ir@') ||
      email.toLowerCase().startsWith('contact@') ||
      email.toLowerCase().startsWith('investors@') ||
      email.toLowerCase().startsWith('hello@') ||
      email.toLowerCase().startsWith('support@')
    );
    
    const needsEnrichment = (
      !contactName || 
      !email || 
      hasGenericEmail
    ) && status.toLowerCase() !== 'enriched';
    
    if (needsEnrichment) {
      targets.push({ 
        company, 
        website, 
        rowIndex: i + 1, 
        currentContact: contactName, 
        currentEmail: email 
      });
    }
  }
  
  console.log(`Found ${targets.length} firms needing enrichment\n`);
  
  if (targets.length === 0) {
    console.log('✓ Sheet is fully enriched. No action needed.\n');
    return;
  }
  
  let enriched = 0;
  let notFound = 0;
  const enrichmentLog = [];
  
  // Process up to 12 firms per run
  for (const target of targets.slice(0, 12)) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Row ${target.rowIndex}: ${target.company}`);
    console.log(`Website: ${target.website}`);
    console.log(`Current: ${target.currentContact || '[NONE]'} | ${target.currentEmail || '[NONE]'}`);
    console.log('Searching Apollo API...');
    
    const contacts = await searchApolloContacts(target.company, target.website);
    
    if (contacts.length > 0) {
      console.log(`\n✓ Found ${contacts.length} decision-makers:`);
      contacts.forEach((c, idx) => {
        console.log(`  ${idx + 1}. ${c.name} - ${c.title}`);
        console.log(`     Email: ${c.email} ${c.verified ? '(verified ✓)' : '(unverified)'}`);
        if (c.linkedin) console.log(`     LinkedIn: ${c.linkedin}`);
      });
      
      // Pick best: verified email preferred, then partner/principal, then C-level
      const best = contacts.find(c => c.verified) || 
                   contacts.find(c => c.title.toLowerCase().includes('partner') || c.title.toLowerCase().includes('principal')) ||
                   contacts.find(c => c.title.toLowerCase().includes('ceo') || c.title.toLowerCase().includes('cto') || c.title.toLowerCase().includes('coo')) ||
                   contacts[0];
      
      const notes = `Apollo API (2026-03-25 11:46pm) - ${contacts.length} contacts found. Email verified: ${best.verified ? 'Yes' : 'No'}. Source: Apollo.io database.`;
      
      const success = await updateSheetRow(
        sheets,
        target.rowIndex,
        best.name,
        best.title,
        best.email,
        best.linkedin,
        notes
      );
      
      if (success) {
        console.log(`\n✅ ENRICHED: ${best.name} (${best.title})`);
        console.log(`   Email: ${best.email}`);
        enriched++;
        enrichmentLog.push({
          company: target.company,
          contact: best.name,
          title: best.title,
          email: best.email,
          verified: best.verified
        });
      }
      
      // Rate limit between companies
      await new Promise(r => setTimeout(r, 2000));
    } else {
      console.log('❌ No contacts found in Apollo - firm not in database');
      notFound++;
      
      // Leave a note for manual research
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!I${target.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[`Apollo search: No contacts found (2026-03-25 11:46pm). Firm not in Apollo database. Manual research needed: website team pages, LinkedIn site: search, press releases, or SEC filings.`]]
        }
      });
      
      // Rate limit
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n🫡 ENRICHMENT COMPLETE`);
  console.log(`Processed: ${Math.min(targets.length, 12)} firms`);
  console.log(`Enriched: ${enriched} firms with verified contacts`);
  console.log(`Not found in Apollo: ${notFound} firms (flagged for manual research)\n`);
  
  if (enrichmentLog.length > 0) {
    console.log('✓ Summary of enriched leads:\n');
    enrichmentLog.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.company}`);
      console.log(`   ${item.contact} - ${item.title}`);
      console.log(`   ${item.email} ${item.verified ? '✓ Verified' : '(unverified)'}\n`);
    });
  } else {
    console.log('⚠️  No firms enriched this run - all targets not in Apollo database.');
    console.log('   These firms need manual research (team pages, LinkedIn, etc.)\n');
  }
  
  console.log('Next run: In 1 hour\n');
}

main().catch(console.error);
