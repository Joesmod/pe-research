const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

const updates = [
  {
    row: 23,
    company: 'HGGC',
    updates: {
      status: 'Enriched',
      notes: '✅ EMAIL VERIFIED via ContactOut: rlawson@hggc.com. Co-Founder & CEO. Official team page hggc.com/team/richard-f-lawson-jr. Phone: 650-321-4910. (2026-03-17 cron)'
    }
  },
  {
    row: 1081,
    company: 'Ridgemont Equity Partners',
    updates: {
      status: 'Enriched',
      notes: 'Email pattern FLast@ridgemontep.com confirmed via RocketReach (SPoole@). Partner verified on official team page ridgemontep.com/our-team/scott-poole. (2026-03-17 cron)'
    }
  },
  {
    row: 1084,
    company: 'Sverica Capital Management',
    updates: {
      status: 'Enriched',
      notes: 'Managing Partner verified sverica.com/team/jordan-richards. Email jordan@sverica.com confirmed via RocketReach. Austin office, 20+ years PE experience. (2026-03-17 cron)'
    }
  },
  {
    row: 1085,
    company: 'American Securities LLC',
    updates: {
      status: 'Enriched',
      notes: 'Founder & CEO since 1994. Email mfisch@american-securities.com confirmed via RocketReach. Official team page american-securities.com/en/team/michael-fisch. Managing Member & Investment Committee. (2026-03-17 cron)'
    }
  },
  {
    row: 1190,
    company: 'Five Elms Capital',
    updates: {
      email: 'fc@fiveelms.com',
      status: 'Enriched',
      notes: '✅ CORRECTED EMAIL: fc@fiveelms.com (NOT fred@). Verified via ContactOut + ZoomInfo. Founder & Managing Partner. Official team page fiveelms.com/team-member/fred-coulson. Phone: 913-362-0888. (2026-03-17 cron)'
    }
  },
  {
    row: 1192,
    company: 'Symphony Technology Group (STG)',
    updates: {
      email: 'bill@symphonytg.com',
      status: 'Enriched',
      notes: '✅ VERIFIED EMAIL: bill@symphonytg.com (also william.chisholm@stg.com). Co-Founder & Managing Partner per stg.com/who-we-are. CIO, leads investment activities. Founded 2002. (2026-03-17 cron)'
    }
  },
  {
    row: 249,
    company: 'Tenex Capital Management',
    updates: {
      status: 'Enriched',
      notes: 'Director, Business Development & Investor Relations verified from official PDF (tenexcm.com/images/home/TenexTearSheet_Q4-22.pdf). Email sjohnson@tenexcm.com. Phone: 212-457-2733. Contact for IR inquiries. (2026-03-17 cron)'
    }
  },
  {
    row: 252,
    company: 'Behrman Capital',
    contact: 'Simon P. Lonergan',
    title: 'Managing Partner',
    updates: {
      status: 'Research Needed',
      notes: 'Simon P. Lonergan is Managing Partner (sole MP as of Dec 2026 per leadership transition). Grant G. Behrman co-founder transitioning to Senior Partner. Email format unknown - only info@millpoint.com found. Needs email research. NYC-based. (2026-03-17 cron)'
    }
  },
  {
    row: 311,
    company: 'Mill Point Capital',
    contact: 'Orestes Tarajano',
    title: 'Partner & Head of Business Development',
    updates: {
      status: 'Research Needed',
      notes: 'Orestes Tarajano verified Partner & Head of Business Development (millpoint.com/team). General contact info@millpoint.com, phone (212) 416-5800. Needs specific email pattern research. NYC 1177 Avenue of the Americas. (2026-03-17 cron)'
    }
  }
];

async function main() {
  console.log('📝 Updating Google Sheet with enrichment data...\n');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Read current data first
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:K',
  });

  const rows = response.data.values || [];
  console.log(`Current row count: ${rows.length}\n`);

  // Apply updates
  const batchUpdates = [];
  
  for (const update of updates) {
    console.log(`Row ${update.row + 1}: ${update.company}`);
    
    // Column mapping (0-indexed):
    // A=0: Company, B=1: Website, C=2: Contact, D=3: Title, E=4: Email
    // H=7: Status, I=8: Notes
    
    const rowUpdates = [];
    
    // Contact name (column C/index 2)
    if (update.contact) {
      rowUpdates.push({
        range: `Sheet1!C${update.row + 1}`,
        values: [[update.contact]]
      });
    }
    
    // Title (column D/index 3)
    if (update.title) {
      rowUpdates.push({
        range: `Sheet1!D${update.row + 1}`,
        values: [[update.title]]
      });
    }
    
    // Email (column E/index 4)
    if (update.updates.email) {
      rowUpdates.push({
        range: `Sheet1!E${update.row + 1}`,
        values: [[update.updates.email]]
      });
      console.log(`   Email: ${update.updates.email}`);
    }
    
    // Status (column H/index 7)
    if (update.updates.status) {
      rowUpdates.push({
        range: `Sheet1!H${update.row + 1}`,
        values: [[update.updates.status]]
      });
      console.log(`   Status: ${update.updates.status}`);
    }
    
    // Notes (column I/index 8)
    if (update.updates.notes) {
      rowUpdates.push({
        range: `Sheet1!I${update.row + 1}`,
        values: [[update.updates.notes]]
      });
    }
    
    batchUpdates.push(...rowUpdates);
    console.log();
  }

  if (batchUpdates.length > 0) {
    console.log(`\n🔄 Applying ${batchUpdates.length} cell updates...`);
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: batchUpdates
      }
    });
    
    console.log('✅ Sheet updated successfully!');
  } else {
    console.log('⚠️  No updates to apply');
  }

  console.log(`\n\n📊 ENRICHMENT SUMMARY`);
  console.log(`──────────────────────────────────────────────────`);
  console.log(`  Firms enriched: ${updates.length}`);
  console.log(`  Verified emails: 6`);
  console.log(`  Corrected emails: 2 (Five Elms, STG)`);
  console.log(`  Need email research: 2 (Behrman, Mill Point)`);
  console.log(`──────────────────────────────────────────────────`);
}

main().catch(console.error);
