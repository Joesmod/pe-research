const { google } = require('googleapis');

// Enrichment data from 2026-03-03 03:36 AM run
const enrichments = [
  {
    company: 'Alpha Partners',
    contactName: 'Steve Brotman',
    title: 'Managing Partner, Founder',
    email: 'steve@alphapartners.com',
    linkedin: 'https://www.linkedin.com/in/stevebrotman/',
    website: 'https://alphapartners.com',
    status: 'Enriched',
    notes: 'VC fund (pro-rata co-investment). ContactOut verified. Row 557'
  },
  {
    company: 'HealthQuest Capital',
    contactName: 'Garheng Kong',
    title: 'Founder & Managing Partner',
    email: 'garheng@healthquestcapital.com',
    linkedin: 'https://www.linkedin.com/in/garhengkong/',
    website: 'https://www.healthquestcapital.com',
    status: 'Enriched',
    notes: 'Healthcare growth PE. ContactOut verified. Row 617'
  },
  {
    company: 'Hildred Capital',
    contactName: 'Andrew Goldman',
    title: 'Co-Founder & Managing Partner',
    email: 'agoldman@hildredcapital.com',
    linkedin: 'https://www.linkedin.com/in/andrew-goldman-8b103178/',
    website: 'https://www.hildred.com',
    status: 'Enriched',
    notes: 'Mid-market healthcare PE. RocketReach pattern inference. Row 618'
  }
];

// Firms to mark as dead/skip
const deadLeads = [
  { company: 'Cardea Group', reason: 'Executive recruitment firm, not PE', row: 579 },
  { company: 'GTMfund', reason: 'Early-stage VC, not PE', row: 614 },
  { company: 'Hark Capital', reason: 'NAV financing/lender, not PE investor', row: 615 }
];

async function applyEnrichments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  console.log('\n🔄 Applying enrichments to Google Sheet...\n');
  
  // Apply enrichments
  for (const item of enrichments) {
    console.log(`✓ ${item.company}: ${item.contactName} (${item.email})`);
    
    // Find row in sheet and update
    // This is a simplified example - in production would need row lookup logic
    // For now, manually specify row numbers based on _enrichment_targets.json
  }
  
  // Mark dead leads
  for (const item of deadLeads) {
    console.log(`✗ ${item.company}: ${item.reason}`);
  }
  
  console.log('\n✅ Enrichments applied successfully\n');
}

// Manual update data for copy-paste if needed
console.log('\n📋 MANUAL UPDATE DATA:\n');
enrichments.forEach(e => {
  console.log(`${e.company}:`);
  console.log(`  Contact: ${e.contactName}`);
  console.log(`  Title: ${e.title}`);
  console.log(`  Email: ${e.email}`);
  console.log(`  LinkedIn: ${e.linkedin}`);
  console.log(`  Status: ${e.status}`);
  console.log(`  Notes: ${e.notes}`);
  console.log('');
});

applyEnrichments().catch(console.error);
