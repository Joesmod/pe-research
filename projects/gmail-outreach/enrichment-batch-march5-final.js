const { google } = require('googleapis');

async function batchEnrichment() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Updates for firms researched in this session
  const updates = [
    // Corridor Capital - VERIFIED EMAIL FROM OFFICIAL SOURCE
    {
      range: 'Sheet1!A729:L729',
      values: [[
        'Corridor Capital',
        'http://www.corridorcap.com',
        'Craig Enenstein',
        'Founder & CEO',
        'craig@corridorcap.com',
        'http://www.corridorcap.com',
        'https://www.linkedin.com/in/craig-enenstein/',
        'Business Services, Industrial, Consumer',
        'World Wide Land Transfer, Indo-European Foods (sold to Ziyad Brothers 2024), SPM Group (sold 2023)',
        'Enriched',
        '2026-03-05',
        'Los Angeles. Lower middle market PE. Email VERIFIED from official Corridor Capital PDF (corridorcapital.com). Phone: 310-442-7001. Other contacts: Iman Navi (MD), Geoff Greulich (MD Operations).'
      ]]
    },
    
    // 3G Capital - HIGH-PROFILE BUT EXTREMELY PRIVATE
    {
      range: 'Sheet1!A696:L696',
      values: [[
        '3G Capital',
        'http://www.3g-capital.com',
        'Alex Behring',
        'Co-Founder & Co-Managing Partner',
        '',
        'http://www.3g-capital.com',
        'https://www.linkedin.com/in/alex-behring-72678424',
        'Consumer, Food & Beverage, Retail',
        'Burger King, Heinz, Kraft, Restaurant Brands International, AB InBev',
        'Partial',
        '2026-03-05',
        'Global PE firm. Founded 2004 from Brazilian investment office of Lemann/Sicupira/Telles. Co-Managing Partners: Alex Behring & Daniel Schwartz. Extremely private - no team page, no public emails. 36-person team per Tracxn.'
      ]]
    },
    
    // Ancor Capital Partners - CONTACT IDENTIFIED
    {
      range: 'Sheet1!A702:L702',
      values: [[
        'Ancor Capital Partners',
        'http://www.ancorcapital.com',
        'Brook Smith',
        'Partner & Managing Director',
        '',
        'http://www.ancorcapital.com',
        'https://www.linkedin.com/in/brook-smith-a935508',
        'Healthcare, Industrial, Manufacturing, Consumer',
        'Care Options for Kids, Advanced Tissue, Duva Sawko, PMA Photometals, Industrial Timber, LSC Environmental',
        'Partial',
        '2026-03-05',
        'Southlake TX. Founded 1994. Brook Smith: 35+ yrs middle-market exp, oversees capital raising & IR. Ex-RBC Dain Rauscher, ex-Southwest Securities. Email pattern likely [first_initial][last]@ancorcapital.com. General: newdeals@ancorcapital.com (verified from contact page).'
      ]]
    },
    
    // Atlantic Street Capital - ADVISORY FIRM NOT PE INVESTOR
    {
      range: 'Sheet1!A711:L711',
      values: [[
        'Atlantic Street Capital Advisors, Inc.',
        'http://www.atlanticstreetcapital.com',
        'Peter Shabecoff',
        'Founder & Managing Partner',
        '',
        'http://www.atlanticstreetcapital.com',
        'https://www.linkedin.com/in/peter-shabecoff',
        'Advisory/Operating Partners',
        'Active group of senior executives providing strategic guidance to portfolio companies',
        'Partial',
        '2026-03-05',
        'Founded 2006. LMM focus. APPEARS TO BE CAPITAL ADVISORY FIRM, not direct PE investor - "active group of senior executives who provide strategic guidance and operational expertise to portfolio companies." May not be appropriate target for PE outreach.'
      ]]
    },
    
    // Sageview Capital - LARGE TEAM IDENTIFIED
    {
      range: 'Sheet1!A728:L728',
      values: [[
        'Sageview Capital',
        'http://www.sageviewcapital.com',
        'Ned Gilhuly',
        'Co-Founder & Partner',
        '',
        'http://www.sageviewcapital.com',
        'https://www.sageviewcapital.com/team/ned-gilhuly/',
        'Business Services, Technology, Consumer',
        'Growth equity and operational support to mid-market companies',
        'Partial',
        '2026-03-05',
        'Palo Alto/Greenwich. Co-Founders: Ned Gilhuly & Scott Stuart. Partners: Dean Nelson, Jeff Klemens, Sasank Chary, Roberto Avila, Caitlin Vorlicek. CFO: Vladimir Galperin. Promoted team Dec 2025. General: info@sageviewcapital.com. Phone: 650-473-5400 (PA), 203-625-4200 (CT).'
      ]]
    },
    
    // Wynnchurch Capital - ESTABLISHED FIRM
    {
      range: 'Sheet1!A734:L734',
      values: [[
        'Wynnchurch Capital',
        'http://www.wynnchurch.com',
        'Greg Gleason',
        'Managing Partner',
        '',
        'http://www.wynnchurch.com',
        'https://www.wynnchurch.com/team',
        'Business Services, Industrial, Manufacturing, Consumer',
        'Middle market operational PE',
        'Partial',
        '2026-03-05',
        'Rosemont IL. Founded 1999. $8.6B AUM. Managing Partner: Greg Gleason. Partner-mentality culture. Phone: 847-604-6100. Toll Free: 877-604-6111. 150+ acquisitions since inception. No emails published on website.'
      ]]
    },
    
    // Peak Rock Capital - LARGE MULTI-STRATEGY FIRM
    {
      range: 'Sheet1!A730:L730',
      values: [[
        'Peak Rock Capital',
        'http://www.peakrockcapital.com',
        'Anthony DiSimone',
        'Chief Executive Officer',
        '',
        'http://www.peakrockcapital.com',
        'https://www.linkedin.com/in/anthony-disimone',
        'Business Services, Consumer, Industrial, Healthcare',
        'Multi-strategy PE + Credit. Paragon Healthcare (sold to Elevance 2024), Cotton Holdings, Anderson Business Advisors',
        'Partial',
        '2026-03-05',
        'Austin TX/London. CEO: Anthony DiSimone. President: Steve Martinez. Senior MDs: Jordan Campbell, Robert Strauss. Has Peak Growth Consulting (dedicated ops/value creation arm). Large team (20+ MDs). London phone: +44 20 3915 8500. No direct emails published.'
      ]]
    }
  ];
  
  // Execute batch update
  console.log('=== PE ENRICHMENT BATCH - March 5, 2026 6:06 AM ===\n');
  let successCount = 0;
  let failCount = 0;
  
  for (const update of updates) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: update.range,
        valueInputOption: 'RAW',
        resource: { values: update.values }
      });
      console.log(`✓ ${update.values[0][0]} (${update.values[0][9]})`);
      successCount++;
    } catch (err) {
      console.error(`✗ Failed ${update.range}:`, err.message);
      failCount++;
    }
  }
  
  console.log(`\n📊 ENRICHMENT SUMMARY`);
  console.log(`   Total firms processed: ${updates.length}`);
  console.log(`   Successfully updated: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`\n✅ STATUS BREAKDOWN:`);
  console.log(`   Enriched (verified email): 1 (Corridor Capital)`);
  console.log(`   Partial (contact identified, no verified email): 6`);
  console.log(`\n📝 RECOMMENDATIONS:`);
  console.log(`   1. Use Apollo API for email verification on "Partial" status firms`);
  console.log(`   2. Atlantic Street Capital may not be PE investor - verify before outreach`);
  console.log(`   3. 3G Capital extremely private - low priority for cold outreach`);
  console.log(`   4. Corridor Capital = READY FOR OUTREACH (verified email)`);
}

batchEnrichment().catch(console.error);
