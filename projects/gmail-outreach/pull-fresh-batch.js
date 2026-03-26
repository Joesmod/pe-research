const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function pullBatch() {
  const auth = new GoogleAuth({
    keyFile: './service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Get Outreach Log for deduplication
  console.log('Loading Outreach Log...');
  const outreachResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Outreach Log!A:E'
  });
  
  const outreachRows = outreachResponse.data.values || [];
  const contactedEmails = new Set();
  const contactedCompanies = new Set();
  
  for (let i = 1; i < outreachRows.length; i++) {
    const email = outreachRows[i][3];
    const company = outreachRows[i][1];
    if (email) contactedEmails.add(email.toLowerCase().trim());
    if (company) contactedCompanies.add(company.toLowerCase().trim());
  }
  
  console.log(`Contacted emails: ${contactedEmails.size}`);
  console.log(`Contacted companies: ${contactedCompanies.size}`);
  
  // Get Uncontacted Leads
  console.log('Loading Uncontacted Leads...');
  const leadsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Uncontacted Leads!A:I'
  });
  
  const leadsRows = leadsResponse.data.values || [];
  
  // Parse leads
  const leads = [];
  const seenEmails = new Set();
  
  for (let i = 1; i < leadsRows.length; i++) {
    const row = leadsRows[i];
    const lead = {
      company: row[0] || '',
      domain: row[1] || '',
      contact: row[2] || '',
      title: row[3] || '',
      email: row[4] || '',
      linkedin: row[5] || '',
      gumboScore: parseInt(row[6]) || 0,
      lastContacted: row[7] || '',
      notes: row[8] || ''
    };
    
    const emailLower = lead.email.toLowerCase().trim();
    const companyLower = lead.company.toLowerCase().trim();
    
    // Skip if: no email, already contacted, or duplicate in this batch
    if (!lead.email) continue;
    if (contactedEmails.has(emailLower)) continue;
    if (contactedCompanies.has(companyLower)) continue;
    if (seenEmails.has(emailLower)) continue;
    
    seenEmails.add(emailLower);
    leads.push(lead);
  }
  
  console.log(`Total clean uncontacted leads: ${leads.length}\n`);
  
  // AI title keywords (strong AI focus)
  const aiTitles = [
    'chief ai officer',
    'chief artificial intelligence',
    'vp ai',
    'vp artificial intelligence',
    'head of ai',
    'director of ai',
    'director ai',
    'head of artificial intelligence',
    'chief data officer',
    'cdo',
    'head of analytics',
    'director of analytics',
    'vp analytics'
  ];
  
  // Tech titles (CTO, tech-focused ops)
  const techTitles = [
    'cto',
    'chief technology officer',
    'vp technology',
    'head of technology',
    'director of technology',
    'chief digital officer'
  ];
  
  // Categorize leads
  const aiLeads = [];
  const techLeads = [];
  const opsLeads = [];
  
  for (const lead of leads) {
    const titleLower = lead.title.toLowerCase();
    
    // Check AI titles first (highest priority)
    if (aiTitles.some(keyword => titleLower.includes(keyword))) {
      aiLeads.push(lead);
    }
    // Then tech titles
    else if (techTitles.some(keyword => titleLower.includes(keyword))) {
      techLeads.push(lead);
    }
    // High-score ops roles
    else if (lead.gumboScore >= 8) {
      opsLeads.push(lead);
    }
  }
  
  console.log(`AI-titled leads: ${aiLeads.length}`);
  console.log(`Tech-focused leads: ${techLeads.length}`);
  console.log(`High-score ops leads: ${opsLeads.length}\n`);
  
  // Build batch: AI first, then tech, then ops
  const batch = [
    ...aiLeads.slice(0, 15),
    ...techLeads.slice(0, 10)
  ];
  
  // Fill remaining spots with ops leads if needed
  if (batch.length < 25) {
    batch.push(...opsLeads.slice(0, 25 - batch.length));
  }
  
  console.log('=== TOP 25 BATCH ===\n');
  batch.forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.contact} (${lead.title}) at ${lead.company}`);
    console.log(`   Email: ${lead.email} | Score: ${lead.gumboScore}`);
  });
  
  return batch;
}

pullBatch().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
