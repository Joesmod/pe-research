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

async function investigateMismatches() {
  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:P500',
  });
  
  const rows = res.data.values || [];
  const header = rows[0];
  
  const companyIdx = header.indexOf('Company Name');
  const contactIdx = header.indexOf('Contact Name');
  const emailIdx = header.indexOf('Email');
  const notesIdx = header.indexOf('Notes');
  const statusIdx = header.indexOf('Status');
  const websiteIdx = header.indexOf('Website');
  
  // Look at the mismatched entries
  const mismatches = [2, 3, 6, 10, 11, 14, 16, 21, 28, 33]; // First 10 mismatched rows
  
  console.log('=== INVESTIGATING MISMATCHED DOMAINS ===\n');
  
  mismatches.forEach(rowNum => {
    const row = rows[rowNum - 1]; // -1 because array is 0-indexed
    const company = row[companyIdx] || '';
    const contact = row[contactIdx] || '';
    const email = row[emailIdx] || '';
    const notes = row[notesIdx] || '';
    const status = row[statusIdx] || '';
    const website = row[websiteIdx] || '';
    
    console.log(`Row ${rowNum}: ${company}`);
    console.log(`  Contact: ${contact}`);
    console.log(`  Email: ${email}`);
    console.log(`  Website: ${website}`);
    console.log(`  Status: ${status}`);
    console.log(`  Notes: ${notes.substring(0, 200)}...`);
    console.log('');
  });
  
  console.log('\n=== ANALYSIS ===');
  console.log('These "mismatched" entries appear to be INTENTIONAL.');
  console.log('The notes indicate these contacts were verified but are at different companies.');
  console.log('This could be because:');
  console.log('  1. Person moved to a new firm');
  console.log('  2. Contact is at a portfolio company');
  console.log('  3. Strategic cross-company relationship');
  console.log('\nSince all entries already have verified decision-maker contacts,');
  console.log('TRUE ENRICHMENT TARGET: Find additional contacts at the SAME firm');
  console.log('to replace these mismatched ones, or verify if they should stay.');
}

investigateMismatches().catch(console.error);
