const fs = require('fs');
const { sendEmail } = require('./send.js');

const leads = JSON.parse(fs.readFileSync('final-25-leads.json', 'utf8'));

// Email templates based on role type
function generateEmail(lead) {
  const { name, title, company, sector, notes } = lead;
  const firstName = name.split(' ')[0];
  
  // Determine email angle based on role
  const isCLevel = /^(cto|cio|ciso|chief|ceo|chairman)/i.test(title);
  const isTech = /(technology|digital|data|analytics|ai|software|engineer)/i.test(title);
  const isGrowth = /(growth|value creation|portfolio|operating partner)/i.test(title);
  
  let opening, body, cta;
  
  if (isCLevel) {
    opening = `${firstName} - I saw your tech leadership role at ${company} and thought you'd want to know about this.`;
    body = `Most PE firms are still treating AI like a side project - running pilots, building MVPs, waiting for perfect use cases.<br><br>The firms winning right now are the ones building AI infrastructure across their entire portfolio. Not one-off tools. Repeatable systems that work at scale.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE platforms deploy production AI agents that handle real work: lead generation, research, portfolio monitoring, deal sourcing. We've built the infrastructure so your portfolio companies can focus on their business.`;
    cta = `Worth a 15-minute conversation? I can show you what we've built and how other firms are using it.`;
  } else if (isTech || isGrowth) {
    opening = `${firstName} - given your ${title.toLowerCase()} role at ${company}, you're probably seeing this: every portfolio company asking about AI, but no one has time to build it properly.`;
    body = `That's the gap <a href="https://hellogumbo.com">Gumbo</a> fills. We build production AI agent systems for PE platforms - the infrastructure that lets your portfolio companies deploy AI without hiring ML teams or running endless pilots.<br><br>Real use cases we've shipped: automated lead generation, market research, portfolio monitoring, competitive intelligence. The kind of work that takes associates hours but doesn't require human judgment.`;
    cta = `15 minutes to show you what's possible? I think you'll see applications across your portfolio immediately.`;
  } else {
    // Business Development / Generic
    opening = `${firstName} - quick question: how many of your portfolio companies are asking about AI right now?`;
    body = `Most PE firms are stuck in pilot purgatory - every portco wants AI, but no one has the infrastructure to deploy it properly. That's what <a href="https://hellogumbo.com">Gumbo</a> built.<br><br>We're an AI engineering firm that builds production agent systems for PE platforms. Not consultants. Not software vendors. We build the actual infrastructure that lets your portfolio companies deploy AI agents that handle real work.<br><br>Current use cases: lead generation, market research, portfolio monitoring, deal sourcing. The work that takes analysts hours but doesn't need human creativity.`;
    cta = `Worth 15 minutes to see what we've built? I can walk you through the platform and show you how other firms are using it.`;
  }
  
  const subject = isCLevel
    ? `${company}: AI infrastructure for your portfolio`
    : `Quick question about AI across your portfolio`;
  
  const fullBody = `${opening}<br><br>${body}<br><br>${cta}<br><br>Best,<br>Jim<br><br>---<br>Jim | <a href="https://hellogumbo.com">Gumbo</a>`;
  
  return { subject, body: fullBody };
}

// Generate all emails and save
const emailBatch = leads.map(lead => {
  const email = generateEmail(lead);
  return {
    to: lead.email,
    subject: email.subject,
    body: email.body,
    company: lead.company,
    name: lead.name,
    title: lead.title
  };
});

fs.writeFileSync('email-batch.json', JSON.stringify(emailBatch, null, 2));
console.log(`✅ Generated ${emailBatch.length} personalized emails`);
console.log('Saved to email-batch.json\n');

// Show preview of first 3
console.log('=== PREVIEW ===\n');
emailBatch.slice(0, 3).forEach((email, i) => {
  console.log(`${i+1}. TO: ${email.name} <${email.to}>`);
  console.log(`   SUBJECT: ${email.subject}`);
  console.log(`   COMPANY: ${email.company}\n`);
});
