const { google } = require('googleapis');
const path = require('path');

const GENERIC_PATTERNS = /^(info|contact|sales|ir|investor\.relations|hello|support|admin|general|inquiries)@/i;

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A:N'
  });
  
  const rows = res.data.values || [];
  
  console.log(`📊 PE RESEARCH CRM STATUS - ${new Date().toLocaleString()}\n`);
  console.log(`Total rows in sheet: ${rows.length}`);
  console.log(`Total firms (excluding header): ${rows.length - 1}\n`);
  
  // Count by status
  const statusCounts = {};
  let withContact = 0;
  let withEmail = 0;
  let withDirectEmail = 0;
  let withLinkedIn = 0;
  let withWebsite = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const linkedin = (row[6] || '').trim();
    const status = (row[9] || '').trim();
    
    if (!company) continue;
    
    // Count by status
    const statusKey = status || '(empty)';
    statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
    
    // Count enrichment completeness
    if (contact) withContact++;
    if (email) withEmail++;
    if (email && !GENERIC_PATTERNS.test(email)) withDirectEmail++;
    if (linkedin) withLinkedIn++;
    if (website) withWebsite++;
  }
  
  const totalFirms = rows.length - 1;
  
  console.log(`📈 STATUS BREAKDOWN:`);
  Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      const pct = ((count / totalFirms) * 100).toFixed(1);
      console.log(`  ${status.padEnd(20)} ${count.toString().padStart(5)} (${pct}%)`);
    });
  
  console.log(`\n✅ ENRICHMENT COMPLETENESS:`);
  console.log(`  With contact name:     ${withContact}/${totalFirms} (${((withContact/totalFirms)*100).toFixed(1)}%)`);
  console.log(`  With email:            ${withEmail}/${totalFirms} (${((withEmail/totalFirms)*100).toFixed(1)}%)`);
  console.log(`  With direct email:     ${withDirectEmail}/${totalFirms} (${((withDirectEmail/totalFirms)*100).toFixed(1)}%)`);
  console.log(`  With LinkedIn:         ${withLinkedIn}/${totalFirms} (${((withLinkedIn/totalFirms)*100).toFixed(1)}%)`);
  console.log(`  With website:          ${withWebsite}/${totalFirms} (${((withWebsite/totalFirms)*100).toFixed(1)}%)`);
  
  // Find any that still need enrichment
  const needsEnrichment = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const company = (row[0] || '').trim();
    const website = (row[1] || '').trim();
    const contact = (row[2] || '').trim();
    const email = (row[4] || '').trim();
    const status = (row[9] || '').trim().toLowerCase();
    
    if (!company || status === 'dead' || status === 'sent') continue;
    
    if (!contact || !email || GENERIC_PATTERNS.test(email)) {
      needsEnrichment.push({
        row: i + 1,
        company,
        website,
        reason: !contact ? 'No contact' : (!email ? 'No email' : 'Generic email'),
      });
    }
  }
  
  console.log(`\n🎯 LEADS NEEDING ENRICHMENT: ${needsEnrichment.length}`);
  
  if (needsEnrichment.length > 0) {
    console.log(`\nTop 10 firms needing enrichment:`);
    needsEnrichment.slice(0, 10).forEach(lead => {
      console.log(`  Row ${lead.row}: ${lead.company} - ${lead.reason} - ${lead.website || '(no website)'}`);
    });
  } else {
    console.log(`  ✅ All active leads are fully enriched!`);
  }
  
  console.log(`\n✨ SUMMARY:`);
  if (needsEnrichment.length === 0) {
    console.log(`  🎉 CRM is fully enriched - no action needed!`);
    console.log(`  📬 ${statusCounts['Enriched'] || 0} leads ready for outreach`);
    console.log(`  ✉️  ${statusCounts['Sent'] || 0} emails already sent`);
  } else {
    console.log(`  ⚠️  ${needsEnrichment.length} leads still need enrichment`);
  }
  
})().catch(console.error);
