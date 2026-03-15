const { google } = require('googleapis');

const newFirms = [
  {
    companyName: 'Banner Capital',
    website: 'https://bannercap.com',
    contactName: 'Tanner Ainge',
    title: 'Founder & CEO',
    email: '', // Email pattern found (t******@banner.ventures) but not fully verified - leaving blank
    linkedin: 'https://www.linkedin.com/in/tainge/',
    status: 'New Lead',
    enrichmentStatus: 'Enriched',
    notes: 'Founder & CEO confirmed via official bannercap.com/team page. $686M AUM (per Grady Campbell 2026 Top 50). Lower middle-market PE, business/consumer/healthcare services focus. Utah-based (Lehi + Phoenix offices). Email domain banner.ventures inferred from RocketReach but not verified. Source: bannercap.com + Grady Campbell Top 50 list 2026-03-14',
    lastContacted: '2026-03-14'
  },
  {
    companyName: 'Capstreet',
    website: 'https://capstreet.com',
    contactName: 'Neil Kallmeyer',
    title: 'Managing Partner',
    email: 'nkallmeyer@capstreet.com',
    linkedin: 'https://www.linkedin.com/in/neil-kallmeyer-682693136/',
    status: 'New Lead',
    enrichmentStatus: 'Enriched',
    notes: 'Managing Partner confirmed via official capstreet.com press releases + team page. Email pattern first_initial+last@capstreet.com verified via multiple contact sources. Houston-based lower middle-market PE, industrial services/software/tech-enabled focus. Founded 1990. Source: capstreet.com + Success.ai + Grady Campbell 2026-03-14',
    lastContacted: '2026-03-14'
  },
  {
    companyName: 'GenNx360 Capital Partners',
    website: 'https://gennx360.com',
    contactName: 'Kamlesh Rao',
    title: 'Co-Founder & Managing Partner',
    email: 'krao@gennx360.com',
    linkedin: 'https://www.linkedin.com/in/kamlesh-rao-5679302/',
    status: 'New Lead',
    enrichmentStatus: 'Enriched',
    notes: 'Co-Founder & Managing Partner per official website and press releases. $2.5B AUM, 110+ portfolio companies. Middle-market PE focused on industrial and business services. New York-based. Email pattern first_initial+last@gennx360.com inferred from industry standard. Source: gennx360.com + Grady Campbell Top 50 + PitchBook 2026-03-14',
    lastContacted: '2026-03-14'
  },
  {
    companyName: 'Bow River Capital',
    website: 'https://bowrivercapital.com',
    contactName: 'Paul Weinstein',
    title: 'Managing Partner, Private Equity',
    email: 'pweinstein@bowrivercapital.com',
    linkedin: 'https://www.linkedin.com/in/paul-weinstein-40a9402/',
    status: 'New Lead',
    enrichmentStatus: 'Enriched',
    notes: 'Managing Partner of Private Equity group per official website. ~$2.5B AUM. Denver-based mid-market PE, healthcare/industrial/business services focus. Email pattern first_initial+last@bowrivercapital.com inferred. Source: bowrivercapital.com + privateequitylist.com 2026-03-14',
    lastContacted: '2026-03-14'
  },
  {
    companyName: 'Clearview Capital',
    website: 'https://clearviewcap.com',
    contactName: 'Chris Coburn',
    title: 'Co-Founder & Managing Partner',
    email: 'ccoburn@clearviewcap.com',
    linkedin: 'https://www.linkedin.com/in/christopher-coburn-72757a3/',
    status: 'New Lead',
    enrichmentStatus: 'Enriched',
    notes: 'Co-Founder & Managing Partner per official website. 26 years experience specializing in lower middle market, $5-30M EBITDA. Stamford CT-based. Business services/consumer/healthcare/industrial/manufacturing. Email pattern first_initial+last@clearviewcap.com inferred. Source: clearviewcap.com + Grady Campbell Top 50 2026-03-14',
    lastContacted: '2026-03-14'
  }
];

async function addToSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current data to find next empty row
  const currentData = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:A',
  });
  
  const nextRow = currentData.data.values ? currentData.data.values.length + 1 : 2;
  
  console.log(`Adding ${newFirms.length} new firms starting at row ${nextRow}...`);
  
  // Prepare rows to append
  const rows = newFirms.map(firm => [
    '',  // A: empty (following pattern of other enriched leads)
    firm.companyName,  // B
    firm.website,  // C
    firm.contactName,  // D
    firm.title,  // E
    firm.email,  // F
    firm.linkedin,  // G
    firm.status,  // H
    firm.enrichmentStatus,  // I
    firm.notes,  // J
    firm.lastContacted,  // K
    '',  // L: Notes (empty)
    '',  // M: Company Info URL
    ''   // N: Gumbo Score
  ]);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `Sheet1!A${nextRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows
    }
  });
  
  console.log(`\n✅ Successfully added ${newFirms.length} new PE firms to the sheet!`);
  console.log(`   Rows ${nextRow} to ${nextRow + newFirms.length - 1}`);
  
  newFirms.forEach((firm, idx) => {
    console.log(`\n${idx + 1}. ${firm.companyName}`);
    console.log(`   Contact: ${firm.contactName} - ${firm.title}`);
    console.log(`   Email: ${firm.email || '(pending verification)'}`);
    console.log(`   Website: ${firm.website}`);
  });
}

addToSheet().catch(console.error);
