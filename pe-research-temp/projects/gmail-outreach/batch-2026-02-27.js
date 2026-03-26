const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const { checkDedup } = require('./dedup-guard');

function getAuth2() {
  const creds = JSON.parse(fs.readFileSync(__dirname + '/credentials.json'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(__dirname + '/token.json'));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function sendEmail(to, subject, body) {
  const blocked = ['heygumbo.com'];
  const domain = to.split('@')[1]?.toLowerCase();
  if (blocked.includes(domain)) throw new Error(`BLOCKED: "${to}" uses blocked domain`);

  const gmail2 = google.gmail({ version: 'v1', auth: getAuth2() });
  const htmlBody = body.split(/\n\n+/).map(p => p.replace(/\n/g, ' ').trim()).join('<br><br>');
  const bcc = 'jeff@hellogumbo.com, alex@hellogumbo.com';
  const signature = `<br><br>--<br>Jim Jensen<br><a href="https://hellogumbo.com">Gumbo</a> | <a href="https://hellogumbo.com">hellogumbo.com</a><br>AI-first engineering, served simple.<br><a href="mailto:jim@hellogumbo.com">jim@hellogumbo.com</a>`;
  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nBcc: ${bcc}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}${signature}</div>`
  ).toString('base64url');
  const res = await gmail2.users.messages.send({ userId: 'me', requestBody: { raw } });
  return res.data;
}

const emails = [
  {
    to: 'upmanb@shoreview.com',
    name: 'Brittney',
    subject: 'AI ops for healthcare and industrial services portfolios',
    co: 'ShoreView Industries',
    cRowIdx: 270,
    s1RowIdx: 14,
    body: `Hi Brittney,

ShoreView's focus on business services, healthcare, and industrial companies -- like American Eye Associates and Winzer -- is right in our wheelhouse. These are the kinds of businesses where targeted automation delivers fast, measurable ROI.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom automation and AI tools for PE portfolio companies. We handle everything from workflow automation to AI-powered reporting -- practical builds that ship in weeks, not months.

A few things we have built recently: AI agents that automate repetitive back-office processes, reporting dashboards that replace manual Excel work, and integration layers that connect disconnected systems across portfolio companies.

Would it make sense to set up a quick call to explore where AI could drive value across ShoreView's portfolio?`
  },
  {
    to: 'mogrady@palladiumequity.com',
    name: 'Meahgan',
    subject: 'Scaling AI across multi-sector portfolio companies',
    co: 'Palladium Equity Partners',
    cRowIdx: 286,
    s1RowIdx: 19,
    body: `Hi Meahgan,

Palladium's diversified portfolio across business services, consumer, healthcare, and industrial creates real opportunities for AI-driven efficiency gains that compound across sectors.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. Think workflow automation, data pipeline modernization, and AI agents that handle operational tasks -- the kind of work that drives EBITDA impact without massive headcount increases.

We deliver working software in weeks. No strategy decks, no six-month discovery phases -- just practical tools that move the needle.

Would you be open to a brief conversation about where AI could create value across Palladium's portfolio?`
  },
  {
    to: 'eric.haufler@inclineequity.com',
    name: 'Eric',
    subject: 'AI automation for distribution and manufacturing portfolios',
    co: 'Incline Equity Partners',
    cRowIdx: 308,
    s1RowIdx: 26,
    body: `Hi Eric,

Incline's focus on distribution, specialized manufacturing, and services in the lower middle market is exactly where we see AI delivering outsized returns. These businesses often run on manual processes that are ripe for intelligent automation.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. We specialize in practical, high-impact builds: automated reporting, AI agents for operational workflows, and integration systems that connect fragmented tech stacks.

For distribution companies specifically, we have seen AI cut order processing time in half and dramatically reduce manual data entry across the board.

Open to a quick call to discuss where automation could accelerate Incline's portfolio companies?`
  },
  {
    to: 'mollyk@parthenoncapital.com',
    name: 'Molly',
    subject: 'AI tools for financial services and healthcare portfolio ops',
    co: 'Parthenon Capital Partners',
    cRowIdx: 315,
    s1RowIdx: 32,
    body: `Hi Molly,

Parthenon's depth across financial services, healthcare services, and business services -- with 50+ platforms under your belt -- creates a lot of surface area for AI-driven operational improvements.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom automation and AI tools for PE portfolio companies. We focus on practical builds that ship fast: workflow automation, data infrastructure modernization, and AI agents that handle repetitive operational tasks.

What sets us apart is speed. We deliver working software in weeks, not quarters -- which matters when you are trying to drive value creation across a large portfolio.

Would it make sense to have a quick conversation about where AI could move the needle for Parthenon's portfolio companies?`
  },
  {
    to: 'apetersen@nautic.com',
    name: 'Allan',
    subject: 'AI-driven efficiency for healthcare and industrial services',
    co: 'Nautic Partners',
    cRowIdx: 316,
    s1RowIdx: 33,
    body: `Hi Allan,

With 140+ investments and a heavy focus on healthcare, industrial, and outsourced services, Nautic has the kind of portfolio where AI automation creates compounding returns across companies.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We handle everything from back-office workflow automation to customer-facing AI features -- practical builds that drive measurable results.

As COO and Managing Director, you are probably seeing the same thing we hear from other firms: there is a huge gap between AI hype and actual implementation at the portfolio level. We bridge that gap with fast, focused builds.

Would you be open to a 15-minute call to explore where AI could drive value across Nautic's portfolio?`
  },
  {
    to: 'mrude@cresseyco.com',
    name: 'Mike',
    subject: 'AI automation for healthcare services and health IT portfolios',
    co: 'Cressey & Company',
    cRowIdx: 339,
    s1RowIdx: 36,
    body: `Hi Mike,

Cressey's focus on healthcare services and healthcare IT -- including companies like InterMed Group -- puts you at the intersection where AI delivers the most impact. Healthcare operations are full of manual processes that intelligent automation can transform.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. As an Operating Partner, you know that real value creation comes from operational improvement, not just financial engineering.

We build things like automated patient intake workflows, AI-powered reporting dashboards, and integration systems that connect fragmented healthcare tech stacks -- all delivered in weeks.

Would it make sense to have a quick conversation about where AI could accelerate value creation across Cressey's portfolio?`
  },
  {
    to: 'berger@windrose.com',
    name: 'Adam',
    subject: 'AI tools for healthcare IT and outsourced care management',
    co: 'WindRose Health Investors',
    cRowIdx: 348,
    s1RowIdx: 56,
    body: `Hi Adam,

WindRose's portfolio -- TrustHCS in revenue cycle management, the naviHealth exit, Ovation Fertility -- shows a clear thesis around tech-enabled healthcare services. That is exactly where we see AI delivering the fastest ROI.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. For healthcare IT companies specifically, we build things like automated coding and billing workflows, intelligent document processing, and AI agents that handle repetitive operational tasks.

As an Operating Partner focused on healthcare, you are probably evaluating where AI fits into the value creation playbook. We help firms move from evaluation to implementation fast.

Open to a brief call to discuss where AI could create value for WindRose's current portfolio?`
  },
  {
    to: 'jroberts@trivest.com',
    name: 'Jared',
    subject: 'AI-powered ops for founder-owned business portfolios',
    co: 'Trivest Partners',
    cRowIdx: 356,
    s1RowIdx: 57,
    body: `Hi Jared,

Trivest's focus on founder- and family-owned businesses across business services, consumer, distribution, and healthcare -- including companies like HealthDrive -- creates unique opportunities for AI. These companies often have strong fundamentals but haven't yet tapped into automation.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We specialize in practical builds that ship in weeks: workflow automation, reporting dashboards, and AI agents that handle repetitive tasks.

For founder-owned businesses specifically, we often see quick wins in automating manual processes that were never prioritized during the growth phase.

Would you be open to a quick call to explore where AI could drive value across Trivest's portfolio?`
  },
  {
    to: 'jgwozdz@edisonpartners.com',
    name: 'Joseph',
    subject: 'AI implementation for fintech and enterprise software portfolios',
    co: 'Edison Partners',
    cRowIdx: 375,
    s1RowIdx: 90,
    body: `Hi Joseph,

Edison's focus on FinTech, Healthcare IT, and Enterprise Software -- with companies like KnowledgeLake and Budderfly in the portfolio -- tells me you understand the power of technology-driven value creation.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI tools and automation for PE portfolio companies. As an Operating Partner, you have probably seen the gap between what AI promises and what actually gets implemented. We bridge that gap with fast, practical builds.

We have built AI agents for customer service automation, intelligent document processing pipelines, and reporting systems that replace manual workflows -- all shipped in weeks, not months.

Would it make sense to set up a quick call to discuss where AI could accelerate value creation across Edison's portfolio?`
  },
  {
    to: 'erichsu@trivecapital.com',
    name: 'Eric',
    subject: 'AI automation for mid-market services and industrial companies',
    co: 'Trive Capital',
    cRowIdx: 392,
    s1RowIdx: 109,
    body: `Hi Eric,

Trive's focus on business services, industrial services, and healthcare in the mid-market -- companies like NxEdge -- is exactly where we see AI delivering outsized operational improvements.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We focus on practical builds that drive measurable results: workflow automation, AI-powered reporting, and integration systems that connect fragmented operations.

For services businesses specifically, we have seen AI reduce back-office processing time by 50% or more -- directly impacting margins.

Open to a brief conversation about where AI could move the needle for Trive's portfolio companies?`
  },
  {
    to: 'wrichter@llcp.com',
    name: 'Weston',
    subject: 'AI tools for franchising and business services portfolios',
    co: 'Levine Leichtman Capital Partners',
    cRowIdx: 399,
    s1RowIdx: 112,
    body: `Hi Weston,

LLCP's portfolio across business services, franchising, education, and training -- companies like Signature Resolution, Expert Institute, and Zero100 -- has a lot of potential for AI-driven value creation. Multi-location and knowledge-intensive businesses are where automation compounds fastest.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We deliver working software in weeks: AI agents for repetitive workflows, intelligent reporting systems, and integration layers that unify operations across locations.

Would it make sense to set up a quick call to explore where AI could drive efficiency across LLCP's portfolio?`
  },
  {
    to: 'athimmaya@flexpointford.com',
    name: 'Arjun',
    subject: 'AI-powered automation for financial services and healthcare',
    co: 'Flexpoint Ford',
    cRowIdx: 415,
    s1RowIdx: 191,
    body: `Hi Arjun,

Flexpoint Ford's focus on financial services and healthcare -- two sectors drowning in manual processes -- is exactly where AI delivers the fastest ROI for PE portfolios.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. For insurance platforms and healthcare services specifically, we build things like automated claims processing, intelligent document handling, and AI agents that streamline back-office operations.

We ship working software in weeks, not quarters -- which matters when you are trying to drive value creation on a PE timeline.

Would you be open to a brief call to discuss where AI could create value across Flexpoint Ford's portfolio?`
  },
  {
    to: 'kpark@harvestmp.com',
    name: 'Kyle',
    subject: 'AI ops for middle-market services companies',
    co: 'Harvest Partners',
    cRowIdx: 425,
    s1RowIdx: 9,
    body: `Hi Kyle,

Harvest Partners' focus on business and industrial services, healthcare, and consumer -- all in the middle market -- is exactly where we see AI creating outsized value. These businesses often run on manual processes that are ready for intelligent automation.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We specialize in fast, practical builds: workflow automation, AI-powered reporting, and integration systems that connect fragmented tech stacks.

As Co-Founder, you have seen the full arc of value creation in PE. AI is the next lever -- and we help firms pull it faster than building an in-house team.

Open to a quick call to explore where AI could drive value across Harvest Partners' portfolio?`
  },
  {
    to: 'gmittal@thl.com',
    name: 'Gaurav',
    subject: 'AI implementation across healthcare and software portfolios',
    co: 'THL Partners',
    cRowIdx: 433,
    s1RowIdx: 11,
    body: `Hi Gaurav,

THL's portfolio across healthcare services, business services, and software -- including pharma services and tech-enabled businesses -- has significant potential for AI-driven operational improvements.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We build things like automated data pipelines, AI agents for operational workflows, and intelligent reporting systems -- all delivered in weeks.

For tech-enabled services companies, we often see the biggest wins in automating the operational layer that sits behind the technology product itself.

Would it make sense to have a quick conversation about where AI could accelerate value creation across THL's portfolio?`
  },
  {
    to: 'gbenson@hggc.com',
    name: 'Greg',
    subject: 'AI-powered value creation for tech and services portfolios',
    co: 'HGGC',
    cRowIdx: 454,
    s1RowIdx: 23,
    body: `Hi Greg,

HGGC's portfolio -- AutoAlert, Dealer-FX, MyCase, Scout, Serena Software -- shows a clear affinity for technology-driven businesses. That makes the next logical step clear: deploying AI across those platforms to drive even more efficiency and growth.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We specialize in practical builds that ship fast: AI agents for customer-facing and internal workflows, intelligent data processing, and automation that reduces operational overhead.

For tech companies already in your portfolio, we often see quick wins in automating support, accelerating product features with AI, and streamlining internal operations.

Would you be open to a brief call to discuss where AI could create additional value across HGGC's portfolio?`
  },
  {
    to: 'garrett@sentinelpartners.com',
    name: 'Josh',
    subject: 'AI automation for lower midmarket services companies',
    co: 'Sentinel Capital Partners',
    cRowIdx: 462,
    s1RowIdx: 285,
    body: `Hi Josh,

Sentinel's focus on lower midmarket business services, consumer, healthcare, and industrial companies is right in our sweet spot. These are the businesses where AI automation creates the most leverage -- established operations with manual processes ready for modernization.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We deliver practical builds in weeks: workflow automation, AI-powered reporting, and integration systems that unify fragmented operations.

For lower midmarket companies specifically, we have seen AI implementation be a real differentiator -- the kind of operational upgrade that drives margin expansion without major capital expenditure.

Open to a quick call to explore where AI could move the needle for Sentinel's portfolio?`
  },
  {
    to: 'tom.miller@serentcapital.com',
    name: 'Tom',
    subject: 'AI tools for B2B software and tech-enabled services portfolios',
    co: 'Serent Capital',
    cRowIdx: 484,
    s1RowIdx: 63,
    body: `Hi Tom,

Serent's 70+ portfolio companies across B2B software, tech-enabled services, healthcare IT, and industrial software is exactly the kind of scale where AI-driven operational improvements compound fast.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We build things like AI agents for customer operations, automated data pipelines, and intelligent reporting -- practical tools that ship in weeks and drive measurable results.

With a portfolio that size, even small efficiency gains per company add up to significant value creation at the fund level.

Would it make sense to set up a quick call to discuss where AI could drive value across Serent's portfolio?`
  },
  {
    to: 'ckolb@quadcp.com',
    name: 'Christine',
    subject: 'AI for education, healthcare, and professional services portfolios',
    co: 'Quad Partners',
    cRowIdx: 493,
    s1RowIdx: 107,
    body: `Hi Christine,

Quad's focus on knowledge-based services companies in education, healthcare, and professional services is a natural fit for AI. These are information-heavy businesses where intelligent automation delivers immediate, measurable impact.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. For knowledge-based services specifically, we build things like automated content processing, AI-powered workflow tools, and intelligent reporting systems.

We ship in weeks, not months -- which matters when you are focused on accelerating growth and driving value creation on a PE timeline.

Would you be open to a brief conversation about where AI could create value across Quad's portfolio?`
  },
  {
    to: 'jjohnson@blackfordcapital.com',
    name: 'Jeffrey',
    subject: 'AI automation for manufacturing and distribution portfolios',
    co: 'Blackford Capital',
    cRowIdx: 500,
    s1RowIdx: 130,
    body: `Hi Jeffrey,

Blackford's focus on manufacturing, distribution, and services in the lower middle market is exactly where we see AI delivering outsized returns. These businesses often have strong fundamentals but run on legacy processes that are ripe for automation.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We build things like automated order processing, AI-powered quality control tools, and reporting systems that replace manual data wrangling.

For manufacturing and distribution specifically, we have seen AI dramatically reduce processing times and operational overhead without adding headcount.

Open to a quick call to explore where AI could drive value across Blackford's portfolio?`
  },
  {
    to: 'mbrandys@shorecp.com',
    name: 'Matthew',
    subject: 'AI tools for healthcare and knowledge services platforms',
    co: 'Shore Capital Partners',
    cRowIdx: 89,
    s1RowIdx: 3,
    body: `Hi Matthew,

Shore Capital's portfolio -- Soliant Health, Forcura, Medalogix, MGT Solutions -- shows a strong thesis around tech-enabled healthcare and knowledge services. That is exactly where AI implementation creates the most leverage.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. For healthcare and knowledge services, we build things like automated workflow tools, AI-powered reporting, and integration systems that connect fragmented operations across platform companies.

We ship working software in weeks -- fast enough to see results within a single quarter.

Would it make sense to have a quick conversation about where AI could accelerate value creation across Shore Capital's platforms?`
  },
  {
    to: 'cwood@onsitemammography.com',
    name: 'Connor',
    subject: 'AI-driven ops for staffing and business services companies',
    co: 'Olympus Partners',
    cRowIdx: 234,
    s1RowIdx: 6,
    body: `Hi Connor,

Olympus Partners' work across business services, healthcare, financial services, and staffing -- including the Soliant Health exit -- demonstrates a strong track record in services-heavy portfolios. These are the businesses where smart automation drives the most value.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We specialize in practical builds that ship in weeks: workflow automation, AI-powered reporting, and integration systems that connect disconnected operations.

For staffing and services companies, we have seen AI cut administrative overhead significantly -- better candidate matching, automated onboarding workflows, and intelligent scheduling.

Open to a brief call to discuss where AI could create value across Olympus Partners' portfolio?`
  },
  {
    to: 'dgorton@tailwind.com',
    name: 'David',
    subject: 'AI automation for middle market healthcare and services',
    co: 'Tailwind Capital',
    cRowIdx: 249,
    s1RowIdx: 10,
    body: `Hi David,

Tailwind's focus on middle market services, healthcare, and business services creates significant surface area for AI-driven operational improvements. At that scale, even incremental efficiency gains compound fast.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We build practical tools that ship in weeks: automated workflows, AI agents for back-office operations, and reporting systems that replace manual data processes.

Rather than big consulting engagements, we deliver working software fast -- the kind of builds that drive measurable EBITDA impact within a quarter.

Would it make sense to set up a quick call to explore where AI could drive value across Tailwind's portfolio?`
  },
  {
    to: 'paul.matthews@endeavour-capital.com',
    name: 'Paul',
    subject: 'AI tools for Pacific Northwest services and tech portfolios',
    co: 'Endeavour Capital',
    cRowIdx: 361,
    s1RowIdx: 68,
    body: `Hi Paul,

Endeavour's portfolio -- BRG (sold to TowerBrook), CTC Global, CoPilot/Mallory, ENTEK -- across business services, healthcare, technology, and industrial shows a strong operational value creation approach. AI is the next lever for firms like yours.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We focus on practical, high-impact builds: automated workflows, AI agents for operational tasks, and intelligent reporting systems -- all delivered in weeks.

As a Founding Partner, you have built Endeavour on operational excellence. We help portfolio companies take that to the next level with AI that actually works in production.

Would you be open to a brief call to discuss where AI could create value across Endeavour's current portfolio?`
  },
  {
    to: 'rgundry@excellere.com',
    name: 'Ross',
    subject: 'AI automation for lower middle market services platforms',
    co: 'Excellere Partners',
    cRowIdx: 379,
    s1RowIdx: 269,
    body: `Hi Ross,

Excellere's focus on lower middle market business services, healthcare services, and consumer services is right where we see AI making the biggest difference. These companies typically have solid operations but haven't yet tapped into intelligent automation.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. We build practical tools in weeks: workflow automation, AI-powered reporting, and integration systems that connect fragmented operations.

For services platforms, we often see the biggest wins in automating back-office processes and standardizing operations across locations -- directly driving margin expansion.

Open to a quick call to explore where AI could move the needle for Excellere's portfolio?`
  },
  {
    to: 'ali@metamoragrowth.com',
    name: 'Ali',
    subject: 'AI-powered growth for SaaS and tech roll-ups',
    co: 'Metamora Growth Partners',
    cRowIdx: 388,
    s1RowIdx: 98,
    body: `Hi Ali,

Metamora's focus on technology, business services, and SaaS in the lower middle market -- especially tech roll-ups -- is exactly where AI delivers outsized returns. When you are consolidating multiple platforms, intelligent automation can accelerate integration and drive efficiency across the combined entity.

We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom AI and automation tools for PE portfolio companies. For SaaS roll-ups specifically, we build things like AI-powered customer support, automated data migration tools, and unified reporting across acquired entities.

We ship in weeks, not months -- which is critical for roll-up strategies where speed of integration directly impacts returns.

Would it make sense to have a quick conversation about where AI could accelerate value creation for Metamora's portfolio?`
  }
];

async function run() {
  const results = [];
  
  for (const e of emails) {
    try {
      console.log(`\nChecking dedup for ${e.name} at ${e.co} (${e.to})...`);
      const dedupResult = await checkDedup(e.to, e.subject);
      if (dedupResult.blocked) {
        console.log(`SKIPPED: ${dedupResult.reason}`);
        results.push({ ...e, sent: false, error: dedupResult.reason });
        continue;
      }
      console.log(`Sending to ${e.name} at ${e.co} (${e.to})...`);
      const res = await sendEmail(e.to, e.subject, e.body);
      console.log('Sent:', res.id);
      results.push({ ...e, sent: true, messageId: res.id });
      
      // Small delay between sends
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`FAILED for ${e.to}:`, err.message);
      results.push({ ...e, sent: false, error: err.message });
    }
  }
  
  // Update CRM
  console.log('\n=== Updating CRM ===');
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const ts = new Date().toISOString();
  
  for (const e of results) {
    if (!e.sent) continue;
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!I${e.s1RowIdx}:J${e.s1RowIdx}`,
        valueInputOption: 'RAW',
        requestBody: { values: [['Contacted', ts]] }
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Contacts!I${e.cRowIdx}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[ts]] }
      });
      console.log(`Updated CRM for ${e.co}`);
    } catch (err) {
      console.error(`CRM update failed for ${e.co}:`, err.message);
    }
  }
  
  const sentCount = results.filter(r => r.sent).length;
  const failCount = results.filter(r => !r.sent).length;
  console.log(`\n=== SUMMARY ===`);
  console.log(`Sent: ${sentCount} | Failed/Skipped: ${failCount}`);
  results.forEach(r => console.log(`${r.sent ? 'SENT' : 'SKIP'}: ${r.name} @ ${r.co} (${r.to}) - "${r.subject}"${r.error ? ' [' + r.error + ']' : ''}`));
}

run().catch(e => console.error(e));
