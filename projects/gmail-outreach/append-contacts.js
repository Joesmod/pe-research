const { execSync } = require('child_process');
const fs = require('fs');

const contacts = JSON.parse(fs.readFileSync('new-contacts.json', 'utf8'));

for (const contact of contacts) {
  const json = JSON.stringify([contact]);
  const cmd = `node sheets.js append "Sheet1" '${json}'`;
  console.log(`Appending: ${contact[2]} at ${contact[0]}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to append ${contact[2]}: ${e.message}`);
  }
}
