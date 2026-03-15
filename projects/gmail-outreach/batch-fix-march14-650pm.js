const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

// Critical fixes: data in wrong columns, verified emails
const fixes = [
  {
    row: 629, company: 'Keystone Capital',
    contact: 'Scott Gwilliam', title: 'Managing Partner', 
    email: 'sgwilliam@keystonecapital.com',
    linkedin: 'https://www.linkedin.com/in/scott-gwilliam-07a4863/',
    source: 'Data rearranged. RocketReach pattern + LinkedIn verified.',
    status: 'Enriched'
  },
  {
    row: 777, company: 'Prospect Capital Management',
    contact: 'John Barry', title: 'Chairman & CEO',
    email: 'jbarry@prospectstreet.com',
    linkedin: 'https://www.linkedin.com/in/john-barry/',
    source: 'Data rearranged from misplaced columns.',
    status: 'Enriched'
  },
  {
    row: 851, company: 'Wynnchurch Capital',
    contact: 'John Hatherly', title: 'Managing Partner',
    email: 'jhatherly@wynnchurch.com',
    linkedin: 'https://www.linkedin.com/in/johnhatherly',
    source: 'Email verified from official PR (wynnchurch.com/news). Founder 1999.',
    status: 'Enriched'
  },
  {
    row: 864, company: 'Accel-KKR',
    contact: 'Tom Barnds', title: 'Co-Managing Partner',
    email: 'tbarnds@accel-kkr.com',
    linkedin: 'https://www.linkedin.com/in/tom-barnds-6083525/',
    source: 'RocketReach pattern t******@accel-kkr.com. Co-founder 2000. Team page accel-kkr.com/team-member/tom-barnds/',
    status: 'Enriched - Email Needs Verification'
  },
  {
    row: 868, company: 'Accel-KKR',
    contact: 'Rob Palumbo', title: 'Co-Managing Partner',
    email: 'rpalumbo@accel-kkr.com',
    linkedin: 'https://www.linkedin.com/in/rob-palumbo-canada/',
    source: 'Pattern inferred from RocketReach. Co-Managing Partner per LinkedIn.',
    status: 'Enriched - Email Needs Verification'
  },
  {
    row: 934, company: 'Amulet Capital Partners',
    contact: 'Ramsey Frank', title: 'Managing Partner & Co-Founder',
    email: 'rfrank@amuletcapital.com',
    linkedin: 'https://www.linkedin.com/company/amulet-capital-partners',
    source: 'Data rearranged. Email and name verified.',
    status: 'Enriched'
  },
  {
    row: 940, company: 'Monroe Capital',
    contact: 'Theodore Koenig', title: 'Chairman & CEO',
    email: 'tkoenig@monroecap.com',
    linkedin: 'https://www.linkedin.com/company/monroe-capital',
    source: 'Data rearranged. Email and title verified.',
    status: 'Enriched'
  },
  {
    row: 998, company: 'Edison Partners',
    contact: 'Chris Sugden', title: 'Managing Partner',
    email: 'csugden@edisonpartners.com',
    linkedin: 'https://www.edisonpartners.com',
    source: 'Data rearranged. Email and title verified.',
    status: 'Enriched'
  }
];

async function batchFix() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log(`\n🔧 Fixing ${fixes.length} critical data quality issues...\n`);
  
  for (const fix of fixes) {
    console.log(`Row ${fix.row}: ${fix.company}`);
    console.log(`  → ${fix.contact} (${fix.title})`);
    console.log(`  → ${fix.email}`);
    console.log(`  Source: ${fix.source}\n`);
    
    // Update main columns: Contact (C), Title (D), Email (E), blank (F), LinkedIn (G)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!C${fix.row}:G${fix.row}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[fix.contact, fix.title, fix.email, '', fix.linkedin]]
      }
    });
    
    // Update Status (H)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!H${fix.row}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[fix.status]]
      }
    });
    
    // Update Notes (I)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!I${fix.row}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[`${fix.source} (Fixed 2026-03-14 6:50pm cron)`]]
      }
    });
  }
  
  console.log(`✅ Fixed ${fixes.length} rows`);
  
  // Generate summary report
  const report = {
    timestamp: new Date().toISOString(),
    fixedRows: fixes.length,
    details: fixes.map(f => ({
      row: f.row,
      company: f.company,
      contact: f.contact,
      email: f.email,
      status: f.status
    }))
  };
  
  fs.writeFileSync(
    'enrichment-fixes-march14-650pm.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📊 Summary saved to enrichment-fixes-march14-650pm.json');
}

batchFix().catch(console.error);
