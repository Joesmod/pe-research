/**
 * Outreach batch — March 16, 2026 8:00 AM
 * 25 emails to PE contacts
 * 
 * Run: node cron-outreach-batch-march16-8am-SEND.js
 */

const { sendEmail } = require('./send.js');

const batch = [
  {
    "company": "One Rock Capital Partners",
    "score": 341,
    "contact": "Allison Spector",
    "title": "Managing Director, Head of Sustainability",
    "email": "aspector@onerockcapital.com",
    "subject": "AI-driven ops efficiency for One Rock Capital Partners portfolio companies",
    "body": "Hi Allison,\n\nI'm reaching out because One Rock Capital Partners's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Littlejohn & Co.",
    "score": 300,
    "contact": "Brian Michaud",
    "title": "Managing Director",
    "email": "bmichaud@littlejohnllc.com",
    "subject": "AI-driven ops efficiency for Littlejohn & Co. portfolio companies",
    "body": "Hi Brian,\n\nI'm reaching out because Littlejohn & Co.'s focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Union Capital Associates",
    "score": 297,
    "contact": "William Ogden",
    "title": "Managing Director",
    "email": "bill@unioncapitalassociates.com",
    "subject": "AI-driven ops efficiency for Union Capital Associates portfolio companies",
    "body": "Hi William,\n\nI'm reaching out because Union Capital Associates's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Siris Capital Group",
    "score": 234,
    "contact": "Dave Calamai",
    "title": "Managing Director",
    "email": "calamai@siris.com",
    "subject": "AI-driven ops efficiency for Siris Capital Group portfolio companies",
    "body": "Hi Dave,\n\nI'm reaching out because Siris Capital Group's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "BV Investment Partners",
    "score": 231,
    "contact": "Justin Garrison",
    "title": "Managing Director",
    "email": "jgarrison@bvlp.com",
    "subject": "AI-driven ops efficiency for BV Investment Partners portfolio companies",
    "body": "Hi Justin,\n\nI'm reaching out because BV Investment Partners's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Marlin Equity Partners",
    "score": 230,
    "contact": "Nathan Pingelton",
    "title": "Managing Director",
    "email": "npingelton@marlinequity.com",
    "subject": "AI-driven ops efficiency for Marlin Equity Partners portfolio companies",
    "body": "Hi Nathan,\n\nI'm reaching out because Marlin Equity Partners's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Golden Gate Capital",
    "score": 229,
    "contact": "Neale Attenborough",
    "title": "Managing Director",
    "email": "nattenborough@goldengatecap.com",
    "subject": "AI-driven ops efficiency for Golden Gate Capital portfolio companies",
    "body": "Hi Neale,\n\nI'm reaching out because Golden Gate Capital's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Cortec Group",
    "score": 228,
    "contact": "Jesse Moberg",
    "title": "Managing Director",
    "email": "jmoberg@cortecgroup.com",
    "subject": "AI-driven ops efficiency for Cortec Group portfolio companies",
    "body": "Hi Jesse,\n\nI'm reaching out because Cortec Group's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "CID Capital",
    "score": 226,
    "contact": "Tom Shaw",
    "title": "Managing Director",
    "email": "tom@cidcap.com",
    "subject": "AI-driven ops efficiency for CID Capital portfolio companies",
    "body": "Hi Tom,\n\nI'm reaching out because CID Capital's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Pine Brook Partners",
    "score": 225,
    "contact": "Joe Gantz",
    "title": "Managing Director",
    "email": "jgantz@pinebrookpartners.com",
    "subject": "AI-driven ops efficiency for Pine Brook Partners portfolio companies",
    "body": "Hi Joe,\n\nI'm reaching out because Pine Brook Partners's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Clairvest Group",
    "score": 219,
    "contact": "Angus Cole",
    "title": "Managing Director, Partner",
    "email": "angusc@clairvest.com",
    "subject": "AI-driven ops efficiency for Clairvest Group portfolio companies",
    "body": "Hi Angus,\n\nI'm reaching out because Clairvest Group's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Platte River Equity",
    "score": 216,
    "contact": "Eric Crawford",
    "title": "Managing Director",
    "email": "ecrawford@platteriverequity.com",
    "subject": "AI-driven ops efficiency for Platte River Equity portfolio companies",
    "body": "Hi Eric,\n\nI'm reaching out because Platte River Equity's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Mountaingate Capital",
    "score": 215,
    "contact": "Sue Cho",
    "title": "Managing Director",
    "email": "scho@mountaingate.com",
    "subject": "AI-driven ops efficiency for Mountaingate Capital portfolio companies",
    "body": "Hi Sue,\n\nI'm reaching out because Mountaingate Capital's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Rhône Group",
    "score": 206,
    "contact": "Patrick Mundt",
    "title": "Managing Director",
    "email": "mundt@rhonegroup.com",
    "subject": "AI-driven ops efficiency for Rhône Group portfolio companies",
    "body": "Hi Patrick,\n\nI'm reaching out because Rhône Group's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Midwest Growth Partners",
    "score": 205,
    "contact": "Zane Hendricks",
    "title": "Managing Director",
    "email": "zane.hendricks@mgpfund.com",
    "subject": "AI-driven ops efficiency for Midwest Growth Partners portfolio companies",
    "body": "Hi Zane,\n\nI'm reaching out because Midwest Growth Partners's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Kainos Capital",
    "score": 203,
    "contact": "Doug Reader",
    "title": "Senior Managing Director",
    "email": "dreader@kainoscapital.com",
    "subject": "AI-driven ops efficiency for Kainos Capital portfolio companies",
    "body": "Hi Doug,\n\nI'm reaching out because Kainos Capital's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Brentwood Associates",
    "score": 202,
    "contact": "Ryan Foltz",
    "title": "Managing Director",
    "email": "rfoltz@brentwood.com",
    "subject": "AI-driven ops efficiency for Brentwood Associates portfolio companies",
    "body": "Hi Ryan,\n\nI'm reaching out because Brentwood Associates's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Resurgens Technology Partners",
    "score": 201,
    "contact": "Fred Sturgis",
    "title": "Managing Director",
    "email": "fred@resurgenstech.com",
    "subject": "AI-driven ops efficiency for Resurgens Technology Partners portfolio companies",
    "body": "Hi Fred,\n\nI'm reaching out because Resurgens Technology Partners's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Greater Sum Ventures",
    "score": 9,
    "contact": "Chris Ritchie",
    "title": "CTO, Cio, CSO",
    "email": "chris.ritchie@greatersumventures.com",
    "subject": "AI-driven ops efficiency for Greater Sum Ventures portfolio companies",
    "body": "Hi Chris,\n\nI'm reaching out because Greater Sum Ventures's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in technology strategy, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Knox Capital",
    "score": 9,
    "contact": "Ed Ogden",
    "title": "Managing Director",
    "email": "ed@knoxlending.com",
    "subject": "AI-driven ops efficiency for Knox Capital portfolio companies",
    "body": "Hi Ed,\n\nI'm reaching out because Knox Capital's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Roark Capital Group",
    "score": 9,
    "contact": "Paul Aglialoro",
    "title": "Director, Business Development & Capital Markets",
    "email": "paglialoro@roarkcapital.com",
    "subject": "AI-driven ops efficiency for Roark Capital Group portfolio companies",
    "body": "Hi Paul,\n\nI'm reaching out because Roark Capital Group's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Renovus Capital Partners",
    "score": 9,
    "contact": "Jason Tanker",
    "title": "Managing Director",
    "email": "jason.tanker@renovuscapital.com",
    "subject": "AI-driven ops efficiency for Renovus Capital Partners portfolio companies",
    "body": "Hi Jason,\n\nI'm reaching out because Renovus Capital Partners's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Waud Capital Partners",
    "score": 9,
    "contact": "Mike Lehman",
    "title": "Principal",
    "email": "mlehman@waudcapital.com",
    "subject": "AI-driven ops efficiency for Waud Capital Partners portfolio companies",
    "body": "Hi Mike,\n\nI'm reaching out because Waud Capital Partners's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Comvest Partners",
    "score": 9,
    "contact": "Itai Baron",
    "title": "Managing Director",
    "email": "i.baron@comvest.com",
    "subject": "AI-driven ops efficiency for Comvest Partners portfolio companies",
    "body": "Hi Itai,\n\nI'm reaching out because Comvest Partners's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  },
  {
    "company": "Bertram Capital",
    "score": 9,
    "contact": "Tom Long",
    "title": "Principal",
    "email": "tlong@bcap.com",
    "subject": "AI-driven ops efficiency for Bertram Capital portfolio companies",
    "body": "Hi Tom,\n\nI'm reaching out because Bertram Capital's focus on operational value creation aligns with what we're building at <a href=\"https://hellogumbo.com\">Gumbo</a>.\n\nWe help PE firms deploy AI across their portfolio companies to drive measurable efficiency gains in the first 90 days. Our approach is lightweight, non-disruptive, and designed to complement existing ops teams — not replace them.\n\nGiven your role in value creation, I'd love to share a quick overview of how firms like yours are using AI to accelerate post-acquisition value capture.\n\nWould you be open to a 15-minute call in the next week or two?\n\nBest,<br><br>\nJim from Gumbo<br>\n<a href=\"https://hellogumbo.com\">hellogumbo.com</a>"
  }
];

async function sendBatch() {
  for (const lead of batch) {
    console.log(`Sending to ${lead.contact} at ${lead.company}...`);
    await sendEmail(lead.email, lead.subject, lead.body);
    console.log(`✅ Sent to ${lead.email}`);
    await new Promise(r => setTimeout(r, 2000)); // 2s delay between sends
  }
  console.log(`\n✅ Batch complete: ${batch.length} emails sent`);
}

sendBatch().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
