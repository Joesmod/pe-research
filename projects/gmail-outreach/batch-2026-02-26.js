// Batch outreach - Feb 26, 2026
// DO NOT RUN until Alex approves. Preview sent to alex@hellogumbo.com first.

const { sendEmail } = require('./send.js');

const BCC = 'jeff@hellogumbo.com, alex@hellogumbo.com';

const emails = [
  {
    to: 'aspector@onerockcapital.com',
    subject: 'AI-Powered Value Creation for One Rock Portfolio Companies',
    body: `<p>Allison,</p>

<p>One Rock's operations-focused approach to industrial and business services investments caught my attention -- particularly having Eleanor Johnson leading internal AI and automation. That tells me your team already sees the potential.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. Not off-the-shelf chatbots -- purpose-built systems that handle real operational workflows: automating back-office processes, accelerating due diligence, and creating data pipelines that drive better decisions faster.</p>

<p>For a firm like One Rock that's hands-on with operations, we've seen AI agents reduce manual workload by 40-60% across common portfolio company functions.</p>

<p>Would a 15-minute call make sense to explore what this could look like for your portfolio?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'dbolzan@pfingsten.com',
    subject: 'Scaling 174 Acquisitions with AI Agents',
    body: `<p>Denny,</p>

<p>174 acquisitions is a serious track record -- and with Pfingsten's focus on manufacturing, distribution, and business services, I imagine the operational complexity across that portfolio is significant.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. These aren't generic tools -- they're purpose-built systems that automate operational workflows, from supply chain optimization to back-office processes, specifically designed for the kinds of mid-market companies you invest in.</p>

<p>For firms managing large portfolios like yours, AI agents can meaningfully accelerate integration and value creation across acquisitions.</p>

<p>Worth a quick conversation?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'rsummers@millpoint.com',
    subject: 'AI Agents for Tech-Enabled Services at Mill Point',
    body: `<p>Richard,</p>

<p>Mill Point's portfolio -- iQor, Verinext, AeriTek -- sits right at the intersection of technology services and operational scale. That's exactly where AI agents create the most impact.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI systems for PE portfolio companies. For businesses like yours in BPO, IT services, and managed services, we automate the high-volume operational workflows that eat into margins -- think customer intake, ticket routing, data processing, and reporting.</p>

<p>Would a brief call make sense to explore what this could look like for your portfolio?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'rduggal@fflpartners.com',
    subject: 'AI-Driven Growth for FFL Portfolio Companies',
    body: `<p>Rajat,</p>

<p>FFL's focus on growth-oriented financial services and business services companies is a great fit for what we do at <a href="https://hellogumbo.com">Gumbo</a>.</p>

<p>We build custom AI agents for PE portfolio companies -- purpose-built systems that handle real operational work. For financial services firms, that means automating compliance workflows, client onboarding, data reconciliation, and reporting processes that typically require significant headcount.</p>

<p>The result: faster scaling without proportional cost increases, which directly supports the growth thesis.</p>

<p>Would 15 minutes make sense to explore the fit?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'bmichaud@littlejohnllc.com',
    subject: 'AI Value Creation for Littlejohn Portfolio Companies',
    body: `<p>Brian,</p>

<p>Littlejohn's Portfolio Support Group caught my eye -- having dedicated value creation directors working alongside portfolio companies is exactly the kind of operational mindset that makes AI adoption successful.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For industrial and business services companies like the ones in your portfolio, we automate operational workflows -- field service scheduling, compliance tracking, back-office processing -- the high-volume work that value creation teams are always trying to optimize.</p>

<p>Could be a useful tool for your PSG to deploy across the portfolio. Worth a quick call?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'caracciolo@dubinclark.com',
    subject: 'AI Agents for Dynamic Core Capital\'s Services Portfolio',
    body: `<p>Thomas,</p>

<p>Dynamic Core Capital's focus on lower middle market specialty services companies is a segment where AI agents deliver outsized returns -- these businesses often have manual-heavy operations that are ripe for automation but too small for enterprise software solutions.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents specifically for PE portfolio companies. Purpose-built systems that handle real operational work: automating scheduling, invoicing, customer communications, and reporting workflows.</p>

<p>For specialty services businesses, this typically means doing more with existing headcount rather than hiring to scale.</p>

<p>Would a brief conversation make sense?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'akamel@aeainvestors.com',
    subject: 'Custom AI for AEA\'s Multi-Sector Portfolio',
    body: `<p>Anneka,</p>

<p>AEA's breadth across business services, healthcare, and industrials means you're likely seeing AI opportunities -- and challenges -- from multiple angles across your portfolio.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. Not one-size-fits-all solutions -- each agent is purpose-built for a specific company's workflows. That could mean automating clinical documentation for a healthcare company or streamlining procurement for an industrial business.</p>

<p>The common thread: reducing manual operational overhead to improve margins and scalability.</p>

<p>Worth a quick conversation to see where the biggest opportunities are in your portfolio?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'calamai@siris.com',
    subject: 'AI-Native Operations for Siris Portfolio Companies',
    body: `<p>Dave,</p>

<p>Siris invests in technology and tech-enabled services companies -- which means your portfolio companies are already tech-forward. The next step is making their internal operations AI-native too.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For tech-enabled services businesses, we automate the operational workflows that don't scale linearly: customer onboarding, data processing, internal reporting, and service delivery coordination.</p>

<p>Would a 15-minute call make sense to explore what this could look like for your portfolio?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'nicholas.rowland@sheridancp.com',
    subject: 'AI Agents for Healthcare Services at Sheridan Capital',
    body: `<p>Nicholas,</p>

<p>Healthcare services is one of the most operationally complex sectors in PE -- and it's where AI agents are having the biggest impact right now.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For healthcare services businesses, we automate patient intake, scheduling, billing workflows, and compliance documentation -- the operational burden that limits growth in every healthcare platform.</p>

<p>For a firm focused exclusively on healthcare like Sheridan, this could be a meaningful value creation lever across your entire portfolio.</p>

<p>Worth a quick call?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'jgarrison@bvlp.com',
    subject: 'AI for BV Investment Partners\' Tech-Enabled Services Portfolio',
    body: `<p>Justin,</p>

<p>BV's focus on tech-enabled business services and healthcare IT puts you in exactly the space where AI agents create the most value.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies -- purpose-built systems that automate operational workflows. For tech-enabled services businesses, that means automating the repetitive work that limits margin expansion: data entry, customer support triage, report generation, and process orchestration.</p>

<p>Would 15 minutes make sense to discuss what this could look like for your portfolio companies?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'npingelton@marlinequity.com',
    subject: 'Scaling 200+ Acquisitions with AI at Marlin Equity',
    body: `<p>Nathan,</p>

<p>200+ acquisitions completed is remarkable -- and with Marlin's focus on technology, healthcare, and business services, the opportunity to deploy AI across that portfolio is significant.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. Purpose-built systems that handle real operational workflows -- automating the manual processes that slow down integration and limit margin expansion post-acquisition.</p>

<p>For a firm with Marlin's scale and velocity, having a repeatable AI playbook for portfolio companies could be a real differentiator.</p>

<p>Worth a quick conversation?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'nattenborough@goldengatecap.com',
    subject: 'AI Agents for Golden Gate Capital Portfolio Companies',
    body: `<p>Neale,</p>

<p>Golden Gate's portfolio spanning financial services, industrials, and software tells me you're seeing the AI transformation from every angle. The question is how to deploy it practically inside portfolio companies.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. Not generic software -- purpose-built systems that automate specific operational workflows. For financial services, that's compliance and reporting automation. For industrials, it's supply chain and field operations. Each agent is tailored to the business.</p>

<p>Would a 15-minute call make sense?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'jmoberg@cortecgroup.com',
    subject: 'AI-Powered Operations for Cortec Portfolio Companies',
    body: `<p>Jesse,</p>

<p>Cortec's 40-year track record in healthcare, consumer, and specialty services -- with a dedicated operating team -- tells me you understand that value creation happens at the operational level.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For healthcare products and specialty services businesses, we automate the workflows that typically require manual effort: order processing, customer service, regulatory documentation, and inventory management.</p>

<p>This is the kind of tool that makes operating teams more effective across every portfolio company.</p>

<p>Worth a quick call to explore the fit?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'barmstrong@lmpartners.com',
    subject: 'AI for Financial Services at Lovell Minnick',
    body: `<p>Brad,</p>

<p>Financial services and insurance companies face some of the most documentation-heavy operations in any industry -- which makes them ideal candidates for AI automation.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For financial services businesses, we automate compliance workflows, claims processing, client onboarding, and reporting -- the operational bottlenecks that limit growth and eat into margins.</p>

<p>For a firm like Lovell Minnick that specializes in the sector, having an AI partner who understands financial services operations could be a valuable addition to your value creation toolkit.</p>

<p>Would a brief conversation make sense?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'tom@cidcap.com',
    subject: 'AI Agents for CID Capital\'s Services Platforms',
    body: `<p>Tom,</p>

<p>CID Capital's focus on lower middle market business services and professional staffing companies is exactly where AI agents deliver the most practical value.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For services and staffing businesses, we automate high-volume operational workflows -- candidate matching, scheduling, invoicing, compliance tracking -- the manual work that limits how fast these platforms can scale.</p>

<p>Worth a quick call to explore what this could look like for your portfolio?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'jgantz@pinebrookpartners.com',
    subject: 'AI Automation for Pine Brook\'s Financial Services Portfolio',
    body: `<p>Joe,</p>

<p>Pine Brook's deep focus on financial services and insurance gives you a portfolio that's particularly well-suited for AI automation -- these industries run on documentation, compliance, and data processing.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For financial services businesses, we automate underwriting workflows, claims processing, regulatory reporting, and client communications -- reducing operational costs while improving accuracy and speed.</p>

<p>Would 15 minutes make sense to discuss where the biggest opportunities are?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'rspasser@accel-kkr.com',
    subject: 'AI-Native Operations for Accel-KKR Portfolio Companies',
    body: `<p>Rachel,</p>

<p>Accel-KKR's exclusive focus on technology and software companies means your portfolio is already tech-forward. The opportunity now is making their internal operations just as sophisticated.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For software and tech-enabled services businesses, we automate the operational workflows that don't scale with revenue: customer success processes, internal reporting, QA workflows, and data pipeline management.</p>

<p>Would a quick call make sense to explore the fit?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'tarshisneil@torquest.com',
    subject: 'AI Agents for TorQuest\'s Services Portfolio',
    body: `<p>Jonathan,</p>

<p>TorQuest's focus on Canadian mid-market business services and healthcare companies is a segment where AI agents are having a real impact -- particularly for companies scaling across multiple locations or geographies.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. Purpose-built systems that automate operational workflows: scheduling, reporting, customer communications, and compliance -- the manual work that limits margin expansion in services businesses.</p>

<p>Would a brief call make sense to discuss what this could look like?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'angusc@clairvest.com',
    subject: 'AI Value Creation for Clairvest Portfolio Companies',
    body: `<p>Angus,</p>

<p>Clairvest's multi-sector approach across business services, healthcare, and financial services means you're managing operational complexity across very different types of businesses. That's where custom AI agents shine.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. Each agent is purpose-built for a specific company's workflows -- so a healthcare portfolio company gets automation tailored to its clinical operations, while a financial services company gets compliance and reporting automation.</p>

<p>Would 15 minutes make sense to explore where the biggest opportunities are across your portfolio?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'ecrawford@platteriverequity.com',
    subject: 'AI for Platte River Equity\'s Services Platforms',
    body: `<p>Eric,</p>

<p>Platte River's focus on lower middle market business services and healthcare is the sweet spot for AI agents -- these companies have enough operational complexity to benefit, but rarely have the resources to build AI capabilities in-house.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. We handle the entire build -- from identifying the highest-impact workflows to deploying production-ready agents. For services businesses, that typically means automating scheduling, billing, customer intake, and reporting.</p>

<p>Worth a quick call?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'scho@mountaingate.com',
    subject: 'AI Agents for Mountaingate\'s Marketing Services Portfolio',
    body: `<p>Sue,</p>

<p>Mountaingate's portfolio -- Walker Sands, Podean, and the exits to Publicis and New Mountain -- shows a clear pattern of building marketing services platforms that scale. AI agents can accelerate that playbook significantly.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For marketing services businesses, we automate campaign reporting, client onboarding, data analysis, and content workflows -- the operational work that grows linearly with client count and limits margin expansion.</p>

<p>Would a 15-minute call make sense to explore the fit?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'junertl@excellere.com',
    subject: 'AI-Powered Scaling for Excellere\'s Services Platforms',
    body: `<p>Justin,</p>

<p>Excellere's focus on lower middle market services platforms -- business services, healthcare, and consumer -- is exactly where AI agents create the most practical value.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. Purpose-built systems that automate the operational workflows limiting growth: scheduling, billing, customer communications, compliance tracking, and reporting. Each agent is tailored to the specific business.</p>

<p>For a firm building services platforms, having AI as part of the value creation playbook from day one is a real advantage.</p>

<p>Worth a quick conversation?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'gmorgan@ridgemontep.com',
    subject: 'AI Across 70+ Platforms at Ridgemont Equity',
    body: `<p>George,</p>

<p>70+ platforms and 180+ add-on acquisitions across business services, healthcare, and industrials -- that's a portfolio where a repeatable AI playbook could have massive impact.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For firms with Ridgemont's breadth, we create tailored automation for each portfolio company's highest-impact workflows -- then apply those learnings across the broader portfolio.</p>

<p>The result: faster integration, better margins, and a scalable approach to AI across every new platform and add-on.</p>

<p>Would 15 minutes make sense to discuss?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'abatlaw@generalatlantic.com',
    subject: 'Custom AI Agents for General Atlantic Portfolio Companies',
    body: `<p>Anish,</p>

<p>General Atlantic's scale across healthcare, financial services, and technology means you're already thinking about AI at the portfolio level. The challenge is moving from strategy to implementation inside individual companies.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. We handle the full build -- identifying high-impact workflows, building production-ready agents, and deploying them. For healthcare and financial services companies, that means automating the operational complexity that limits scalability.</p>

<p>Would a quick call make sense to explore where the biggest opportunities are?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'mundt@rhonegroup.com',
    subject: 'AI Agents for Rhone Group\'s Professional Services Portfolio',
    body: `<p>Patrick,</p>

<p>Rhone's transatlantic approach to professional services and industrial investments gives you a portfolio where operational efficiency directly drives returns. AI agents can be a meaningful lever there.</p>

<p>At <a href="https://hellogumbo.com">Gumbo</a>, we build custom AI agents for PE portfolio companies. For professional services firms, we automate project management, client reporting, billing, and compliance workflows -- the operational overhead that limits profitability as these businesses scale.</p>

<p>Would a brief call make sense to discuss what this could look like?</p>

<p>Best,<br>Jim from <a href="https://hellogumbo.com">Gumbo</a></p>`
  }
];

async function sendPreview() {
  const first = emails[0];
  console.log('Sending preview to alex@hellogumbo.com...');
  await sendEmail(
    'alex@hellogumbo.com',
    '[PREVIEW] ' + first.subject,
    first.body,
    BCC
  );
  console.log('Preview sent!');
}

async function sendBatch() {
  for (let i = 0; i < emails.length; i++) {
    const e = emails[i];
    console.log(`Sending ${i+1}/${emails.length}: ${e.to} - ${e.subject}`);
    await sendEmail(e.to, e.subject, e.body, BCC);
    // 2 second delay between sends
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('Batch complete!');
}

// Run preview only
if (process.argv[2] === 'preview') {
  sendPreview().catch(console.error);
} else if (process.argv[2] === 'send') {
  sendBatch().catch(console.error);
} else {
  console.log('Usage: node batch-2026-02-26.js preview|send');
}
