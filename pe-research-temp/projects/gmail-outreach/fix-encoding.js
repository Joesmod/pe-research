const fs = require('fs');
const path = require('path');
const dir = 'drafts';

const files = ['02-testa-produce.md', '03-vienna-beef.md', '04-elis-cheesecake.md', '05-wirtz-breakthru.md'];

files.forEach(f => {
  const p = path.join(dir, f);
  let t = fs.readFileSync(p, 'utf8');
  // Replace em/en dashes with regular dash
  t = t.replace(/\u2014/g, '-').replace(/\u2013/g, '-');
  // Replace curly quotes
  t = t.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
  // Replace ellipsis
  t = t.replace(/\u2026/g, '...');
  fs.writeFileSync(p, t);
  console.log('Fixed: ' + f);
});
