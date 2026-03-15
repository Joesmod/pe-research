const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function enrichLeads() {
  const sheets = await getClient();
  
  // Read current data
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1',
  });
  const rows = res.data.values || [];
  const header = rows[0];
  
  // Find column indices
  const colMap = {};
  header.forEach((col, idx) => { colMap[col] = idx; });
  
  const enrichments = [
    {
      company: 'American Industrial Partners',
      contact: 'Lawrence Steyn',
      title: 'Partner, Business Development',
      email: '',
      linkedin: 'https://linkedin.com/in/lawrencesteyn',
      status: 'Enriched',
      notes: 'BD partner found on official team page; email pattern likely firstname@americanindustrial.com per existing contact Kim@'
    },
    {
      company: 'American Industrial Partners',
      contact: 'Jamie Tam',
      title: 'Partner, Business Development',
      email: '',
      linkedin: '',
      status: 'Enriched',
      notes: 'BD partner found on official team page'
    },
    {
      company: 'American Industrial Partners',
      contact: 'Daryl Yap',
      title: 'Partner, Business Development',
      email: '',
      linkedin: '',
      status: 'Enriched',
      notes: 'BD partner found on official team page'
    },
    {
      company: 'Renovus Capital Partners',
      contact: 'Jason Tanker',
      title: 'Managing Director',
      email: '',
      linkedin: 'https://linkedin.com/in/jtanker',
      status: 'Enriched',
      notes: 'Managing Director, Technology Services practice. Press release: renovuscapital.com/team-promotions'
    },
    {
      company: 'Renovus Capital Partners',
      contact: 'Lee Minkoff',
      title: 'Managing Director',
      email: '',
      linkedin: '',
      status: 'Enriched',
      notes: 'Promoted to MD from Principal (2024). Found in press release'
    },
    {
      company: 'Vistria Group',
      contact: 'Kip Kirkpatrick',
      title: 'Co-Founder, Co-CEO, Co-Chairman',
      email: '',
      linkedin: 'https://vistria.com/team/kip-kirkpatrick',
      status: 'Enriched',
      notes: 'Co-founder with Martin Nesbitt. Healthcare/education focus. $8B+ AUM. Official bio page: vistria.com'
    },
    {
      company: 'Vistria Group',
      contact: 'Martin Nesbitt',
      title: 'Co-Founder, Co-CEO, Co-Chairman',
      email: '',
      linkedin: '',
      status: 'Enriched',
      notes: 'Co-founder with Kip Kirkpatrick. Chicago-based, healthcare/education/financial services/housing sectors'
    },
    {
      company: 'Gemspring Capital',
      contact: 'Clay Cole',
      title: 'Managing Director',
      email: '',
      linkedin: 'https://linkedin.com/in/clay-cole-17798a4',
      status: 'Enriched',
      notes: '15+ years PE experience. Westport CT. $3.5B+ AUM. Business services focus'
    },
    {
      company: 'Gemspring Capital',
      contact: 'Charles Fraas',
      title: 'Managing Director',
      email: '',
      linkedin: '',
      status: 'Enriched',
      notes: 'Managing Director at Gemspring. Found on Crunchbase'
    },
    {
      company: 'Quad-C Management',
      contact: 'Joseph April',
      title: 'Managing Director, Portfolio Optimization',
      email: '',
      linkedin: '',
      status: 'Enriched',
      notes: 'MD Portfolio Optimization. Charlottesville VA. $2B+ equity invested across 50+ companies since 1989'
    },
    {
      company: 'Water Street Healthcare Partners',
      contact: 'Timothy Dugan',
      title: 'Founder',
      email: '',
      linkedin: 'https://linkedin.com/in/tim-dugan',
      status: 'Enriched',
      notes: 'Founded Water Street in 2005. Chicago. Healthcare-only focus. Official LinkedIn: /in/tim-dugan'
    }
  ];

  // Find existing company rows and get website
  const companyMap = {};
  for (let i = 1; i < rows.length; i++) {
    const company = rows[i][colMap['Firm/Company Name']];
    if (company && !companyMap[company]) {
      companyMap[company] = {
        website: rows[i][colMap['Website']] || '',
        sectors: rows[i][colMap['Sectors/Industry']] || '',
        description: rows[i][colMap['Notes/Description']] || ''
      };
    }
  }

  const newRows = [];
  for (const data of enrichments) {
    const companyData = companyMap[data.company];
    if (!companyData) {
      console.log(`⚠️ Skipped: ${data.company} - not found in sheet`);
      continue;
    }
    
    const row = new Array(header.length).fill('');
    row[colMap['Firm/Company Name']] = data.company;
    row[colMap['Website']] = companyData.website;
    row[colMap['Contact Name']] = data.contact;
    row[colMap['Title']] = data.title;
    row[colMap['Email']] = data.email;
    row[colMap['LinkedIn']] = data.linkedin;
    row[colMap['Sectors/Industry']] = companyData.sectors;
    row[colMap['Notes/Description']] = companyData.description;
    row[colMap['Status']] = data.status;
    row[colMap['Notes']] = data.notes;
    
    newRows.push(row);
    console.log(`✅ Prepared: ${data.company} - ${data.contact}`);
  }

  if (newRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: newRows },
    });
    console.log(`\n📊 Appended ${newRows.length} enriched contacts to sheet`);
  }
}

enrichLeads().catch(console.error);
