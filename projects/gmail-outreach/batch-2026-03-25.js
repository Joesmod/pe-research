// PE Outreach Batch - March 25, 2026
// DO NOT RUN THIS SCRIPT - Wait for Alex's approval after preview

const { sendEmail } = require('./send.js');

const batch = [
  {
    company: "Comvest Partners",
    contact: "Alex Ray",
    title: "MD, Business Development",
    email: "a.ray@comvest.com",
    subject: "Newly Independent PE Platform + AI Capabilities",
    body: `Hi Alex,<br><br>Congrats on the Manulife credit sale - Comvest's newly independent PE arm is perfectly positioned for what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that automate portfolio company operations:<br><br>- Lead generation and outreach automation<br>- Data extraction and CRM hygiene<br>- Process automation across sales, marketing, and ops<br>- Custom AI workflows for specific portfolio needs<br><br>Your Operating Advisory Group could deploy these across your platform companies, creating immediate value and competitive advantage.<br><br>We've worked with PE-backed companies to implement AI that reduces headcount needs, accelerates revenue cycles, and improves data quality.<br><br>Would you be open to a 15-minute call to explore how AI automation could enhance Comvest's value creation playbook?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "GTCR",
    contact: "Joe Rubino",
    title: "Managing Director & CTO, Co-Head of Portfolio Resources Group",
    email: "joe.rubino@gtcr.com",
    subject: "AI Agents for Portfolio Resources",
    body: `Hi Joe,<br><br>As CTO and Co-Head of Portfolio Resources at GTCR, you're likely exploring how AI can scale your support across portfolio companies without adding headcount.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate operations for PE-backed companies:<br><br>- Lead generation and prospect research<br>- Outbound sales automation<br>- Data extraction and CRM management<br>- Custom workflows for marketing, sales, and operations<br><br>Think of us as adding 10-20 hours of work capacity per week to each portfolio company, without hiring.<br><br>Given your technology leadership role, I'd love to show you what's possible. These aren't chatbots - they're autonomous agents that execute repeatable business processes.<br><br>15 minutes to discuss?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "TA Associates",
    contact: "Damon Khouri",
    title: "Chief Information & Technology Officer",
    email: "dkhouri@ta.com",
    subject: "AI Automation for Portfolio Technology",
    body: `Hi Damon,<br><br>As CITO at TA Associates, you're in a unique position to deploy AI capabilities across your entire portfolio.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate business operations:<br><br>- Sales prospecting and lead generation<br>- Outbound email and follow-up sequences<br>- Data extraction and enrichment<br>- Process automation for marketing and operations<br><br>We've worked with PE-backed companies to replace manual work with AI agents, creating measurable ROI in months, not years.<br><br>Your portfolio companies could benefit from a standardized AI automation approach - something your technology team could roll out firm-wide.<br><br>Would you be open to a brief call to explore how this fits with TA's technology strategy?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Francisco Partners",
    contact: "Brian Maury",
    title: "Chief Technology Officer",
    email: "brian.maury@franciscopartners.com",
    subject: "AI Agents for Tech-Focused PE",
    body: `Hi Brian,<br><br>Francisco Partners is known for technology expertise - which makes you the perfect fit for what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that automate operations for growth companies:<br><br>- Lead generation and sales automation<br>- CRM data enrichment and management<br>- Marketing automation and content workflows<br>- Custom process automation<br><br>These agents work 24/7, handling repetitive tasks that typically require headcount. They're particularly powerful for portfolio companies scaling GTM motions.<br><br>Given your CTO role and Francisco's tech focus, you'd immediately understand the leverage this creates. We're not talking about chatbots - these are autonomous systems that execute business processes.<br><br>15 minutes to show you what's possible?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Motive Partners",
    contact: "Chris Williams",
    title: "Managing Director",
    email: "chris.williams@motivepartners.com",
    subject: "AI + Fintech Innovation",
    body: `Hi Chris,<br><br>Motive's focus on fintech innovation and your IOI model (Investor, Operator, Innovator) aligns perfectly with what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that automate operations for financial services and tech companies:<br><br>- Lead generation and prospect research<br>- Outbound sales and follow-up automation<br>- Data extraction and CRM hygiene<br>- Process automation across sales, marketing, and ops<br><br>Your portfolio companies - especially those in payments, lending, and data - could deploy AI agents to scale operations without proportional headcount growth.<br><br>We've worked with fintech companies to automate manual workflows, improving both efficiency and data quality.<br><br>Would you be open to a 15-minute call to explore how AI automation fits with Motive's value creation approach?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Serent Capital",
    contact: "Neal Sainani",
    title: "SVP, Product & Technology",
    email: "neal.sainani@serentcapital.com",
    subject: "AI Automation for Product & Growth",
    body: `Hi Neal,<br><br>As SVP of Product & Technology at Serent, you're likely evaluating AI's role in accelerating portfolio company growth.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate business operations:<br><br>- Lead generation and qualification<br>- Sales outreach and follow-up<br>- Data enrichment and CRM management<br>- Marketing automation and content workflows<br><br>Serent's 25-person Growth Team could use these agents to scale support across more portfolio companies without adding headcount.<br><br>We've worked with SaaS and tech-enabled services companies to deploy AI that creates immediate operational leverage - perfect for Serent's growth-focused model.<br><br>15 minutes to discuss how this could enhance your product and technology strategy?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "PSG Equity",
    contact: "Bill Aliber",
    title: "Managing Director",
    email: "william.aliber@psgequity.com",
    subject: "AI Agents for Software-Focused PE",
    body: `Hi Bill,<br><br>PSG's focus on software companies makes you an ideal partner for what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that automate operations:<br><br>- Lead generation and prospect research<br>- Outbound sales automation<br>- CRM data enrichment<br>- Process automation for marketing and operations<br><br>Your portfolio companies - especially those in SaaS and tech-enabled services - can deploy these agents to scale GTM motions without proportional headcount growth.<br><br>We've worked with software companies to implement AI automation that reduces manual work, accelerates revenue cycles, and improves data quality.<br><br>Would you be open to a 15-minute call to explore how AI fits into PSG's value creation playbook?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Charlesbank Capital Partners",
    contact: "John Flannery",
    title: "Managing Director, Head of Portfolio Resources Group",
    email: "jflannery@charlesbank.com",
    subject: "AI Agents for Portfolio Resources",
    body: `Hi John,<br><br>As Head of Portfolio Resources at Charlesbank, you're perfectly positioned to deploy AI capabilities across your entire portfolio.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate business operations:<br><br>- Lead generation and sales prospecting<br>- Outbound email and follow-up sequences<br>- Data extraction and CRM management<br>- Custom workflows for marketing, sales, and ops<br><br>Your Portfolio Resources Group could use these agents to scale support across portfolio companies without adding team members.<br><br>We've worked with PE-backed companies to implement AI that creates measurable ROI - reducing manual work, accelerating revenue, and improving data quality.<br><br>15 minutes to discuss how AI automation could enhance Charlesbank's value creation approach?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "HGGC",
    contact: "Holland Reynolds",
    title: "Managing Director, Business Development",
    email: "hreynolds@hggc.com",
    subject: "AI for Tech-Focused PE Platform",
    body: `Hi Holland,<br><br>HGGC's focus on software and tech-enabled services makes you an ideal partner for what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that automate business operations:<br><br>- Lead generation and prospect research<br>- Sales outreach and follow-up automation<br>- CRM data enrichment and hygiene<br>- Process automation across GTM functions<br><br>Your portfolio companies can deploy these agents to scale operations without proportional headcount growth - creating immediate value and competitive advantage.<br><br>We've worked with tech companies to implement AI that reduces manual work, accelerates revenue cycles, and improves operational efficiency.<br><br>Would you be open to a 15-minute call to explore how AI automation fits with HGGC's value creation strategy?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Genstar Capital",
    contact: "Jean-Pierre Conte",
    title: "Chairman",
    email: "jpconte@gencap.com",
    subject: "AI Automation for Portfolio Value Creation",
    body: `Hi Jean-Pierre,<br><br>Genstar's 40B AUM and focus on software and services companies positions you perfectly for what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that automate operations for growth companies:<br><br>- Lead generation and sales prospecting<br>- Outbound automation and follow-up<br>- Data extraction and CRM management<br>- Process automation for marketing and operations<br><br>These agents work 24/7, handling tasks that typically require headcount. They're particularly powerful for portfolio companies scaling GTM motions.<br><br>Given Genstar's scale and operational focus, AI automation could become a standardized value creation tool across your entire platform.<br><br>Would you be open to a brief call to explore this?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Roark Capital Group",
    contact: "Neal Aronson",
    title: "Founder and Managing Partner",
    email: "naronson@roarkcapital.com",
    subject: "AI Automation for Multi-Unit Operations",
    body: `Hi Neal,<br><br>Roark's focus on franchise and multi-unit businesses creates unique opportunities for AI automation at scale.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate operations:<br><br>- Lead generation and local marketing automation<br>- Customer outreach and follow-up<br>- Data extraction and operational reporting<br>- Process automation across locations<br><br>For multi-unit businesses, AI agents can standardize operations, improve customer engagement, and reduce administrative overhead across all locations.<br><br>We've worked with service businesses to implement AI that creates measurable ROI - reducing manual work while improving customer experience.<br><br>Would you be open to a 15-minute call to explore how AI fits into Roark's operational playbook?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Windjammer Capital Investors",
    contact: "John Donahue",
    title: "Managing Director, Business Development",
    email: "jdonahue@windjammercapital.com",
    subject: "AI Agents for Lower Middle Market",
    body: `Hi John,<br><br>Windjammer's focus on lower middle market companies creates perfect opportunities for AI automation - where every efficiency gain has outsized impact.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate business operations:<br><br>- Lead generation and sales prospecting<br>- Outbound automation and follow-up<br>- CRM data management<br>- Process automation for marketing and operations<br><br>For smaller companies, AI agents can replace manual work that would otherwise require hiring, creating immediate value and competitive advantage.<br><br>We've worked with PE-backed companies to implement AI that reduces operational costs while accelerating growth.<br><br>15 minutes to discuss how this could fit with Windjammer's value creation approach?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "MiddleGround Capital",
    contact: "Scot Duncan",
    title: "Portfolio Company Management",
    email: "sduncan@middleground.com",
    subject: "AI Automation for Industrial Services",
    body: `Hi Scot,<br><br>MiddleGround's focus on industrial services and value creation creates great opportunities for AI automation.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate operations:<br><br>- Lead generation and customer prospecting<br>- Outbound sales and follow-up automation<br>- Data extraction and reporting<br>- Process automation for sales and operations<br><br>Industrial services companies can use AI agents to scale customer acquisition, improve operational efficiency, and reduce administrative overhead.<br><br>We've worked with services businesses to implement AI that creates measurable ROI - reducing manual work while accelerating revenue growth.<br><br>Would you be open to a 15-minute call to explore how AI fits into your portfolio management approach?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Patient Square Capital",
    contact: "Sam Saini",
    title: "Head of Technology",
    email: "ssaini@patientsquarecapital.com",
    subject: "AI for Healthcare Portfolio Technology",
    body: `Hi Sam,<br><br>As Head of Technology at Patient Square, you're in a unique position to deploy AI across your healthcare portfolio.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate operations:<br><br>- Patient lead generation and outreach<br>- Provider prospecting and relationship management<br>- Data extraction and reporting automation<br>- Process automation for administrative tasks<br><br>Healthcare companies face unique operational challenges where AI can create immediate impact - reducing administrative burden, improving patient engagement, and scaling operations.<br><br>We've worked with healthcare services companies to implement AI that reduces costs while improving outcomes.<br><br>15 minutes to discuss how AI automation could enhance your technology strategy?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Alpine Investors",
    contact: "Audrey Harris",
    title: "Head of Marketing",
    email: "aharris@alpineinvestors.com",
    subject: "AI for PeopleFirst Portfolio Companies",
    body: `Hi Audrey,<br><br>Alpine's PeopleFirst approach and focus on business services creates perfect alignment with what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that automate operations while freeing your people for higher-value work:<br><br>- Lead generation and sales prospecting<br>- Outbound automation and customer follow-up<br>- Marketing content and campaign automation<br>- Data management and operational reporting<br><br>Your 190+ portfolio companies in 2025 could benefit from standardized AI automation - something your platform team could roll out firm-wide.<br><br>We've worked with PE-backed services companies to implement AI that reduces manual work while improving customer experience.<br><br>Would you be open to a 15-minute call to explore this?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Capstreet",
    contact: "Michelle Lewis",
    title: "Principal, Head of Business Development",
    email: "MLewis@capstreet.com",
    subject: "AI for Capvalue Framework",
    body: `Hi Michelle,<br><br>Capstreet's Capvalue Framework and focus on value creation makes you an ideal partner for what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that automate business operations:<br><br>- Lead generation and customer prospecting<br>- Sales outreach and follow-up automation<br>- Data extraction and CRM management<br>- Process automation for marketing and operations<br><br>Your portfolio companies in industrial distribution, manufacturing, and tech-enabled services can deploy AI agents to scale operations without proportional headcount growth.<br><br>We've worked with services and industrial companies to implement AI that creates measurable ROI - reducing manual work while accelerating revenue.<br><br>15 minutes to discuss how AI fits into the Capvalue Framework?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Levine Leichtman Capital Partners",
    contact: "Lauren Leichtman",
    title: "Co-Founder & President",
    email: "lleichtman@llcp.com",
    subject: "AI Automation for Structured PE",
    body: `Hi Lauren,<br><br>Levine Leichtman's structured PE approach and Inc Founder-Friendly recognition suggests you value operational efficiency and growth.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate business operations:<br><br>- Lead generation and sales automation<br>- Outbound campaigns and follow-up<br>- Data enrichment and CRM hygiene<br>- Process automation for marketing and operations<br><br>Your portfolio companies can deploy AI agents to scale operations while maintaining lean teams - creating immediate value and competitive advantage.<br><br>We've worked with PE-backed companies to implement AI that reduces operational costs while accelerating growth.<br><br>Would you be open to a brief call to explore how AI fits into your value creation approach?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "TZP Group",
    contact: "Jarrad Berman",
    title: "Partner, Portfolio Growth",
    email: "jberman@tzpgroup.com",
    subject: "AI for Portfolio Growth Acceleration",
    body: `Hi Jarrad,<br><br>Your Portfolio Growth role at TZP - combined with your Facebook ecommerce marketing background - makes you perfect for what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that accelerate portfolio company growth:<br><br>- Lead generation and customer prospecting<br>- Sales outreach and nurture automation<br>- Marketing campaign execution<br>- Data extraction and reporting<br><br>These agents work 24/7, handling tasks that typically require marketing and sales headcount. They're particularly powerful for B2B companies scaling their GTM motion.<br><br>Given your growth acceleration focus, you'd immediately see how AI creates leverage across your portfolio.<br><br>15 minutes to show you what's possible?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Gauge Capital",
    contact: "Andrew Peix",
    title: "Partner, Business Development",
    email: "apeix@gaugecapital.com",
    subject: "AI for Business Development & Portfolio Growth",
    body: `Hi Andrew,<br><br>As Partner for Business Development at Gauge Capital, you're perfectly positioned to understand how AI can accelerate portfolio company growth.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate business operations:<br><br>- Lead generation and prospect research<br>- Outbound sales and follow-up automation<br>- CRM data enrichment and management<br>- Process automation for marketing and operations<br><br>Your portfolio companies can deploy AI agents to scale BD and GTM functions without proportional headcount growth.<br><br>We've worked with PE-backed companies to implement AI that creates immediate operational leverage - reducing manual work while accelerating revenue.<br><br>Would you be open to a 15-minute call to explore this?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "ShoreView Industries",
    contact: "Garrett Davis",
    title: "Business Development",
    email: "garrett@shoreview.com",
    subject: "AI for Industrial Services Portfolio",
    body: `Hi Garrett,<br><br>ShoreView's focus on middle market industrials creates great opportunities for AI automation.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate operations for industrial and services companies:<br><br>- Customer lead generation and prospecting<br>- Sales outreach and follow-up automation<br>- Data extraction and operational reporting<br>- Process automation for sales and operations<br><br>Industrial companies can use AI agents to scale customer acquisition, improve operational efficiency, and reduce administrative overhead.<br><br>We've worked with manufacturing and services businesses to implement AI that creates measurable ROI - reducing costs while accelerating growth.<br><br>15 minutes to discuss how AI fits with ShoreView's value creation approach?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Revelstoke Capital Partners",
    contact: "Cy Barton-Dobenin",
    title: "Principal",
    email: "cbarton@revelstokecapital.com",
    subject: "AI Automation for Value Creation",
    body: `Hi Cy,<br><br>Revelstoke's focus on operational improvement and value creation aligns perfectly with what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that automate business operations:<br><br>- Lead generation and customer prospecting<br>- Sales outreach and follow-up automation<br>- Data extraction and CRM management<br>- Process automation for marketing and operations<br><br>Portfolio companies can deploy AI agents to scale operations without proportional headcount growth - creating immediate value and competitive advantage.<br><br>We've worked with PE-backed companies to implement AI that reduces operational costs while accelerating growth.<br><br>Would you be open to a 15-minute call to explore how AI automation fits with Revelstoke's value creation playbook?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Pritzker Private Capital",
    contact: "Jeff Carlson",
    title: "Principal - Head of Technology",
    email: "jcarlson@ppcpartners.com",
    subject: "AI Agents for Portfolio Technology",
    body: `Hi Jeff,<br><br>As Head of Technology at Pritzker Private Capital, you're in a unique position to deploy AI capabilities across your portfolio.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate operations:<br><br>- Lead generation and sales prospecting<br>- Outbound automation and follow-up<br>- Data extraction and reporting<br>- Process automation for sales, marketing, and ops<br><br>Your manufacturing and services portfolio companies could benefit from standardized AI automation - something your technology team could roll out firm-wide.<br><br>We've worked with industrial and services companies to implement AI that creates measurable ROI - reducing manual work while accelerating growth.<br><br>15 minutes to discuss how AI fits with your technology strategy?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "GI Partners",
    contact: "Brett Derby",
    title: "Vice President, Portfolio Operations",
    email: "bderby@gipartners.com",
    subject: "AI for Portfolio Operations",
    body: `Hi Brett,<br><br>As VP of Portfolio Operations at GI Partners, you're perfectly positioned to understand how AI can scale your support across portfolio companies.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate business operations:<br><br>- Lead generation and customer prospecting<br>- Sales automation and follow-up<br>- Data extraction and operational reporting<br>- Process automation for marketing and operations<br><br>Your portfolio operations team could use these agents to scale support across more companies without adding headcount.<br><br>We've worked with PE-backed companies to implement AI that creates immediate operational leverage - reducing manual work while improving efficiency.<br><br>Would you be open to a 15-minute call to explore this?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Resurgens Technology Partners",
    contact: "Fred Sturgis",
    title: "Managing Director",
    email: "fred@resurgenstech.com",
    subject: "AI for Tech-Enabled Services",
    body: `Hi Fred,<br><br>Resurgens' focus on tech-enabled business services makes you an ideal partner for what we're building at <a href="https://hellogumbo.com">Gumbo</a>.<br><br>We build AI agents that automate operations:<br><br>- Lead generation and prospect research<br>- Sales outreach and follow-up automation<br>- Data extraction and CRM management<br>- Process automation for marketing and operations<br><br>Tech-enabled services companies are perfect for AI automation - these agents can handle repeatable tasks that typically require headcount, creating immediate value.<br><br>We've worked with services and technology companies to implement AI that reduces operational costs while accelerating growth.<br><br>15 minutes to discuss how AI fits with Resurgens' operating partner model?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  },
  {
    company: "Bow River Capital",
    contact: "Blair E. Richardson",
    title: "Founder & CEO",
    email: "richardson@bowrivercapital.com",
    subject: "AI Automation for Multi-Strategy Platform",
    body: `Hi Blair,<br><br>Bow River's multi-strategy approach and focus on healthcare, industrial, and tech-enabled services creates perfect opportunities for AI automation.<br><br>We're <a href="https://hellogumbo.com">Gumbo</a> - we build AI agents that automate operations:<br><br>- Lead generation and customer prospecting<br>- Sales outreach and follow-up automation<br>- Data extraction and operational reporting<br>- Process automation across functions<br><br>Your portfolio companies across multiple sectors could benefit from standardized AI automation - creating immediate value and competitive advantage.<br><br>We've worked with PE-backed companies to implement AI that reduces operational costs while accelerating growth.<br><br>Would you be open to a brief call to explore how AI fits into Bow River's value creation approach?<br><br>Best,<br>Jim<br><a href="https://hellogumbo.com">Gumbo</a>`
  }
];

// Function to send all emails with delay
async function sendBatch() {
  console.log(`Preparing to send ${batch.length} emails...`);
  console.log('⚠️  DO NOT RUN - WAIT FOR ALEX APPROVAL ⚠️\n');
  
  for (let i = 0; i < batch.length; i++) {
    const email = batch[i];
    console.log(`[${i + 1}/${batch.length}] ${email.company} - ${email.contact} (${email.email})`);
    
    try {
      await sendEmail(
        email.email,
        email.subject,
        email.body,
        ['jeff@hellogumbo.com', 'alex@hellogumbo.com'] // BCC
      );
      console.log(`✓ Sent successfully\n`);
      
      // Wait 2 seconds between sends
      if (i < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`✗ Failed: ${error.message}\n`);
    }
  }
  
  console.log('Batch send complete!');
}

// Export for manual execution only
module.exports = { batch, sendBatch };

console.log('\n⚠️  BATCH SCRIPT LOADED - DO NOT AUTO-RUN ⚠️');
console.log(`Total emails prepared: ${batch.length}`);
console.log('Run sendBatch() manually after Alex approves the preview\n');
