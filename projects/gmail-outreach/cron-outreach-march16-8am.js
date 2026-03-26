/**
 * PE Outreach — Daily 25 emails (March 16, 2026 8:00 AM)
 * 
 * Finds qualified contacts from CRM and prepares personalized emails.
 * Sends preview to Alex, then posts summary to #openclaw-sales.
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const CRM_SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const KEY_FILE = path.join(__dirname, 'service-account.json');

const { sendEmail } = require('./send.js');

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function findQualifiedContacts() {
  const sheets = await getSheets();
  
  // Read Contacts sheet
  const contactsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Contacts!A:I',
  });
  const contactsRows = contactsRes.data.values || [];
  const headers = contactsRows[0];
  
  // Read Sheet1 to check company Last Contacted (col K)
  const sheet1Res = await sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: 'Sheet1!A:K',
  });
  const sheet1Rows = sheet1Res.data.values || [];
  
  // Build company last contacted map
  const companyLastContacted = new Map();
  for (let i = 1; i < sheet1Rows.length; i++) {
    const companyName = (sheet1Rows[i][0] || '').trim();
    const lastContacted = (sheet1Rows[i][10] || '').trim(); // Col K (index 10)
    if (companyName && lastContacted) {
      companyLastContacted.set(companyName.toLowerCase(), lastContacted);
    }
  }
  
  // Parse contacts
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const qualified = [];
  const companiesUsed = new Set();
  
  for (let i = 1; i < contactsRows.length; i++) {
    const row = contactsRows[i];
    const company = (row[0] || '').trim();
    const score = parseFloat(row[1] || '0');
    const contact = (row[2] || '').trim();
    const title = (row[3] || '').trim();
    const email = (row[4] || '').trim().toLowerCase();
    const emailStatus = (row[5] || '').toLowerCase();
    const lastContacted = (row[8] || '').trim(); // Col I
    
    // Filter: Gumbo Score >= 8
    if (score < 8) continue;
    
    // Filter: verified email
    if (!email || !email.includes('@') || emailStatus !== 'verified') continue;
    
    // Filter: tech/AI/value creation roles
    const titleLower = title.toLowerCase();
    const techRoles = ['cto', 'chief technology', 'chief ai', 'chief information',
                       'vp product', 'vp tech', 'operating partner', 'principal',
                       'value creation', 'digital', 'head of technology'];
    const hasRelevantRole = techRoles.some(role => titleLower.includes(role));
    if (!hasRelevantRole) continue;
    
    // Filter: skip if contacted in last 7 days (Contacts sheet)
    if (lastContacted) {
      try {
        const lastDate = new Date(lastContacted);
        if (lastDate >= sevenDaysAgo) {
          console.log(`Skipping ${email}: contact last reached ${lastContacted}`);
          continue;
        }
      } catch (e) {
        // Invalid date, skip
      }
    }
    
    // Filter: skip if company contacted in last 7 days (Sheet1)
    const companyLC = companyLastContacted.get(company.toLowerCase());
    if (companyLC) {
      try {
        const lastDate = new Date(companyLC);
        if (lastDate >= sevenDaysAgo) {
          console.log(`Skipping ${email}: company ${company} last contacted ${companyLC}`);
          continue;
        }
      } catch (e) {
        // Invalid date, skip
      }
    }
    
    // Filter: only 1 contact per company
    if (companiesUsed.has(company.toLowerCase())) {
      console.log(`Skipping ${email}: already have contact from ${company}`);
      continue;
    }
    
    companiesUsed.add(company.toLowerCase());
    qualified.push({ company, score, contact, title, email });
  }
  
  // Sort by score descending, take top 25
  qualified.sort((a, b) => b.score - a.score);
  return qualified.slice(0, 25);
}

function generateEmail(lead) {
  const { company, contact, title, email } = lead;
  const firstName = contact.split(' ')[0];
  
  const subject = `AI-driven ops efficiency for ${company} portfolio companies`;
  
  const body = `Hi ${firstName},

I'm reaching out because ${company}'s focus on operational value creation aligns with what we're building at <a href="https://hellogumbo.com">Gumbo</a>.

We help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.

Given your role in ${title.includes('Technology') || title.includes('CTO') || title.includes('AI') ? 'technology strategy' : 'value creation'}, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.

Would you be open to a 15-minute call in the next week or two?

Best,<br><br>
Jim from Gumbo<br>
<a href="https://hellogumbo.com">hellogumbo.com</a>`;
  
  return { subject, body };
}

async function main() {
  console.log('🔍 Finding qualified contacts...\n');
  const leads = await findQualifiedContacts();
  
  if (leads.length === 0) {
    console.log('❌ No qualified contacts found');
    return;
  }
  
  console.log(`✅ Found ${leads.length} qualified contacts\n`);
  
  // Generate emails
  const batch = leads.map(lead => {
    const { subject, body } = generateEmail(lead);
    return { ...lead, subject, body };
  });
  
  // Save batch script
  const batchScript = `/**
 * Outreach batch — March 16, 2026 8:00 AM
 * ${batch.length} emails to PE contacts
 * 
 * Run: node cron-outreach-batch-march16-8am-SEND.js
 */

const { sendEmail } = require('./send.js');

const batch = ${JSON.stringify(batch, null, 2)};

async function sendBatch() {
  for (const lead of batch) {
    console.log(\`Sending to \${lead.contact} at \${lead.company}...\`);
    await sendEmail(lead.email, lead.subject, lead.body);
    console.log(\`✅ Sent to \${lead.email}\`);
    await new Promise(r => setTimeout(r, 2000)); // 2s delay between sends
  }
  console.log(\`\\n✅ Batch complete: \${batch.length} emails sent\`);
}

sendBatch().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
`;
  
  fs.writeFileSync(path.join(__dirname, 'cron-outreach-batch-march16-8am-SEND.js'), batchScript);
  console.log('💾 Saved batch script: cron-outreach-batch-march16-8am-SEND.js');
  console.log('   DO NOT RUN until Alex approves!\n');
  
  // Send preview to Alex
  const previewLead = batch[0];
  const previewSubject = `[PREVIEW] ${previewLead.subject}`;
  const previewBody = `<p><strong>This is a PREVIEW of the first email in today's batch.</strong></p>
<p>Review below. If approved, I'll send the remaining ${batch.length - 1} emails.</p>
<hr>
<p><strong>To:</strong> ${previewLead.contact} (${previewLead.title}) at ${previewLead.company}<br>
<strong>Email:</strong> ${previewLead.email}<br>
<strong>Subject:</strong> ${previewLead.subject}</p>
<hr>
${previewLead.body}`;
  
  console.log('📧 Sending preview to alex@hellogumbo.com...\n');
  await sendEmail('alex@hellogumbo.com', previewSubject, previewBody);
  console.log('✅ Preview sent to Alex\n');
  
  // Print summary for Slack
  console.log('=== Slack Summary (#openclaw-sales) ===\n');
  console.log(`📬 **PE Outreach Batch Ready** (March 16, 2026 8:00 AM)`);
  console.log(`\nPreview sent to Alex. Awaiting approval before sending ${batch.length} emails.\n`);
  console.log(`**Recipients:**`);
  batch.forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.contact} (${lead.title}) at ${lead.company} — ${lead.email}`);
  });
  console.log(`\n**Subject lines (sample):**`);
  const uniqueSubjects = [...new Set(batch.map(l => l.subject))];
  uniqueSubjects.slice(0, 3).forEach(s => console.log(`- "${s}"`));
  
  return batch;
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
