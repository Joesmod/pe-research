/**
 * Manual PE enrichment research targets
 * Identify firms needing research, prepare search queries
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function identifyTargets() {
  const sheets = await getSheets();
  
  // Read Sheet1
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:N',
  });
  
  const rows = res.data.values || [];
  
  console.log('📊 PE Enrichment Research Targets\n');
  console.log('='.repeat(80) + '\n');
  
  const targets = [];
  
  for (let i = 1; i < Math.min(rows.length, 100); i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    const company = row[0] || '';
    const website = row[1] || '';
    const currentContact = row[2] || '';
    const currentTitle = row[3] || '';
    const currentEmail = row[4] || '';
    const status = row[9] || '';
    const notes = row[11] || '';
    
    if (!company) continue;
    if (/dead|not qualified/i.test(status)) continue;
    
    // Extract domain
    let domain = '';
    if (website && !website.includes('github.com') && !website.includes('notebooklm')) {
      const match = website.match(/https?:\/\/(www\.)?([^\/]+)/);
      if (match) domain = match[2];
    }
    
    if (!domain) continue;
    
    // Check if needs better contact
    const hasGenericEmail = /^(info@|contact@|sales@|ir@)/i.test(currentEmail);
    const emailWrongDomain = currentEmail && !currentEmail.toLowerCase().includes(domain.split('.')[0].toLowerCase());
    const missingEmail = !currentEmail || currentEmail.trim() === '';
    const missingContact = !currentContact || currentContact.trim() === '';
    
    if (missingContact || missingEmail || hasGenericEmail || emailWrongDomain) {
      targets.push({
        rowIndex: i + 1,
        company,
        website,
        domain,
        currentContact,
        currentTitle,
        currentEmail,
        status,
        notes,
        issue: missingContact ? 'No contact' : (missingEmail ? 'No email' : (hasGenericEmail ? 'Generic email' : 'Wrong domain'))
      });
    }
  }
  
  console.log(`Found ${targets.length} firms needing enrichment\n`);
  
  // Take top 15
  const top15 = targets.slice(0, 15);
  
  // Generate markdown report
  let report = `# PE Enrichment Research Targets\n`;
  report += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
  report += `**Time:** ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago' })}\n\n`;
  report += `## Summary\n\n`;
  report += `- Total firms scanned: ${Math.min(100, rows.length - 1)}\n`;
  report += `- Firms needing enrichment: ${targets.length}\n`;
  report += `- Priority targets (top 15): ${top15.length}\n\n`;
  report += `## Priority Targets for Manual Research\n\n`;
  
  top15.forEach((t, i) => {
    report += `### ${i + 1}. ${t.company}\n\n`;
    report += `- **Row:** ${t.rowIndex}\n`;
    report += `- **Website:** ${t.website}\n`;
    report += `- **Domain:** ${t.domain}\n`;
    report += `- **Current contact:** ${t.currentContact || '(empty)'}\n`;
    report += `- **Current title:** ${t.currentTitle || '(empty)'}\n`;
    report += `- **Current email:** ${t.currentEmail || '(empty)'}\n`;
    report += `- **Issue:** ${t.issue}\n`;
    report += `- **Status:** ${t.status}\n\n`;
    
    report += `**Research queries:**\n`;
    report += `- Team page: \`site:${t.domain} team OR leadership OR partners\`\n`;
    report += `- LinkedIn search: \`site:linkedin.com "${t.company}" (CTO OR "Chief Technology" OR "Operating Partner" OR "Managing Director")\`\n`;
    report += `- Email pattern: Search company team page for email patterns\n`;
    report += `- Press releases: \`site:${t.domain} press release executive OR "announces"\`\n\n`;
    
    report += `**Target titles:**\n`;
    report += `- CTO / Chief Technology Officer\n`;
    report += `- CIO / Chief Information Officer\n`;
    report += `- Operating Partner (Technology/Digital)\n`;
    report += `- Managing Partner / Director\n`;
    report += `- VP Technology / VP Product\n`;
    report += `- Head of Digital / Technology\n\n`;
    
    report += `**Notes:**\n`;
    if (t.notes) {
      report += `${t.notes}\n\n`;
    } else {
      report += `(no existing notes)\n\n`;
    }
    
    report += `---\n\n`;
  });
  
  report += `## Next Steps\n\n`;
  report += `1. For each firm, visit the team/leadership page\n`;
  report += `2. Identify decision-makers matching target titles\n`;
  report += `3. Find verified email addresses (company domain only)\n`;
  report += `4. Verify LinkedIn profiles\n`;
  report += `5. Update the CRM sheet with findings\n\n`;
  
  report += `## Enrichment Guidelines\n\n`;
  report += `- **ONLY use emails from official sources**: company team pages, press releases, LinkedIn verified contacts\n`;
  report += `- **NO guessing email patterns** unless confirmed on company website\n`;
  report += `- **Prefer CTO/CIO** for AI/tech outreach, then Operating Partners, then Managing Directors\n`;
  report += `- **Verify LinkedIn profiles** match the company and title\n`;
  report += `- **Document sources** in the Notes column\n\n`;
  
  // Save report
  const filename = `ENRICHMENT-RESEARCH-${new Date().toISOString().split('T')[0]}.md`;
  fs.writeFileSync(filename, report);
  
  console.log(report);
  console.log(`\n📝 Research report saved to: ${filename}\n`);
  
  return top15;
}

identifyTargets().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
