const { sendEmail } = require('./send.js');

(async () => {
  const to = 'alex@hellogumbo.com';
  const subject = 'AI infrastructure for healthcare service platforms';
  const body = `Hi Jeff,<br><br>I noticed JLL Partners' focus on healthcare and business services — two sectors where AI infrastructure is quickly becoming table stakes.<br><br>I work with <a href="https://hellogumbo.com">Gumbo</a>, a lean AI engineering team that's helped PE-backed companies build scalable AI tools without the bloat of traditional consultancies. We've worked with portfolio companies that needed practical automation — customer support triage, operational workflow tools, data pipelines — without spinning up full in-house AI teams.<br><br>Given your role as Chief AI Officer, I imagine you're evaluating where AI can drive real operational leverage across JLL's portfolio. Would you be open to a quick call to discuss what we've seen work (and what doesn't) in similar middle-market platforms?<br><br>Happy to share a few recent examples.<br><br>Best,<br>Jim`;
  
  await sendEmail(to, subject, body);
  console.log('\n📧 Draft email sent to alex@hellogumbo.com for review');
})().catch(console.error);
