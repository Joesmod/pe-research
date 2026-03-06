const fs = require('fs');

const contacts = JSON.parse(fs.readFileSync('clean-batch-25.json'));

const emails = contacts.map(c => {
  const firstName = c.name.split(' ')[0];
  
  // Personalize based on role/title
  let opener = `I saw your role as ${c.title} at ${c.company} and wanted to reach out about AI deployment for your portfolio.`;
  
  if (c.title.toLowerCase().includes('head of technology') || c.title.toLowerCase().includes('cto')) {
    opener = `I saw your role as ${c.title} at ${c.company} — exactly the kind of tech leadership that's rare in PE.`;
  } else if (c.title.toLowerCase().includes('operating partner')) {
    opener = `I saw your Operating Partner role at ${c.company} and figured you're probably fielding a lot of "AI transformation" pitches right now.`;
  }
  
  const body = `${firstName},<br><br>${opener}<br><br>Most PE firms are struggling to roll out AI across portcos without it turning into a multi-quarter science project. We built the opposite at <a href="https://hellogumbo.com">Gumbo</a>: lightweight AI agents that drop in and start delivering ROI in weeks.<br><br>Voice SDRs that book real meetings. Document automation that cuts analyst hours. Customer service agents that scale without headcount.<br><br>No data science teams required. No infrastructure overhauls. Just working AI that proves value fast.<br><br>Worth 15 minutes to see what we've deployed for PE-backed companies?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`;
  
  return {
    to: c.email,
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: `${c.company} portfolio: AI that works now`,
    body: body,
    company: c.company,
    name: c.name
  };
});

fs.writeFileSync('email-batch.json', JSON.stringify(emails, null, 2));
console.log(`Generated ${emails.length} emails for never-contacted companies`);
