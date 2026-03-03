const { google } = require('googleapis');

const enrichments = [
  {
    row: 560, // PSG Equity
    company: 'PSG Equity',
    contactName: 'Tom Reardon',
    title: 'Managing Director',
    email: '', // Found in press release but no email
    linkedin: '',
    notes: 'MD mentioned in Traliant partnership press release. Other MDs: Matt Stone, Adam Marcus, Bill Skarinka, Chris Andrews'
  },
  {
    row: 733, // Thomas H. Lee Partners
    company: 'Thomas H. Lee Partners',
    contactName: 'Jim Carlisle',
    title: 'Managing Director, Head of Technology & Business Solutions',
    email: 'jcarlisle@thl.com',
    linkedin: 'https://www.linkedin.com/in/jim-carlisle-282a9a31/',
    notes: 'SOURCE: ContactOut verified email. MD and Head of Tech vertical, Automation Fund lead. Named to GrowthCap Top 25 Software Investors 2024.'
  },
  {
    row: 835, // Advent International - Tom Allen
    company: 'Advent International',
    contactName: 'Tom Allen',
    title: 'Managing Director, Healthcare Sector (Europe)',
    email: 'tallen@adventinternational.com',
    linkedin: 'https://www.adventinternational.com/our-team/tom-allen/',
    notes: 'SOURCE: RocketReach pattern match. London-based, joined 2004. Email format: FLast@adventinternational.com'
  },
  {
    row: 775, // WindPoint Partners
    company: 'WindPoint Partners',
    contactName: 'Nathan Brown',
    title: 'Managing Director',
    email: 'nbrown@wppartners.com',
    linkedin: 'https://www.linkedin.com/in/nathan-brown-82bb71169/',
    notes: 'SOURCE: RocketReach verified. Joined Wind Point 1997. Sits on multiple boards: Central Moloney, Envera Systems, MOREgroup, Nelson Global, Pavion, Vertex, Voyant Beauty.'
  },
  {
    row: 911, // Blue Wolf Capital Partners - Chris Thomas
    company: 'Blue Wolf Capital Partners',
    contactName: 'Chris Thomas',
    title: 'Operating Partner',
    email: 'cthomas@bluewolfcapital.com',
    linkedin: 'https://www.bluewolfcapital.com/team/chris-thomas/',
    notes: 'SOURCE: Company site + email pattern (Kate Spaziani: k******@bluewolfcapital.com). 25+ years in Building Products, financial/operational management focus.'
  },
  {
    row: 1440, // Hg Capital - Andrew Jobst (first occurrence)
    company: 'Hg Capital',
    contactName: 'Andrew Jobst',
    title: 'Partner',
    email: 'ajobst@hgre.com',
    linkedin: 'https://www.linkedin.com/in/andrew-jobst-2399611/',
    notes: 'SOURCE: RocketReach + ContactOut verified. NOTE: HG Capital LLC (hgre.com) is a real estate firm, NOT Hg Capital PE. Verify if this is the right firm.'
  },
  {
    row: 699, // Kayne Partners
    company: 'Kayne Partners',
    contactName: 'Leon Chen',
    title: 'Managing Partner, Growth Equity',
    email: '', // No email found
    linkedin: '',
    notes: 'Managing Partner since 2020. Leads growth equity strategy. Won M&A Advisor Emerging Leaders 2018. Recent investments: Bark, Onfleet, Shipfusion. Other MPs: Dave Walsh, Nishita Cummings, Nathan Locke.'
  },
  {
    row: 732, // Brockway Moran & Partners
    company: 'Brockway Moran & Partners',
    contactName: 'Mr. Brockway',
    title: 'Managing Director',
    email: '', // No email found, phone: (561) 750-2000
    linkedin: '',
    notes: '30+ years PE experience, SE US pioneer. Exec in Residence at Wake Forest. Also: Mr. Moran (SVP), Peter Klein (MD/General Counsel since 2000), Mr. Anderson (Director/CFO). Boca Raton, FL.'
  },
  {
    row: 765, // Falconhead Capital
    company: 'Falconhead Capital',
    contactName: '', // No specific name found
    title: '',
    email: '',
    linkedin: '',
    notes: 'Lower mid-market, sports/media/entertainment, rec equipment, personal care, food/beverage, consumer services. Operating partners mentioned but not named.'
  },
  {
    row: 776, // Wicks Capital Partners
    company: 'Wicks Capital Partners',
    contactName: '', // Research needed
    title: '',
    email: '',
    linkedin: '',
    notes: 'Needs research'
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  const updates = [];
  
  for (const item of enrichments) {
    if (!item.contactName && !item.notes) continue; // Skip empty entries
    
    // Contacts sheet columns: Company, Gumbo Score, Contact Name, Title, Email, Email Status, LinkedIn, Research Notes, Last Contacted
    // Update columns C (Contact Name), D (Title), E (Email), G (LinkedIn), H (Research Notes)
    
    const range = `Contacts!C${item.row}:H${item.row}`;
    const values = [[
      item.contactName || '', // C: Contact Name
      item.title || '', // D: Title
      item.email || '', // E: Email
      item.email ? 'Researched' : '', // F: Email Status
      item.linkedin || '', // G: LinkedIn
      item.notes || '' // H: Research Notes
    ]];
    
    updates.push({
      range,
      values
    });
  }
  
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    
    console.log(`Updated ${updates.length} rows in Contacts sheet`);
  } else {
    console.log('No updates to make');
  }
}

updateSheet().catch(console.error);
