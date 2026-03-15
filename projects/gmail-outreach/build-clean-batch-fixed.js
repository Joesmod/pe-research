const { google } = require('googleapis');
const fs = require('fs');

async function buildCleanBatch() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'sheets-service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read all contacts
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Contacts!A2:I1000'
  });

  const rows = response.data.values || [];
  
  // Build set of companies that have been contacted (ANY contact with timestamp in col I)
  const contactedCompanies = new Set();
  rows.forEach(r => {
    if (r[8]) { // Column I = Last Contacted
      contactedCompanies.add(r[0]); // Column A = Company
    }
  });

  console.log(`Total companies with prior contact: ${contactedCompanies.size}`);

  // Filter to uncontacted companies with Gumbo Score >= 8
  const candidates = rows
    .filter(r => {
      const company = r[0];
      const score = parseInt(r[1]) || 0;
      const name = r[2];
      const email = r[4];
      const lastContacted = r[8];

      return (
        company && 
        score >= 8 && 
        name && 
        email && 
        email.includes('@') && // Must have valid email
        email !== 'NO EMAIL' && // Exclude placeholder
        !lastContacted && // No timestamp on this contact
        !contactedCompanies.has(company) // No other contacts at company have been reached
      );
    })
    .map(r => ({
      company: r[0],
      gumboScore: parseInt(r[1]) || 0,
      name: r[2],
      title: r[3] || '',
      email: r[4],
      verification: r[5] || '',
      linkedin: r[6] || '',
      bio: r[7] || ''
    }));

  console.log(`Uncontacted candidates (Score >= 8): ${candidates.length}`);

  // Sort by Gumbo Score descending
  candidates.sort((a, b) => b.gumboScore - a.gumboScore);

  // Take top contact from each company (one per company)
  const seenCompanies = new Set();
  const batch = [];
  for (const candidate of candidates) {
    if (!seenCompanies.has(candidate.company)) {
      batch.push(candidate);
      seenCompanies.add(candidate.company);
      if (batch.length >= 25) break;
    }
  }

  console.log(`Unique companies selected: ${batch.length}`);

  console.log(`\n=== TOP 25 UNCONTACTED CONTACTS ===\n`);
  batch.forEach((contact, i) => {
    console.log(`${i + 1}. ${contact.name} (${contact.title}) - Score: ${contact.gumboScore}`);
    console.log(`   ${contact.company} - ${contact.email}\n`);
  });

  // Save batch
  fs.writeFileSync('clean-batch-25-verified.json', JSON.stringify(batch, null, 2));
  console.log(`Saved to clean-batch-25-verified.json`);

  // Read Sheet1 for company research data
  const sheet1Response = await sheets.spreadsheets.values.get({
    spreadsheetId: '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4',
    range: 'Sheet1!A2:H1000'
  });

  const sheet1Rows = sheet1Response.data.values || [];
  const companyData = {};
  sheet1Rows.forEach(r => {
    const company = r[0];
    companyData[company] = {
      sector: r[2] || '',
      portfolio: r[3] || '',
      researchNotes: r[5] || 'No public data found'
    };
  });

  // Generate email batch
  const emails = batch.map(contact => {
    const data = companyData[contact.company] || { sector: '', portfolio: '', researchNotes: 'No public data found' };
    
    // Customize subject and body based on sector/title
    let subject = `Tech stack for ${contact.company}`;
    let focusArea = 'operational efficiency';
    
    if (data.sector.toLowerCase().includes('tech') || contact.title.toLowerCase().includes('tech')) {
      focusArea = 'technology investments';
    } else if (data.sector.toLowerCase().includes('health')) {
      focusArea = 'healthcare portfolio';
    } else if (contact.title.toLowerCase().includes('portfolio') || contact.title.toLowerCase().includes('operations')) {
      focusArea = 'portfolio operations';
    }

    const body = `Hi ${contact.name.split(' ')[0]},<br><br>I'm Jim from <a href="https://hellogumbo.com">Gumbo</a>. We build AI tools that help PE firms streamline ${focusArea}.<br><br>Given your role at ${contact.company}, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for ${contact.company}?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href="https://hellogumbo.com">Gumbo</a>`;

    return {
      to: contact.email,
      subject,
      body,
      contact: {
        company: contact.company,
        name: contact.name,
        title: contact.title,
        email: contact.email,
        gumboScore: contact.gumboScore,
        linkedin: contact.linkedin,
        sector: data.sector,
        portfolio: data.portfolio,
        researchNotes: data.researchNotes
      }
    };
  });

  // Generate send script
  const sendScript = `const { sendEmail } = require('./send.js');

const emails = ${JSON.stringify(emails, null, 2)};

async function sendBatch() {
  console.log('Sending 25 emails...');
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(\`[\${i + 1}/25] Sending to \${email.contact.name} at \${email.contact.company}...\`);
    
    try {
      await sendEmail(
        email.to,
        email.subject,
        email.body,
        'alex@hellogumbo.com,jeff@hellogumbo.com'
      );
      console.log('✓ Sent');
      
      // Wait 2 seconds between sends
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (err) {
      console.error(\`✗ Failed: \${err.message}\`);
    }
  }
  
  console.log('\\nBatch complete!');
}

sendBatch().catch(console.error);
`;

  fs.writeFileSync('batch-2026-03-09-rebuilt.js', sendScript);
  console.log(`\nBatch send script saved to batch-2026-03-09-rebuilt.js`);
}

buildCleanBatch().catch(console.error);
