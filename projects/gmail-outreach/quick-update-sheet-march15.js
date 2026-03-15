#!/usr/bin/env node

const { google } = require('googleapis');
const path = require('path');

// ========= CONFIG =========
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SHEET_NAME = 'Sheet1';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// ========= ENRICHED CONTACTS =========
const updates = [
  {
    rowIndex: 3,
    firm: '424 Capital',
    contact: 'Kyle Stanbro',
    title: 'Co-Founder and Managing Partner',
    email: 'kstanbro@424capital.com',
    linkedin: '',
    notes: 'Published on official 424capital.com website. Phone: (781) 425-5561'
  },
  {
    rowIndex: 14,
    firm: 'ShoreView Industries',
    contact: 'Garrett Davis',
    title: 'Vice President, Business Development',
    email: 'garrett@shoreview.com',
    linkedin: '',
    notes: 'Published on official shoreview.com website and PDF one-pager. Phone: 612-436-4290'
  }
];

// ========= SETUP =========
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// ========= UPDATE FUNCTION =========
async function updateRow(update) {
  const range = `${SHEET_NAME}!B${update.rowIndex}:I${update.rowIndex}`;
  
  const values = [[
    '', // NotebookLM (column B)
    update.contact,
    update.title,
    update.email,
    '', // Website (column F)
    update.linkedin || '',
    'Enriched',
    update.notes
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    resource: { values }
  });

  console.log(`✅ Updated Row ${update.rowIndex}: ${update.firm} - ${update.contact} (${update.email})`);
}

// ========= MAIN =========
async function main() {
  console.log('=== Quick Sheet Update - Enriched Contacts ===\n');
  
  for (const update of updates) {
    try {
      await updateRow(update);
    } catch (error) {
      console.error(`❌ Failed to update Row ${update.rowIndex}: ${error.message}`);
    }
  }

  console.log(`\n✅ Updated ${updates.length} row(s)`);
}

main().catch(console.error);
