const fs = require('fs');
const { sendEmail } = require('./send.js');

const batch = JSON.parse(fs.readFileSync('batch-2026-03-02.json', 'utf8'));

// Email template generator - personalized for PE tech/ops leaders
function generateEmail(contact) {
  const firstName = contact.contact.split(' ')[0];
  
  // Personalize based on role and sector focus
  let opening, hook, relevance;
  
  if (contact.title.toLowerCase().includes('cto') || contact.title.toLowerCase().includes('chief technology')) {
    opening = `I'm reaching out because ${contact.company}'s tech-forward approach in ${contact.sector} caught my attention.`;
    hook = `Given your role as CTO`;
    relevance = `technical infrastructure`;
  } else if (contact.title.toLowerCase().includes('cio') || contact.title.toLowerCase().includes('chief information')) {
    opening = `I'm reaching out because ${contact.company}'s operational capabilities in ${contact.sector} stood out.`;
    hook = `Given your position as CIO`;
    relevance = `IT systems and digital transformation`;
  } else if (contact.title.toLowerCase().includes('coo') || contact.title.toLowerCase().includes('operating')) {
    opening = `I'm reaching out because ${contact.company}'s operational excellence in ${contact.sector} stood out.`;
    hook = `Given your operational focus`;
    relevance = `portfolio company operations`;
  } else {
    opening = `I'm reaching out because ${contact.company}'s value creation approach in ${contact.sector} caught my attention.`;
    hook = `Given your role`;
    relevance = `portfolio operations`;
  }
  
  // Sector-specific value prop
  let sectorHook;
  if (contact.sector.toLowerCase().includes('healthcare')) {
    sectorHook = `Many PE healthcare platforms are still managing scheduling, compliance docs, and patient workflows manually.`;
  } else if (contact.sector.toLowerCase().includes('business services') || contact.sector.toLowerCase().includes('industrial')) {
    sectorHook = `Many PE services platforms are still handling client onboarding, project scoping, and reporting manually.`;
  } else if (contact.sector.toLowerCase().includes('software') || contact.sector.toLowerCase().includes('technology')) {
    sectorHook = `Many PE software platforms are still managing support tickets, onboarding, and customer success workflows manually.`;
  } else {
    sectorHook = `Many PE-backed companies are still managing operations, compliance, and reporting manually.`;
  }
  
  const subject = `${contact.company} portfolio automation`;
  
  const body = `${firstName},<br><br>${opening}<br><br>${sectorHook} We've built custom AI agents that automate these workflows across portfolios.<br><br>${hook}, you might see value in:<br><br>- Automated workflows for portfolio operations (no-code deployment)<br>- Pre-built agents for common PE use cases (HR, finance, compliance)<br>- Fast rollouts across multiple portfolio companies<br><br>We work with PE firms to deploy automation that delivers value in weeks, not quarters.<br><br>Worth a quick conversation?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href="https://hellogumbo.com">Gumbo</a><br>Custom AI Agents for PE Portfolios`;
  
  return { subject, body };
}

async function sendBatch() {
  console.log(`\n=== BATCH 2026-03-02: 25 CONTACTS ===\n`);
  
  // APPROVAL GATE: Send first email to Alex as preview
  const firstContact = batch[0];
  const { subject, body } = generateEmail(firstContact);
  
  console.log(`\n--- APPROVAL GATE: Sending preview to alex@hellogumbo.com ---`);
  console.log(`First contact: ${firstContact.contact} (${firstContact.company})`);
  console.log(`Subject: ${subject}`);
  console.log(`\nPreview:\n${body.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '')}\n`);
  
  console.log(`\nSending preview email to alex@hellogumbo.com...`);
  
  const previewSubject = `[PREVIEW] Batch 2026-03-02 - First of 25`;
  const previewBody = `Alex,<br><br>Ready to send 25 emails to enriched PE contacts (tech/ops leaders). Here's the first one for approval:<br><br>---<br><br><strong>To: ${firstContact.contact} (${firstContact.company}) - ${firstContact.email}</strong><br><br><strong>Subject:</strong> ${subject}<br><br>${body}<br><br>---<br><br>If approved, I'll send this one plus the remaining 24 today.<br><br>Jim`;
  
  try {
    await sendEmail(
      'alex@hellogumbo.com',
      previewSubject,
      previewBody
    );
    
    console.log(`✅ Preview sent to alex@hellogumbo.com`);
    console.log(`\nWaiting for approval before sending remaining 24...`);
    console.log(`\nTo send after approval, run: node send-approved-2026-03-02.js`);
    
    // Save the batch for later sending
    const approved = {
      batch,
      approved: false,
      previewSent: new Date().toISOString()
    };
    fs.writeFileSync('batch-2026-03-02-status.json', JSON.stringify(approved, null, 2));
    
  } catch (error) {
    console.error(`❌ Failed to send preview:`, error.message);
    throw error;
  }
}

// Export for use by approval script
module.exports = { generateEmail, batch };

// Run if called directly
if (require.main === module) {
  sendBatch().catch(console.error);
}
