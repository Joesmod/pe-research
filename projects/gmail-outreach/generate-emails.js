const fs = require('fs');
const contacts = JSON.parse(fs.readFileSync('top25-final.json', 'utf8'));

// Firm context for personalization (from CRM research)
const firmContext = {
  'One Rock Capital Partners': 'operationally-intensive industries',
  'Littlejohn & Co.': 'middle-market industrial and services companies',
  'Union Capital Associates': 'growth-oriented businesses',
  'Siris Capital Group': 'technology and telecommunications',
  'BV Investment Partners': 'middle-market software and tech-enabled services',
  'Marlin Equity Partners': 'technology companies',
  'Golden Gate Capital': 'financial services and insurance',
  'Cortec Group': 'middle-market businesses across North America',
  'CID Capital': 'business services',
  'Pine Brook Partners': 'financial services',
  'Accel-KKR': 'software and tech-enabled services',
  'Clairvest Group': 'middle-market companies',
  'Platte River Equity': 'business services',
  'Mountaingate Capital': 'lower middle-market services',
  'General Atlantic': 'growth equity in tech and healthcare',
  'Rhône Group': 'transatlantic businesses',
  'Midwest Growth Partners': 'professional services',
  'Kainos Capital': 'middle-market companies',
  'Brentwood Associates': 'services businesses',
  'Resurgens Technology Partners': 'tech-enabled business services',
  'Charlesbank Capital Partners': 'middle-market companies',
  'GTCR': 'growth businesses in Healthcare, Technology, and Financial Services',
  'Huron Capital': 'business services',
  'JLL Partners': 'middle-market companies',
  'Renovus Capital Partners': 'growth companies'
};

// Generate personalized emails
const emails = contacts.map((contact, index) => {
  const sector = firmContext[contact.company] || 'portfolio companies';
  
  // Personalize based on title
  let opening = '';
  let valueProps = [];
  
  if (/CTO|Chief.*Tech|Chief.*AI|Chief.*Information/i.test(contact.title)) {
    opening = `I am reaching out because your role as ${contact.title} positions you uniquely to evaluate how AI can create operational value across ${contact.company} portfolio.`;
    valueProps = [
      'Embedded AI assistants that reduce operational overhead by 30-40% through intelligent automation',
      'Portfolio-wide AI deployment frameworks that scale best practices across all investments',
      'Custom AI solutions for repetitive workflows (compliance, reporting, due diligence prep)'
    ];
  } else if (/Portfolio.*Resource|Value Creation|Portfolio.*Ops/i.test(contact.title)) {
    opening = `Your ${contact.title} role at ${contact.company} makes you the perfect person to explore how AI can accelerate value creation across ${sector}.`;
    valueProps = [
      'AI-powered operational playbooks that compress 6-month initiatives into weeks',
      'Automated performance dashboards that surface opportunities earlier',
      'Portfolio-wide AI tools for marketing, sales, and customer success optimization'
    ];
  } else {
    opening = `As ${contact.title} at ${contact.company}, you are in a position to see how AI could transform operations across your ${sector} portfolio.`;
    valueProps = [
      'Rapid AI deployment across portfolio companies (days, not months)',
      'Measurable ROI through operational efficiency gains and revenue acceleration',
      'White-glove implementation that does not burden your portfolio leadership teams'
    ];
  }
  
  const body = `${opening}

<a href="https://hellogumbo.com">Gumbo</a> builds custom AI agents for private equity firms and their portfolio companies. We are not selling generic chatbots - we create tailored AI solutions that directly impact EBITDA.

What makes this relevant to you:

• ${valueProps[0]}
• ${valueProps[1]}
• ${valueProps[2]}

Quick example: One of our PE clients deployed AI agents across 3 portfolio companies in 45 days. Result: 35% reduction in customer support costs and a 22% increase in sales pipeline velocity.

Would you be open to a 15-minute call to explore how AI could fit into ${contact.company} value creation toolkit?

Best,<br>
Jim from Gumbo<br>
<a href="https://hellogumbo.com">hellogumbo.com</a>`;

  return {
    to: contact.email,
    subject: `AI for ${contact.company} Portfolio Operations`,
    body: body,
    company: contact.company,
    name: contact.name,
    title: contact.title
  };
});

fs.writeFileSync('emails-draft.json', JSON.stringify(emails, null, 2));
console.log(`✓ Generated ${emails.length} personalized emails`);
console.log('\nSample email:\n');
console.log(`To: ${emails[0].to}`);
console.log(`Subject: ${emails[0].subject}\n`);
console.log(emails[0].body);
