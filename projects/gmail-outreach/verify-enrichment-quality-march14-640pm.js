const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

async function verifyQuality() {
  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:M',
  });

  const rows = response.data.values;
  
  console.log('\n🔍 Random sample of 10 enriched leads:\n');
  
  // Sample 10 random rows (excluding header)
  const samples = [];
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * (rows.length - 1)) + 1;
    const row = rows[randomIndex];
    
    samples.push({
      rowIndex: randomIndex + 1,
      company: row[0] || '(empty)',
      website: row[1] || '(empty)',
      contactName: row[2] || '(empty)',
      title: row[3] || '(empty)',
      email: row[4] || '(empty)',
      linkedin: row[6] || '(empty)',
      status: row[7] || '(empty)'
    });
  }
  
  samples.forEach(sample => {
    console.log(`Row ${sample.rowIndex}: ${sample.company}`);
    console.log(`  Contact: ${sample.contactName} - ${sample.title}`);
    console.log(`  Email: ${sample.email}`);
    console.log(`  LinkedIn: ${sample.linkedin}`);
    console.log(`  Status: ${sample.status}\n`);
  });
  
  // Count enrichment stats
  let totalWithContact = 0;
  let totalWithDirectEmail = 0;
  let totalGenericEmail = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue; // Skip if no company
    
    if (row[2] && row[2].trim()) totalWithContact++;
    if (row[4] && row[4].trim() && !/^(info|sales|ir|contact|investor|admin|support)@/i.test(row[4])) {
      totalWithDirectEmail++;
    }
    if (row[4] && /^(info|sales|ir|contact|investor|admin|support)@/i.test(row[4])) {
      totalGenericEmail++;
    }
  }
  
  const totalLeads = rows.length - 1; // Exclude header
  
  console.log('\n📊 Enrichment Quality Summary:');
  console.log(`  Total leads: ${totalLeads}`);
  console.log(`  With contact names: ${totalWithContact} (${((totalWithContact/totalLeads)*100).toFixed(1)}%)`);
  console.log(`  With direct emails: ${totalWithDirectEmail} (${((totalWithDirectEmail/totalLeads)*100).toFixed(1)}%)`);
  console.log(`  With generic emails: ${totalGenericEmail} (${((totalGenericEmail/totalLeads)*100).toFixed(1)}%)`);
  console.log(`\n✅ Sheet is ${((totalWithContact/totalLeads)*100).toFixed(1)}% enriched with real contacts`);
}

verifyQuality().catch(console.error);
