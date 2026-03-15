const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const creds = JSON.parse(fs.readFileSync('service-account.json'));

const enrichments = [
  {
    row: 49,
    company: "Apax Partners",
    contactName: "Seth Brody",
    title: "Partner, Global Head of Operational Excellence",
    email: "", // Leave blank per instructions
    emailStatus: "LinkedIn Outreach",
    linkedin: "https://www.linkedin.com/in/seth-brody-6721511/",
    notes: "Verified from official team page. Joined 2008, based NYC. LinkedIn InMail recommended."
  },
  {
    row: 699,
    company: "Kayne Partners",
    contactName: "Leon Chen",
    title: "Managing Partner, Growth Equity",
    email: "",
    emailStatus: "LinkedIn Outreach",
    linkedin: "https://kaynecapital.com/people/leon-chen/",
    notes: "Managing Partner since 2012 promotion. GrowthCap Award winner. LinkedIn InMail recommended."
  },
  {
    row: 728,
    company: "Pritzker Group Private Capital",
    contactName: "Ryan Roberts",
    title: "Investment Partner, Co-Head Services Team",
    email: "",
    emailStatus: "LinkedIn Outreach",
    linkedin: "",
    notes: "Previously Madison Dearborn. Harvard MBA, Princeton BA. Office: (312) 447-6001"
  },
  {
    row: 765,
    company: "Falconhead Capital",
    contactName: "David Gubbay",
    title: "Partner",
    email: "",
    emailStatus: "Website Form",
    linkedin: "",
    notes: "Verified partner. Founded 1998, consumer/sports focus. Use website contact form."
  }
];

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  console.log(`\n📝 Updating ${enrichments.length} contacts in sheet...\n`);

  const updates = [];

  for (const enrich of enrichments) {
    console.log(`Row ${enrich.row}: ${enrich.company} - ${enrich.contactName}`);
    
    // Column mapping (from read-full-sheet.js):
    // A=Company, B=Gumbo Score, C=Contact Name, D=Title, E=Email, 
    // F=Email Status, G=LinkedIn, H=Research Notes, I=Last Contacted, J=Status
    
    updates.push({
      range: `Contacts!C${enrich.row}:H${enrich.row}`,
      values: [[
        enrich.contactName,      // C: Contact Name
        enrich.title,            // D: Title
        enrich.email,            // E: Email (blank per instructions)
        enrich.emailStatus,      // F: Email Status
        enrich.linkedin,         // G: LinkedIn
        enrich.notes             // H: Research Notes
      ]]
    });
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'USER_ENTERED'
      }
    });

    console.log(`\n✅ Updated ${updates.length} rows in sheet`);
  } else {
    console.log('\n⚠️ No updates to make');
  }
}

updateSheet().catch(console.error);
