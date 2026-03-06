// PE Outreach Batch - 2026-03-05
// DO NOT RUN - Preview only. Send first email to alex@hellogumbo.com for approval.

const { sendEmail } = require('./send.js');

const emails = [
  {
    to: 'joe.rubino@gtcr.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'GTCR Portfolio Resources + AI Deployment',
    body: `Joe,

I saw your role as CTO and Co-Head of Portfolio Resources at GTCR — exactly the kind of dual operational + technology leadership that's rare in PE.

Most firms are trying to figure out how to roll AI out across 20+ portcos without turning it into a science project. You're probably getting vendors pitching "AI strategy" that's 80% deck and 20% delivery.

We're building the opposite: lightweight AI agents that drop into portcos in days, not quarters. Voice SDRs that book meetings. Document automation that cuts analyst workload. Real ROI, not roadmaps.

<a href="https://hellogumbo.com">Gumbo</a>'s worked with PE-backed teams to prove AI works without ripping out systems or hiring data scientists.

Worth 15 minutes to see what we've shipped?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'jflannery@charlesbank.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Charlesbank Portfolio Resources: AI that works now',
    body: `John,

As Head of Portfolio Resources at Charlesbank, you're probably fielding a lot of "AI transformation" pitches that promise the moon and deliver PowerPoint.

We're doing the opposite at <a href="https://hellogumbo.com">Gumbo</a>: shipping working AI agents to PE portcos in weeks, not quarters. Voice SDRs that book real meetings. Document workflows that cut analyst hours. Tools that prove ROI fast.

Most of your portcos don't need a data science team — they need AI that drops in and works without rebuilding their stack.

That's what we built. Healthcare services, tech-enabled businesses, whatever vertical you're backing — if they have customer touchpoints or manual ops work, we can show impact fast.

15 minutes to see what we've deployed?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'jbeakey@nautic.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Nautic portfolio: AI deployment at scale',
    body: `Jim,

Nautic's made 140+ investments — that's a lot of portcos that could use AI, but rolling it out at scale without creating chaos is the hard part.

Most PE firms are stuck between "hire consultants to do strategy" and "let each portco figure it out." Neither scales.

<a href="https://hellogumbo.com">Gumbo</a> built lightweight AI agents that drop into portcos fast: voice SDRs, document automation, workflow intelligence. Proven ROI in weeks, not quarters. No rebuild required.

We've worked with PE-backed teams in business services, tech-enabled ops, and healthcare. If your portcos have customer touchpoints or manual processes, we can show value fast.

Worth 15 minutes to see what we've shipped?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'chris.williams@motivepartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Motive fintech portcos + AI automation',
    body: `Chris,

Motive's fintech focus means your portcos are sitting on mountains of data and workflows that are ripe for AI — but most "AI vendors" want to sell you a 6-month roadmap.

<a href="https://hellogumbo.com">Gumbo</a> ships working agents in weeks: voice SDRs that book meetings, document intelligence that cuts manual review time, workflow automation that actually works.

Fintech portcos need AI that drops in without ripping out their compliance-heavy stacks. That's exactly what we built.

If you're looking to roll AI out across portcos without creating a science project, let's talk.

15 minutes?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'william.aliber@psgequity.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'PSG software portcos: AI that ships fast',
    body: `Bill,

PSG backs software companies — which means your portcos already understand tech, but they're probably getting pitched "AI strategy" that takes 6 months to show results.

<a href="https://hellogumbo.com">Gumbo</a> built the opposite: AI agents that ship in weeks and prove ROI fast. Voice SDRs that book pipeline. Document automation that cuts analyst workload. Real tools, not roadmaps.

Your portcos don't need another consultant deck — they need AI that drops in, works, and shows results before next quarter's board meeting.

Worth 15 minutes to see what we've deployed?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'david@baymarkpartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Following up: Baymark portcos + AI deployment',
    body: `David,

You mentioned interest in what we're building at <a href="https://hellogumbo.com">Gumbo</a> — thought I'd follow up with specifics.

We're shipping AI agents to PE portcos in weeks: voice SDRs that book real meetings, document intelligence that cuts manual work, workflow automation that actually delivers ROI.

Most of Baymark's portcos (industrial, services) have customer touchpoints and manual ops that AI can supercharge without ripping out existing systems.

Let's get that call on the calendar. 15 minutes to walk through what we've shipped?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'gmatelich@kelso.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Kelso portcos: AI deployment without the chaos',
    body: `George,

Kelso's got 30 partners and decades of operational expertise — but rolling AI out across portcos without turning it into a multi-quarter "transformation" is tough.

<a href="https://hellogumbo.com">Gumbo</a> built AI agents that drop in fast: voice SDRs, document automation, workflow intelligence. Proven ROI in weeks, not quarters.

Your portcos (business services, industrials) don't need AI strategy — they need AI that works now and shows results before next board meeting.

Worth 15 minutes to see what we've deployed?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'clay@gemspring.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Gemspring portcos: AI that proves ROI fast',
    body: `Clay,

Gemspring's flexible capital approach means your portcos are diverse — carve-outs, growth equity, LBOs — but they all share one thing: manual processes that AI can supercharge.

<a href="https://hellogumbo.com">Gumbo</a> ships working AI agents in weeks: voice SDRs that book meetings, document intelligence that cuts analyst hours, workflow automation that delivers fast ROI.

We've worked with PE-backed teams in business services and tech-enabled ops. If your portcos have customer touchpoints or manual workflows, we can show value immediately.

15 minutes to see what we've shipped?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'brian.maury@franciscopartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Francisco Partners CTO: AI agents that ship fast',
    body: `Brian,

As CTO at Francisco Partners (tech-focused PE), you're probably evaluating a dozen AI vendors promising "transformational ROI" with 6-month delivery timelines.

<a href="https://hellogumbo.com">Gumbo</a> built the opposite: lightweight AI agents that deploy in weeks and prove value fast. Voice SDRs, document automation, workflow intelligence — real tools, not roadmaps.

Your portcos understand tech, but they need AI that drops in without requiring a rebuild or hiring data scientists. That's exactly what we ship.

Worth 15 minutes to see what we've deployed across PE-backed tech companies?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'mollyk@parthenoncapital.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Parthenon portcos: AI deployment that works',
    body: `Molly,

Parthenon just closed Fund VII and your growth-focused portcos are probably getting pitched "AI strategy" from every consultant in town.

<a href="https://hellogumbo.com">Gumbo</a> ships working AI agents in weeks: voice SDRs that book pipeline, document intelligence that cuts manual work, workflow automation that proves ROI fast.

Growth equity portcos don't need another 6-month roadmap — they need AI that drops in and shows results before next quarter's board meeting.

If you're looking to roll AI out across portcos without creating chaos, let's talk.

15 minutes?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'jberman@tzpgroup.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'TZP Portfolio Growth: AI that delivers fast ROI',
    body: `Jarrad,

As Partner for Portfolio Growth at TZP, you're focused on driving value across portcos — and AI is probably on every board deck, but most firms are stuck in "strategy mode" instead of shipping.

<a href="https://hellogumbo.com">Gumbo</a> built AI agents that prove ROI in weeks: voice SDRs that book meetings, document automation that cuts manual workload, workflow intelligence that actually works.

Your portcos don't need AI consultants — they need tools that drop in fast and show results before next quarter.

Worth 15 minutes to see what we've deployed?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'jcarlson@ppcpartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Pritzker Private Capital: Head of Technology + AI rollout',
    body: `Jeff,

As Head of Technology at Pritzker Private Capital, you're probably evaluating how to roll AI out across portcos without it becoming a multi-quarter "transformation project."

<a href="https://hellogumbo.com">Gumbo</a> built lightweight AI agents that deploy fast: voice SDRs, document automation, workflow intelligence. Proven ROI in weeks, not quarters.

Your portcos (manufactured products, services) have customer touchpoints and manual ops that AI can supercharge without requiring a systems rebuild.

Worth 15 minutes to see what we've shipped to PE-backed teams?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'mbettegowda@olympuspartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Olympus COO: AI deployment at scale',
    body: `Manu,

As COO at Olympus Partners, you're sitting at the intersection of operations and portfolio value creation — which means you're probably fielding a lot of "AI strategy" pitches.

<a href="https://hellogumbo.com">Gumbo</a> ships working AI agents in weeks: voice SDRs that book real meetings, document intelligence that cuts analyst hours, workflow automation that proves ROI fast.

Your portcos don't need consultants — they need AI that drops in, works, and shows results before next board meeting.

Worth 15 minutes to see what we've deployed?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'apeix@gaugecapital.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Gauge Capital portcos: AI that ships now',
    body: `Andrew,

Gauge Capital's portcos (business services, industrials) are probably getting pitched "AI transformation" that takes 6 months to show results.

<a href="https://hellogumbo.com">Gumbo</a> built the opposite: AI agents that deploy in weeks and prove value fast. Voice SDRs, document automation, workflow intelligence — real tools, not roadmaps.

If your portcos have customer touchpoints or manual operations, we can show ROI immediately without requiring a rebuild.

Worth 15 minutes to see what we've shipped?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'knoggle@aligncp.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Following up: Align Capital portcos + AI',
    body: `Katie,

Following up on Align Capital's LMM B2B portcos — software, professional services, industrial businesses all have manual processes that AI can supercharge.

<a href="https://hellogumbo.com">Gumbo</a> ships working AI agents in weeks: voice SDRs that book meetings, document intelligence that cuts workload, workflow automation that proves ROI fast.

Your portcos don't need AI strategy — they need tools that drop in and show results before next quarter's board meeting.

Worth 15 minutes to see what we've deployed?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'naronson@roarkcapital.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Roark Capital portcos: AI deployment at scale',
    body: `Neal,

Roark's portfolio is massive (550+ brands, franchise-heavy) — rolling AI out at that scale without creating chaos is the hard part.

<a href="https://hellogumbo.com">Gumbo</a> built AI agents that deploy fast across portcos: voice SDRs that book meetings, document automation, workflow intelligence. Proven ROI in weeks, not quarters.

Franchise operations, customer touchpoints, manual workflows — all ripe for AI that actually works without requiring a rebuild.

Worth 15 minutes to see what we've shipped to multi-unit operators?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'kevin@diversis.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Diversis Capital Fund III + AI: technical founder to technical founder',
    body: `Kevin,

Diversis Fund III explicitly mentions AI — and with your CS+Robotics+EE background from Wharton/Penn, you understand the gap between "AI strategy decks" and actually shipping.

<a href="https://hellogumbo.com">Gumbo</a> built working AI agents that deploy in weeks: voice SDRs, document automation, workflow intelligence. Real tools, not roadmaps.

Your portcos don't need consultants pitching 6-month transformations — they need AI that drops in fast and proves ROI before next board meeting.

Worth 15 minutes to see what we've built?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'jack.glover@inclineequity.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Incline Equity portcos: AI that works now',
    body: `Jack,

Incline just closed Fund VI and your portcos (distribution, specialized manufacturing, services) are probably fielding a lot of "AI transformation" pitches.

<a href="https://hellogumbo.com">Gumbo</a> ships AI agents that work in weeks: voice SDRs, document intelligence, workflow automation. Proven ROI fast, no rebuild required.

Your portcos don't need strategy — they need tools that drop in and show results before next quarter's board meeting.

Worth 15 minutes to see what we've deployed?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'a.ray@comvest.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Comvest independent PE arm + AI capabilities',
    body: `Alex,

Comvest just spun out as an independent PE arm with a dedicated Operating Advisory Group — perfect timing to roll AI out across portcos without inheriting legacy "strategy."

<a href="https://hellogumbo.com">Gumbo</a> built AI agents that deploy fast: voice SDRs that book meetings, document automation that cuts workload, workflow intelligence that proves ROI in weeks.

Your portcos don't need consultants — they need AI that drops in and shows results before next board meeting.

Worth 15 minutes to see what we've shipped?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'MLewis@capstreet.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Capstreet Capvalue Framework + AI deployment',
    body: `Michelle,

Capstreet's Capvalue Framework means you're already thinking about operations and value creation across portcos — AI is the next lever, but most vendors pitch "transformation" instead of results.

<a href="https://hellogumbo.com">Gumbo</a> ships working AI agents in weeks: voice SDRs, document automation, workflow intelligence. Real ROI, not roadmaps.

Your portcos (industrial distribution, manufacturing, business services) have customer touchpoints and manual ops that AI can supercharge fast.

Worth 15 minutes to see what we've deployed?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'garrett@shoreview.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'ShoreView Industries portcos: AI that proves ROI fast',
    body: `Garrett,

ShoreView just closed Fund V (oversubscribed at $800M+) — your portcos (industrial, manufacturing, services) are probably getting pitched "AI strategy" from every consultant.

<a href="https://hellogumbo.com">Gumbo</a> built the opposite: AI agents that ship in weeks and prove value fast. Voice SDRs, document automation, workflow intelligence — real tools, not PowerPoint.

Your portcos don't need transformation roadmaps — they need AI that drops in and shows results before next board meeting.

Worth 15 minutes to see what we've shipped?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'dkhouri@ta.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'TA Associates CITO: AI deployment across portcos',
    body: `Damon,

As CITO at TA Associates, you're sitting at the intersection of technology and portfolio value creation — which means you're probably evaluating how to roll AI out across portcos at scale.

<a href="https://hellogumbo.com">Gumbo</a> built lightweight AI agents that deploy in weeks: voice SDRs, document automation, workflow intelligence. Proven ROI fast, no systems rebuild required.

Your portcos (software, healthcare, financial services) all have touchpoints and workflows that AI can supercharge without creating a multi-quarter "transformation project."

Worth 15 minutes to see what we've shipped?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'jpconte@gencap.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Genstar Capital portcos: AI deployment at scale',
    body: `Jean-Pierre,

Genstar's $40B+ AUM and decades of operational focus mean your portcos already have strong value creation playbooks — AI is the next lever, but most vendors pitch "strategy" instead of shipping.

<a href="https://hellogumbo.com">Gumbo</a> built AI agents that work in weeks: voice SDRs, document intelligence, workflow automation. Real ROI, not roadmaps.

Your portcos (tech-enabled services, industrials, software) don't need consultants — they need AI that drops in fast and shows results before next board meeting.

Worth 15 minutes to see what we've deployed?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'aharris@alpineinvestors.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Alpine Investors PeopleFirst + AI deployment',
    body: `Audrey,

Alpine's PeopleFirst approach and CEO-in-Training program mean you're already focused on operational excellence — AI is the next lever, but most vendors pitch "transformation" instead of results.

<a href="https://hellogumbo.com">Gumbo</a> ships working AI agents in weeks: voice SDRs that book meetings, document automation that cuts workload, workflow intelligence that proves ROI fast.

Your portcos (software, business services) have customer touchpoints and manual workflows that AI can supercharge without requiring a rebuild.

Worth 15 minutes to see what we've deployed?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    to: 'lleichtman@llcp.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Levine Leichtman structured PE + AI capabilities',
    body: `Lauren,

Levine Leichtman's structured PE approach and Inc Founder-Friendly recognition mean your portcos trust you to bring operational value without chaos.

<a href="https://hellogumbo.com">Gumbo</a> built AI agents that deploy fast: voice SDRs, document automation, workflow intelligence. Proven ROI in weeks, not quarters.

Your portcos (middle market, founder-led) don't need AI "strategy" — they need tools that drop in and show results before next board meeting.

Worth 15 minutes to see what we've shipped?

Best,
Jim
<a href="https://hellogumbo.com">Gumbo</a>`
  }
];

// PREVIEW MODE: Send first email to Alex for approval
async function sendPreview() {
  console.log('=== PREVIEW MODE ===');
  console.log('Sending first email as PREVIEW to alex@hellogumbo.com\n');
  
  const preview = emails[0];
  const previewBody = `PREVIEW EMAIL #1 of 25

This is email #1 to: ${preview.to}
Original subject: ${preview.subject}

---

${preview.body}

---

If approved, reply "SEND BATCH" and I will send all 25 emails.`;
  
  await sendEmail('alex@hellogumbo.com', '[PREVIEW] ' + preview.subject, previewBody);
  
  console.log('Preview sent to alex@hellogumbo.com');
  console.log('\n=== BATCH SUMMARY ===');
  console.log(`Total emails prepared: ${emails.length}`);
  console.log('\nAll recipients:');
  emails.forEach((e, i) => {
    console.log(`${i + 1}. ${e.to} - ${e.subject}`);
  });
}

// SEND MODE: Send all emails (ONLY run after Alex approves)
async function sendBatch() {
  console.log('=== SENDING FULL BATCH ===\n');
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`Sending ${i + 1}/${emails.length}: ${email.to}`);
    await sendEmail(email.to, email.subject, email.body);
    // Wait 2 seconds between sends to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n=== BATCH COMPLETE ===');
  console.log(`Sent ${emails.length} emails successfully`);
}

// Export functions
module.exports = { sendPreview, sendBatch, emails };

// Run preview if called directly
if (require.main === module) {
  sendPreview().catch(console.error);
}
