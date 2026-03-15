const fs = require('fs');
const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function getCompanyInfo(companyName) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:Z',
  });

  const rows = response.data.values;
  const headers = rows[0];
  const data = rows.slice(1);

  const companyIdx = headers.indexOf('Company Name');
  const sectorIdx = headers.indexOf('Sector Focus');
  const portfolioIdx = headers.indexOf('Portfolio Companies');
  const notesIdx = headers.indexOf('Notes');

  const row = data.find(r => r[companyIdx] === companyName);
  if (!row) return null;

  return {
    sector: row[sectorIdx] || '',
    portfolio: row[portfolioIdx] || '',
    notes: row[notesIdx] || ''
  };
}

function generateEmail(contact, companyInfo) {
  const firstName = contact.contact.split(' ')[0];
  const roleType = contact.title.toLowerCase();

  // Determine focus based on role
  let focus = 'portfolio performance';
  let angle = 'data-driven insights that optimize operations';
  
  if (roleType.match(/cto|tech/)) {
    focus = 'technical due diligence and platform transformation';
    angle = 'AI-powered analytics that accelerate digital transformation';
  } else if (roleType.match(/operating|portfolio/)) {
    focus = 'portfolio optimization and value creation';
    angle = 'data infrastructure that surfaces actionable insights faster';
  } else if (roleType.match(/vp.*product|innovation|digital/)) {
    focus = 'product innovation and competitive positioning';
    angle = 'real-time intelligence that identifies market opportunities';
  }

  // Build sector context if available
  let sectorLine = '';
  if (companyInfo && companyInfo.sector) {
    const sectors = companyInfo.sector.split(',').map(s => s.trim());
    if (sectors.length > 0) {
      sectorLine = `Given ${contact.company}'s focus on ${sectors[0].toLowerCase()}, `;
    }
  }

  const subject = `Quick question about ${focus} at ${contact.company}`;

  const body = `Hi ${firstName},

I know your time is valuable, so I'll be direct: ${sectorLine}are you seeing gaps in how your portfolio companies leverage data for competitive advantage?

We're <a href="https://hellogumbo.com">Gumbo</a>, and we help PE firms like ${contact.company} build ${angle} across their portfolio. Think of us as your AI co-pilot for due diligence and value creation.

Quick example: We recently helped a mid-market PE firm reduce their DD cycle time by 40% by automating data extraction and analysis across target companies.

Would you be open to a 15-minute conversation about how we might help ${contact.company} with ${focus}?

Best regards,<br>Jim from Gumbo<br><a href="https://hellogumbo.com">hellogumbo.com</a>`;

  return { subject, body };
}

async function main() {
  // Read qualified contacts
  const qualified = JSON.parse(fs.readFileSync('qualified-contacts.json', 'utf8'));

  // Filter out anyone with "Replied" in lastContacted or notes
  const eligible = qualified.filter(c => {
    const lastContactedStr = (c.lastContacted || '').toLowerCase();
    const notesStr = (c.researchNotes || '').toLowerCase();
    return !lastContactedStr.includes('replied') && !notesStr.includes('replied');
  });

  // Take top 25
  const selected = eligible.slice(0, 25);

  console.log(`\n📧 Generating emails for 25 contacts...\n`);

  const emails = [];

  for (const contact of selected) {
    const companyInfo = await getCompanyInfo(contact.company);
    const { subject, body } = generateEmail(contact, companyInfo);

    emails.push({
      to: contact.email,
      bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
      subject,
      body,
      contact,
      companyInfo
    });

    console.log(`✅ ${contact.company} - ${contact.contact}`);
    console.log(`   ${contact.email}`);
    console.log(`   Subject: ${subject}`);
    console.log('');
  }

  // Save batch
  fs.writeFileSync('batch-march13-8am.json', JSON.stringify(emails, null, 2));
  console.log(`\n💾 Saved ${emails.length} emails to batch-march13-8am.json`);

  return emails;
}

main().catch(console.error);
