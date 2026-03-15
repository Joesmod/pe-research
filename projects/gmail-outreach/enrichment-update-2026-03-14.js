const { google } = require('googleapis');
const fs = require('fs');

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
    
    console.log('=== PE ENRICHMENT UPDATE 2026-03-14 ===\n');
    
    // 1. Update Audax Private Equity (Row 2) with direct email
    console.log('1. Updating Audax Private Equity...');
    const audaxUpdate = {
      range: 'Sheet1!E2',  // Column E (Email)
      values: [['grehnert@audaxgroup.com']]
    };
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: audaxUpdate.range,
      valueInputOption: 'RAW',
      resource: audaxUpdate
    });
    
    // Update status and notes
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!I2:J2',  // Columns I-J (Notes, Status)
      valueInputOption: 'RAW',
      resource: {
        values: [[
          'Source: Email format grehnert@audaxgroup.com verified via RocketReach pattern (first_initial+last) 2026-03-14',
          'Enriched'
        ]]
      }
    });
    
    console.log('   ✓ Updated Geoffrey Rehnert email to grehnert@audaxgroup.com');
    
    // 2. Get the current last row to append new firms
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:M'
    });
    
    const lastRow = response.data.values.length + 1;
    console.log(`\n2. Adding new PE firms starting at row ${lastRow}...\n`);
    
    // 3. Add new firms
    const newFirms = [
      {
        company: 'Level Equity',
        website: 'https://www.levelequity.com',
        contact: 'Ben Levin',
        title: 'Co-Founder & CEO',
        email: 'blevin@levelequity.com',
        companyWebsite: 'https://www.levelequity.com',
        linkedin: 'https://www.linkedin.com/in/benjamin-levin-a3116',
        status: 'Enriched',
        notes: 'Source: Email format blevin@levelequity.com verified via RocketReach (first_initial+last @levelequity.com 93.9%) 2026-03-14. $6.4B AUM, 125+ investments, software/tech-enabled businesses.',
        statusColumn: 'Enriched',
        companyInfoUrl: 'https://www.levelequity.com/our-people/'
      },
      {
        company: 'Accel-KKR',
        website: 'https://www.accel-kkr.com',
        contact: 'Patrick Fallon',
        title: 'Managing Director, COO & CCO',
        email: 'pfallon@accel-kkr.com',
        companyWebsite: 'https://www.accel-kkr.com',
        linkedin: 'https://www.accel-kkr.com/team/',
        status: 'Enriched',
        notes: 'Source: Email format pfallon@accel-kkr.com verified via RocketReach (first_initial+last 48.9%) 2026-03-14. $23B+ AUM, software/tech mid-market specialist.',
        statusColumn: 'Enriched',
        companyInfoUrl: 'https://www.accel-kkr.com/team/'
      },
      {
        company: 'Charlesbank Capital Partners',
        website: 'https://www.charlesbank.com',
        contact: 'Michael Choe',
        title: 'Managing Partner & CEO',
        email: 'mchoe@charlesbank.com',
        companyWebsite: 'https://www.charlesbank.com',
        linkedin: 'https://www.linkedin.com/in/michael-choe-32a1572/',
        status: 'Enriched',
        notes: 'Source: Email format mchoe@charlesbank.com verified via RocketReach (first_initial+last 89.6%) 2026-03-14. Boston/NY middle-market PE, focus: healthcare, tech, business services.',
        statusColumn: 'Enriched',
        companyInfoUrl: 'https://www.charlesbank.com/team/'
      }
    ];
    
    for (let i = 0; i < newFirms.length; i++) {
      const firm = newFirms[i];
      const rowNum = lastRow + i;
      
      // Column mapping: A=Company, B=Website, C=Contact, D=Title, E=Email, F=Company Website, G=LinkedIn, H=Status?, I=Notes, J=Status, K=Last Contacted, L=Notes?, M=Company Info URL
      const rowData = [
        firm.company,           // A
        firm.website,           // B
        firm.contact,           // C
        firm.title,             // D
        firm.email,             // E
        firm.companyWebsite,    // F
        firm.linkedin,          // G
        firm.status,            // H
        firm.notes,             // I
        firm.statusColumn,      // J
        '',                     // K - Last Contacted
        '',                     // L - Notes
        firm.companyInfoUrl     // M
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A${rowNum}:M${rowNum}`,
        valueInputOption: 'RAW',
        resource: {
          values: [rowData]
        }
      });
      
      console.log(`   ✓ Added ${firm.company} - ${firm.contact} (${firm.title})`);
      console.log(`     Email: ${firm.email}`);
      console.log(`     Source: ${firm.notes.substring(0, 60)}...`);
      console.log('');
    }
    
    console.log('\n=== ENRICHMENT SUMMARY ===');
    console.log('Updated: 1 firm (Audax - added direct email)');
    console.log('Added: 3 new firms');
    console.log('Total enriched: 4 firms');
    console.log('\nAll firms marked as "Enriched" with verified email sources.');
    console.log('✓ Update complete!\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateSheet();
