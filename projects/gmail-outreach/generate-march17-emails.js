const fs = require('fs');

const batch = JSON.parse(fs.readFileSync('batch-march17-25.json', 'utf8'));

// Generate personalized emails
const emails = batch.map((contact, idx) => {
  const { company, contact: name, title, email } = contact;
  
  // Generate subject line variations
  const subjects = [
    `Portfolio AI acceleration - ${company}`,
    `Building portfolio value with AI - ${company}`,
    `AI for portfolio ops - ${company}`,
    `Tech transformation across your portfolio - ${company}`,
    `Scaling AI in portfolio companies - ${company}`
  ];
  
  const subject = subjects[idx % subjects.length];
  
  // Generate personalized body
  const firstName = name.split(' ')[0];
  
  const body = `${firstName},\n\nMy name is Jim, and I work with <a href="https://hellogumbo.com">Gumbo</a>, a design and development agency that builds AI agents for private equity firms.\n\nWe help PE firms like ${company} embed AI capabilities across portfolio companies - from automating deal sourcing and diligence to building custom AI tools that drive operational improvements post-acquisition.\n\nRecent work includes:\n- Building an AI-powered deal flow pipeline for a mid-market PE firm that reduced manual screening time by 70%\n- Creating custom AI agents for a portfolio company that automated customer support, cutting costs 40%\n- Developing AI-enhanced diligence tools that identify value creation opportunities 3x faster\n\nGiven your role as ${title}, I'd love to explore how we can help ${company} systematically deploy AI to create value across your portfolio.\n\nWould you be open to a brief call?\n\nBest,\nJim\n<a href="https://hellogumbo.com">Gumbo</a>`;
  
  return {
    to: email,
    subject,
    body,
    company,
    contact: name,
    title
  };
});

// Save emails
fs.writeFileSync('emails-march17-25.json', JSON.stringify(emails, null, 2));

console.log(`✅ Generated ${emails.length} personalized emails`);
console.log('\n📋 Preview of first 3:\n');

emails.slice(0, 3).forEach((e, i) => {
  console.log(`${i + 1}. TO: ${e.to}`);
  console.log(`   SUBJECT: ${e.subject}`);
  console.log(`   COMPANY: ${e.company} - ${e.contact}, ${e.title}`);
  console.log('');
});

console.log(`\n💾 Saved to emails-march17-25.json`);
