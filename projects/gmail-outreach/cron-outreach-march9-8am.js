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
  'director of technology', 'director of innovation', 'director of digital'
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

function hasGumboScore(row, minScore = 8) {
  // Check if there's a Gumbo Score column - might be in a different position
  // For now, prioritize based on sector focus and portfolio size
  const sectorFocus = row[6] || '';
  const portfolio = row[7] || '';
  
  // High score if mentions tech, AI, software, SaaS, or has substantial portfolio
  const highValueSectors = /tech|ai|software|saas|digital|data|cloud|innovation/i;
  const hasHighValueSector = highValueSectors.test(sectorFocus) || highValueSectors.test(portfolio);
  
  return hasHighValueSector;
}

// Process Sheet1 (main firms)
const sheet1Headers = crmData.sheet1[0];
const sheet1Data = crmData.sheet1.slice(1);

// Process Contacts sheet
const contactsHeaders = crmData.contacts[0];
const contactsData = crmData.contacts.slice(1);

// Combine and filter candidates
const candidates = [];
const companiesContacted = new Set();

// Track companies recently contacted from both sheets
sheet1Data.forEach(row => {
  const company = row[0];
  const lastContacted = row[9]; // Column J in Sheet1
  if (wasContactedRecently(lastContacted)) {
    companiesContacted.add(company);
  }
});

contactsData.forEach(row => {
  const company = row[0];
  const lastContacted = row[8]; // Column I in Contacts
  if (wasContactedRecently(lastContacted)) {
    companiesContacted.add(company);
  }
});

// Find qualified contacts from Contacts sheet
contactsData.forEach(row => {
  const company = row[0];
  const name = row[1];
  const title = row[2];
  const email = row[3];
  const website = row[4];
  const linkedin = row[5];
  const sector = row[6] || '';
  const portfolio = row[7] || '';
  
  // Skip if no email or recently contacted
  if (!email || companiesContacted.has(company)) return;
  
  // Skip if company already in candidates
  if (candidates.find(c => c.company === company)) return;
  
  // Check if priority role
  if (!isPriorityRole(title)) return;
  
  // Check for high-value sector/portfolio
  if (!hasGumboScore(row)) return;
  
  candidates.push({
    company,
    name,
    title,
    email,
    website,
    linkedin,
    sector,
    portfolio
  });
});

// Sort by priority (tech/AI roles first) and limit to 25
candidates.sort((a, b) => {
  const aHasTech = /tech|ai|innovation|digital/i.test(a.title);
  const bHasTech = /tech|ai|innovation|digital/i.test(b.title);
  if (aHasTech && !bHasTech) return -1;
  if (!aHasTech && bHasTech) return 1;
  return 0;
});

const selected = candidates.slice(0, 25);

console.log(`Found ${candidates.length} qualified candidates`);
console.log(`Selected ${selected.length} for this batch\n`);

// Generate personalized emails
const emails = selected.map((contact, idx) => {
  const firstName = contact.name.split(' ')[0];
  const companySector = contact.sector || 'portfolio companies';
  const focusArea = contact.sector.includes('tech') || contact.sector.includes('AI') 
    ? 'technology and AI investments' 
    : contact.sector.includes('healthcare') 
    ? 'healthcare portfolio'
    : contact.sector.includes('industrial')
    ? 'industrial operations'
    : 'portfolio companies';
  
  // Personalize subject based on role/sector
  let subject;
  if (contact.title.toLowerCase().includes('operating partner')) {
    subject = `Scalable ops for ${contact.company}'s portfolio`;
  } else if (contact.title.toLowerCase().includes('tech') || contact.title.toLowerCase().includes('ai')) {
    subject = `AI ops for ${contact.company}`;
  } else if (contact.title.toLowerCase().includes('innovation') || contact.title.toLowerCase().includes('digital')) {
    subject = `Digital transformation at ${contact.company}`;
  } else {
    subject = `Portfolio ops for ${contact.company}`;
  }
  
  const body = `Hi ${firstName},<br><br>I'm Jim from <a href="https://hellogumbo.com">Gumbo</a>. We help PE firms scale operations across their ${focusArea}.<br><br>Given your role at ${contact.company}, I thought you might be interested in how we're helping similar firms automate repetitive workflows and improve portfolio company efficiency.<br><br>Quick examples:<br>• Automated investor reporting (saving 20+ hours/month)<br>• AI-powered due diligence summaries<br>• Portfolio company performance dashboards<br><br>Would you be open to a 15-minute call to explore how this might fit ${contact.company}'s needs?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href="https://hellogumbo.com">Gumbo</a>`;
  
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
  const previewEmail = emails[0];
  const previewSubject = `[PREVIEW] ${previewEmail.subject}`;
  const previewBody = `<strong>PREVIEW EMAIL - BATCH OF ${selected.length}</strong><br><br>Recipient: ${previewEmail.contact.name} &lt;${previewEmail.to}&gt;<br>Company: ${previewEmail.contact.company}<br>Title: ${previewEmail.contact.title}<br><br>---<br><br>${previewEmail.body}<br><br>---<br><br><strong>BATCH SUMMARY:</strong><br>${selected.map((c, i) => `${i + 1}. ${c.name} (${c.title}) - ${c.company} - ${c.email}`).join('<br>')}`;
  
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
  console.log(`${i + 1}. ${contact.name} (${contact.title})`);
  console.log(`   ${contact.company} - ${contact.email}`);
  console.log(`   Sector: ${contact.sector}`);
  console.log('');
});
