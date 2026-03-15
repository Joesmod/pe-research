const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

async function main() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('=== PE Research Focus Run - March 15, 2026 12:37 AM ===\n');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1:K1200', // Read more rows
    });

    const rows = response.data.values || [];
    
    const needsResearch = [];
    
    // Column indices based on actual structure
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0) continue;
      
      const firm = row[0] || '';
      const contact = row[2] || '';
      const email = row[4] || '';
      const status = row[7] || ''; // Column H seems to be status
      const notes = row[8] || ''; // Column I seems to be notes
      
      // Skip if no firm name
      if (!firm || firm.trim() === '') continue;
      
      // Skip if Dead/Bounced
      if (status.includes('Dead') || status.includes('Bounced')) continue;
      
      // Priority 1: Empty contact name
      if (!contact || contact.trim() === '') {
        needsResearch.push({
          rowIndex: i + 1,
          firm,
          contact,
          email,
          status,
          priority: 'EMPTY_CONTACT',
        });
        continue;
      }
      
      // Priority 2: Needs Email Verification
      if (status.includes('Needs Email Verification')) {
        needsResearch.push({
          rowIndex: i + 1,
          firm,
          contact,
          email,
          status,
          priority: 'VERIFY_EMAIL',
        });
        continue;
      }
      
      // Priority 3: Generic emails (info@, sales@, ir@, contact@)
      if (email && (email.includes('info@') || email.includes('sales@') || 
                    email.includes('ir@') || email.includes('contact@'))) {
        needsResearch.push({
          rowIndex: i + 1,
          firm,
          contact,
          email,
          status,
          priority: 'GENERIC_EMAIL',
        });
      }
    }

    console.log(`Total firms needing research: ${needsResearch.length}\n`);
    
    // Categorize by priority
    const emptyContact = needsResearch.filter(f => f.priority === 'EMPTY_CONTACT');
    const verifyEmail = needsResearch.filter(f => f.priority === 'VERIFY_EMAIL');
    const genericEmail = needsResearch.filter(f => f.priority === 'GENERIC_EMAIL');
    
    console.log(`Priority breakdown:`);
    console.log(`  Empty contact name: ${emptyContact.length}`);
    console.log(`  Needs email verification: ${verifyEmail.length}`);
    console.log(`  Generic email: ${genericEmail.length}`);
    
    // Select top 15 for this run - prioritize empty contacts first
    const targets = [
      ...emptyContact.slice(0, 10),
      ...verifyEmail.slice(0, 5),
    ].slice(0, 15);
    
    console.log(`\n=== Top 15 Research Targets ===\n`);
    targets.forEach((t, idx) => {
      console.log(`${idx + 1}. ${t.firm} (Row ${t.rowIndex}) - ${t.priority}`);
      if (t.contact) console.log(`   Current contact: ${t.contact}`);
      if (t.email) console.log(`   Current email: ${t.email}`);
      if (t.status) console.log(`   Status: ${t.status}`);
      console.log('');
    });
    
    // Save to file
    const outputFile = path.join(__dirname, 'research-targets-march15-0037am.json');
    fs.writeFileSync(outputFile, JSON.stringify(targets, null, 2));
    console.log(`\nTargets saved to: ${outputFile}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
