const path = require('path');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const updates = [
    // Row 2: Audax - Timothy Porter, MD
    {range:'Sheet1!B2:D2', values:[['Timothy Porter','Managing Director','tporter@audaxprivateequity.com']]},
    {range:'Sheet1!I2', values:[['Enriched']]},
    {range:'Sheet1!K2', values:[['Mid-market PE, Boston-based. $15.5B AUM. Timothy Porter (MD) email verified via Apollo/Contacts sheet. Other MDs: Jason Ellis, Stephen Weaver, Mauricio Sanchez, Matthew Gosselin. 2026-02-18 enrichment.']]},
    
    // Row 9: Harvest Partners - Fabia DeCrescenzo CFO
    {range:'Sheet1!B9:D9', values:[['Fabia DeCrescenzo','Chief Financial Officer','fabia@harvestpartners.com']]},
    {range:'Sheet1!I9', values:[['Enriched']]},
    {range:'Sheet1!K9', values:[['NYC-based mid-market PE. CEO: Michael DeFlorio. Fabia DeCrescenzo (CFO) email verified via Apollo/Contacts (fabia@harvestpartners.com). Other Apollo contacts used non-HP domains. Team: harvestpartners.com/people. 2026-02-18 enrichment.']]},
    
    // Row 15: JLL Partners - Raj Bhavsar CTO (upgrade from IR contact)
    {range:'Sheet1!B15:D15', values:[['Raj Bhavsar','Managing Director/CTO','r.bhavsar@jllpartners.com']]},
    {range:'Sheet1!I15', values:[['Enriched']]},
    {range:'Sheet1!K15', values:[['NYC mid-market PE. Raj Bhavsar (MD/CTO) verified via Contacts sheet. Also: Jeff Hunter (Chief AI Officer), Brooks Powlen (MD), James Shillito (MD). 7 verified contacts. 2026-02-18 enrichment.']]},
    
    // Row 28: Seidler - Eric O Brien Partner
    {range:'Sheet1!B28:D28', values:[["Eric O'Brien",'Partner','ob@sepfunds.com']]},
    {range:'Sheet1!I28', values:[['Enriched']]},
    {range:'Sheet1!K28', values:[["LA-based lower-mid PE. Eric O'Brien (Partner) email verified via Apollo/Contacts. Other partners: Leonard Lee, Tom Denot, Eric Kutsenda. 9 verified contacts total. 2026-02-18 enrichment."]]},
    
    // Row 69: Renovus - Bradley Whitman Founding Partner
    {range:'Sheet1!B69:D69', values:[['Bradley Whitman','Founding Partner','brad.whitman@renovuscapital.com']]},
    {range:'Sheet1!I69', values:[['Enriched']]},
    {range:'Sheet1!K69', values:[['Wayne PA. Knowledge & Talent PE. $875M Fund IV. Bradley Whitman (Founding Partner) verified. Other founders: Atif Gilani, Jesse Serventi. 9 verified contacts. #1 HEC-Dow Jones small-cap PE 3 yrs. 2026-02-18 enrichment.']]},
    
    // Row 107: Quad Partners - Basil Katsamakis Operating Partner
    {range:'Sheet1!B107:D107', values:[['Basil Katsamakis','Operating Partner','basil@quadpartners.com']]},
    {range:'Sheet1!I107', values:[['Enriched']]},
    {range:'Sheet1!K107', values:[['NYC education-focused PE. Basil Katsamakis (Operating Partner) verified. Also: Andrew Herrick (VP), Seth Martin (CEO). 7 verified contacts. 2026-02-18 enrichment.']]},
    
    // Row 130: Blackford Capital - Jeffrey Johnson MD
    {range:'Sheet1!B130:D130', values:[['Jeffrey Johnson','Managing Director','jjohnson@blackfordcapital.com']]},
    {range:'Sheet1!I130', values:[['Enriched']]},
    {range:'Sheet1!K130', values:[['Grand Rapids MI. Lower-mid mfg/distribution/services PE. Jeff Johnson (MD) 2025 Notable Leader in Finance. Verified. Also: Rick Lopez (MD), Kristen Muir (VP Portfolio Ops), Rob Leonard (Operating Partner). 2026-02-18 enrichment.']]},
    
    // Row 60: PSG Equity - no contacts found
    {range:'Sheet1!K60', values:[['Growth equity, software-focused. No individual contacts found via Apollo (credits exhausted). Team page JS-rendered. Needs manual LinkedIn research. 2026-02-18 attempted enrichment.']]},
    
    // Row 161: Thomas H. Lee Partners - no contacts found
    {range:'Sheet1!K161', values:[['Boston. Large-cap PE ($30B+ AUM). No individual contacts found via Apollo. Team page JS-rendered. Needs manual research. 2026-02-18 attempted enrichment.']]},
    
    // Row 195: Vance Street Capital - no contacts found
    {range:'Sheet1!K195', values:[['LA-based industrials PE. No individual contacts found via Apollo (credits exhausted). 2026-02-18 attempted enrichment.']]},
    
    // Row 198: Valeas Capital Partners - already has Rob Little, keep as-is
    // Row 117: Keltic Financial Partners - dead lead, skip
  ];
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {valueInputOption: 'RAW', data: updates}
  });
  console.log('Done! Updated ' + updates.length + ' cell ranges across Sheet1');
}

main().catch(console.error);
