const path = require('path');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

const newLeads = [
  ["Great Hill Partners", "", "Operating Partner (TBD)", "", "https://www.greathillpartners.com", "https://www.linkedin.com/company/great-hill-partners", "Software, Healthcare, Business Services, Financial Technology", "ZoomInfo, Bombora, iCIMS", "New", "", "$2.7B AUM. Boston-based. Targets $100-500M investments in high-growth mid-market."],
  ["Vestar Capital Partners", "", "Operating Partner (TBD)", "", "https://www.vestarcapital.com", "https://www.linkedin.com/company/vestar-capital-partners", "Consumer, Healthcare, Business Services", "Birds Eye Foods, Sun Products", "New", "", "NY-based. Founded 1988. Middle-market buyouts and growth capital. Strong healthcare services focus."],
  ["Norwest Equity Partners", "", "Operating Partner (TBD)", "", "https://nep.com", "https://www.linkedin.com/company/norwest-equity-partners", "Business Services, Consumer Services, Industrials", "Various mid-market platforms", "New", "", "Minneapolis-based since 1961. Has dedicated operating partners and advisors. Mid-market focus."],
  ["HCI Equity Partners", "", "Operating Partner (TBD)", "", "https://www.hciequity.com", "https://www.linkedin.com/company/hci-equity-partners", "Industrial Services, Business Services, Distribution", "Various lower mid-market services cos", "New", "", "Washington DC. Lower mid-market. 6x Inc. Founder-Friendly Investor. Operational value creation focus."],
  ["Flexpoint Ford", "", "Operating Partner (TBD)", "", "https://www.flexpointford.com", "https://www.linkedin.com/company/flexpoint-ford", "Financial Services, Healthcare", "Insurance platforms, healthcare services", "New", "", "Chicago-based. $6B+ AUM. Deep financial/healthcare services expertise. Strong operating team."],
  ["NewSpring Capital", "", "Operating Partner (TBD)", "", "https://www.newspringcapital.com", "https://www.linkedin.com/company/newspring-capital", "Business Services, Healthcare, Technology", "Various mid-market platforms", "New", "", "Radnor PA. 151+ investments. Operational knowledge focus. Growth equity and buyouts."],
  ["Sagewind Capital", "", "Operating Partner (TBD)", "", "https://www.sagewindcapital.com", "https://www.linkedin.com/company/sagewind-capital", "Business Services, Healthcare Services, Specialty Distribution", "Various services platforms", "New", "", "NY-based mid-market PE. Focus on services businesses with recurring revenue. Value creation team."],
  ["CIP Capital", "", "Operating Partner (TBD)", "", "https://www.cipcapital.com", "https://www.linkedin.com/company/cip-capital", "Business Services, Healthcare, Industrial", "Various mid-market service companies", "New", "", "NY-based. Lower mid-market PE focused on services and industrial. Operating partner model."],
  ["Vance Street Capital", "", "Operating Partner (TBD)", "", "https://www.vancestreetcapital.com", "https://www.linkedin.com/company/vance-street-capital", "Industrial Technology, Business Services", "Niche industrial and services platforms", "New", "", "LA-based. Lower mid-market. Focus on niche industrial services with value creation approach."],
  ["Patient Square Capital", "", "Operating Partner (TBD)", "", "https://www.patientsquarecapital.com", "https://www.linkedin.com/company/patient-square-capital", "Healthcare Services, Life Sciences, Healthcare IT", "Various healthcare services platforms", "New", "", "Menlo Park. Dedicated healthcare PE. $3.9B Fund I. Deep healthcare ops expertise."],
  ["Guardian Capital Partners", "", "Operating Partner (TBD)", "", "https://www.guardiancp.com", "https://www.linkedin.com/company/guardian-capital-partners", "Professional Services, IT Services, Business Services", "Various professional services cos", "New", "", "Wayne PA. Control-oriented, operationally focused PE. Professional services specialist."],
  ["Valeas Capital Partners", "", "Operating Partner (TBD)", "", "https://www.valeascapital.com", "https://www.linkedin.com/company/valeas-capital-partners", "Professional Services, Accounting, Business Services", "Baker Tilly (co-investment w/ H&F)", "New", "", "Professional services-focused PE. Led largest PE investment in US CPA sector. Strong ops team."],
  ["RLJ Equity Partners", "", "Operating Partner (TBD)", "", "https://www.rljequitypartners.com", "https://www.linkedin.com/company/rlj-equity-partners", "Business Services, Healthcare Services, Government Services", "Various mid-market services platforms", "New", "", "Bethesda MD. Mid-market PE targeting services businesses. Value creation and operating team."],
  ["Resurgens Technology Partners", "", "Operating Partner (TBD)", "", "https://www.resurgenstp.com", "https://www.linkedin.com/company/resurgens-technology-partners", "Tech-Enabled Business Services, Healthcare IT, SaaS", "Various tech-enabled services cos", "New", "", "Atlanta-based. Mid-market. Focus on tech-enabled business services. Operating partner model."],
  ["Brentwood Associates", "", "Operating Partner (TBD)", "", "https://www.brentwoodassociates.com", "https://www.linkedin.com/company/brentwood-associates", "Services, Consumer, Healthcare Services", "Various services and consumer platforms", "New", "", "LA-based. Mid-market PE since 1984. Focus on services businesses. Dedicated operating resources."],
  ["Kainos Capital", "", "Operating Partner (TBD)", "", "https://www.kainoscapital.com", "https://www.linkedin.com/company/kainos-capital", "Food & Consumer Services, Business Services", "Various consumer and services platforms", "New", "", "Dallas-based. Mid-market. Active operating approach with value creation playbook."],
  ["Ascend Partners", "", "Operating Partner (TBD)", "", "https://www.ascendpartners.com", "https://www.linkedin.com/company/ascend-partners-healthcare", "Healthcare Services", "Healthcare services platforms", "New", "", "NY-based. Founded 2019. Healthcare-focused PE. Growth and expansion of healthcare enterprises."],
  ["Midwest Growth Partners", "", "Operating Partner (TBD)", "", "https://www.mgpfund.com", "https://www.linkedin.com/company/midwest-growth-partners", "Professional Services, Business Services", "Various growth-oriented mid-market cos", "New", "", "West Des Moines IA. Growth-oriented PE. 25+ investments. Professional services focus."],
  ["Rhône Group", "", "Operating Partner (TBD)", "", "https://www.rhonegroup.com", "https://www.linkedin.com/company/rhone-group", "Professional Services, Finance, Industrial", "Various European and US services cos", "New", "", "NY-based. Transatlantic PE. Leveraged buyouts, recapitalizations. Professional services sector."],
  ["General Atlantic", "", "Operating Partner (TBD)", "", "https://www.generalatlantic.com", "https://www.linkedin.com/company/general-atlantic", "Healthcare Services, Financial Services, Technology, Business Services", "Various large growth platforms globally", "New", "", "$84B+ AUM. Growth equity powerhouse. Healthcare services, digital health, provider tech. Large ops team."]
];

async function addLeads() {
  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K',
      valueInputOption: 'RAW',
      resource: { values: newLeads }
    });
    console.log('Added', res.data.updates.updatedRows, 'rows');
  } catch(e) {
    console.error('Error:', e.message);
  }
}
addLeads();
