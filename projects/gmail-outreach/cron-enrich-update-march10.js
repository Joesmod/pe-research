const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Enrichment updates for 2026-03-10 2:06 AM cron
  const updates = [
    {
      row: 131,
      company: 'Stellex Capital Management',
      contact: 'Ray Whiteman',
      title: 'Founder & Managing Partner',
      email: 'rwhiteman@stellexcapital.com',
      linkedin: 'https://www.linkedin.com/in/raymond-whiteman-900886120/',
      status: 'Enriched - 2026-03-10',
      notes: 'Managing Partner verified from stellexcapital.com/team. Email rwhiteman@stellexcapital.com published in official Stellex one-pager PDF (212-710-2310). Founded firm after Carlyle. Source: Official PDF + website team page.'
    },
    {
      row: 191,
      company: 'Flexpoint Ford',
      contact: 'Josh Tamaroff',
      title: 'Managing Director, Healthcare',
      email: 'jtamaroff@flexpointford.com',
      linkedin: 'https://www.linkedin.com/in/joshua-tamaroff-a7096116/',
      status: 'Enriched - 2026-03-10',
      notes: 'Managing Director, Healthcare verified from PR Newswire (July 2024) + flexpointford.com/team. Email pattern {first_initial}{last}@flexpointford.com verified via RocketReach (92% confidence: j******@flexpointford.com). Joined NY office July 2024.'
    },
    {
      row: 192,
      company: 'NewSpring Capital',
      contact: 'Marc Lederman',
      title: 'Co-Founder & General Partner',
      email: 'mlederman@newspringcapital.com',
      linkedin: 'https://www.linkedin.com/in/marclederman',
      status: 'Enriched - 2026-03-10',
      notes: 'Co-Founder & General Partner verified from newspringcapital.com/team. Email mlederman@newspringcapital.com verified from ContactOut + WhartonPE directory. Pattern {first_initial}{last}@newspringcapital.com confirmed. Founded 1999, $2.5B+ AUM.'
    }
  ];
  
  console.log('=== UPDATING SHEET ===\n');
  
  for (const update of updates) {
    console.log(`Updating Row ${update.row}: ${update.company}`);
    console.log(`  Contact: ${update.contact}`);
    console.log(`  Title: ${update.title}`);
    console.log(`  Email: ${update.email}`);
    console.log(`  Status: ${update.status}`);
    console.log('');
    
    // Update row (columns C=contact, D=title, E=email, G=linkedin, J=status, L=notes)
    // Range C:L = 10 columns: C(contact), D(title), E(email), F(website), G(linkedin), H(sector), I(portfolio), J(status), K(lastcontacted), L(notes)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!C${update.row}:L${update.row}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[
          update.contact,      // C
          update.title,        // D
          update.email,        // E
          '',                  // F - Website (skip)
          update.linkedin,     // G
          '',                  // H - Sector Focus
          '',                  // I - Portfolio Companies
          update.status,       // J
          '',                  // K - Last Contacted
          update.notes         // L
        ]]
      }
    });
  }
  
  console.log('Sheet updated successfully!');
  console.log(`\nTotal enrichments: ${updates.length}`);
  
  const fs = require('fs');
  const report = {
    timestamp: new Date().toISOString(),
    enrichmentCount: updates.length,
    firms: updates.map(u => ({
      company: u.company,
      contact: u.contact,
      email: u.email,
      verificationSource: u.notes.split('Source:')[1]?.trim() || 'See notes'
    }))
  };
  
  fs.writeFileSync('enrichment-report-march10-0206am.json', JSON.stringify(report, null, 2));
  console.log('\nReport saved to enrichment-report-march10-0206am.json');
}

updateSheet().catch(console.error);
