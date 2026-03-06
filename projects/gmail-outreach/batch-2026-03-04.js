// PE Outreach Batch - March 4, 2026
// DO NOT RUN - Preview only, awaiting approval

const { sendEmail } = require('./send.js');

const emails = [
  {
    to: 'jflannery@charlesbank.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'Portfolio AI Rollouts at Charlesbank',
    body: `John,<br><br>Congrats on leading Portfolio Resources at Charlesbank — I noticed you're actively supporting portcos through value creation.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a>, an AI agency that helps PE-backed companies roll out AI across operations. We've worked with portfolio companies to deploy AI agents for customer service, sales ops, and back-office automation.<br><br>Would you be open to a brief call to explore how we could support your portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'joe.rubino@gtcr.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI for GTCR Portfolio Resources',
    body: `Joe,<br><br>As CTO and Co-Head of Portfolio Resources at GTCR, you're uniquely positioned to drive AI adoption across your portfolio.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency specializing in PE portfolio support — we help portcos deploy AI agents for customer ops, sales automation, and workflow efficiency.<br><br>Would you be interested in discussing how we could support your portfolio companies with AI implementation?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'dkhouri@ta.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Capabilities for TA Associates Portfolio',
    body: `Damon,<br><br>As CITO at TA Associates, you're overseeing tech strategy across a massive portfolio. I imagine AI implementation is top of mind.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed companies deploy AI agents for customer service, sales ops, and back-office automation. We work with portfolio companies to identify high-ROI AI use cases and execute rapidly.<br><br>Would you be open to a brief call to explore how we could support your portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'brian.maury@franciscopartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Deployment for Francisco Partners Portfolio',
    body: `Brian,<br><br>As CTO at Francisco Partners, you're driving tech transformation across a tech-heavy portfolio.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency that helps PE portcos roll out AI agents for customer ops, sales automation, and internal workflows. We've helped companies reduce support costs and accelerate revenue ops with custom AI solutions.<br><br>Would you be interested in discussing how we could support your portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'chris.williams@motivepartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI for Fintech Portfolio Companies',
    body: `Chris,<br><br>Motive Partners' IOI model (Investor, Operator, Innovator) is perfectly positioned to leverage AI across your fintech portfolio.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed fintechs deploy AI agents for customer service, compliance workflows, and sales automation. We focus on rapid deployment and measurable ROI.<br><br>Would you be open to a brief call to explore how we could support your portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'william.aliber@psgequity.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Solutions for PSG Software Portfolio',
    body: `Bill,<br><br>PSG's software-focused portfolio is perfectly positioned to adopt AI — both internally and as product features.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency that helps PE-backed software companies deploy AI agents for customer support, sales ops, and product automation. We've helped portcos reduce support costs and improve retention with AI.<br><br>Would you be interested in discussing how we could support your Kansas City portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'jpconte@gencap.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Value Creation at Genstar',
    body: `Jean-Pierre,<br><br>Genstar's ~$40B AUM and focus on software/services makes AI adoption a major value creation lever.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE portfolio companies deploy AI agents for customer ops, sales automation, and back-office workflows. We focus on rapid implementation and measurable impact.<br><br>Would you be open to a brief call to explore how we could support Genstar's portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'a.ray@comvest.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI for Newly Independent Comvest PE',
    body: `Alex,<br><br>Congrats on Comvest's independence following the Manulife credit sale — perfect timing to differentiate your PE platform with AI capabilities.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency that helps PE firms deploy AI across portfolio companies. We work with portcos on customer service automation, sales ops, and workflow efficiency.<br><br>As MD of Business Development, would you be interested in discussing how we could support Comvest's portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'cy.barton@revelstokecapital.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI for Revelstoke Portfolio Companies',
    body: `Cy,<br><br>Revelstoke's focus on value creation makes AI deployment a natural fit for portfolio companies.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed companies roll out AI agents for customer service, sales automation, and operations. We focus on rapid deployment and measurable ROI.<br><br>Would you be open to a brief call to explore how we could support Revelstoke's portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'balvarez@roarkcapital.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Automation for Roark Portfolio',
    body: `Brandon,<br><br>As a Software Engineer at Roark Capital, you're uniquely positioned to understand how AI can drive value across your restaurant and services portfolio.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency that helps PE portcos deploy AI agents for customer ops, workforce scheduling, and operational efficiency. We've worked with services businesses to automate repetitive workflows.<br><br>Would you be interested in discussing how AI could support Roark's portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'rauzenne@roarkcapital.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Infrastructure for Roark Portfolio',
    body: `Rebecca,<br><br>Your DevOps/data engineering background at Roark positions you perfectly to evaluate AI infrastructure for portfolio companies.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed companies deploy AI agents for customer service, sales automation, and operational workflows. We focus on practical, high-ROI implementations.<br><br>Would you be open to a brief call to explore how AI could support Roark's portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'jberman@tzpgroup.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI for TZP Portfolio Growth',
    body: `Jarrad,<br><br>As Partner focused on Portfolio Growth at TZP, you're driving value creation across your portfolio — AI is a major opportunity.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed companies deploy AI agents for customer service, sales automation, and back-office ops. We've helped portcos reduce costs and accelerate growth with AI.<br><br>Would you be interested in discussing how we could support TZP's portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'jkruse@tzpgroup.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI-Powered Talent Solutions for TZP',
    body: `JoAnne,<br><br>Your 30-year HR background and focus on Portfolio Growth Talent at TZP makes you perfectly positioned to see how AI can transform workforce ops.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency that helps PE portcos deploy AI agents for recruiting automation, onboarding, and employee support. We've helped companies reduce HR ops costs with AI.<br><br>Would you be open to discussing how AI could support TZP's talent initiatives?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'neal.sainani@serentcapital.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Product Strategy for Serent Portfolio',
    body: `Neal,<br><br>As SVP Product & Technology at Serent, you're driving product innovation across a $1B+ recurring revenue portfolio.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed SaaS companies deploy AI agents for customer support, onboarding, and product usage. We work with portcos to embed AI into their products and operations.<br><br>Would you be interested in discussing how we could support Serent's portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'gmittal@thl.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Value Creation at THL Partners',
    body: `Gaurav,<br><br>THL's 40+ year track record and focus on services businesses makes AI adoption a key value creation lever.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency that helps PE portfolio companies deploy AI agents for customer ops, sales automation, and back-office workflows. We focus on rapid deployment and measurable ROI.<br><br>Would you be open to a brief call to explore how we could support THL's portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'garrett@sentinelpartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI for Sentinel Portfolio Companies',
    body: `Josh,<br><br>Sentinel's operational focus and middle-market portfolio is perfectly positioned to adopt AI for value creation.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed companies deploy AI agents for customer service, sales ops, and operational workflows. We've worked with portcos to reduce costs and accelerate growth with AI.<br><br>Would you be interested in discussing how we could support Sentinel's portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'hreynolds@hggc.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Solutions for HGGC Tech Portfolio',
    body: `Holland,<br><br>HGGC's tech-focused portfolio and operational approach makes AI deployment a natural next step for value creation.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency that helps PE-backed tech companies roll out AI agents for customer support, sales automation, and product features. We focus on rapid deployment and measurable impact.<br><br>Would you be open to discussing how we could support HGGC's portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'max@angelesequity.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI for Angeles Equity Portfolio',
    body: `Max,<br><br>As Head of Business Development at Angeles Equity, you're perfectly positioned to identify AI opportunities across your portfolio.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed companies deploy AI agents for customer service, sales automation, and operational workflows. We've helped portcos reduce costs and accelerate growth with AI.<br><br>Would you be interested in discussing how we could support Angeles Equity's portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'jberman@tzpgroup.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Growth Strategies for TZP',
    body: `Jarrad,<br><br>Your background at Facebook and current role driving Portfolio Growth at TZP positions you perfectly to leverage AI for portco acceleration.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency that helps PE portfolio companies deploy AI agents for customer acquisition, retention, and operational efficiency. We've worked with growth-stage companies to scale with AI.<br><br>Would you be open to a brief call to explore opportunities?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'rverma@gennx360.biz',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI for GenNx360 Portfolio',
    body: `Rishi,<br><br>GenNx360's operational focus and industrial portfolio could benefit significantly from AI-powered workflow automation.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed companies deploy AI agents for customer service, supply chain ops, and back-office automation. We focus on practical, high-ROI implementations.<br><br>Would you be interested in discussing how we could support GenNx360's portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'fred@resurgenstech.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI for Resurgens Tech Portfolio',
    body: `Fred,<br><br>Resurgens' focus on tech-enabled business services makes AI deployment a natural fit for value creation.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency that helps PE portfolio companies roll out AI agents for customer ops, sales automation, and back-office workflows. We've worked with services businesses to reduce costs and accelerate growth with AI.<br><br>Would you be open to discussing how we could support Resurgens' portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'apeix@gaugecapital.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Solutions for Gauge Capital Portfolio',
    body: `Andrew,<br><br>As Partner focused on Business Development at Gauge Capital, you're uniquely positioned to identify AI opportunities across your portfolio.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed companies deploy AI agents for customer service, sales automation, and operational workflows. We focus on rapid deployment and measurable ROI.<br><br>Would you be interested in discussing how we could support Gauge's portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'tduncan@summitparkllc.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Innovation for Summit Park Portfolio',
    body: `Tom,<br><br>As Operating Partner focused on Growth & Innovation at Summit Park, you're driving transformation across your portfolio — AI is a major lever.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed companies deploy AI agents for customer ops, sales automation, and back-office workflows. We've helped portcos reduce costs and accelerate growth with AI.<br><br>Would you be open to discussing how we could support Summit Park's portfolio?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'bderby@gipartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI for GI Partners Portfolio Operations',
    body: `Brett,<br><br>As VP of Portfolio Operations at GI Partners, you're driving operational excellence — AI is the next frontier.<br><br><a href="https://hellogumbo.com">Gumbo</a> is an AI agency that helps PE portcos deploy AI agents for customer service, sales ops, and back-office automation. We focus on rapid deployment and measurable ROI.<br><br>Would you be interested in discussing how we could support GI Partners' portfolio companies?<br><br>Best,<br>Jim from Gumbo`
  },
  {
    to: 'jcarlson@ppcpartners.com',
    bcc: ['jeff@hellogumbo.com', 'alex@hellogumbo.com'],
    subject: 'AI Technology Strategy for Pritzker Private Capital',
    body: `Jeff,<br><br>As Principal and Head of Technology at Pritzker Private Capital, you're uniquely positioned to drive AI adoption across your manufacturing and services portfolio.<br><br><a href="https://hellogumbo.com">Gumbo</a> helps PE-backed companies deploy AI agents for customer ops, supply chain automation, and operational workflows. We focus on practical implementations with measurable impact.<br><br>Would you be open to discussing how AI could support PPC's portfolio?<br><br>Best,<br>Jim from Gumbo`
  }
];

// Preview mode - DO NOT execute
console.log(`Batch prepared: ${emails.length} emails`);
console.log('Recipients:', emails.map(e => e.to).join(', '));
console.log('\nDO NOT RUN THIS SCRIPT UNTIL APPROVED BY ALEX');

// Uncomment to execute (ONLY after approval):
// async function runBatch() {
//   for (const email of emails) {
//     try {
//       await sendEmail(email.to, email.subject, email.body, email.bcc);
//       console.log(`Sent to ${email.to}`);
//       await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay between sends
//     } catch (error) {
//       console.error(`Failed to send to ${email.to}:`, error.message);
//     }
//   }
// }
// runBatch();
