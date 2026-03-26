const { execSync } = require('child_process');
const path = require('path');
const sendJs = path.join(__dirname, 'gmail-outreach', 'send.js');

const subjects = [
  'Draft Outreach Emails for Review (1 of 5) - Knox Capital',
  'Draft Outreach Emails for Review (2 of 5) - Kohlberg & Company',
  'Draft Outreach Emails for Review (3 of 5) - Diversis Capital',
  'Draft Outreach Emails for Review (4 of 5) - Align Capital Partners',
  'Draft Outreach Emails for Review (5 of 5) - Gauge Capital',
];

for (const sub of subjects) {
  const out = execSync(`node "${sendJs}" send "alex@hellogumbo.com" "${sub}" "Resent with fixed From name. See original email for full draft."`, { encoding: 'utf8' });
  console.log(sub.split(' - ')[1] + ': ' + out.trim());
}
