const { sendEmail } = require('./send.js');

const emails = [
  {
    "to": "aspector@onerockcapital.com",
    "subject": "Tech stack for One Rock Capital Partners",
    "body": "Hi Allison,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at One Rock Capital Partners, I thought you might be interested in how we're helping similar firms:<br><br>• AI-powered due diligence summaries<br>• Tech stack assessment automation<br>• Digital transformation playbooks<br><br>Would you be open to a 15-minute call to explore whether this could be useful for One Rock Capital Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "One Rock Capital Partners",
      "name": "Allison Spector",
      "title": "Managing Director, Head of Sustainability",
      "email": "aspector@onerockcapital.com",
      "gumboScore": 341,
      "linkedin": "http://www.linkedin.com/in/allison-spector",
      "sector": "Industrial, Business Services",
      "portfolio": "Operations-focused middle market PE",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "bmichaud@littlejohnllc.com",
    "subject": "Tech stack for Littlejohn & Co.",
    "body": "Hi Brian,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Littlejohn & Co., I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Littlejohn & Co.?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Littlejohn & Co.",
      "name": "Brian Michaud",
      "title": "Managing Director",
      "email": "bmichaud@littlejohnllc.com",
      "gumboScore": 300,
      "linkedin": "http://www.linkedin.com/in/brian-michaud-27111514",
      "sector": "Industrial, Business Services, Transportation & Logistics",
      "portfolio": "PowerParts Group, RailPros, CoActive, Tidel",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "bill@unioncapitalassociates.com",
    "subject": "Tech stack for Union Capital Associates",
    "body": "Hi William,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Union Capital Associates, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Union Capital Associates?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Union Capital Associates",
      "name": "William Ogden",
      "title": "Managing Director",
      "email": "bill@unioncapitalassociates.com",
      "gumboScore": 297,
      "linkedin": "http://www.linkedin.com/in/bill-ogden-4168175",
      "sector": "Food Manufacturing, BPO, Marketing Services, Business Services",
      "portfolio": "Founder/family-owned $20-200M revenue businesses",
      "researchNotes": "kaynepartners.com returned 404. Apollo credits exhausted. Brave Search quota exhausted. NEEDS Apollo refresh. Last attempted: 2026-02-25 5:38 PM CT."
    }
  },
  {
    "to": "calamai@siris.com",
    "subject": "Tech stack for Siris Capital Group",
    "body": "Hi Dave,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline technology investments.<br><br>Given your role at Siris Capital Group, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Siris Capital Group?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Siris Capital Group",
      "name": "Dave Calamai",
      "title": "Managing Director",
      "email": "calamai@siris.com",
      "gumboScore": 234,
      "linkedin": "http://www.linkedin.com/in/davidcalamai",
      "sector": "Technology, Tech-Enabled Services, Data/Telecom",
      "portfolio": "Control-oriented investments in tech-enabled services",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "jgarrison@bvlp.com",
    "subject": "Tech stack for BV Investment Partners",
    "body": "Hi Justin,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline technology investments.<br><br>Given your role at BV Investment Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for BV Investment Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "BV Investment Partners",
      "name": "Justin Garrison",
      "title": "Managing Director",
      "email": "jgarrison@bvlp.com",
      "gumboScore": 231,
      "linkedin": "http://www.linkedin.com/in/justin-garrison-1687b9",
      "sector": "Business Services, Tech-Enabled Services, Healthcare IT",
      "portfolio": "Tech-enabled services companies across sectors",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "npingelton@marlinequity.com",
    "subject": "Tech stack for Marlin Equity Partners",
    "body": "Hi Nathan,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline technology investments.<br><br>Given your role at Marlin Equity Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Marlin Equity Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Marlin Equity Partners",
      "name": "Nathan Pingelton",
      "title": "Managing Director",
      "email": "npingelton@marlinequity.com",
      "gumboScore": 230,
      "linkedin": "http://www.linkedin.com/in/nathan-pingelton-6a179011",
      "sector": "Technology, Healthcare, Business Services",
      "portfolio": "Baxter Planning, 200+ acquisitions completed",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "nattenborough@goldengatecap.com",
    "subject": "Tech stack for Golden Gate Capital",
    "body": "Hi Neale,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline technology investments.<br><br>Given your role at Golden Gate Capital, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Golden Gate Capital?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Golden Gate Capital",
      "name": "Neale Attenborough",
      "title": "Managing Director",
      "email": "nattenborough@goldengatecap.com",
      "gumboScore": 229,
      "linkedin": "http://www.linkedin.com/in/neale-attenborough-356b675",
      "sector": "Financial Services, Industrials, Software & Services",
      "portfolio": "NASSAU, Mosaic Insurance, Vector Solutions, Invo Healthcare",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "jmoberg@cortecgroup.com",
    "subject": "Tech stack for Cortec Group",
    "body": "Hi Jesse,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline healthcare portfolio.<br><br>Given your role at Cortec Group, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Cortec Group?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Cortec Group",
      "name": "Jesse Moberg",
      "title": "Managing Director",
      "email": "jmoberg@cortecgroup.com",
      "gumboScore": 228,
      "linkedin": "http://www.linkedin.com/in/jesse-moberg-4b0a739",
      "sector": "Healthcare, Consumer, Specialty Services",
      "portfolio": "Healthcare products, B2B/B2C products, value-added distribution",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "tom@cidcap.com",
    "subject": "Tech stack for CID Capital",
    "body": "Hi Tom,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at CID Capital, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for CID Capital?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "CID Capital",
      "name": "Tom Shaw",
      "title": "Managing Director",
      "email": "tom@cidcap.com",
      "gumboScore": 226,
      "linkedin": "http://www.linkedin.com/in/tpshaw",
      "sector": "Business Services, Industrial, Consumer",
      "portfolio": "Professional services, staffing, industrial services",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "jgantz@pinebrookpartners.com",
    "subject": "Tech stack for Pine Brook Partners",
    "body": "Hi Joe,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline portfolio operations.<br><br>Given your role at Pine Brook Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Pine Brook Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Pine Brook Partners",
      "name": "Joe Gantz",
      "title": "Managing Director",
      "email": "jgantz@pinebrookpartners.com",
      "gumboScore": 225,
      "linkedin": "http://www.linkedin.com/in/joe-gantz-423211156",
      "sector": "Financial Services, Business Services, Energy",
      "portfolio": "Insurance services, financial services cos",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "rspasser@accel-kkr.com",
    "subject": "Tech stack for Accel-KKR",
    "body": "Hi Rachel,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline technology investments.<br><br>Given your role at Accel-KKR, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Accel-KKR?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Accel-KKR",
      "name": "Rachel Spasser",
      "title": "Managing Director",
      "email": "rspasser@accel-kkr.com",
      "gumboScore": 223,
      "linkedin": "http://www.linkedin.com/in/rachel-spasser-118355",
      "sector": "Technology, Software, Tech-Enabled Services",
      "portfolio": "Tech-enabled business services portfolio",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "nbrown@wppartners.com",
    "subject": "Tech stack for WindPoint Partners",
    "body": "Hi Nathan,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline portfolio operations.<br><br>Given your role at WindPoint Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for WindPoint Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "WindPoint Partners",
      "name": "Nathan Brown",
      "title": "Managing Director",
      "email": "nbrown@wppartners.com",
      "gumboScore": 221,
      "linkedin": "https://www.linkedin.com/in/nathan-brown-82bb71169/",
      "sector": "",
      "portfolio": "",
      "researchNotes": "SOURCE: RocketReach verified. Joined Wind Point 1997. Sits on multiple boards: Central Moloney, Envera Systems, MOREgroup, Nelson Global, Pavion, Vertex, Voyant Beauty."
    }
  },
  {
    "to": "angusc@clairvest.com",
    "subject": "Tech stack for Clairvest Group",
    "body": "Hi Angus,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline healthcare portfolio.<br><br>Given your role at Clairvest Group, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Clairvest Group?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Clairvest Group",
      "name": "Angus Cole",
      "title": "Managing Director, Partner",
      "email": "angusc@clairvest.com",
      "gumboScore": 219,
      "linkedin": "http://www.linkedin.com/in/anguscole",
      "sector": "Business Services, Healthcare, Industrial, Financial Services",
      "portfolio": "Multi-sector services portfolio",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "ecrawford@platteriverequity.com",
    "subject": "Tech stack for Platte River Equity",
    "body": "Hi Eric,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline healthcare portfolio.<br><br>Given your role at Platte River Equity, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Platte River Equity?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Platte River Equity",
      "name": "Eric Crawford",
      "title": "Managing Director",
      "email": "ecrawford@platteriverequity.com",
      "gumboScore": 216,
      "linkedin": "http://www.linkedin.com/in/ericacrawford",
      "sector": "Business Services, Healthcare Services, Industrial",
      "portfolio": "Services-heavy portfolio companies",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "scho@mountaingate.com",
    "subject": "Tech stack for Mountaingate Capital",
    "body": "Hi Sue,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline healthcare portfolio.<br><br>Given your role at Mountaingate Capital, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Mountaingate Capital?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Mountaingate Capital",
      "name": "Sue Cho",
      "title": "Managing Director",
      "email": "scho@mountaingate.com",
      "gumboScore": 215,
      "linkedin": "http://www.linkedin.com/in/sue-cho-44733714",
      "sector": "Business Services, Healthcare",
      "portfolio": "Services-focused portfolio",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "abatlaw@generalatlantic.com",
    "subject": "Tech stack for General Atlantic",
    "body": "Hi Anish,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline technology investments.<br><br>Given your role at General Atlantic, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for General Atlantic?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "General Atlantic",
      "name": "Anish Batlaw",
      "title": "Managing Director",
      "email": "abatlaw@generalatlantic.com",
      "gumboScore": 207,
      "linkedin": "http://www.linkedin.com/in/anish-batlaw-6a30748",
      "sector": "Healthcare Services, Financial Services, Technology, Business Services",
      "portfolio": "Various large growth platforms globally",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "mundt@rhonegroup.com",
    "subject": "Tech stack for Rh├┤ne Group",
    "body": "Hi Patrick,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Rh├┤ne Group, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Rh├┤ne Group?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Rh├┤ne Group",
      "name": "Patrick Mundt",
      "title": "Managing Director",
      "email": "mundt@rhonegroup.com",
      "gumboScore": 206,
      "linkedin": "http://www.linkedin.com/in/patrick-mundt-b6a461a",
      "sector": "Professional Services, Finance, Industrial",
      "portfolio": "Various European and US services cos",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "zane.hendricks@mgpfund.com",
    "subject": "Tech stack for Midwest Growth Partners",
    "body": "Hi Zane,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline portfolio operations.<br><br>Given your role at Midwest Growth Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Midwest Growth Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Midwest Growth Partners",
      "name": "Zane Hendricks",
      "title": "Managing Director",
      "email": "zane.hendricks@mgpfund.com",
      "gumboScore": 205,
      "linkedin": "http://www.linkedin.com/in/zane-hendricks",
      "sector": "Professional Services, Business Services",
      "portfolio": "Various growth-oriented mid-market cos",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "dreader@kainoscapital.com",
    "subject": "Tech stack for Kainos Capital",
    "body": "Hi Doug,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline portfolio operations.<br><br>Given your role at Kainos Capital, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Kainos Capital?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Kainos Capital",
      "name": "Doug Reader",
      "title": "Senior Managing Director",
      "email": "dreader@kainoscapital.com",
      "gumboScore": 203,
      "linkedin": "http://www.linkedin.com/in/doug-reader-40ba733",
      "sector": "Food & Consumer Services, Business Services",
      "portfolio": "Various consumer and services platforms"
    }
  },
  {
    "to": "rfoltz@brentwood.com",
    "subject": "Tech stack for Brentwood Associates",
    "body": "Hi Ryan,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline healthcare portfolio.<br><br>Given your role at Brentwood Associates, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Brentwood Associates?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Brentwood Associates",
      "name": "Ryan Foltz",
      "title": "Managing Director",
      "email": "rfoltz@brentwood.com",
      "gumboScore": 202,
      "linkedin": "http://www.linkedin.com/in/ryan-foltz-4884a29",
      "sector": "Services, Consumer, Healthcare Services",
      "portfolio": "Various services and consumer platforms"
    }
  },
  {
    "to": "fred@resurgenstech.com",
    "subject": "Tech stack for Resurgens Technology Partners",
    "body": "Hi Fred,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline technology investments.<br><br>Given your role at Resurgens Technology Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Resurgens Technology Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Resurgens Technology Partners",
      "name": "Fred Sturgis",
      "title": "Managing Director",
      "email": "fred@resurgenstech.com",
      "gumboScore": 201,
      "linkedin": "http://www.linkedin.com/in/fred-sturgis-548124",
      "sector": "Tech-Enabled Business Services, Healthcare IT, SaaS",
      "portfolio": "Various tech-enabled services cos"
    }
  },
  {
    "to": "jcarlisle@thl.com",
    "subject": "Tech stack for Thomas H. Lee Partners",
    "body": "Hi Jim,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline technology investments.<br><br>Given your role at Thomas H. Lee Partners, I thought you might be interested in how we're helping similar firms:<br><br>• AI-powered due diligence summaries<br>• Tech stack assessment automation<br>• Digital transformation playbooks<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Thomas H. Lee Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Thomas H. Lee Partners",
      "name": "Jim Carlisle",
      "title": "Managing Director, Head of Technology & Business Solutions",
      "email": "jcarlisle@thl.com",
      "gumboScore": 162,
      "linkedin": "https://www.linkedin.com/in/jim-carlisle-282a9a31/",
      "sector": "Healthcare, financial services, business services, technology",
      "portfolio": "+ raised. Hologic, ServiceLink, healthcare services portfolio",
      "researchNotes": "SOURCE: ContactOut verified email. MD and Head of Tech vertical, Automation Fund lead. Named to GrowthCap Top 25 Software Investors 2024."
    }
  },
  {
    "to": "issam.abedin@warburgpincus.com",
    "subject": "Tech stack for Warburg Pincus",
    "body": "Hi Issam,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline technology investments.<br><br>Given your role at Warburg Pincus, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Warburg Pincus?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Warburg Pincus",
      "name": "Issam Abedin",
      "title": "Managing Director",
      "email": "issam.abedin@warburgpincus.com",
      "gumboScore": 154,
      "linkedin": "http://www.linkedin.com/in/issam-abedin-364b0344",
      "sector": "Healthcare, financial services, business services, technology",
      "portfolio": "+ AUM. Major healthcare services and financial services portfolio"
    }
  },
  {
    "to": "mscheggia@searchlightcap.com",
    "subject": "Tech stack for Searchlight Capital Partners",
    "body": "Hi Michele,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline portfolio operations.<br><br>Given your role at Searchlight Capital Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Searchlight Capital Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Searchlight Capital Partners",
      "name": "Michele Scheggia",
      "title": "Managing Director",
      "email": "mscheggia@searchlightcap.com",
      "gumboScore": 150,
      "linkedin": "http://www.linkedin.com/in/michele-scheggia-a9056557",
      "sector": "Communications, media, IT services, business services",
      "portfolio": " AUM. Services and IT portfolio"
    }
  },
  {
    "to": "dolsen@highlander-partners.com",
    "subject": "Tech stack for Highlander Partners",
    "body": "Hi David,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline healthcare portfolio.<br><br>Given your role at Highlander Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Highlander Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Highlander Partners",
      "name": "David Olsen",
      "title": "Managing Director",
      "email": "dolsen@highlander-partners.com",
      "gumboScore": 145,
      "linkedin": "http://www.linkedin.com/in/davidlolsen",
      "sector": "Business Services, Healthcare Services, Food & Consumer",
      "portfolio": "Various services platforms"
    }
  }
];

async function sendBatch() {
  console.log('Sending 25 emails...');
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`[${i + 1}/25] Sending to ${email.contact.name} at ${email.contact.company}...`);
    
    try {
      await sendEmail(
        email.to,
        email.subject,
        email.body,
        'alex@hellogumbo.com,jeff@hellogumbo.com'
      );
      console.log('✓ Sent');
      
      // Wait 2 seconds between sends
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (err) {
      console.error(`✗ Failed: ${err.message}`);
    }
  }
  
  console.log('\nBatch complete!');
}

sendBatch().catch(console.error);
