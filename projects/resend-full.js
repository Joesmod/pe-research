const { execSync } = require('child_process');
const path = require('path');
const sendJs = path.join(__dirname, 'gmail-outreach', 'send.js');
const recipients = ['alex@hellogumbo.com', 'ben@lyleburn.com', 'jeff@hellogumbo.com', 'steve@hellogumbo.com'];

const drafts = [
  {
    subject: 'Draft Outreach Email (1 of 5) - Knox Capital',
    body: `DRAFT 1 - Knox Capital (Alex Gregor, Founder and Partner)
Score: 9 | Focus: Tech-enabled services

Subject line: AI engineering capacity for Knox portfolio companies

---

Hi Alex,

I'm reaching out from Gumbo, an AI-first product and engineering studio. We build and integrate AI systems (LLMs, agents, RAG pipelines, computer vision) for companies that need to ship fast without building a full internal team.

Knox Capital's focus on tech-enabled services caught our attention. A lot of the portfolio companies we work with are in a similar spot -- they know AI can unlock value but don't have the in-house bench to build it right.

We staff dedicated pods (senior engineers, technical PM, embedded design) and typically deliver 2-3x the output of a traditional dev shop using AI-augmented workflows. Engagements are flexible -- anything from a focused MVP build to ongoing product development.

Would it be worth a 15-minute call to see if there's a fit for any of your current portfolio companies?

Best,
Jim
Gumbo | hellogumbo.com`
  },
  {
    subject: 'Draft Outreach Email (2 of 5) - Kohlberg & Company',
    body: `DRAFT 2 - Kohlberg & Company (Michael Bogobowicz, Operating Executive, AI & Data)
Score: 9 | Focus: Healthcare, Industrial, Financial Services

Subject line: Partnering on AI implementation across Kohlberg portfolio

---

Hi Michael,

Your role overseeing AI and data across Kohlberg's portfolio is exactly why I wanted to reach out. We're Gumbo -- an AI-first engineering studio that builds production AI systems: LLM integrations, agent workflows, RAG pipelines, NLP, and computer vision.

We work as embedded pods with portfolio companies, which means we plug in fast and ship weekly. For operating partners like you evaluating where AI can drive value, we've found that having a technical team that understands both the AI landscape and how to actually ship product makes the difference between a pilot that stalls and one that scales.

I'd love to learn more about what you're seeing across the portfolio and where the biggest opportunities are. Would a quick call make sense?

Best,
Jim
Gumbo | hellogumbo.com`
  },
  {
    subject: 'Draft Outreach Email (3 of 5) - Diversis Capital',
    body: `DRAFT 3 - Diversis Capital (Kevin Ma, Co-Founder & Managing Partner)
Score: 9 | Focus: Software, Tech-Enabled Services

Subject line: AI engineering studio for Diversis portfolio builds

---

Hi Kevin,

Gumbo is an AI-first product and engineering studio -- we help companies build and ship AI-powered software (LLM systems, agents, RAG, computer vision) without needing to hire a full internal AI team.

Given Diversis's focus on software and tech-enabled services, I imagine many of your portfolio companies are either building AI features into existing products or exploring AI-driven operational improvements. That's our sweet spot. We staff dedicated pods that integrate directly with your teams and deliver weekly.

Would it be useful to connect and see if there's alignment with any current or upcoming portfolio needs?

Best,
Jim
Gumbo | hellogumbo.com`
  },
  {
    subject: 'Draft Outreach Email (4 of 5) - Align Capital Partners',
    body: `DRAFT 4 - Align Capital Partners (Katie Noggle, Partner, Business Development)
Score: 8 | Focus: B2B software, professional services, industrial services

Subject line: AI development partner for Align's B2B portfolio

---

Hi Katie,

I'm Jim with Gumbo, an AI-first engineering studio. We build production AI systems -- LLM integrations, intelligent agents, data pipelines -- for B2B companies that want to move fast.

Align's portfolio in B2B software and professional services is a natural fit. We've seen that mid-market B2B companies often have the highest ROI from AI -- whether it's automating internal workflows, building smarter customer-facing features, or creating entirely new product lines. But they usually don't have the specialized AI engineering talent to execute.

That's where we come in. Dedicated pod, ships weekly, fully integrated with your team's stack.

Happy to share more about how we work if it's relevant to anything in the portfolio. Worth a quick chat?

Best,
Jim
Gumbo | hellogumbo.com`
  },
  {
    subject: 'Draft Outreach Email (5 of 5) - Gauge Capital',
    body: `DRAFT 5 - Gauge Capital (Andrew Peix, Partner, Business Development)
Score: 8 | Focus: Business services, healthcare services, consumer services

Subject line: Engineering capacity for AI initiatives at Gauge portfolio cos

---

Hi Andrew,

Gumbo is an AI-first product and engineering studio. We build and deploy AI systems -- LLMs, agents, RAG pipelines, NLP, computer vision -- as embedded teams within companies that need to ship without the overhead of building an internal AI org.

With Gauge's focus on business and healthcare services, I'd imagine there are portfolio companies exploring how AI can improve operations, customer experience, or product differentiation. We staff dedicated pods that integrate directly, maintain a shared backlog, and deliver weekly.

If any of that resonates with what you're seeing across the portfolio, I'd welcome a quick conversation.

Best,
Jim
Gumbo | hellogumbo.com`
  }
];

(async () => {
  for (const d of drafts) {
    for (const to of recipients) {
      try {
        const out = execSync(`node "${sendJs}" send "${to}" "${d.subject}" "${d.body.replace(/"/g, '\\"')}"`, { encoding: 'utf8', timeout: 30000 });
        console.log(`${to}: ${out.trim()}`);
      } catch (e) {
        console.error(`FAIL ${to}: ${e.message.split('\n')[0]}`);
      }
    }
    console.log('---');
  }
})();
