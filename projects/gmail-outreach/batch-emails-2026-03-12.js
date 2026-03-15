const { sendEmail } = require('./send.js');

// Batch email script for PE outreach - 2026-03-12
// DO NOT RUN until Alex approves preview

const emails = [
  {
    to: 'aspector@onerockcapital.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'One Rock + AI: Operational Analytics for Portfolio Companies',
    body: `<p>Allison,</p>

<p>One Rock's sustainability-led value creation is unique in mid-market PE. As you drive ESG improvements across portfolio companies, there's a massive opportunity to layer in AI-powered operational analytics.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms embed intelligence into their portcos without the heavy lift. We've helped firms like yours turn operational data (supply chain, energy usage, workforce planning) into real-time decision support - and it directly improves sustainability metrics.</p>

<p>Would you be open to a brief call? I'd love to show you how we're helping sustainability-focused firms accelerate value creation with AI.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'dbolzan@pfingsten.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Pfingsten + AI: Scaling Your Buy-and-Build Playbook',
    body: `<p>Denny,</p>

<p>Pfingsten's track record in fragmented services and manufacturing is impressive - you've built 40+ platforms through smart M&A and operational improvements. As deal flow accelerates, AI can be the force multiplier for integration and value creation.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with mid-market PE firms to deploy custom AI across their portfolios. We help streamline integration playbooks, automate post-merger ops, and surface synergies faster.</p>

<p>Quick question: are you exploring AI to accelerate your buy-and-build strategy? I'd love to share what we're seeing work for firms like yours.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'bmichaud@littlejohnllc.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Littlejohn + AI: Operational Intelligence for Industrials',
    body: `<p>Brian,</p>

<p>Littlejohn's integrated PE + special situations model requires deep operational visibility. With $14B+ AUM and a focus on mid-market industrials and services, you're sitting on a goldmine of operational data that AI can unlock.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms turn portfolio data into actionable intelligence. We build custom AI systems that improve forecasting, optimize supply chains, and accelerate turnarounds - especially valuable for special situations.</p>

<p>Would you be open to a brief conversation? I'd love to show you how we're helping firms like yours deploy AI without disrupting your operations.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'bill@unioncapitalassociates.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Union Capital + AI: Smarter Business Services Platforms',
    body: `<p>Bill,</p>

<p>Union Capital's focus on lower middle market business services gives you a front-row seat to operational inefficiency - and a massive opportunity for AI-driven improvement. Most of your portcos are still running on spreadsheets and gut instinct.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms embed intelligence into business services companies. We build custom AI tools for workforce optimization, customer analytics, and process automation - all designed to drive EBITDA growth without adding headcount.</p>

<p>Quick question: are you exploring AI as a value creation lever? I'd love to share what we're seeing work in business services.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'calamai@siris.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Siris + AI: Tech-Enabled Transformation at Scale',
    body: `<p>Dave,</p>

<p>Siris' focus on tech and telecom means you're already operating in AI-adjacent markets. But there's a huge opportunity to deploy AI internally across your portfolio - not as a product feature, but as an operational backbone.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms build custom AI systems for their portcos. We've worked with tech-focused firms to deploy AI for customer success, product analytics, and operational efficiency - driving margin expansion without R&D bloat.</p>

<p>Would you be open to a brief call? I'd love to show you how we're helping tech-focused PE firms like Siris accelerate value creation with AI.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'jgarrison@bvlp.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'BV Investment Partners + AI: Scaling Your Healthcare Platforms',
    body: `<p>Justin,</p>

<p>BV's healthcare and business services focus puts you in markets where AI adoption is exploding - but most portcos don't have the resources to execute. We're seeing smart PE firms step in and build AI capabilities as a value creation tool.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with mid-market PE firms to deploy custom AI across healthcare and services platforms. We help firms like yours build patient analytics, operational forecasting, and workflow automation - all designed to improve margins and exit multiples.</p>

<p>Quick question: are you exploring AI as a strategic lever for your healthcare portcos? I'd love to share what we're seeing work.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'npingelton@marlinequity.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Marlin + AI: Operational Intelligence for Tech Services',
    body: `<p>Nathan,</p>

<p>Marlin's focus on tech-enabled services and software gives you unparalleled visibility into how technology drives value. But most portcos are sitting on underutilized data - and AI can turn that into competitive advantage.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms build custom AI systems for their tech services and software platforms. We've helped firms like yours deploy AI for customer retention, usage analytics, and product optimization - driving ARR growth and margin expansion.</p>

<p>Would you be open to a brief conversation? I'd love to show you how we're helping tech-focused PE firms accelerate value creation with AI.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'nattenborough@goldengatecap.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Golden Gate + AI: Smarter Financial Services Platforms',
    body: `<p>Neale,</p>

<p>Golden Gate's deep expertise in financial services puts you at the intersection of data and operational complexity. With $19B+ AUM and a strong insurance portfolio, you're sitting on datasets that AI can transform into predictive intelligence.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with PE firms to deploy custom AI across financial services platforms. We help firms like yours build underwriting models, claims automation, and customer lifetime value analytics - all designed to improve unit economics and exit multiples.</p>

<p>Quick question: are you exploring AI as a value creation lever for your financial services portcos? I'd love to share what we're seeing work.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'jmoberg@cortecgroup.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Cortec + AI: 40 Years of PE, Now Powered by Intelligence',
    body: `<p>Jesse,</p>

<p>Cortec's 40-year track record in mid-market value creation is impressive. As operational complexity grows, AI is becoming the next frontier for driving EBITDA improvements across portfolios.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms embed intelligence into their portcos. We build custom AI systems for supply chain optimization, workforce planning, and financial forecasting - all designed to accelerate the value creation playbook you've perfected over four decades.</p>

<p>Would you be open to a brief call? I'd love to show you how we're helping experienced PE firms like Cortec deploy AI without disrupting proven processes.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'tom@cidcap.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'CID Capital + AI: Smarter Business Services in the Midwest',
    body: `<p>Tom,</p>

<p>CID's focus on Indianapolis and lower middle market business services puts you in markets where AI adoption is still early - and that's the opportunity. You can build competitive moats for your portcos before their competitors catch on.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with regional PE firms to deploy custom AI across business services platforms. We help firms like yours build customer analytics, operational dashboards, and predictive pricing - all designed to drive margin expansion in competitive markets.</p>

<p>Quick question: are you exploring AI as a value creation tool for your business services portcos? I'd love to share what we're seeing work in the Midwest.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'jgantz@pinebrookpartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Pine Brook + AI: Operational Intelligence for Energy & Infrastructure',
    body: `<p>Joe,</p>

<p>Pine Brook's focus on energy and infrastructure gives you exposure to some of the most data-rich sectors in private equity. With $7B+ AUM, you're managing complex operations that AI can optimize - from asset performance to supply chain efficiency.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms deploy custom AI across energy and industrial platforms. We've helped firms like yours build predictive maintenance systems, energy forecasting models, and operational analytics - all designed to improve asset utilization and EBITDA.</p>

<p>Would you be open to a brief conversation? I'd love to show you how we're helping infrastructure-focused PE firms accelerate value creation with AI.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'rspasser@accel-kkr.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Accel-KKR + AI: Software Meets Intelligence',
    body: `<p>Rachel,</p>

<p>Accel-KKR's focus on software means you're already operating in AI-adjacent markets. But there's a huge opportunity to deploy AI internally across your portfolio - not as a product feature, but as an operational and go-to-market accelerator.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with software-focused PE firms to deploy custom AI for product analytics, customer success, and revenue optimization. We've helped firms like yours build usage-based pricing models, churn prediction systems, and automated customer onboarding - all designed to drive ARR growth and improve retention.</p>

<p>Quick question: are you exploring AI as a strategic lever for your software portcos? I'd love to share what we're seeing work in B2B SaaS.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'angusc@clairvest.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Clairvest + AI: Cross-Border Intelligence',
    body: `<p>Angus,</p>

<p>Clairvest's focus on North American mid-market services gives you exposure to diverse operational models across geographies. As you scale portcos cross-border, AI can be the connective tissue - unifying data, standardizing processes, and surfacing insights faster.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms deploy custom AI across multi-site, multi-geography operations. We've helped firms like yours build unified dashboards, predictive analytics, and automated reporting - all designed to improve visibility and decision-making at scale.</p>

<p>Would you be open to a brief call? I'd love to show you how we're helping cross-border PE firms like Clairvest accelerate value creation with AI.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'ecrawford@platteriverequity.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Platte River + AI: Smarter Business Services in the Rockies',
    body: `<p>Eric,</p>

<p>Platte River's Denver-based focus on lower middle market business services puts you in a market where AI adoption is still nascent - and that's the opportunity. You can build competitive advantages for your portcos before their competitors catch on.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with regional PE firms to deploy custom AI across business services platforms. We help firms like yours build workforce optimization tools, customer analytics, and operational dashboards - all designed to drive margin expansion in competitive markets.</p>

<p>Quick question: are you exploring AI as a value creation lever for your business services portcos? I'd love to share what we're seeing work in the Mountain West.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'scho@mountaingate.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Mountaingate + AI: Operational Intelligence for Services',
    body: `<p>Sue,</p>

<p>Mountaingate's LA-based focus on lower middle market services gives you a front-row seat to operational inefficiency - and a massive opportunity for AI-driven improvement. Most of your portcos are still running on manual processes and spreadsheets.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms embed intelligence into services businesses. We build custom AI tools for workforce planning, customer retention, and process automation - all designed to drive EBITDA growth without adding headcount.</p>

<p>Would you be open to a brief conversation? I'd love to show you how we're helping services-focused PE firms accelerate value creation with AI.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'abatlaw@generalatlantic.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'General Atlantic + AI: Growth Equity Meets Intelligence',
    body: `<p>Anish,</p>

<p>General Atlantic's $84B+ AUM and focus on growth equity in healthcare and tech puts you at the forefront of AI adoption. But there's a gap between product-level AI (what most portcos are building) and operational AI (what drives margin expansion).</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with growth equity firms to deploy custom AI for operational excellence. We've helped firms like yours build customer lifetime value models, usage analytics, and automated workflows - all designed to accelerate the path to profitability without sacrificing growth.</p>

<p>Quick question: are you exploring AI as an operational lever for your high-growth portcos? I'd love to share what we're seeing work in digital health and B2B SaaS.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'mundt@rhonegroup.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Rhône Group + AI: Transatlantic Intelligence',
    body: `<p>Patrick,</p>

<p>Rhône's transatlantic model gives you exposure to diverse markets and regulatory environments. As you scale portcos cross-border, AI can unify data, standardize processes, and surface insights faster - especially valuable in professional services.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms deploy custom AI across multi-geography operations. We've helped firms like yours build unified reporting systems, predictive analytics, and automated compliance workflows - all designed to improve visibility and decision-making at scale.</p>

<p>Would you be open to a brief call? I'd love to show you how we're helping transatlantic PE firms like Rhône accelerate value creation with AI.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'zane.hendricks@mgpfund.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Midwest Growth Partners + AI: Regional Intelligence',
    body: `<p>Zane,</p>

<p>Midwest Growth Partners' focus on Des Moines and regional professional services puts you in markets where AI adoption is still early - and that's the opportunity. You can build competitive moats for your portcos before their competitors catch on.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with regional PE firms to deploy custom AI across professional services platforms. We help firms like yours build client analytics, project forecasting, and workforce optimization tools - all designed to drive margin expansion in competitive markets.</p>

<p>Quick question: are you exploring AI as a value creation lever for your professional services portcos? I'd love to share what we're seeing work in the Midwest.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'dreader@kainoscapital.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Kainos + AI: Active Operating Meets Intelligence',
    body: `<p>Doug,</p>

<p>Kainos' active operating approach and value creation playbook are exactly where AI can multiply impact. As you drive operational improvements across portcos, AI can accelerate execution - from forecasting to process optimization.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with operationally-focused PE firms to deploy custom AI as part of the value creation playbook. We've helped firms like yours build predictive dashboards, supply chain optimization tools, and automated reporting - all designed to accelerate EBITDA improvements.</p>

<p>Would you be open to a brief conversation? I'd love to show you how we're helping operationally-driven PE firms like Kainos deploy AI without disrupting proven processes.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'rfoltz@brentwood.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Brentwood + AI: Services Meets Intelligence',
    body: `<p>Ryan,</p>

<p>Brentwood's 40-year track record in services businesses gives you deep operational expertise. As service delivery becomes more complex and competitive, AI is becoming the next frontier for margin expansion and differentiation.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms embed intelligence into services platforms. We build custom AI for workforce optimization, customer analytics, and predictive scheduling - all designed to improve utilization rates and EBITDA without adding headcount.</p>

<p>Quick question: are you exploring AI as a value creation lever for your services portcos? I'd love to share what we're seeing work in the LA market.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'fred@resurgenstech.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Resurgens + AI: Technology Meets Intelligence',
    body: `<p>Fred,</p>

<p>Resurgens' focus on tech-enabled business services puts you at the intersection of technology and operations. Most portcos are still underutilizing their data - and AI can turn that into competitive advantage.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with tech-focused PE firms to deploy custom AI for operational excellence. We've helped firms like yours build customer success automation, product usage analytics, and revenue forecasting - all designed to drive ARR growth and improve margins.</p>

<p>Would you be open to a brief call? I'd love to show you how we're helping tech-enabled services firms accelerate value creation with AI.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'i.baron@comvest.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Comvest + AI: Newly Independent, Newly Intelligent',
    body: `<p>Itai,</p>

<p>Comvest's recent independence (credit sold to Manulife for $937M) creates a unique opportunity to rebuild your operational infrastructure. As you establish your new PE platform, embedding AI from the ground up can be a huge competitive advantage.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms build custom AI systems for portfolio management and value creation. We've worked with newly independent platforms to deploy AI for deal sourcing, portco monitoring, and operational analytics - all designed to scale your team's impact without scaling headcount.</p>

<p>Quick question: are you exploring AI as part of your new platform build? I'd love to share what we're seeing work for newly independent PE firms.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'brian.maury@franciscopartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Francisco Partners + AI: CTO Meets Intelligence',
    body: `<p>Brian,</p>

<p>As CTO at Francisco Partners, you're uniquely positioned to understand the gap between what tech companies sell (AI products) and what they run on internally (often manual processes). There's a huge opportunity to deploy AI operationally across your portfolio - not as a product feature, but as an efficiency driver.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with tech-focused PE firms to deploy custom AI for operational excellence. We've helped CTOs like you build internal AI systems for product analytics, customer success automation, and engineering productivity - all designed to improve margins without disrupting roadmaps.</p>

<p>Would you be open to a brief conversation? I'd love to show you how we're helping tech-focused PE firms like Francisco Partners accelerate value creation with AI.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'chris.ritchie@greatersumventures.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Greater Sum Ventures + AI: CTO Meets Intelligence',
    body: `<p>Chris,</p>

<p>As CTO/CIO/CSO at Greater Sum Ventures, you're wearing multiple hats - and AI can be the force multiplier. Most PE firms are still figuring out how to deploy AI across their portfolios, but CTOs like you have the technical depth to execute faster.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy that helps PE firms build custom AI systems for portfolio operations. We've worked with CTOs to deploy AI for portfolio monitoring, operational dashboards, and predictive analytics - all designed to scale your impact without scaling headcount.</p>

<p>Quick question: are you exploring AI as a platform-level tool for Greater Sum? I'd love to share what we're seeing work for technically-savvy PE firms.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  },
  {
    to: 'joe.rubino@gtcr.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'GTCR + AI: CTO + Portfolio Resources Meets Intelligence',
    body: `<p>Joe,</p>

<p>As Managing Director & CTO and Co-Head of Portfolio Resources at GTCR, you're at the epicenter of value creation. Your role gives you visibility into operational challenges across every portco - and AI can be the connective tissue that scales your team's impact.</p>

<p>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI consultancy working with large PE firms to deploy custom AI across their Portfolio Resources functions. We've helped CTOs like you build AI-powered portco monitoring dashboards, predictive analytics for value creation initiatives, and automated reporting systems - all designed to scale your team's reach without scaling headcount.</p>

<p>Would you be open to a brief call? I'd love to show you how we're helping Portfolio Resources teams at firms like GTCR deploy AI to accelerate value creation across their portfolios.</p>

<p>Best,<br>
Jim<br>
<a href="https://hellogumbo.com">Gumbo</a></p>`
  }
];

async function sendAll() {
  console.log(`Preparing to send ${emails.length} emails...\n`);
  
  const results = [];
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`[${i + 1}/${emails.length}] Sending to ${email.to}...`);
    
    try {
      const result = await sendEmail(
        email.to,
        email.subject,
        email.body,
        'Jim from Gumbo',
        email.bcc
      );
      
      results.push({ to: email.to, status: 'sent', result });
      console.log(`✓ Sent successfully\n`);
      
      // Rate limit: wait 2 seconds between sends
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      results.push({ to: email.to, status: 'failed', error: error.message });
      console.log(`✗ Failed: ${error.message}\n`);
    }
  }
  
  console.log('\n=== BATCH SEND COMPLETE ===');
  console.log(`Sent: ${results.filter(r => r.status === 'sent').length}`);
  console.log(`Failed: ${results.filter(r => r.status === 'failed').length}`);
  
  return results;
}

// Export for manual execution
module.exports = { emails, sendAll };

// Only run if called directly (NOT via require)
if (require.main === module) {
  sendAll().catch(console.error);
}
