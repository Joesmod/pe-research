const { sendEmail } = require('./send.js');

const emails = [
  {
    "to": "rkuehl@frontenac.com",
    "subject": "Tech stack for Frontenac Company",
    "body": "Hi Ron,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Frontenac Company, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Frontenac Company?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Frontenac Company",
      "name": "Ron Kuehl",
      "title": "",
      "email": "rkuehl@frontenac.com",
      "gumboScore": 325,
      "linkedin": "",
      "sector": "Michael Langdon",
      "portfolio": "Managing Partner",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "nbrown@wppartners.com",
    "subject": "Tech stack for WindPoint Partners",
    "body": "Hi Nathan,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at WindPoint Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for WindPoint Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "WindPoint Partners",
      "name": "Nathan Brown",
      "title": "Managing Director",
      "email": "nbrown@wppartners.com",
      "gumboScore": 221,
      "linkedin": "https://www.linkedin.com/in/nathan-brown-82bb71169/",
      "sector": "Jake Behringer",
      "portfolio": "Principal",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "troy@centerfieldcapital.com",
    "subject": "Tech stack for Centerfield Capital Partners",
    "body": "Hi Troy,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Centerfield Capital Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Centerfield Capital Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Centerfield Capital Partners",
      "name": "Troy Clark",
      "title": "Partner",
      "email": "troy@centerfieldcapital.com",
      "gumboScore": 218,
      "linkedin": "http://www.linkedin.com/in/troy-clark-b29a2691",
      "sector": "Troy Clark",
      "portfolio": "Partner",
      "researchNotes": "https://centerfieldcapital.com"
    }
  },
  {
    "to": "zane.hendricks@mgpfund.com",
    "subject": "Tech stack for Midwest Growth Partners",
    "body": "Hi Zane,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Midwest Growth Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Midwest Growth Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Midwest Growth Partners",
      "name": "Zane Hendricks",
      "title": "Managing Director",
      "email": "zane.hendricks@mgpfund.com",
      "gumboScore": 205,
      "linkedin": "http://www.linkedin.com/in/zane-hendricks",
      "sector": "Zane Hendricks",
      "portfolio": "Managing Director",
      "researchNotes": "https://www.mgpfund.com"
    }
  },
  {
    "to": "richard@ascendpartners.com",
    "subject": "Tech stack for Ascend Partners",
    "body": "Hi Richard,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Ascend Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Ascend Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Ascend Partners",
      "name": "Richard Park",
      "title": "Partner",
      "email": "richard@ascendpartners.com",
      "gumboScore": 204,
      "linkedin": "http://www.linkedin.com/in/richard-park-md-2a380a16",
      "sector": "Richard Park",
      "portfolio": "Partner",
      "researchNotes": "https://www.ascendpartners.com"
    }
  },
  {
    "to": "dreader@kainoscapital.com",
    "subject": "Tech stack for Kainos Capital",
    "body": "Hi Doug,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Kainos Capital, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Kainos Capital?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Kainos Capital",
      "name": "Doug Reader",
      "title": "Senior Managing Director",
      "email": "dreader@kainoscapital.com",
      "gumboScore": 203,
      "linkedin": "http://www.linkedin.com/in/doug-reader-40ba733",
      "sector": "Doug Reader",
      "portfolio": "Senior Managing Director",
      "researchNotes": "https://www.kainoscapital.com"
    }
  },
  {
    "to": "rfoltz@brentwood.com",
    "subject": "Tech stack for Brentwood Associates",
    "body": "Hi Ryan,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Brentwood Associates, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Brentwood Associates?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Brentwood Associates",
      "name": "Ryan Foltz",
      "title": "Managing Director",
      "email": "rfoltz@brentwood.com",
      "gumboScore": 202,
      "linkedin": "http://www.linkedin.com/in/ryan-foltz-4884a29",
      "sector": "Ryan Foltz",
      "portfolio": "Managing Director",
      "researchNotes": "https://www.brentwoodassociates.com"
    }
  },
  {
    "to": "fred@resurgenstech.com",
    "subject": "Tech stack for Resurgens Technology Partners",
    "body": "Hi Fred,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Resurgens Technology Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Resurgens Technology Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Resurgens Technology Partners",
      "name": "Fred Sturgis",
      "title": "Managing Director",
      "email": "fred@resurgenstech.com",
      "gumboScore": 201,
      "linkedin": "http://www.linkedin.com/in/fred-sturgis-548124",
      "sector": "Fred Sturgis",
      "portfolio": "Managing Director",
      "researchNotes": "https://www.resurgenstp.com"
    }
  },
  {
    "to": "jcarlisle@thl.com",
    "subject": "Tech stack for Thomas H. Lee Partners",
    "body": "Hi Jim,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline technology investments.<br><br>Given your role at Thomas H. Lee Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Thomas H. Lee Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Thomas H. Lee Partners",
      "name": "Jim Carlisle",
      "title": "Managing Director, Head of Technology & Business Solutions",
      "email": "jcarlisle@thl.com",
      "gumboScore": 162,
      "linkedin": "https://www.linkedin.com/in/jim-carlisle-282a9a31/",
      "sector": "Mark Bean",
      "portfolio": "Board of Directors",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "mwerner@thomabravo.com",
    "subject": "Tech stack for Thoma Bravo",
    "body": "Hi Max,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Thoma Bravo, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Thoma Bravo?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Thoma Bravo",
      "name": "Max Werner",
      "title": "AVP, Assistant Controller",
      "email": "mwerner@thomabravo.com",
      "gumboScore": 155,
      "linkedin": "http://www.linkedin.com/in/maxwerner1",
      "sector": "Media Contact",
      "portfolio": "mfrank@thomabravo.com",
      "researchNotes": "No public data found"
    }
  },
  {
    "to": "issam.abedin@warburgpincus.com",
    "subject": "Tech stack for Warburg Pincus",
    "body": "Hi Issam,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Warburg Pincus, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Warburg Pincus?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Warburg Pincus",
      "name": "Issam Abedin",
      "title": "Managing Director",
      "email": "issam.abedin@warburgpincus.com",
      "gumboScore": 154,
      "linkedin": "http://www.linkedin.com/in/issam-abedin-364b0344",
      "sector": "Alex Stratoudakis",
      "portfolio": "Managing Director, Technology Group",
      "researchNotes": "https://www.linkedin.com/company/warburg-pincus"
    }
  },
  {
    "to": "mscheggia@searchlightcap.com",
    "subject": "Tech stack for Searchlight Capital Partners",
    "body": "Hi Michele,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Searchlight Capital Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Searchlight Capital Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Searchlight Capital Partners",
      "name": "Michele Scheggia",
      "title": "Managing Director",
      "email": "mscheggia@searchlightcap.com",
      "gumboScore": 150,
      "linkedin": "http://www.linkedin.com/in/michele-scheggia-a9056557",
      "sector": "Michele Scheggia",
      "portfolio": "Managing Director",
      "researchNotes": "https://searchlightcap.com"
    }
  },
  {
    "to": "razevedo@hig.com",
    "subject": "Tech stack for H.I.G. Capital",
    "body": "Hi Rodrigo,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at H.I.G. Capital, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for H.I.G. Capital?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "H.I.G. Capital",
      "name": "Rodrigo Azevedo",
      "title": "Principal",
      "email": "razevedo@hig.com",
      "gumboScore": 149,
      "linkedin": "http://www.linkedin.com/in/rodrigo-azevedo-b097a42b",
      "sector": "Sami Mnaymneh",
      "portfolio": "Founder, Co-CEO & Co-Executive Chairman",
      "researchNotes": "https://hig.com"
    }
  },
  {
    "to": "cthomas@highlander-partners.com",
    "subject": "Tech stack for Highlander Partners",
    "body": "Hi Cory,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Highlander Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Highlander Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Highlander Partners",
      "name": "Cory Thomas",
      "title": "Managing Director",
      "email": "cthomas@highlander-partners.com",
      "gumboScore": 145,
      "linkedin": "http://www.linkedin.com/in/davidlolsen",
      "sector": "Jeff Hull",
      "portfolio": "President & CEO",
      "researchNotes": "https://www.highlander-partners.com"
    }
  },
  {
    "to": "cthomas@bluewolfcapital.com",
    "subject": "Tech stack for Blue Wolf Capital Partners",
    "body": "Hi Chris,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Blue Wolf Capital Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Blue Wolf Capital Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Blue Wolf Capital Partners",
      "name": "Chris Thomas",
      "title": "Operating Partner",
      "email": "cthomas@bluewolfcapital.com",
      "gumboScore": 144,
      "linkedin": "https://www.bluewolfcapital.com/team/chris-thomas/",
      "sector": "Stephen Madsen",
      "portfolio": "Business Development Contact",
      "researchNotes": "https://www.bluewolfcapital.com"
    }
  },
  {
    "to": "lguthart@topspinpartners.com",
    "subject": "Tech stack for Topspin Partners",
    "body": "Hi Leo,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Topspin Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Topspin Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Topspin Partners",
      "name": "Leo Guthart",
      "title": "Managing Partner",
      "email": "lguthart@topspinpartners.com",
      "gumboScore": 140,
      "linkedin": "http://www.linkedin.com/in/leo-guthart-91a42716",
      "sector": "Leigh Randall",
      "portfolio": "Managing Partner",
      "researchNotes": "https://www.topspinpartners.com"
    }
  },
  {
    "to": "eric.geveda@leedsequity.com",
    "subject": "Tech stack for Leeds Equity Partners",
    "body": "Hi Eric,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Leeds Equity Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Leeds Equity Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Leeds Equity Partners",
      "name": "Eric Geveda",
      "title": "Managing Director",
      "email": "eric.geveda@leedsequity.com",
      "gumboScore": 136,
      "linkedin": "http://www.linkedin.com/in/eric-geveda-5587854",
      "sector": "Jeffrey Leeds",
      "portfolio": "Managing Partner",
      "researchNotes": "https://www.leedsequity.com"
    }
  },
  {
    "to": "ozhao@stellexcapital.com",
    "subject": "Tech stack for Stellex Capital Management",
    "body": "Hi Olivia,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Stellex Capital Management, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Stellex Capital Management?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Stellex Capital Management",
      "name": "Olivia Zhao",
      "title": "Managing Director",
      "email": "ozhao@stellexcapital.com",
      "gumboScore": 132,
      "linkedin": "http://www.linkedin.com/in/olivia-zhao-71814a66",
      "sector": "Ray Whiteman",
      "portfolio": "Managing Partner",
      "researchNotes": "https://www.stellexcapital.com"
    }
  },
  {
    "to": "pcifelli@kinderhook.com",
    "subject": "Tech stack for Kinderhook Industries",
    "body": "Hi Paul,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Kinderhook Industries, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Kinderhook Industries?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Kinderhook Industries",
      "name": "Paul Cifelli",
      "title": "Managing Director",
      "email": "pcifelli@kinderhook.com",
      "gumboScore": 129,
      "linkedin": "http://www.linkedin.com/in/paul-cifelli-4a51258",
      "sector": "Robert Michalik",
      "portfolio": "Managing Director",
      "researchNotes": "https://www.kinderhook.com"
    }
  },
  {
    "to": "dbaylor@vectorcapital.com",
    "subject": "Tech stack for Vector Capital",
    "body": "Hi David,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Vector Capital, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Vector Capital?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Vector Capital",
      "name": "David Baylor",
      "title": "Chief Operating Officer",
      "email": "dbaylor@vectorcapital.com",
      "gumboScore": 127,
      "linkedin": "http://www.linkedin.com/in/david-baylor-a70a90198",
      "sector": "Mac Hofeditz",
      "portfolio": "Managing Director",
      "researchNotes": "https://www.vectorcapital.com"
    }
  },
  {
    "to": "kkielhorn@tonkabayequity.com",
    "subject": "Tech stack for Tonka Bay Equity Partners",
    "body": "Hi Kam,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Tonka Bay Equity Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Tonka Bay Equity Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Tonka Bay Equity Partners",
      "name": "Kam Kielhorn",
      "title": "Partner",
      "email": "kkielhorn@tonkabayequity.com",
      "gumboScore": 124,
      "linkedin": "http://www.linkedin.com/in/kam-kielhorn-12bb0b33",
      "sector": "Cary Musech",
      "portfolio": "Founder & Advisory Partner",
      "researchNotes": "https://www.tonkabayequity.com"
    }
  },
  {
    "to": "dwilson@soundgrowthpartners.com",
    "subject": "Tech stack for CM Equity Partners",
    "body": "Hi Daniel,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at CM Equity Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for CM Equity Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "CM Equity Partners",
      "name": "Daniel Wilson",
      "title": "Private Equity",
      "email": "dwilson@soundgrowthpartners.com",
      "gumboScore": 120,
      "linkedin": "http://www.linkedin.com/in/wilsondanielp",
      "sector": "Kyle Largent",
      "portfolio": "Managing Partner",
      "researchNotes": "https://www.cmequity.com"
    }
  },
  {
    "to": "mgarff@suncappart.com",
    "subject": "Tech stack for Sun Capital Partners",
    "body": "Hi Matthew,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Sun Capital Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Sun Capital Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Sun Capital Partners",
      "name": "Matthew Garff",
      "title": "Senior Managing Director & Partner",
      "email": "mgarff@suncappart.com",
      "gumboScore": 111,
      "linkedin": "http://www.linkedin.com/in/matthew-garff-a2b254b",
      "sector": "Matthew Garff",
      "portfolio": "Senior Managing Director & Partner",
      "researchNotes": "https://suncappart.com"
    }
  },
  {
    "to": "emaurer@prospect-partners.com",
    "subject": "Tech stack for Prospect Partners",
    "body": "Hi Erik,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Prospect Partners, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Prospect Partners?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Prospect Partners",
      "name": "Erik Maurer",
      "title": "Partner",
      "email": "emaurer@prospect-partners.com",
      "gumboScore": 106,
      "linkedin": "http://www.linkedin.com/in/erikmaurer",
      "sector": "Brett Holcomb",
      "portfolio": "Partner",
      "researchNotes": "https://prospect-partners.com"
    }
  },
  {
    "to": "vgarcia@stelluscapital.com",
    "subject": "Tech stack for Stellus Capital Management",
    "body": "Hi Victoria,<br><br>I'm Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>. We build AI tools that help PE firms streamline operational efficiency.<br><br>Given your role at Stellus Capital Management, I thought you might be interested in how we're helping similar firms:<br><br>• Automated investor reporting (saving 20+ hours/month)<br>• Portfolio performance dashboards<br>• Due diligence workflow automation<br><br>Would you be open to a 15-minute call to explore whether this could be useful for Stellus Capital Management?<br><br>Best,<br>Jim<br><br>---<br>Jim from <a href=\"https://hellogumbo.com\">Gumbo</a>",
    "contact": {
      "company": "Stellus Capital Management",
      "name": "Victoria Garcia",
      "title": "Managing Director",
      "email": "vgarcia@stelluscapital.com",
      "gumboScore": 103,
      "linkedin": "http://www.linkedin.com/in/victoria-garcia-51a5075",
      "sector": "Bill Haverland",
      "portfolio": "Managing Director",
      "researchNotes": "https://www.stelluscapital.com"
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
