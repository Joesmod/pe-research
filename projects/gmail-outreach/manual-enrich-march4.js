// Manual enrichment using web search when Apollo credits are exhausted
const { google } = require('googleapis');
const fs = require('fs');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Manual enrichment targets from research
const manualEnrichments = [
  {
    rowNum: 216,
    company: 'Falconhead Capital',
    contactName: 'Ken Conn',
    title: 'Co-Founder & Managing Partner',
    email: 'kconn@falconheadcapital.com',
    linkedin: 'https://www.linkedin.com/in/ken-conn',
    source: 'Found on falconheadcapital.com/team/ken-conn (official site)',
    notes: 'Co-Founder & MP. 30+ years PE experience. San Mateo, CA office.'
  },
  {
    rowNum: 216,
    company: 'Falconhead Capital',
    contactName: 'Tom Tebbe',
    title: 'Co-Founder & Managing Partner',
    email: 'ttebbe@falconheadcapital.com',
    linkedin: 'https://www.linkedin.com/in/tom-tebbe',
    source: 'Found on falconheadcapital.com/team (official site)',
    notes: 'Co-Founder & MP. Ex-Partner at Accel-KKR.'
  },
  {
    rowNum: 231,
    company: 'Clayton Dubilier & Rice (CD&R)',
    contactName: 'Vikas Sinha',
    title: 'Operating Partner & Chief Technology Officer',
    email: 'VSinha@cdr-inc.com',
    linkedin: 'https://www.linkedin.com/in/vikas-sinha',
    source: 'Found on cdr.com/our-people (official site)',
    notes: 'Operating Partner & CTO. Ideal AI/tech contact. Ex-CTO multiple portfolio companies.'
  },
  {
    rowNum: 668,
    company: 'Ribbit Capital',
    contactName: 'Micky Malka',
    title: 'Founder & Managing Partner',
    email: 'micky@ribbit.com',
    linkedin: 'https://www.linkedin.com/in/mickymalka',
    source: 'Email pattern from ribbit.com/team',
    notes: 'Founder & MP. Fintech-focused VC/growth equity. Palo Alto based.'
  },
  {
    rowNum: 670,
    company: 'ScaleView Partners',
    contactName: 'Tom Leighton',
    title: 'Managing Director & Co-Founder',
    email: 'tleighton@scaleviewpartners.com',
    linkedin: 'https://www.linkedin.com/in/tom-leighton-mba-1409a62',
    source: 'Found on scaleviewpartners.com/team (official site)',
    notes: 'MD & Co-Founder. SaaS-focused growth equity. Boulder, CO.'
  },
  {
    rowNum: 672,
    company: 'Sidekick Partners',
    contactName: 'Gavin Seebacher',
    title: 'Managing Partner',
    email: 'gavin@sidekickpartners.com',
    linkedin: 'https://www.linkedin.com/in/gavin-seebacher',
    source: 'Email from sidekickpartners.com/contact',
    notes: 'Managing Partner. Healthcare-focused PE. Email from official contact page.'
  },
  {
    rowNum: 675,
    company: 'Solomon Partners',
    contactName: 'Marc Cooper',
    title: 'Vice Chairman',
    email: 'marc.cooper@solomonpartners.com',
    linkedin: 'https://www.linkedin.com/in/marc-cooper-7b58b11',
    source: 'Found on solomonpartners.com/our-people',
    notes: 'Vice Chairman. Investment banking & advisory. Healthcare expertise.'
  },
  {
    rowNum: 680,
    company: 'Sunstone Partners',
    contactName: 'Walt Conrad',
    title: 'Managing Director',
    email: 'wconrad@sunstonepartners.com',
    linkedin: 'https://www.linkedin.com/in/walt-conrad',
    source: 'Verified from PRNewswire (Answer 1 acquisition, Oct 2018)',
    notes: 'MD. AI & tech-enabled services growth PE. $475M Fund II. Phoenix, AZ.'
  },
  {
    rowNum: 677,
    company: 'Space Capital',
    contactName: 'Chad Anderson',
    title: 'Founder & Managing Partner',
    email: 'chad@spacecapital.com',
    linkedin: 'https://www.linkedin.com/in/chadanderson',
    source: 'Email pattern from spacecapital.com/team',
    notes: 'Founder & MP. Space tech/aerospace-focused VC. NYC-based.'
  },
  {
    rowNum: 681,
    company: 'Tailwater Capital LLC',
    contactName: 'Jason Downie',
    title: 'Co-Founder and Managing Partner',
    email: 'jdownie@tailwatercapital.com',
    linkedin: 'https://www.linkedin.com/in/jason-downie',
    source: 'Email pattern from tailwatercapital.com/our-team',
    notes: 'Co-Founder & MP. Energy-focused PE. Dallas-based.'
  }
];

async function manualEnrich() {
  console.log('=== Manual Enrichment - March 4, 2026 8:06 AM ===');
  console.log(`Processing ${manualEnrichments.length} manually researched contacts\n`);
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:N'
  });
  
  const rows = res.data.values || [];
  const updates = [];
  
  for (const enrichment of manualEnrichments) {
    console.log(`\n[Row ${enrichment.rowNum}] ${enrichment.company}`);
    console.log(`  Contact: ${enrichment.contactName}`);
    console.log(`  Title: ${enrichment.title}`);
    console.log(`  Email: ${enrichment.email}`);
    console.log(`  Source: ${enrichment.source}`);
    
    const rowIdx = enrichment.rowNum - 1;
    const currentRow = rows[rowIdx] || [];
    const newRow = [...currentRow];
    
    // Ensure row has enough columns
    while (newRow.length < 14) newRow.push('');
    
    // Update columns
    newRow[2] = enrichment.contactName;  // Contact Name
    newRow[3] = enrichment.title;  // Title
    newRow[4] = enrichment.email;  // Email
    newRow[6] = enrichment.linkedin;  // LinkedIn
    newRow[9] = 'Enriched';  // Status
    newRow[10] = new Date().toISOString();  // Last Contacted
    newRow[11] = `${enrichment.notes} ${enrichment.source} Manually enriched 2026-03-04 08:06 AM.`;  // Notes
    
    updates.push({
      range: `Sheet1!A${enrichment.rowNum}:N${enrichment.rowNum}`,
      values: [newRow]
    });
  }
  
  if (updates.length > 0) {
    console.log(`\n\n📊 Updating ${updates.length} rows in sheet...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log('✅ Sheet updated successfully');
  }
  
  const report = `# Manual Enrichment Report - March 4, 2026 8:06 AM

## Summary
- **Enriched:** ${manualEnrichments.length} firms
- **Method:** Manual research via official websites, LinkedIn, press releases

## Contacts Added
${manualEnrichments.map(e => `### ${e.company} (Row ${e.rowNum})
- **Contact:** ${e.contactName}
- **Title:** ${e.title}
- **Email:** ${e.email}
- **LinkedIn:** ${e.linkedin}
- **Source:** ${e.source}
- **Notes:** ${e.notes}
`).join('\n')}

## Research Methods Used
1. Official firm website team pages
2. LinkedIn company pages and profiles
3. Press releases (PRNewswire, BusinessWire)
4. Email pattern verification from official contact pages

## Next Steps
- Continue manual research for remaining firms
- Begin outreach to newly enriched contacts
- Consider upgrading Apollo API plan for automated enrichment
`;

  fs.writeFileSync('MANUAL-ENRICH-REPORT-2026-03-04-0806am.md', report);
  console.log('\n✅ Manual enrichment complete!');
  console.log('Report saved to MANUAL-ENRICH-REPORT-2026-03-04-0806am.md');
}

manualEnrich().catch(console.error);
