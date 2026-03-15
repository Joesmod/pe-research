const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Tech/AI/value creation role keywords
const priorityRoles = [
  'CTO', 'Chief Technology', 'Chief Information', 'Chief AI',
  'VP Product', 'VP Technology', 'VP Engineering',
  'Operating Partner', 'Portfolio Operations', 'Value Creation',
  'Head of Technology', 'Head of AI', 'Head of Digital',
  'Technology Officer', 'Innovation', 'Transformation',
  'Advisory Director, Artificial Intelligence', 'Advisory Director of AI'
];

async function filterContacts() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read Sheet1 (companies)
  const sheet1 = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:J',
  });
  
  // Read Contacts sheet - structure is: Company, Score, Name, Title, Email, Status, LinkedIn, Notes, LastContacted
  const contactsData = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Contacts!A:I',
  });
  
  const companies = new Map();
  const companyRows = sheet1.data.values.slice(1);
  
  // Build company map with last contacted dates
  companyRows.forEach(row => {
    const [company, , , , , , , , , lastContacted] = row;
    if (company && !companies.has(company)) {
      companies.set(company, { lastContacted: lastContacted || null });
    }
  });
  
  // Today is March 12, 2026
  const today = new Date('2026-03-12');
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // March 5, 2026
  
  const parseDate = (str) => {
    if (!str || str === '') return null;
    try {
      return new Date(str);
    } catch {
      return null;
    }
  };
  
  const contacts = contactsData.data.values.slice(1); // Skip header
  
  const qualified = contacts
    .filter(row => {
      const [company, score, name, title, email, status, linkedin, notes, lastContacted] = row;
      
      // Must have verified email
      if (!email || !status || status.toLowerCase().indexOf('verified') === -1) return false;
      
      // Skip if no name or title
      if (!name || !title) return false;
      
      // Check Gumbo Score >= 8
      const gumboScore = parseInt(score);
      if (isNaN(gumboScore) || gumboScore < 8) return false;
      
      // Check last contacted dates
      const companyData = companies.get(company);
      const companyLastContacted = companyData?.lastContacted;
      
      const lastContactedDateCompany = parseDate(companyLastContacted);
      const lastContactedDateContact = parseDate(lastContacted);
      
      // Skip if contacted in last 7 days
      if (lastContactedDateCompany && lastContactedDateCompany > sevenDaysAgo) return false;
      if (lastContactedDateContact && lastContactedDateContact > sevenDaysAgo) return false;
      
      return true;
    })
    .map(row => ({
      company: row[0],
      score: row[1],
      name: row[2],
      title: row[3],
      email: row[4],
      linkedin: row[6] || '',
      notes: row[7] || '',
      priorityRole: priorityRoles.some(k => row[3]?.toUpperCase().includes(k.toUpperCase()))
    }))
    .sort((a, b) => {
      // Sort by priority role first, then by score, then by company name
      if (a.priorityRole && !b.priorityRole) return -1;
      if (!a.priorityRole && b.priorityRole) return 1;
      const scoreDiff = parseInt(b.score) - parseInt(a.score);
      if (scoreDiff !== 0) return scoreDiff;
      return a.company.localeCompare(b.company);
    });
  
  // Deduplicate by company (only 1 per company)
  const seen = new Set();
  const final = [];
  for (const contact of qualified) {
    if (!seen.has(contact.company) && final.length < 25) {
      seen.add(contact.company);
      final.push(contact);
    }
  }
  
  console.log(JSON.stringify(final, null, 2));
}

filterContacts().catch(console.error);
