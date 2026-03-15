const fs = require('fs');
const { sendEmail } = require('./send.js');

// Read CRM data
const crmDataRaw = fs.readFileSync('crm-data.json', 'utf8');
const crmData = JSON.parse(crmDataRaw.replace(/^\uFEFF/, '')); // Remove BOM

// Current date for 7-day check
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

// Priority roles for tech/AI/value creation
const priorityRoles = [
  'cto', 'chief technology officer', 'chief ai officer', 'chief innovation officer',
  'vp product', 'vp technology', 'vp engineering', 'vp innovation', 'vp digital',
  'operating partner', 'venture partner', 'senior advisor', 'strategic advisor',
  'head of digital', 'head of technology', 'head of innovation', 'head of ai',
  'director of technology', 'director of innovation', 'director of digital',
  'partner', 'principal', 'managing director' // Also include these roles if they have high Gumbo scores
];

function isPriorityRole(title) {
  if (!title) return false;
  const lowerTitle = title.toLowerCase();
  return priorityRoles.some(role => lowerTitle.includes(role));
}

function wasContactedRecently(dateStr) {
  if (!dateStr) return false;
  try {
    const contactDate = new Date(dateStr);
    return contactDate >= sevenDaysAgo;
  } catch {
    return false;
  }
}

// Process Sheet1 (main firms) - get companies recently contacted
const sheet1Data = crmData.sheet1.slice(1);
const companiesContacted = new Set();

sheet1Data.forEach(row => {
  const company = row[0];
  const lastContacted = row[9]; // Column J in Sheet1
  if (wasContactedRecently(lastContacted)) {
    companiesContacted.add(company);
  }
});

// Process Contacts sheet
const contactsHeaders = crmData.contacts[0];
const contactsData = crmData.contacts.slice(1);

// Track companies recently contacted from Contacts sheet
contactsData.forEach(row => {
  const company = row[0];
  const lastContacted = row[8]; // Column I in Contacts
  if (wasContactedRecently(lastContacted)) {
    companiesContacted.add(company);
  }
});

console.log(`Companies contacted in last 7 days: ${companiesContacted.size}`);

// Find qualified contacts from Contacts sheet
const candidates = [];
const companiesInCandidates = new Set();

contactsData.forEach(row => {
  const company = row[0];
  const gumboScore = parseInt(row[1]) || 0;
  const name = row[2];
  const title = row[3];
  const email = row[4];
  const emailStatus = row[5];
  const linkedin = row[6];
  const researchNotes = row[7];
  const lastContacted = row[8];
  
  // Skip if no email or not verified
  if (!email || !email.includes('@')) return;
  
  // Skip if Gumbo Score < 8
  if (gumboScore < 8) return;
  
  // Skip if recently contacted
  if (companiesContacted.has(company)) return;
  
  // Skip if company already in candidates (max 1 per company)
  if (companiesInCandidates.has(company)) return;
  
  // Check if priority role
  if (!isPriorityRole(title)) return;
  
  // Get sector info from Sheet1
  const firmRow = sheet1Data.find(r => r[0] === company);
  const sector = firmRow ? firmRow[6] : '';
  const portfolio = firmRow ? firmRow[7] : '';
  
  candidates.push({
    company,
    name,
    title,
    email,
    gumboScore,
    linkedin,
    sector,
    portfolio,
    researchNotes
  });
  
  companiesInCandidates.add(company);
});

console.log(`Found ${candidates.length} qualified candidates`);

// Sort by Gumbo Score (descending) and prioritize tech/AI/innovation roles
candidates.sort((a, b) => {
  // First priority: CTO, Chief AI Officer, VP Innovation, Operating Partner
  const aIsTopTier = /cto|chief.*officer|vp.*innovation|operating partner|chief innovation/i.test(a.title);
  const bIsTopTier = /cto|chief.*officer|vp.*innovation|operating partner|chief innovation/i.test(b.title);
  
  if (aIsTopTier && !bIsTopTier) return -1;
  if (!aIsTopTier && bIsTopTier) return 1;
  
  // Second priority: Gumbo Score
  return b.gumboScore - a.gumboScore;
});

const selected = candidates.slice(0, 25);

console.log(`Selected ${selected.length} for this batch\n`);

// Generate personalized emails
const emails = selected.map((contact, idx) => {
  const firstName = contact.name.split(' ')[0];
  const companySector = contact.sector || 'portfolio companies';
  
  // Determine focus area from sector/portfolio
  let focusArea = 'portfolio operations';
  if (/tech|software|saas|ai/i.test(companySector)) {
    focusArea = 'technology investments';
  } else if (/healthcare/i.test(companySector)) {
    focusArea = 'healthcare portfolio';
  } else if (/industrial|manufacturing/i.test(companySector)) {
    focusArea = 'operational efficiency';
  } else if (/digital|innovation/i.test(companySector)) {
    focusArea = 'digital transformation';
  }
  
  // Personalize subject based on role/sector
  let subject;
  const titleLower = contact.title.toLowerCase();
  
  if (titleLower.includes('operating partner') || titleLower.includes('operational')) {
    subject = `Ops automation for ${contact.company}`;
  } else if (titleLower.includes('cto') || titleLower.includes('chief technology')) {
    subject = `Tech stack for ${contact.company}`;
  } else if (titleLower.includes('ai') || titleLower.includes('innovation')) {
    subject = `AI ops for ${contact.company}`;
  } else if (titleLower.includes('digital')) {
    subject = `Digital tools for ${contact.company}`;
  } else if (titleLower.includes('partner') || titleLower.includes('managing director')) {
    subject = `Portfolio insights for ${contact.company}`;
  } else {
    subject = `Scalable ops for ${contact.company}`;
  }
  
  // Personalize body based on role and sector
  let valueProps;
  if (titleLower.includes('operating') || titleLower.includes('operational')) {
    valueProps = `• Automated reporting across portfolio companies<br>• Standardized ops dashboards<br>• Value creation playbook automation`;
  } else if (titleLower.includes('tech') || titleLower.includes('ai') || titleLower.includes('innovation')) {
    valueProps = `• AI-powered due diligence summaries<br>• Tech stack assessment automation<br>• Digital transformation playbooks`;
  } else if (titleLower.includes('digital')) {
    valueProps = `• Digital maturity assessments<br>• Automated transformation roadmaps<br>• Portfolio-wide digital initiatives tracking`;
  } else {
    valueProps = `• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation`;
  }
  
  const body = `Hi ${firstName},<br><br>I'm Jim from <a href="https://hellogumbo.com">Gumbo</a>. We build AI tools that help PE firms streamline ${focusArea}.<br><br>Given your role at ${contact.company}, I thought you might be interested in how we're helping similar firms:<br><br>${valueProps}<br><br>Would you be open to a 15-minute call to explore whether this could be useful for ${contact.company}?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href="https://hellogumbo.com">Gumbo</a>`;
  
  return {
    to: contact.email,
    subject,
    body,
    contact
  };
});

// Write batch script
const batchScript = `const { sendEmail } = require('./send.js');

const emails = ${JSON.stringify(emails, null, 2)};

async function sendBatch() {
  console.log('Sending ${selected.length} emails...');
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(\`[\${i + 1}/${emails.length}] Sending to \${email.contact.name} at \${email.contact.company}...\`);
    
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

fs.writeFileSync('batch-2026-03-09-8am.js', batchScript);
console.log('✓ Batch script saved to batch-2026-03-09-8am.js\n');

// Send preview to Alex
async function sendPreview() {
  if (selected.length === 0) {
    console.log('⚠️  No qualified contacts found - skipping preview');
    return;
  }
  
  const previewEmail = emails[0];
  const previewSubject = `[PREVIEW] ${previewEmail.subject}`;
  const previewBody = `<strong>PREVIEW EMAIL - BATCH OF ${selected.length}</strong><br><br>Recipient: ${previewEmail.contact.name} &lt;${previewEmail.to}&gt;<br>Company: ${previewEmail.contact.company}<br>Title: ${previewEmail.contact.title}<br>Gumbo Score: ${previewEmail.contact.gumboScore}<br><br>---<br><br>${previewEmail.body}<br><br>---<br><br><strong>BATCH SUMMARY (${selected.length} emails):</strong><br><br>${selected.map((c, i) => `${i + 1}. <strong>${c.name}</strong> (${c.title}) - Gumbo Score: ${c.gumboScore}<br>   ${c.company} - ${c.email}<br>   ${c.sector ? 'Sector: ' + c.sector : ''}`).join('<br><br>')}`;
  
  try {
    await sendEmail(
      'alex@hellogumbo.com',
      previewSubject,
      previewBody,
      'jeff@hellogumbo.com'
    );
    console.log('✓ Preview email sent to alex@hellogumbo.com');
  } catch (err) {
    console.error('✗ Failed to send preview:', err.message);
  }
}

sendPreview().catch(console.error);

// Print summary
console.log('\n=== BATCH SUMMARY ===');
selected.forEach((contact, i) => {
  console.log(`${i + 1}. ${contact.name} (${contact.title}) - Score: ${contact.gumboScore}`);
  console.log(`   ${contact.company} - ${contact.email}`);
  if (contact.sector) console.log(`   Sector: ${contact.sector}`);
  console.log('');
});
