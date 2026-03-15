const { google } = require('googleapis');
const path = require('path');
const fs = require('fs').promises;

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');
const DOSSIER_DIR = path.join(__dirname, '..', '..', 'pe-research', 'PE-firms');

async function enrichLead(company, websiteUrl) {
  console.log(`\n🔍 Researching: ${company}${websiteUrl ? ` (${websiteUrl})` : ''}`);
  
  // Search queries to cast a wide net
  const searches = [
    `${company} CEO email contact`,
    `${company} Managing Partner contact email`,
    `${company} leadership team contact`,
    `${company} Partners page`,
    `site:linkedin.com/in ${company} Partner OR CEO OR CTO`,
    `${company} "VP" OR "Director" email contact`
  ];
  
  const findings = {
    contact: null,
    title: null,
    email: null,
    linkedin: null,
    source: null,
    notes: []
  };
  
  // NOTE: In production, this would use web_search and web_fetch tools
  // For now, log the search strategy
  console.log(`  📋 Would search:`);
  searches.forEach((q, idx) => console.log(`     ${idx + 1}. ${q}`));
  
  findings.notes.push(`Automated search attempted on ${new Date().toISOString().split('T')[0]}`);
  findings.notes.push(`Target roles: CEO, Managing Partner, CTO, VP Technology, Director BD`);
  
  return findings;
}

async function run() {
  try {
    console.log('🚀 PE Research & Enrichment Cron - Starting...\n');
    
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read the sheet
    console.log('📖 Reading Google Sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:O'
    });
    
    const rows = response.data.values || [];
    if (rows.length === 0) {
      console.log('⚠️  No data found in sheet.');
      return;
    }
    
    const headers = rows[0];
    const companyIdx = headers.indexOf('Company/Firm');
    const contactIdx = headers.indexOf('Contact Name');
    const titleIdx = headers.indexOf('Position/Title');
    const emailIdx = headers.indexOf('Email');
    const websiteIdx = headers.indexOf('Website');
    const statusIdx = headers.indexOf('Status');
    const linkedinIdx = headers.indexOf('LinkedIn URL');
    const notesIdx = headers.indexOf('Notes');
    
    console.log(`\n📊 Sheet has ${rows.length - 1} rows (excluding header)`);
    
    // Find leads needing enrichment
    const needsEnrichment = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const company = row[companyIdx] || '';
      const contact = row[contactIdx] || '';
      const email = row[emailIdx] || '';
      const status = (row[statusIdx] || '').toLowerCase();
      const website = row[websiteIdx] || '';
      
      if (!company) continue;
      if (status === 'dead' || status === 'researched - dead' || status === 'closed') continue;
      
      const hasGenericEmail = email && (
        email.includes('@info') ||
        email.includes('@sales') ||
        email.includes('@ir') ||
        email.includes('@contact') ||
        email.includes('@hello')
      );
      
      const needsWork = !contact || !email || hasGenericEmail;
      
      if (needsWork) {
        needsEnrichment.push({
          rowNum: i + 1,
          rowIndex: i,
          company,
          contact,
          title: row[titleIdx] || '',
          email,
          website,
          status: row[statusIdx] || '',
          linkedin: row[linkedinIdx] || '',
          notes: row[notesIdx] || ''
        });
      }
    }
    
    console.log(`\n✅ Found ${needsEnrichment.length} leads needing enrichment`);
    
    // Prioritize: empty contact/email first
    needsEnrichment.sort((a, b) => {
      const aScore = (!a.contact ? 2 : 0) + (!a.email ? 2 : 0);
      const bScore = (!b.contact ? 2 : 0) + (!b.email ? 2 : 0);
      return bScore - aScore;
    });
    
    // Process top 10-15
    const toProcess = needsEnrichment.slice(0, 12);
    console.log(`\n🎯 Processing ${toProcess.length} highest-priority leads:\n`);
    
    const updates = [];
    const enrichmentResults = [];
    
    for (const lead of toProcess) {
      console.log(`\n[${ toProcess.indexOf(lead) + 1}/${toProcess.length}] Row ${lead.rowNum}: ${lead.company}`);
      console.log(`   Current: Contact="${lead.contact || '(empty)'}" Email="${lead.email || '(empty)'}"`);
      
      // Perform enrichment research
      const findings = await enrichLead(lead.company, lead.website);
      
      // Prepare update if we found something
      if (findings.contact || findings.email) {
        updates.push({
          range: `Sheet1!B${lead.rowNum}:H${lead.rowNum}`,
          values: [[
            findings.contact || lead.contact,
            findings.title || lead.title,
            findings.email || lead.email,
            lead.website,
            'Enriched',
            findings.linkedin || lead.linkedin,
            [lead.notes, ...findings.notes].filter(Boolean).join(' | ')
          ]]
        });
        
        enrichmentResults.push({
          company: lead.company,
          contact: findings.contact,
          title: findings.title,
          email: findings.email,
          source: findings.source
        });
        
        console.log(`   ✅ Found: ${findings.contact} (${findings.title}) - ${findings.email}`);
      } else {
        console.log(`   ⚠️  No verified contact found - left blank`);
        enrichmentResults.push({
          company: lead.company,
          contact: null,
          status: 'Manual research needed'
        });
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Update sheet if we have changes
    if (updates.length > 0) {
      console.log(`\n📝 Updating ${updates.length} rows in Google Sheet...`);
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          data: updates,
          valueInputOption: 'RAW'
        }
      });
      console.log(`✅ Sheet updated successfully`);
    } else {
      console.log(`\n⚠️  No verified contacts found - no sheet updates`);
    }
    
    // Save results log
    const logPath = path.join(__dirname, `cron-enrichment-results-march15-${Date.now()}.json`);
    await fs.writeFile(logPath, JSON.stringify(enrichmentResults, null, 2));
    console.log(`\n📄 Results logged to: ${logPath}`);
    
    // Summary report
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 ENRICHMENT SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total leads scanned: ${needsEnrichment.length}`);
    console.log(`Leads processed: ${toProcess.length}`);
    console.log(`Sheet updates: ${updates.length}`);
    console.log(`Successfully enriched: ${enrichmentResults.filter(r => r.contact).length}`);
    console.log(`Need manual research: ${enrichmentResults.filter(r => !r.contact).length}`);
    console.log(`${'='.repeat(60)}\n`);
    
    return {
      total: needsEnrichment.length,
      processed: toProcess.length,
      enriched: enrichmentResults.filter(r => r.contact).length,
      needsManual: enrichmentResults.filter(r => !r.contact).length
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

// Run the enrichment
run().then(summary => {
  console.log(`\n✅ Cron job complete!`);
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Cron job failed:', err.message);
  process.exit(1);
});
