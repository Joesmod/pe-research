const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: '../projects/gmail-outreach/service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  
  // Updates: [row, col_letter, value] format
  // Columns: A=Company, B=Contact Name, C=Title, D=Email, E=Website, F=LinkedIn, ...I=Status, K=Notes
  
  const updates = [
    // Row 10: Harvest Partners - Michael DeFlorio is CEO, Stephen Carlson is President PE
    // No direct emails found - only info@harvestpartners.com
    {range:'K10', value:'Michael DeFlorio (CEO) and Stephen Carlson (President, PE) confirmed from harvestpartners.com/people. Julie Casella (MD, Head of Human Capital). No direct emails published. Only info@harvestpartners.com. 2026-02-18 enrichment.'},
    
    // Row 16: JLL Partners - has a Chief AI Officer (Jeff Hunter)! Plus Managing Partners
    {range:'B16', value:'Cara Killackey'},
    {range:'C16', value:'Managing Director - Capital Formation'},
    {range:'K16', value:'Dan Agroskin (Managing Partner), Kevin Hammond (Managing Partner), Frank Rodriguez (Managing Partner). Jeff Hunter is Chief AI Officer. Cara Killackey (MD, Capital Formation) is best outreach target. Raj Bhavsar (CTO). No direct emails published on jllpartners.com. Only IR@jllpartners.com. 2026-02-18 enrichment.'},
    
    // Row 61: PSG Equity - JS-rendered team page, no data extracted
    {range:'K61', value:'Team page at psgequity.com/team is JS-rendered, no names extracted. Software/tech-enabled services focus. Apollo credits exhausted. No direct emails found. 2026-02-18 enrichment attempt.'},
    
    // Row 70: Renovus Capital - Atif Gilani (Founding Partner), Jesse Serventi (Founding Partner), Brad Whitman (Founding Partner)
    // Cassidy Baird - Director of Capital Formation & IR (best outreach target)
    {range:'B70', value:'Cassidy Baird'},
    {range:'C70', value:'Director of Capital Formation & Investor Relations'},
    {range:'K70', value:'Founding Partners: Atif Gilani, Jesse Serventi, Brad Whitman. Cassidy Baird (Dir Capital Formation & IR) is best outreach target. $875M Fund IV closed Oct 2024 (oversubscribed). #1 HEC-Dow Jones Small-Cap PE ranking 3 years running. $2B+ AUM. Focus: Knowledge & Talent (education, tech services, healthcare services, professional services). Wayne, PA. No direct emails published. Only info@renovuscapital.com. 2026-02-18 enrichment.'},
    
    // Row 108: Quad Partners - JS-rendered team page
    {range:'K108', value:'Team page at quadpartners.com/team is JS-rendered, no names extracted. Daniel Neuwirth already identified. Education, Healthcare, Professional Services focus. No direct emails found. 2026-02-18 enrichment attempt.'},
    
    // Row 131: Blackford Capital - Martin Stein (Founder/MD), Jeff Johnson (MD)
    {range:'B131', value:'Martin Stein'},
    {range:'C131', value:'Founder & Managing Director'},
    {range:'K131', value:'Martin Stein (Founder & Managing Director), Jeff Johnson (MD, named 2025 Notable Leader in Finance by Crains Detroit). Rick Lopez (new MD hire). Carmen Evola (MD). Lower middle market, manufacturing/industrial/distribution focus. Grand Rapids, MI. Multiple active platforms: PACIV (industrial automation), SFS (fire safety). No direct emails; only info@blackfordcapital.com. 2026-02-18 enrichment.'},
    
    // Row 162: Thomas H. Lee Partners - JS-rendered team page, no names extracted
    {range:'K162', value:'Team page at thl.com/team is JS-rendered. Boston-based. 100 Federal St, Boston MA 02110. Tel: 617-227-1050. Healthcare, financial services, business services, technology focus. No direct emails found. 2026-02-18 enrichment attempt.'},
    
    // Row 196: Vance Street Capital - JS-rendered team page, contact@vancestreetcapital.com only
    {range:'K196', value:'Team and news pages at vancestreetcapital.com are JS-rendered, no data extracted. Only contact@vancestreetcapital.com available. 2026-02-18 enrichment attempt.'},
    
    // Row 29: Seidler Equity Partners - team page JS-rendered
    {range:'K29', value:'Eric OBrien already identified. Team page at sepfunds.com/team is JS-rendered. Marina del Rey, CA + Sydney, Australia offices. Tel: +1 213 683 4622. Only info@sepfunds.com. 2026-02-18 enrichment attempt.'},
    
    // Row 2: Audax Private Equity - team page JS-rendered
    {range:'K2', value:'Mid-market PE, Boston-based. In-house Value Agenda portfolio support team. ~$7B+ AUM. Team page JS-rendered, no additional names extracted. Only PELPrequests@audaxprivateequity.com. 2026-02-18 enrichment attempt.'},
  ];
  
  for (const u of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: u.range,
      valueInputOption: 'RAW',
      requestBody: { values: [[u.value]] }
    });
    console.log('Updated', u.range);
  }
  
  console.log('Done! Updated', updates.length, 'cells');
}

main().catch(e => console.error(e));
