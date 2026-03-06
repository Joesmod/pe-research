const path = require('path');
const { sendEmail } = require('./send.js');

// Today: March 6, 2026
// 7 days ago: Feb 27, 2026
// Cutoff for Last Contacted

const contacts = [
  {
    company: 'GTCR',
    name: 'Joe Rubino',
    title: 'Managing Director & CTO, Co-Head of Portfolio Resources Group',
    email: 'joe.rubino@gtcr.com',
    score: 9,
    sector: 'Tech-enabled businesses, healthcare IT, financial services',
    notes: 'CTO + Co-Head Portfolio Resources - perfect AI/ops fit'
  },
  {
    company: 'Roark Capital Group',
    name: 'Justin Chang',
    title: 'Head of Supply Chain',
    email: 'jchang@roarkcapital.com',
    score: 9,
    sector: 'Consumer, restaurant, franchise-focused',
    notes: 'Supply chain ops leader, former McKinsey'
  },
  {
    company: 'TA Associates',
    name: 'Damon Khouri',
    title: 'Chief Information & Technology Officer',
    email: 'dkhouri@ta.com',
    score: 9,
    sector: 'Software, tech-enabled services, healthcare IT',
    notes: 'CITO - ideal tech leadership contact'
  },
  {
    company: 'Francisco Partners',
    name: 'Brian Maury',
    title: 'Chief Technology Officer',
    email: 'brian.maury@franciscopartners.com',
    score: 9,
    sector: 'Technology-focused PE',
    notes: 'CTO at tech PE firm'
  },
  {
    company: 'Charlesbank Capital Partners',
    name: 'John Flannery',
    title: 'Managing Director, Head of Portfolio Resources Group',
    email: 'jflannery@charlesbank.com',
    score: 9,
    sector: 'Middle market PE, tech-enabled services',
    notes: 'Heads portfolio resources - value creation focus'
  },
  {
    company: 'Comvest Partners',
    name: 'Alex Ray',
    title: 'Managing Director, Business Development',
    email: 'a.ray@comvest.com',
    score: 9,
    sector: 'Middle market control investments',
    notes: 'Newly independent PE arm (credit sold Nov 2025), has Operating Advisory Group'
  },
  {
    company: 'PSG Equity',
    name: 'Bill Aliber',
    title: 'Managing Director',
    email: 'william.aliber@psgequity.com',
    score: 9,
    sector: 'Software-focused growth equity',
    notes: 'Software PE, Kansas City office'
  },
  {
    company: 'Pritzker Private Capital',
    name: 'Jeff Carlson',
    title: 'Principal - Head of Technology',
    email: 'jcarlson@ppcpartners.com',
    score: 8,
    sector: 'Middle market manufacturing and services',
    notes: 'Head of Technology - tech leadership role'
  },
  {
    company: 'Serent Capital',
    name: 'Neal Sainani',
    title: 'SVP, Product & Technology',
    email: 'neal.sainani@serentcapital.com',
    score: 8,
    sector: 'Software & tech-enabled services growth equity',
    notes: 'SVP Product & Technology, has 25+ person Growth Team with AI focus'
  },
  {
    company: 'TZP Group',
    name: 'Jarrad Berman',
    title: 'Partner, Portfolio Growth',
    email: 'jberman@tzpgroup.com',
    score: 9,
    sector: 'Software, tech-enabled services',
    notes: 'Portfolio Growth Partner, ex-Facebook Head of Ecommerce Marketing'
  },
  {
    company: 'GenNx360 Capital Partners',
    name: 'Rishi Verma',
    title: 'Partner',
    email: 'rverma@gennx360.biz',
    score: 8,
    sector: 'Lower middle market industrials and services',
    notes: 'Partner-level contact'
  },
  {
    company: 'Capstreet',
    name: 'Michelle Lewis',
    title: 'Principal, Head of Business Development',
    email: 'MLewis@capstreet.com',
    score: 8,
    sector: 'Industrial distribution, manufacturing, business services',
    notes: 'Capvalue Framework, Houston-based'
  },
  {
    company: 'Alpine Investors',
    name: 'Audrey Harris',
    title: 'Head of Marketing',
    email: 'aharris@alpineinvestors.com',
    score: 8,
    sector: 'Software & services, PeopleFirst approach',
    notes: '~$5B+ AUM, 190 deals in 2025, CEO-in-Training program'
  },
  {
    company: 'Motive Partners',
    name: 'Chris Williams',
    title: 'Managing Director',
    email: 'chris.williams@motivepartners.com',
    score: 8,
    sector: 'Fintech-focused PE',
    notes: 'IOI model (Investor, Operator, Innovator), Create team for tech transformation'
  },
  {
    company: 'Transom Capital Group',
    name: 'Ken Firtel',
    title: 'Founder and Managing Partner',
    email: 'kfirtel@transomcap.com',
    score: 8,
    sector: 'Middle market services and distribution',
    notes: 'ARMOR Value Creation Process, #2 Axial 2025'
  },
  {
    company: 'Gridiron Capital',
    name: 'Kevin Jackson',
    title: 'Managing Partner',
    email: 'kjackson@gridironcapital.com',
    score: 8,
    sector: 'Business services, consumer, industrial',
    notes: 'Mid-market PE, $2.1B Fund V'
  },
  {
    company: 'LFM Capital',
    name: 'Jessica Ginsberg',
    title: 'Managing Director',
    email: 'jessica@lfmcapital.com',
    score: 8,
    sector: 'US/Canada manufacturing',
    notes: 'Founded by operators/engineers, #16 Axial 2025'
  },
  {
    company: 'Hidden Harbor Capital Partners',
    name: 'Tucker Coates',
    title: 'Principal, Business Development',
    email: 'tcoates@hh-cp.com',
    score: 8,
    sector: 'Industrials and services',
    notes: '#1 Axial 2025 Top 50 Industrials (buyside), operations soul'
  },
  {
    company: 'Mill Point Capital',
    name: 'Orestes Tarajano',
    title: 'Partner, Head of Business Development',
    email: 'otarajano@millpoint.com',
    score: 8,
    sector: 'Middle market industrials and services',
    notes: 'NY-based PE'
  },
  {
    company: 'HCI Equity Partners',
    name: 'Tim Frend',
    title: 'Partner, Business Development',
    email: 'tfrend@hciequity.com',
    score: 8,
    sector: 'Value-added distribution, industrial, business services',
    notes: '6x Inc Founder-Friendly, Jeff DeSandre (Executive Partner IT) joined Jul 2025'
  },
  {
    company: 'Argosy Private Equity',
    name: 'Jason Cunningham',
    title: 'Vice President, Business Development',
    email: 'jcunningham@argosycapital.com',
    score: 8,
    sector: 'Middle market services and distribution',
    notes: '6-person in-house operating partners team, 120+ platforms'
  },
  {
    company: 'Resurgens Technology Partners',
    name: 'Fred Sturgis',
    title: 'Managing Director',
    email: 'fred@resurgenstech.com',
    score: 8,
    sector: 'Tech-enabled business services',
    notes: 'Atlanta-based, technology-focused'
  },
  {
    company: 'Havencrest Capital Management',
    name: 'Matthew Shofner',
    title: 'Partner',
    email: 'mshofner@havencrest.com',
    score: 8,
    sector: 'Middle market services and distribution',
    notes: '10 investment pros, 31 operating partners, Dallas-based'
  },
  {
    company: 'Trilantic North America',
    name: 'Justin Clonts',
    title: 'Vice President',
    email: 'justin.clonts@trilantic.com',
    score: 8,
    sector: 'Control and significant minority investments',
    notes: '$1.9B aggregate commitments, NYC-based'
  },
  {
    company: 'HGGC',
    name: 'Holland Reynolds',
    title: 'Managing Director, Business Development',
    email: 'hreynolds@hggc.com',
    score: 8,
    sector: 'Software and tech-enabled services',
    notes: 'Tech-focused PE firm, Palo Alto-based'
  }
];

// Email templates
const templates = {
  'GTCR': {
    subject: 'AI Capabilities for GTCR Portfolio Companies',
    body: `Joe,<br><br>Reaching out because your dual role as CTO and Co-Head of Portfolio Resources at GTCR puts you at the intersection of two things we specialize in: technical implementation and portfolio-wide value creation.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that builds custom automations and agents for private equity portfolio companies. Think: automated data extraction from unstructured documents, intelligent workflow routing, and customer service agents that actually resolve issues.<br><br>Given GTCR's focus on tech-enabled businesses and healthcare IT, we've seen similar use cases drive 20-30% efficiency gains in back-office operations and customer-facing processes.<br><br>Would it make sense to connect for 15 minutes? Happy to share specific examples relevant to your portfolio's sectors.<br><br>Best,<br>Jim from Gumbo`
  },
  'Roark Capital Group': {
    subject: 'Supply Chain AI for Restaurant & Franchise Brands',
    body: `Justin,<br><br>Given your role leading supply chain at Roark and your McKinsey background, I thought you'd be interested in how AI is transforming supply chain operations for franchise and restaurant brands.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that's worked with multi-unit operators to automate demand forecasting, optimize inventory routing, and streamline vendor communications.<br><br>One recent client (multi-concept restaurant group) deployed an AI agent that reduced food waste by 18% and cut ordering time from 2 hours to 15 minutes daily per location.<br><br>With Roark's extensive restaurant and franchise portfolio, there's likely opportunity to deploy similar capabilities across multiple brands.<br><br>Would you be open to a brief call to discuss what we're seeing in the space?<br><br>Best,<br>Jim from Gumbo`
  },
  'TA Associates': {
    subject: 'Portfolio-Wide AI Deployment at TA Associates',
    body: `Damon,<br><br>As CITO at TA Associates, you're uniquely positioned to drive technology initiatives across one of the most active growth equity portfolios in the market.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency specializing in building custom agents and automations for PE-backed companies. Our work typically focuses on: automated document processing, intelligent workflow routing, and customer service agents that resolve tier-1 issues without human intervention.<br><br>Given TA's focus on software and tech-enabled services, we've found that portfolio companies in these sectors see the fastest ROI—often 3-6 month payback periods on automation projects.<br><br>Would it make sense to connect for 15 minutes? I'd be interested to hear about the technology priorities you're seeing across the portfolio.<br><br>Best,<br>Jim from Gumbo`
  },
  'Francisco Partners': {
    subject: 'CTO-to-CTO: AI Deployment Across Technology Portfolio',
    body: `Brian,<br><br>Reaching out CTO to CTO—as the technology leader at Francisco Partners, you're overseeing one of the most sophisticated tech portfolios in PE.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that builds custom automations and intelligent agents for technology companies. Recent projects: automated security log analysis, intelligent ticketing routing, and customer onboarding flows that cut time-to-value by 40%.<br><br>Given Francisco's deep expertise in software and tech-enabled services, I imagine you're already seeing AI deployment requests from portfolio companies. We've found that having a standardized approach to evaluating and implementing these projects accelerates both speed and quality of execution.<br><br>Would you be open to a brief conversation about what you're seeing in this space?<br><br>Best,<br>Jim from Gumbo`
  },
  'Charlesbank Capital Partners': {
    subject: 'AI Value Creation for Charlesbank Portfolio',
    body: `John,<br><br>As Head of Portfolio Resources at Charlesbank, you're driving value creation across a diverse middle market portfolio. AI is becoming a key lever for operational improvement—but most firms struggle with where to start.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that works with PE-backed companies to identify and implement high-ROI automation opportunities. Think: automated document processing (invoices, contracts, forms), intelligent workflow routing, and customer service agents that handle tier-1 inquiries.<br><br>We've worked with similar portfolio companies in tech-enabled services and typically see 20-30% efficiency gains in back-office operations within 90 days of deployment.<br><br>Would it make sense to connect for 15 minutes? I'd be interested to hear about the operational priorities you're focused on across the portfolio.<br><br>Best,<br>Jim from Gumbo`
  },
  'Comvest Partners': {
    subject: 'AI Capabilities for Newly Independent Comvest PE Platform',
    body: `Alex,<br><br>Saw that Comvest's PE arm recently became independent (after the Manulife credit sale). As you're building out the platform and Operating Advisory Group, AI capabilities are increasingly becoming table stakes for portfolio value creation.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that builds custom automations and agents for middle market companies. Common use cases: automated document processing, intelligent workflow routing, customer service agents, and sales process automation.<br><br>Given Comvest's $9B+ investment track record and focus on control investments, there's likely opportunity to standardize AI deployment across portfolio companies as part of the value creation playbook.<br><br>Would you be open to a brief call to discuss what we're seeing in the market?<br><br>Best,<br>Jim from Gumbo`
  },
  'PSG Equity': {
    subject: 'AI for Software-Focused Growth Equity',
    body: `Bill,<br><br>PSG's focus on software companies puts you at the forefront of AI adoption—both as a technology trend and as a value creation opportunity for portfolio companies.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that builds custom automations and intelligent agents for software and tech-enabled services companies. Recent projects: automated customer onboarding, intelligent support routing, and document processing pipelines.<br><br>Software companies often have the cleanest data and most receptive engineering teams, which makes AI deployment faster and more impactful. We've seen 3-6 month payback periods on automation projects in this sector.<br><br>Would it make sense to connect for 15 minutes? I'd be interested to hear about the growth priorities you're focused on across the portfolio.<br><br>Best,<br>Jim from Gumbo`
  },
  'Pritzker Private Capital': {
    subject: 'Technology Leadership: AI for Manufacturing & Services',
    body: `Jeff,<br><br>As Head of Technology at Pritzker Private Capital, you're likely fielding questions about AI from portfolio companies across manufacturing and services. The challenge: most AI vendors focus on software companies, not industrial businesses.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that's worked extensively with manufacturing and services companies. Common use cases: automated quality inspection, predictive maintenance alerts, supply chain optimization, and customer service automation.<br><br>We've found that manufacturing companies benefit most from visual AI (defect detection, inventory counting) and workflow automation (order processing, scheduling), while services businesses see faster ROI from customer-facing agents and document processing.<br><br>Would you be open to a brief call to discuss what you're seeing across the portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  'Serent Capital': {
    subject: 'Product & Technology: AI for High-Growth Software Companies',
    body: `Neal,<br><br>As SVP of Product & Technology at Serent, you're working with some of the fastest-growing software and tech-enabled services companies in the market. AI is quickly becoming a competitive differentiator for these businesses.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that builds custom automations and intelligent agents for high-growth companies. Recent projects: automated customer onboarding, intelligent support routing, sales process automation, and document processing pipelines.<br><br>Given Serent's 25+ person Growth Team and explicit focus on AI (per your recent fund materials), I imagine you're already seeing strong demand for AI capabilities from portfolio companies.<br><br>Would it make sense to connect for 15 minutes? I'd be interested to hear about the technology priorities you're focused on.<br><br>Best,<br>Jim from Gumbo`
  },
  'TZP Group': {
    subject: 'Portfolio Growth: AI for Scaling Operations',
    body: `Jarrad,<br><br>Given your role driving portfolio growth at TZP and your background scaling ecommerce at Facebook, you're uniquely positioned to understand how AI can accelerate growth for software and tech-enabled services companies.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that builds custom automations and intelligent agents focused on growth and operations. Think: automated lead qualification, intelligent customer routing, personalized onboarding flows, and support agents that resolve tier-1 issues.<br><br>We've worked with similar growth-stage companies and typically see: 30-40% reduction in customer onboarding time, 20-25% improvement in lead conversion, and 50%+ reduction in tier-1 support volume.<br><br>Would you be open to a brief call to discuss what we're seeing in the market?<br><br>Best,<br>Jim from Gumbo`
  },
  'GenNx360 Capital Partners': {
    subject: 'AI for Lower Middle Market Industrials',
    body: `Rishi,<br><br>Lower middle market industrial companies often get overlooked by AI vendors who focus on software businesses. But we've found that industrial businesses can see even faster ROI from AI—especially in visual inspection, quality control, and workflow automation.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that's worked with manufacturing and industrial services companies to deploy practical AI solutions. Common use cases: automated defect detection, inventory counting via computer vision, predictive maintenance alerts, and customer service automation.<br><br>Given GenNx360's focus on lower middle market industrials and services, there's likely opportunity to drive operational improvements across portfolio companies using these capabilities.<br><br>Would it make sense to connect for 15 minutes?<br><br>Best,<br>Jim from Gumbo`
  },
  'Capstreet': {
    subject: 'AI Value Creation for Industrial Distribution & Manufacturing',
    body: `Michelle,<br><br>Capstreet's Capvalue Framework is all about operational improvement and growth acceleration. AI is increasingly becoming a key lever for both—especially in industrial distribution and manufacturing.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that works with industrial companies to deploy practical automation solutions. Common use cases: automated order processing, inventory optimization, quality control via computer vision, and customer service automation.<br><br>We've worked with similar distribution and manufacturing businesses and typically see: 40-50% reduction in order processing time, 20-30% improvement in inventory turns, and 30%+ reduction in customer service response time.<br><br>Would it make sense to connect for 15 minutes? I'd be interested to hear about the operational priorities you're focused on across the portfolio.<br><br>Best,<br>Jim from Gumbo`
  },
  'Alpine Investors': {
    subject: 'AI for PeopleFirst Portfolio Companies',
    body: `Audrey,<br><br>Alpine's PeopleFirst approach and CEO-in-Training program are unique in PE. As you scale that model across 190+ deals, AI can help automate the repetitive work that takes time away from high-value human interactions.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that builds custom automations and intelligent agents for software and services companies. Common use cases: automated customer onboarding, intelligent support routing, sales process automation, and back-office document processing.<br><br>The goal: free up your portfolio teams to focus on the strategic and people-centric work that drives value, while AI handles the routine tasks.<br><br>Would you be open to a brief call to discuss what we're seeing in the market?<br><br>Best,<br>Jim from Gumbo`
  },
  'Motive Partners': {
    subject: 'Fintech AI: Opportunities for Motive Portfolio',
    body: `Chris,<br><br>Motive's IOI model (Investor, Operator, Innovator) and Create team for technology transformation position you well to drive AI adoption across the fintech portfolio.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that's worked with financial services and fintech companies to deploy automation and intelligent agents. Common use cases: automated document processing (KYC, compliance docs, loan applications), intelligent fraud detection, customer service agents, and workflow automation.<br><br>Fintech companies often have rich structured data and clear ROI metrics, which makes AI deployment particularly impactful. We've seen: 60-70% reduction in document processing time, 40%+ reduction in false positive fraud alerts, and 50%+ reduction in tier-1 support volume.<br><br>Would it make sense to connect for 15 minutes?<br><br>Best,<br>Jim from Gumbo`
  },
  'Transom Capital Group': {
    subject: 'ARMOR Value Creation + AI Capabilities',
    body: `Ken,<br><br>Transom's ARMOR Value Creation Process and #2 ranking on Axial 2025 show a clear commitment to operational excellence. AI is increasingly becoming a key component of that value creation playbook.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that works with middle market services and distribution companies to deploy practical automation solutions. Common use cases: automated order processing, customer service agents, document processing, and workflow routing.<br><br>We've worked with similar middle market businesses and typically see: 30-40% reduction in order processing time, 20-30% efficiency gains in customer service, and 40-50% faster document processing.<br><br>Would it make sense to connect for 15 minutes? I'd be interested to hear about the operational priorities you're focused on across the portfolio.<br><br>Best,<br>Jim from Gumbo`
  },
  'Gridiron Capital': {
    subject: 'AI for Business Services & Consumer Companies',
    body: `Kevin,<br><br>Gridiron's $2.1B Fund V and focus on business services and consumer businesses puts you in a sweet spot for AI deployment. These sectors often have high-volume, repeatable processes that benefit significantly from automation.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that builds custom automations and intelligent agents for middle market companies. Common use cases: automated customer onboarding, intelligent support routing, document processing, and sales process automation.<br><br>Business services and consumer companies typically see: 30-40% reduction in onboarding time, 40-50% efficiency gains in back-office operations, and 20-30% improvement in customer satisfaction scores.<br><br>Would you be open to a brief call to discuss what we're seeing in the market?<br><br>Best,<br>Jim from Gumbo`
  },
  'LFM Capital': {
    subject: 'AI for Manufacturing: Built by Operators for Operators',
    body: `Jessica,<br><br>LFM's founding by operators and engineers resonates with how we think about AI deployment: practical, ROI-driven, and built by people who understand operations.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that works with manufacturing companies to deploy visual AI and workflow automation. Common use cases: automated defect detection, inventory counting via computer vision, predictive maintenance alerts, quality control automation, and customer service agents.<br><br>We've found that manufacturing companies benefit most from visual AI (defect detection, inventory management) and workflow automation (order processing, scheduling). Typical ROI: 3-6 month payback periods.<br><br>Would it make sense to connect for 15 minutes? I'd be interested to hear about the operational priorities you're focused on across the portfolio.<br><br>Best,<br>Jim from Gumbo`
  },
  'Hidden Harbor Capital Partners': {
    subject: 'Operations-Focused AI for Industrials',
    body: `Tucker,<br><br>Hidden Harbor's reputation as a "PE firm with an operations soul" and #1 ranking on Axial 2025 Industrials (buyside) shows a deep commitment to operational improvement. AI is becoming a key lever for that work.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that works with industrial and services companies to deploy practical automation solutions. Common use cases: automated quality inspection, predictive maintenance, supply chain optimization, document processing, and customer service automation.<br><br>Industrial companies often have the richest opportunities for AI deployment because of high-volume, repeatable processes and clear ROI metrics.<br><br>Would it make sense to connect for 15 minutes?<br><br>Best,<br>Jim from Gumbo`
  },
  'Mill Point Capital': {
    subject: 'AI for Middle Market Industrials & Services',
    body: `Orestes,<br><br>As Head of Business Development at Mill Point, you're likely hearing about AI from portfolio companies across industrials and services. The challenge: most AI vendors don't understand middle market businesses.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that works specifically with middle market companies to deploy practical automation solutions. Common use cases: automated order processing, document processing, customer service agents, quality control, and workflow routing.<br><br>Middle market companies often see faster ROI from AI because they have less technical debt and more flexible processes than enterprise businesses.<br><br>Would you be open to a brief call to discuss what we're seeing in the market?<br><br>Best,<br>Jim from Gumbo`
  },
  'HCI Equity Partners': {
    subject: 'AI Value Creation for Distribution & Industrial Services',
    body: `Tim,<br><br>HCI's 6x Inc Founder-Friendly recognition and recent addition of Jeff DeSandre as Executive Partner IT shows a strong focus on technology and operational improvement.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that works with value-added distribution and industrial services companies to deploy automation. Common use cases: automated order processing, inventory optimization, customer service agents, document processing, and quality control.<br><br>Distribution and industrial services companies typically see: 40-50% reduction in order processing time, 30%+ improvement in inventory accuracy, and 20-30% efficiency gains in customer service.<br><br>Would it make sense to connect for 15 minutes? I'd be interested to hear about the operational priorities you're focused on across the portfolio.<br><br>Best,<br>Jim from Gumbo`
  },
  'Argosy Private Equity': {
    subject: 'AI for 6-Person Operating Partners Team',
    body: `Jason,<br><br>Argosy's 6-person in-house operating partners team (150+ years combined experience) and 120+ platform investments show a serious commitment to operational value creation. AI is increasingly becoming a key tool in that work.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that works with middle market services and distribution companies to deploy practical automation solutions. Common use cases: automated order processing, document processing, customer service agents, and workflow routing.<br><br>Having a centralized operating partners team creates an opportunity to standardize AI deployment across portfolio companies—which accelerates both speed and quality of execution.<br><br>Would you be open to a brief call to discuss what we're seeing in the market?<br><br>Best,<br>Jim from Gumbo`
  },
  'Resurgens Technology Partners': {
    subject: 'Tech-Focused AI for Business Services',
    body: `Fred,<br><br>Resurgens' focus on tech-enabled business services and operating partner model positions you well to drive AI adoption across the portfolio. These companies often have the cleanest data and most receptive teams for AI deployment.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that builds custom automations and intelligent agents for tech-enabled services companies. Common use cases: automated customer onboarding, intelligent support routing, document processing, and sales process automation.<br><br>Tech-enabled services companies typically see: 30-40% reduction in onboarding time, 40-50% efficiency gains in back-office operations, and 3-6 month payback periods on automation projects.<br><br>Would it make sense to connect for 15 minutes?<br><br>Best,<br>Jim from Gumbo`
  },
  'Havencrest Capital Management': {
    subject: 'AI for 31 Operating Partners',
    body: `Matthew,<br><br>Havencrest's 10 investment professionals and 31 operating partners show an impressive commitment to hands-on value creation. As those operating partners work across portfolio companies, AI can help scale their impact.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that works with middle market services and distribution companies to deploy practical automation. Common use cases: automated order processing, document processing, customer service agents, workflow routing, and quality control.<br><br>Having a large operating partner team creates an opportunity to standardize AI deployment across portfolio companies—which accelerates both speed and ROI.<br><br>Would you be open to a brief call to discuss what we're seeing in the market?<br><br>Best,<br>Jim from Gumbo`
  },
  'Trilantic North America': {
    subject: 'AI for Control Investments',
    body: `Justin,<br><br>Trilantic's $1.9B in aggregate commitments and focus on control and significant minority investments positions you well to drive operational improvements at portfolio companies. AI is increasingly becoming a key lever for that work.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that works with middle market companies to deploy practical automation solutions. Common use cases: automated document processing, customer service agents, workflow routing, and sales process automation.<br><br>Control investments create the opportunity to implement AI capabilities as part of the 100-day plan—which typically delivers faster ROI and cleaner execution than bolt-on projects.<br><br>Would it make sense to connect for 15 minutes?<br><br>Best,<br>Jim from Gumbo`
  },
  'HGGC': {
    subject: 'AI for Software & Tech-Enabled Services',
    body: `Holland,<br><br>HGGC's focus on software and tech-enabled services puts you at the forefront of AI adoption. These companies are both building AI products and using AI internally—creating opportunities on both fronts.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that builds custom automations and intelligent agents for software and tech-enabled services companies. Common use cases: automated customer onboarding, intelligent support routing, document processing, and sales process automation.<br><br>Software companies typically see: 30-40% reduction in onboarding time, 40-50% efficiency gains in support operations, and 3-6 month payback periods on automation projects.<br><br>Would you be open to a brief call to discuss what we're seeing in the market?<br><br>Best,<br>Jim from Gumbo`
  }
};

async function sendAllEmails() {
  console.log(`\n=== Preparing ${contacts.length} emails ===\n`);
  
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const template = templates[contact.company];
    
    if (!template) {
      console.log(`⚠️  No template for ${contact.company}, skipping ${contact.name}`);
      continue;
    }
    
    console.log(`[${i+1}/${contacts.length}] ${contact.company} - ${contact.name} (${contact.email})`);
    console.log(`    Subject: ${template.subject}`);
    console.log(`    Score: ${contact.score} | Role: ${contact.title}\n`);
    
    // For preview: only send the first email to Alex
    if (i === 0) {
      const previewSubject = `[PREVIEW] ${template.subject}`;
      console.log(`📧 Sending preview to alex@hellogumbo.com...\n`);
      
      try {
        await sendEmail('alex@hellogumbo.com', previewSubject, template.body);
        console.log(`✅ Preview sent!\n`);
      } catch (err) {
        console.error(`❌ Preview send failed: ${err.message}\n`);
        throw err;
      }
    }
    
    // Store email data for batch send (after approval)
    contact.subject = template.subject;
    contact.body = template.body;
  }
  
  console.log(`\n=== Preview complete ===`);
  console.log(`First email sent to alex@hellogumbo.com as preview.`);
  console.log(`Remaining ${contacts.length - 1} emails ready to send after approval.\n`);
  
  return contacts;
}

// Run if called directly
if (require.main === module) {
  sendAllEmails()
    .then((contacts) => {
      console.log(`\n=== Summary ===`);
      console.log(`Total contacts: ${contacts.length}`);
      console.log(`Preview sent: 1`);
      console.log(`Awaiting approval: ${contacts.length - 1}\n`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`\n❌ Error: ${err.message}\n`);
      process.exit(1);
    });
}

module.exports = { contacts, templates, sendAllEmails };
