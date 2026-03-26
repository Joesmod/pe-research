const fs = require('fs');
const path = require('path');

const firms = JSON.parse(fs.readFileSync(path.join(__dirname, 'apollo-new-firms.json'), 'utf8'));

// Blacklist keywords - VCs, angels, family offices, real estate, infrastructure, non-PE
const removePatterns = [
  /venture/i, /angel/i, /family office/i, /family capital/i,
  /real estate/i, /realty/i, /property/i, /properties/i, /reit/i, /mortgage/i,
  /infrastructure/i, /hedge fund/i, /mutual fund/i, /etf/i, /index/i,
  /insurance/i, /bank(?:ing)?$/i, /credit union/i, /savings/i,
  /accounting/i, /staffing/i, /recruiting/i, /consulting group/i,
  /law firm/i, /legal/i, /attorney/i,
  /bowling/i, /restaurant/i, /brewery/i, /fitness/i, /gym/i, /salon/i,
  /church/i, /ministry/i, /foundation$/i, /nonprofit/i, /charity/i,
  /university/i, /college/i, /school/i, /academy/i, /institute(?! of)/i,
  /podcast/i, /blog/i, /newsletter/i, /media group/i,
  /crypto/i, /blockchain/i, /defi/i, /nft/i, /bitcoin/i, /web3/i,
  /accelerator/i, /incubator/i, /coworking/i,
  /distress/i, /turnaround/i, /restructur/i, /workout/i,
  /spac\b/i, /blank check/i,
];

// Positive PE signals
const peSignals = [
  /private equity/i, /buyout/i, /growth equity/i, /capital partner/i,
  /equity partner/i, /investment partner/i, /portfolio/i, /lbo/i,
  /mid.?market/i, /middle.?market/i, /operating partner/i,
  /capital management/i, /investment management/i,
  /fund/i, /capital/i, /equity/i, /partner/i, /invest/i,
];

console.log(`Starting with ${firms.length} firms`);

// Step 1: Remove obvious non-PE
let filtered = firms.filter(f => {
  const name = f.name;
  if (!name || name.length < 3) return false;
  for (const pat of removePatterns) {
    if (pat.test(name)) return false;
  }
  return true;
});
console.log(`After removing non-PE keywords: ${filtered.length}`);

// Step 2: Score remaining
const scored = filtered.map(f => {
  let score = 0;
  const name = f.name;
  
  // PE signal in name
  for (const pat of peSignals) {
    if (pat.test(name)) score += 2;
  }
  
  // Has website = more legit
  if (f.website) score += 3;
  // Has LinkedIn
  if (f.linkedin) score += 2;
  // Has phone
  if (f.phone) score += 1;
  // Has revenue data
  if (f.revenue) score += 3;
  
  // Headcount growth > 10%
  if (f.headcount_growth_6m > 0.1) score += 5;
  else if (f.headcount_growth_6m > 0) score += 2;
  
  // Founded 2010-2022 sweet spot
  if (f.founded >= 2010 && f.founded <= 2022) score += 3;
  // Established firms also good
  else if (f.founded >= 2000 && f.founded < 2010) score += 2;
  
  // Penalize very new (might not have AUM yet)
  if (f.founded >= 2024) score -= 2;
  
  return { ...f, score };
});

// Sort by score descending
scored.sort((a, b) => b.score - a.score);

// Take top 200 for CRM push
const top = scored.filter(s => s.score >= 8);
console.log(`Firms scoring >= 8: ${top.length}`);
console.log(`Top 10:`);
top.slice(0, 10).forEach((f, i) => console.log(`  ${i+1}. ${f.name} (score: ${f.score}) | ${f.website} | growth: ${(f.headcount_growth_6m*100).toFixed(1)}%`));

// Export top firms for CRM push
const output = top.slice(0, 500); // cap at 500
fs.writeFileSync(path.join(__dirname, 'apollo-top-firms.json'), JSON.stringify(output, null, 2));
console.log(`\nExported top ${output.length} firms to apollo-top-firms.json`);

// Also show score distribution
const dist = {};
scored.forEach(s => { const bucket = Math.floor(s.score/5)*5; dist[bucket] = (dist[bucket]||0)+1; });
console.log('\nScore distribution:');
Object.keys(dist).sort((a,b)=>b-a).forEach(k => console.log(`  ${k}-${+k+4}: ${dist[k]} firms`));
