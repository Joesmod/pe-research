// Analyze CRM and pick top 25 PE outreach targets

// Helper to parse date
function daysSince(dateStr) {
  if (!dateStr || dateStr === '') return 9999;
  try {
    const date = new Date(dateStr);
    if (isNaN(date)) return 9999;
    const now = new Date('2026-03-05');
    return Math.floor((now - date) / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 9999;
  }
}

// Sample contacts data (simplified from CRM read)
const contactsList = [
  // Priority Tech/AI roles from Contacts sheet
  { company: 'GTCR', contact: 'Joe Rubino', position: 'Managing Director & CTO, Co-Head of Portfolio Resources Group', email: 'joe.rubino@gtcr.com', score: 9, lastContacted: '', notes: 'KEY CONTACT - CTO + Co-Head of Portfolio Resources' },
  { company: 'TA Associates', contact: 'Damon Khouri', position: 'Chief Information & Technology Officer', email: 'dkhouri@ta.com', score: 9, lastContacted: '', notes: 'KEY CONTACT - CITO role' },
  { company: 'Francisco Partners', contact: 'Brian Maury', position: 'Chief Technology Officer', email: 'brian.maury@franciscopartners.com', score: 9, lastContacted: '', notes: 'KEY CONTACT - CTO at tech-focused PE firm' },
  { company: 'Motive Partners', contact: 'Chris Williams', position: 'Managing Director', email: 'chris.williams@motivepartners.com', score: 9, lastContacted: '', notes: 'Fintech-focused PE firm. Has CTO in Engineering role' },
  { company: 'PSG Equity', contact: 'Bill Aliber', position: 'Managing Director', email: 'william.aliber@psgequity.com', score: 9, lastContacted: '', notes: 'Software-focused PE' },
  { company: 'Genstar Capital', contact: 'Jean-Pierre Conte', position: 'Chairman', email: 'jpconte@gencap.com', score: 9, lastContacted: '', notes: 'Chairman of Genstar' },
  { company: 'Charlesbank Capital Partners', contact: 'John Flannery', position: 'Managing Director, Head of Portfolio Resources Group', email: 'jflannery@charlesbank.com', score: 9, lastContacted: '', notes: 'KEY CONTACT - Head of Portfolio Resources. Deck sent, meeting scheduling' },
  
  { company: 'Pritzker Private Capital', contact: 'Jeff Carlson', position: 'Principal - Head of Technology', email: 'jcarlson@ppcpartners.com', score: 8, lastContacted: '', notes: 'Head of Technology at mid-market PE' },
  { company: 'TZP Group', contact: 'Jarrad Berman', position: 'Partner, Portfolio Growth', email: 'jberman@tzpgroup.com', score: 9, lastContacted: '', notes: 'Partner focused on portfolio growth' },
  { company: 'Comvest Partners', contact: 'Alex Ray', position: 'MD, Business Development', email: 'a.ray@comvest.com', score: 9, lastContacted: '2026-02-19T14:00:00Z', notes: 'Newly independent PE arm. Dedicated Operating Advisory Group' },
  { company: 'Capstreet', contact: 'Michelle Lewis', position: 'Principal, Head of Business Development', email: 'MLewis@capstreet.com', score: 8, lastContacted: '', notes: 'Houston, 1990 founding, Capvalue Framework' },
  { company: 'Alpine Investors', contact: 'Audrey Harris', position: 'Head of Marketing', email: 'aharris@alpineinvestors.com', score: 8, lastContacted: '', notes: 'PeopleFirst approach, CEO-in-Training program' },
  { company: 'Roark Capital Group', contact: 'Neal Aronson', position: 'Founder and Managing Partner', email: 'naronson@roarkcapital.com', score: 9, lastContacted: '', notes: 'Founded Roark in 2001. Investment Committee member' },
  { company: 'Levine Leichtman Capital Partners', contact: 'Lauren Leichtman', position: 'Co-Founder & President', email: 'lleichtman@llcp.com', score: 7, lastContacted: '', notes: 'Beverly Hills, $3.6B Fund VII, structured PE approach' },
  { company: 'Diversis Capital', contact: 'Kevin Ma', position: 'Co-Founder & Managing Partner', email: 'kevin@diversis.com', score: 9, lastContacted: '', notes: '.2B Fund III explicitly mentions AI. Kevin Ma deeply technical (Wharton/Penn M&T, CS+Robotics+EE)' },
  
  { company: 'Olympus Partners', contact: 'Manu Bettegowda', position: 'COO & Managing Partner', email: 'mbettegowda@olympuspartners.com', score: 7, lastContacted: '', notes: 'COO role at NYC/Stamford middle market LBO firm' },
  { company: 'Kelso & Company', contact: 'George Matelich', position: 'Managing Director', email: 'gmatelich@kelso.com', score: 7, lastContacted: '', notes: 'NYC-based. 60+ employees, 30 partners' },
  { company: 'Gauge Capital', contact: 'Andrew Peix', position: 'Partner, Business Development', email: 'apeix@gaugecapital.com', score: 8, lastContacted: '', notes: 'Email verified from PRNewswire' },
  { company: 'Baymark Partners', contact: 'David J. Hook', position: 'Managing Director & Co-Founder', email: 'david@baymarkpartners.com', score: 8, lastContacted: '2026-02-25', notes: 'Replied: interested in buying, requested call. Dallas-based.' },
  { company: 'ShoreView Industries', contact: 'Garrett Davis', position: 'Business Development', email: 'garrett@shoreview.com', score: 7, lastContacted: '', notes: 'Minneapolis-based. .8B+ committed capital across 5 funds' },
  { company: 'Gemspring Capital', contact: 'Clay Cole', position: 'Managing Director', email: 'clay@gemspring.com', score: 7, lastContacted: '', notes: '$3.5B capital under mgmt. Westport CT. Founded 2015' },
  { company: 'Align Capital Partners', contact: 'Katie Noggle', position: 'Partner, Business Development', email: 'knoggle@aligncp.com', score: 8, lastContacted: '2026-02-20T14:57:03.225Z', notes: 'Cleveland/Dallas. LMM B2B: software, professional services' },
  { company: 'Incline Equity Partners', contact: 'Jack Glover', position: 'Managing Partner', email: 'jack.glover@inclineequity.com', score: 7, lastContacted: '', notes: '$1.9B+ AUM. Pittsburgh. Founded 2011' },
  { company: 'Parthenon Capital Partners', contact: 'Molly Fazio Kloos', position: 'Director, Investor Communications', email: 'mollyk@parthenoncapital.com', score: 7, lastContacted: '', notes: 'Boston/SF/Austin. Fund VII closed Nov 2025. Growth-focused PE' },
  { company: 'Nautic Partners', contact: 'Jim Beakey', position: 'Managing Director, Business Development', email: 'jbeakey@nautic.com', score: 7, lastContacted: '', notes: 'Providence RI. Founded 1986. $9.5B+ managed. 140+ investments' },
];

// Filter for qualified (skip if contacted in last 7 days)
const qualified = contactsList.filter(c => {
  const days = daysSince(c.lastContacted);
  if (days < 7) {
    console.log(`SKIP: ${c.company} - ${c.contact} (contacted ${days} days ago)`);
    return false;
  }
  return true;
});

// Prioritize tech/AI/value creation roles
function priorityScore(position) {
  const pos = (position || '').toLowerCase();
  let score = 0;
  
  if (pos.includes('cto') || pos.includes('chief technology')) score += 10;
  if (pos.includes('chief ai') || pos.includes('ai officer')) score += 10;
  if (pos.includes('vp product') || pos.includes('head of technology')) score += 8;
  if (pos.includes('operating partner') && pos.includes('tech')) score += 8;
  if (pos.includes('head of digital') || pos.includes('transformation')) score += 7;
  if (pos.includes('value creation') || pos.includes('portfolio growth')) score += 6;
  if (pos.includes('portfolio operations') || pos.includes('portfolio resources')) score += 7;
  if (pos.includes('managing director') || pos.includes('partner')) score += 3;
  if (pos.includes('business development')) score += 2;
  if (pos.includes('coo')) score += 5;
  
  return score;
}

// Sort by priority
qualified.sort((a, b) => {
  const scoreA = priorityScore(a.position) + (a.score / 10);
  const scoreB = priorityScore(b.position) + (b.score / 10);
  return scoreB - scoreA;
});

// Take top 25
const top25 = qualified.slice(0, 25);

console.log('\n=== TOP 25 PE OUTREACH TARGETS (2026-03-05) ===\n');
top25.forEach((c, i) => {
  console.log(`${i + 1}. ${c.company}`);
  console.log(`   ${c.contact} - ${c.position}`);
  console.log(`   ${c.email}`);
  console.log(`   Score: ${c.score}, Priority: ${priorityScore(c.position).toFixed(1)}`);
  console.log('');
});

// Save to file
const fs = require('fs');
fs.writeFileSync('./top25-2026-03-05.json', JSON.stringify(top25, null, 2));

console.log(`Saved ${top25.length} contacts to top25-2026-03-05.json`);
