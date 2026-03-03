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

async function sendNext5() {
  const next5 = batch.slice(0, 5);
  
  console.log(`\n=== SENDING NEXT 5 EMAILS ===\n`);
  
  let sent = 0;
  let failed = 0;
  
  for (const contact of next5) {
    const { subject, body } = generateEmail(contact);
    
    console.log(`\nSending to: ${contact.contact} (${contact.company})`);
    console.log(`Email: ${contact.email}`);
    console.log(`Subject: ${subject}`);
    
    try {
      await sendEmail(contact.email, subject, body);
      console.log(`✅ SENT`);
      sent++;
      
      // Wait 2 seconds between sends
      if (sent < 5) {
        console.log(`Waiting 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`❌ FAILED: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`✅ Sent: ${sent}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\nNext contacts would be:`);
  batch.slice(5, 10).forEach((c, i) => {
    console.log(`${i + 6}. ${c.contact} (${c.company})`);
  });
}

sendNext5().catch(console.error);
