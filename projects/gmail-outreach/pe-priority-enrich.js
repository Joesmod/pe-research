const {google} = require('googleapis');
const path = require('path');

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Read current data to find row indices
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:M200'
  });
  const rows = r.data.values || [];
  
  // Find rows for our 6 firms
  const updates = [];
  
  for (let i = 0; i < rows.length; i++) {
    const company = (rows[i][0] || '').toLowerCase();
    
    // ROW 61: Kohlberg & Company
    if (company.includes('kohlberg') && !company.includes('kravis')) {
      updates.push({
        range: `Sheet1!A${i+1}:M${i+1}`,
        values: [[
          'Kohlberg & Company',
          'Michael Bogobowicz',
          'Operating Executive, AI & Data',
          '',
          'https://www.kohlberg.com',
          'https://www.linkedin.com/company/kohlberg-company',
          'Healthcare, Industrial, Financial Services',
          'Quorum Health, various mid-market',
          'Priority - Enriched',
          '',
          '🔥 PRIORITY TARGET (9/10). HAS DEDICATED AI & DATA EXEC: Michael Bogobowicz (joined 2026, ex-McKinsey Data & Transformation partner, Brown CS + Columbia MBA). Also: Jennifer Steeves Kiss (Operating Advisor, Digital Transformation, ex-CEO Dictionary.com, ex-CXO Rocket). Renaud Vidick (Director Finance Valuations & AI). Moira O\'Reilly (CTO). Andrea Simone (Ops Advisor IT Services). Gregory Kamford (Partner BD). $4.3B Fund X. NO PUBLIC EMAILS FOUND. Pitch: Bogobowicz is building AI capabilities across portfolio — Gumbo as delivery partner.',
          'https://www.kohlberg.com/team/michael-bogobowicz/',
          '9'
        ]]
      });
    }
    
    // ROW 90: Diversis Capital
    if (company.includes('diversis')) {
      updates.push({
        range: `Sheet1!A${i+1}:M${i+1}`,
        values: [[
          'Diversis Capital',
          'Kevin Ma / Ryan Tanaka',
          'Co-Founder & Managing Partner / Principal (ex-software exec)',
          '',
          'https://www.diversis.com',
          'https://www.linkedin.com/company/diversis-capital',
          'Software, Tech-Enabled Services',
          'SalesRabbit, Fishbowl, Marketron, ServicePower, PureCars, InductiveHealth, FORM',
          'Priority - Enriched',
          '',
          '🔥 PRIORITY TARGET (9/10). $3B+ AUM. $1.2B Fund III (Oct 2025) explicitly mentions AI in strategy. Kevin Ma (Co-Founder/MP, Wharton M&T, BS CS/Robotics/EE — deeply technical). Ron Nayot (Co-Founder/MP, ex-Gores). Ryan Tanaka (Principal, former software exec/entrepreneur before finance). Joseph Lok (Principal, founding member). Team of 15+ deal professionals. Software/tech-enabled services thesis = perfect AI fit. NO PUBLIC EMAILS. Uses Chris Tofalli PR (914-834-4334). Pitch: AI integration across their software portfolio.',
          'https://www.diversis.com/team',
          '9'
        ]]
      });
    }
    
    // ROW 96: Apax Partners
    if (company.includes('apax') && !company.includes('digital')) {
      updates.push({
        range: `Sheet1!A${i+1}:M${i+1}`,
        values: [[
          'Apax Partners',
          'Seth Brody / Ishan Gammampila',
          'Partner, Global Head of OEP / Chief Data & Analytics Officer',
          'gill.corish@apax.com',
          'https://www.apax.com',
          'https://www.linkedin.com/company/apax-partners',
          'Tech, Services, Healthcare, Internet/Consumer',
          'Thoughtworks, Coalfire, Epicor, Cole Haan, Candela',
          'Priority - Enriched',
          '',
          '🔥 PRIORITY TARGET (9/10). $50B+ raised. 28-person Operational Excellence Practice (OEP) with dedicated Data Science & AI practice. KEY PEOPLE: Seth Brody (Partner, Global Head OEP since 2008 — manages external partnerships). Ishan Gammampila (CDAO). Fang Fang (Head of Data Science). Sharat Chelluboina (Chief Data Architect). Laef Olson (Partner, Tech Practice Lead). Jessica Ross (OP, Digital Strategy). Jon Simmons (OP, Revenue Growth Lead). 146 portfolio companies engaged. Has proprietary tools (Apax Digital Insights, Apax Spend Insights). VERIFIED EMAILS: gill.corish@apax.com (Head of Comms), andrew.kenny@apax.com (Global Media). Pattern: firstname.lastname@apax.com. Pitch: AI delivery partner for OEP team.',
          'https://www.apax.com/people/our-team/?team=operationalexcellence',
          '9'
        ]]
      });
    }
    
    // ROW 114: Comvest Partners
    if (company.includes('comvest')) {
      updates.push({
        range: `Sheet1!A${i+1}:M${i+1}`,
        values: [[
          'Comvest Partners',
          'Alex Ray / Derek Katchis',
          'MD, Business Development / VP, Business Development',
          'a.ray@comvest.com',
          'https://comvest.com',
          'https://www.linkedin.com/company/comvest-partners',
          'Business Services, Healthcare, Industrial, Technology',
          '$9B+ invested, middle-market PE focus',
          'Priority - Enriched',
          '',
          '🔥 PRIORITY TARGET (9/10). $9B+ invested. Newly independent PE arm (credit sold to Manulife Nov 2025 for $937.5M). 5 VERIFIED EMAILS: a.ray@comvest.com (Alex Ray, MD BD), d.katchis@comvest.com (Derek Katchis, VP BD), m.chawla@comvest.com (Maneesh Chawla, Managing Partner), r.marrero@comvest.com (Roger Marrero, Sr Partner), a.shear@comvest.com (Andrew Shear, Principal). Dedicated Operating Advisory Group (OAG). Pattern: first_initial.lastname@comvest.com. Pitch: AI capabilities for newly independent PE platform.',
          'https://comvest.com/team-members/',
          '9'
        ]]
      });
    }
    
    // ROW 141: Bertram Capital
    if (company.includes('bertram')) {
      updates.push({
        range: `Sheet1!A${i+1}:M${i+1}`,
        values: [[
          'Bertram Capital',
          'Tom Long / Billy Mateker',
          'Principal, Bertram Labs / Sr Director of Data Science, Bertram Labs',
          'pr@bcap.com',
          'https://www.bertramcapital.com',
          'https://www.linkedin.com/company/bertram-capital',
          'Tech-Enabled Services, Consumer, Business Services, Industrial',
          'Solo Stove, Lectric eBikes, Flow Control Group, Spireon',
          'Priority - Enriched',
          '',
          '🔥 PRIORITY TARGET (9/10). $8B+ AUM. HAS IN-HOUSE TECH TEAM (Bertram Labs): Tom Long (Principal, leads Labs), Jeremy Crosbie (Principal of Engineering), Bob Whiton (VP Engineering), Greg Willis (CISO), Billy Mateker (Sr Dir Data Science — AI relevant), Kenn Lau (Dir Growth Engineering), Kirsten Johnson (Creative Dir). Labs does software dev, UI/UX, e-commerce, data science, business process automation across entire portfolio. 200+ campaigns, 2M+ lines of code. Only pr@bcap.com verified. Pitch: Gumbo as AI extension of Bertram Labs — they proved the model, we add the AI layer.',
          'https://www.bertramlabs.com/',
          '9'
        ]]
      });
    }
    
    // Southfield Capital
    if (company.includes('southfield')) {
      updates.push({
        range: `Sheet1!A${i+1}:M${i+1}`,
        values: [[
          'Southfield Capital',
          'Bob Root / Jason Perlroth',
          'TRANSFORMATION Partner / Principal, Head of Business Development',
          'jfinkel@southfieldcapital.com',
          'https://www.southfieldcapital.com',
          'https://www.linkedin.com/company/southfield-capital-advisors',
          'Outsourced Business Services',
          'Contextual.io (AI platform), Milrose, BDR, Kelvin Group, Alba Wheels Up, Protos Security',
          'Priority - Enriched',
          '',
          '🔥 PRIORITY TARGET (9/10). LMM outsourced business services. ACQUIRED Contextual.io AI orchestration platform Jan 2026. KEY: Bob Root is "TRANSFORMATION Partner" (unique title, likely leads tech/AI adoption). Andy Levison (Founder/MP). Jason Perlroth (Principal, Head of BD). Chris Grambling (Partner, promoted Jan 2025). Vince Tyra (Partner). VERIFIED: jfinkel@southfieldcapital.com (Josh Finkel, Analyst), info@southfieldcapital.com (general). Pattern likely: first_initial+lastname@southfieldcapital.com. Phone: 203.813.4100. Greenwich CT + Bellevue WA. Pitch: They\'re already buying AI — Gumbo helps deploy across portfolio.',
          'https://www.southfieldcapital.com/team',
          '9'
        ]]
      });
    }
  }
  
  console.log(`Found ${updates.length} rows to update`);
  
  for (const update of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: 'RAW',
      requestBody: { values: update.values }
    });
    console.log(`Updated ${update.range}: ${update.values[0][0]}`);
  }
  
  console.log('Done!');
}

main().catch(e => { console.error(e.message); process.exit(1); });
