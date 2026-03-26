const {google} = require(require('path').join(__dirname, 'gmail-outreach/node_modules/googleapis'));
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'gmail-outreach/service-account.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const newLeads = [
  ['Cortec Group', '', 'Operating Partner (TBD)', '', 'https://cortecgroup.com', 'https://www.linkedin.com/company/cortec-group', 'Healthcare, Consumer, Specialty Services', 'Healthcare products, B2B/B2C products, value-added distribution', 'New', '', 'NYC-based, ~40 years experience, mid-market focus US/Canada. Has operating team.'],
  ['Golden Gate Capital', '', 'Operating Partner (TBD)', '', 'https://goldengatecap.com', 'https://www.linkedin.com/company/golden-gate-capital', 'Financial Services, Industrials, Software & Services', 'NASSAU, Mosaic Insurance, Vector Solutions, Invo Healthcare', 'New', '', 'SF-based, $19B+ cumulative committed capital. Strong financial services/insurance portfolio.'],
  ['Marlin Equity Partners', '', 'Operating Partner (TBD)', '', 'https://www.marlinequity.com', 'https://www.linkedin.com/company/marlin-equity-partners', 'Technology, Healthcare, Business Services', 'Baxter Planning, 200+ acquisitions completed', 'New', '', 'Hermosa Beach CA, ~$10B AUM. Corporate divestitures, turnarounds, growth equity. Strong ops team.'],
  ['BV Investment Partners', '', 'Operating Partner (TBD)', '', 'https://www.bvip.com', 'https://www.linkedin.com/company/bv-investment-partners', 'Business Services, Tech-Enabled Services, Healthcare IT', 'Tech-enabled services companies across sectors', 'New', '', 'Boston-based, founded 1983, ~$5B invested. One of oldest sector-focused PE firms in NA.'],
  ['Clayton Dubilier & Rice (CD&R)', '', 'Operating Partner (TBD)', '', 'https://www.cdr.com', 'https://www.linkedin.com/company/clayton-dubilier-&-rice', 'Healthcare, Industrials, Business Services, Financial Services', 'Envision Healthcare, Hertz, B&M Retail, Sirius XM', 'New', '', 'NYC, founded 1978, ~$30B invested. Pioneer of operating partner model. Strong value creation team.'],
  ['Sheridan Capital Partners', '', 'Operating Partner (TBD)', '', 'https://sheridancp.com', 'https://www.linkedin.com/company/sheridan-capital-partners', 'Healthcare Services', 'Lower middle market healthcare buyouts, growth equity', 'New', '', 'Chicago-based, founded 2012. Healthcare-focused, clinical excellence. Value creation team.'],
  ['Siris Capital Group', '', 'Operating Partner (TBD)', '', 'https://www.siris.com', 'https://www.linkedin.com/company/siris-capital-group', 'Technology, Tech-Enabled Services, Data/Telecom', 'Control-oriented investments in tech-enabled services', 'New', '', 'NYC-based, tech and tech-enabled business services focus. Strong operating resources.'],
  ['The Jordan Company (TJC)', '', 'Operating Partner (TBD)', '', 'https://www.thejordancompany.com', 'https://www.linkedin.com/company/the-jordan-company', 'Industrials, Healthcare, Business Services, Consumer', 'Mid-market LBO/MBO across multiple industries', 'New', '', 'NYC-based, mid-market LBOs. Diversified services portfolio. Has operating partner team.'],
  ['AEA Investors', '', 'Operating Partner (TBD)', '', 'https://www.aeainvestors.com', 'https://www.linkedin.com/company/aea-investors', 'Business Services, Healthcare, Consumer, Industrial', 'Mid-market private equity and growth capital', 'New', '', 'NYC-based, founded 1968. One of oldest PE firms. Strong operating executive network.'],
  ['Colville Group', '', 'Operating Partner (TBD)', '', 'https://www.colvillegroup.com', 'https://www.linkedin.com/company/colville-group', 'Business Services, Manufacturing, Distribution, Industrials', 'Niche manufacturing, value-added distribution, business services', 'New', '', 'Charlotte NC, founded 2005. Lower mid-market business services focus.'],
  ['FFL Partners', '', 'Operating Partner (TBD)', '', 'https://www.fflpartners.com', 'https://www.linkedin.com/company/ffl-partners', 'Financial Services, Healthcare Services, Business Services', 'Financial services and healthcare services companies', 'New', '', 'SF-based, mid-market focus on financial and healthcare services. Operating partner model.'],
  ['Aquiline Capital Partners', '', 'Operating Partner (TBD)', '', 'https://www.aquilinecapital.com', 'https://www.linkedin.com/company/aquiline-capital-partners', 'Financial Services, Insurance, Healthcare', 'Insurance, banking, payments, healthcare services', 'New', '', 'NYC-based, $11B+ AUM. Deep insurance and financial services expertise. Strong ops team.'],
  ['Oak HC/FT', '', 'Operating Partner (TBD)', '', 'https://www.oakhcft.com', 'https://www.linkedin.com/company/oak-hc-ft', 'Healthcare IT, FinTech, Healthcare Services', 'Healthcare technology and financial technology companies', 'New', '', 'Greenwich CT. Healthcare and fintech focused growth equity. Operating resources team.'],
  ['JMI Equity', '', 'Operating Partner (TBD)', '', 'https://www.jmiequity.com', 'https://www.linkedin.com/company/jmi-equity', 'Software, Business Services, Tech-Enabled Services', 'Growth equity in software and services companies', 'New', '', 'Baltimore-based, growth equity focused on software and business services.'],
  ['Coltala Holdings', '', 'Operating Partner (TBD)', '', 'https://www.coltala.com', 'https://www.linkedin.com/company/coltala-holdings', 'Business Services, Healthcare, Industrial Services', 'Lower mid-market buy-and-build in services sectors', 'New', '', 'Dallas TX. Permanent capital, focus on founder-owned services businesses.'],
  ['Cranemere Group', '', 'Operating Partner (TBD)', '', 'https://www.cranemere.com', 'https://www.linkedin.com/company/the-cranemere-group', 'Business Services, Healthcare, Industrial Services', 'Long-hold PE, services and industrial companies', 'New', '', 'NYC/London. Permanent capital vehicle. Business services and healthcare portfolio.'],
  ['Kelso Private Equity (Kelso Fund)', '', 'Operating Partner (TBD)', '', 'https://www.kelso.com', 'https://www.linkedin.com/company/kelso-&-company', 'Healthcare, Business Services, Professional Services', 'Insurance distribution, staffing, professional services', 'New', '', 'Already have Kelso & Company but this is their newer growth fund targeting services.'],
  ['Staple Street Capital', '', 'Operating Partner (TBD)', '', 'https://www.staplestreetcapital.com', 'https://www.linkedin.com/company/staple-street-capital', 'Business Services, Tech-Enabled Services, Data Services', 'Data and tech-enabled business services', 'New', '', 'NYC-based, focus on technology and data-enabled services companies.'],
  ['Valor Equity Partners', '', 'Operating Partner (TBD)', '', 'https://www.valorep.com', 'https://www.linkedin.com/company/valor-equity-partners', 'Business Services, Technology, Consumer', 'Operational growth equity, services and technology', 'New', '', 'Chicago-based, operational growth equity. Known for hands-on value creation approach.'],
  ['Auxo Investment Partners', '', 'Operating Partner (TBD)', '', 'https://www.auxoip.com', 'https://www.linkedin.com/company/auxo-investment-partners', 'Healthcare Services, Business Services', 'Lower mid-market healthcare and business services', 'New', '', 'Healthcare and business services focused. Operational value creation team.']
];

async function run() {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});
  
  // Get existing data to find next empty row
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:A'
  });
  const nextRow = (existing.data.values ? existing.data.values.length : 0) + 1;
  
  // Check for header row
  if (!existing.data.values || existing.data.values.length === 0) {
    // Add header first
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [['Company Name', 'Contact Name', 'Title', 'Email', 'Website', 'LinkedIn', 'Sector Focus', 'Portfolio Companies', 'Status', 'Last Contacted', 'Notes']]
      }
    });
  }

  // Remove the Kelso duplicate (entry 17) since Kelso & Company is already in the sheet
  const filteredLeads = newLeads.filter((_, i) => i !== 16);

  // Append new leads
  const result = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1',
    valueInputOption: 'RAW',
    resource: {
      values: filteredLeads
    }
  });
  
  console.log(`Added ${filteredLeads.length} new leads. Updated range: ${result.data.updates.updatedRange}`);
}

run().catch(e => console.error(e));
