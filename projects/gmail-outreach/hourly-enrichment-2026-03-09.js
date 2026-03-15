const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// NEW enrichments from hourly research run - March 9, 2026
// Focus: Adding senior decision-makers with verified emails
const enrichments = [
  {
    searchFirm: 'Trivest Partners',
    note: 'ADDITION: Troy Templeton is Chairman-level, more senior than existing Reid Callaway contact',
    contactName: 'Troy Templeton',
    title: 'Chairman / Managing Director',
    email: 'ttempleton@trivest.com',
    linkedin: 'https://www.linkedin.com/in/troy-templeton',
    status: 'Enriched',
    notes: 'Source: ContactOut/ZoomInfo verified (2026-03-09). Chairman-level contact. Existing contact Reid Callaway (rcallaway@trivest.com) is good but Troy is more senior.'
  },
  {
    searchFirm: 'Brookside Capital',
    note: 'Was empty - adding Managing Partner',
    contactName: 'Corey Sclar',
    title: 'Managing Partner',
    email: '',  // Pattern found (c******@brooksidecp.com) but not fully verified
    linkedin: 'https://www.linkedin.com/in/corey-sclar-25404525',
    status: 'Research - Needs Email',
    notes: 'Source: LinkedIn/Mergr verified (2026-03-09). Email pattern c******@brooksidecp.com found on RocketReach but requires verification. Joined Brookside 2001, responsible for firm management.'
  },
  {
    searchFirm: 'Pharos Capital Group',
    note: 'ADDITION: CEO/Founder more senior than existing Adam Persiani contact',
    contactName: 'Kneeland Youngblood (CEO/Founder - add as 2nd row)',
    title: 'Founding Partner, Chairman & CEO',
    email: '',
    linkedin: 'https://www.linkedin.com/company/pharos-capital-group',
    status: 'Research - Needs Email',
    notes: 'Source: Official website (2026-03-09). Physician-founded PE firm, Dallas/Nashville. Existing contact Adam Persiani (apersiani@pharosfunds.com) is good, but Kneeland is founder/CEO level.'
  },
  {
    searchFirm: 'ShoreView Industries',
    note: 'ADDITION: Adam Reeves is Partner-level',
    contactName: 'Adam Reeves',
    title: 'Partner',
    email: '',  // Pattern a******@shoreview.com found but not verified
    linkedin: 'https://www.linkedin.com/in/adam-reeves-57840721',
    status: 'Research - Needs Email',
    notes: 'Source: ShoreView.com team page (2026-03-09). Partner since 2011. Email pattern a******@shoreview.com on RocketReach but requires verification. Minneapolis-based.'
  },
  {
    searchFirm: 'Gryphon Investors',
    note: 'Already has R. David Andrews listed with andrews@gryphoninvestors.com - VERIFY this email',
    contactName: 'R. David Andrews (verify email)',
    title: 'Founder & Co-CEO',
    email: '',  // Existing email "andrews@gryphoninvestors.com" needs verification
    linkedin: '',
    status: 'Research - Verify Email',
    notes: 'Source: Gryphon-inv.com (2026-03-09). Existing email andrews@gryphoninvestors.com in sheet needs verification - not found on official sources in this research pass.'
  }
];

async function main() {
  console.log('🔍 Hourly PE Research & Enrichment - March 9, 2026 3:36 PM');
  console.log('📋 Research Summary:\n');
  
  enrichments.forEach((item, i) => {
    console.log(`${i + 1}. ${item.searchFirm}`);
    console.log(`   Contact: ${item.contactName}`);
    console.log(`   Title: ${item.title}`);
    console.log(`   Email: ${item.email || 'NOT VERIFIED'}`);
    console.log(`   LinkedIn: ${item.linkedin || 'N/A'}`);
    console.log(`   Note: ${item.note}`);
    console.log(`   Status: ${item.status}`);
    console.log('');
  });
  
  console.log('\n📊 Summary:');
  console.log(`   - Firms researched: 5`);
  console.log(`   - Verified emails found: 1 (Trivest - Troy Templeton)`);
  console.log(`   - Partial matches (need verification): 2 (Brookside, ShoreView)`);
  console.log(`   - Senior contacts identified (no email): 2 (Pharos CEO, Gryphon verify)`);
  console.log('\n⚠️  Manual update required - script would need row numbers for sheet updates.');
  console.log('   Recommendation: Add these to CRM manually or extend script with row finder logic.');
}

main().catch(console.error);
