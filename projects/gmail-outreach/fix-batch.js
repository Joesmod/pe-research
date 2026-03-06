const fs = require('fs');

// Load the batch from the JS file
const batchFile = fs.readFileSync('batch-2026-03-05.js', 'utf8');
const emailsStart = batchFile.indexOf('const emails = [') + 'const emails = '.length;
const emailsEnd = batchFile.indexOf('];', emailsStart) + 1;
const emailsText = batchFile.substring(emailsStart, emailsEnd);

// Parse it
const emails = eval('(' + emailsText + ')');

// Remove Charlesbank
const filtered = emails.filter(e => e.to !== 'jflannery@charlesbank.com');

console.log(`Removed Charlesbank. Count before: ${emails.length}, after: ${filtered.length}`);

// Add Knox Capital
const replacement = {
  to: 'ed@knoxlending.com',
  bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
  subject: 'Knox Capital portfolio: AI that works now',
  body: `Ed,<br><br>I saw your role as Managing Director at Knox Capital and wanted to reach out about AI deployment for your portfolio.<br><br>Most PE firms are struggling to roll out AI across portcos without it turning into a multi-quarter science project. We built the opposite at <a href="https://hellogumbo.com">Gumbo</a>: lightweight AI agents that drop in and start delivering ROI in weeks.<br><br>Voice SDRs that book real meetings. Document automation that cuts analyst hours. Customer service agents that scale without headcount.<br><br>No data science teams required. No infrastructure overhauls. Just working AI that proves value fast.<br><br>Worth 15 minutes to see what we've deployed for PE-backed companies?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
};

filtered.splice(1, 0, replacement);

console.log(`Added Knox Capital. Final count: ${filtered.length}`);

// Save as JSON for send-batch.js
fs.writeFileSync('email-batch.json', JSON.stringify(filtered, null, 2));

console.log('Saved updated batch to email-batch.json');
