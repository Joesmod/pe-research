const path = require('path');
const https = require('https');
const dir = path.join(__dirname, 'gmail-outreach');
const {google} = require(path.join(dir, 'node_modules', 'googleapis'));
const {JWT} = require(path.join(dir, 'node_modules', 'google-auth-library'));
const creds = require(path.join(dir, 'service-account.json'));
const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const sheets = google.sheets({version:'v4', auth});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

(async()=>{
  const updates = [
    {range:'Sheet1!B243:C243', values:[['Kamil Salame','Chief Executive Officer']]},
    {range:'Sheet1!K243', values:[['CEO confirmed via cranemere.com/team 2026-02-17. Vincent Mai is Founder/Chairman. No direct email published.']]},
    
    {range:'Sheet1!K10', values:[['CEO confirmed via harvestpartners.com/people 2026-02-17. Stephen Carlson (President PE), Doug Campbell (Partner) also senior. Only info@ published.']]},
    {range:'Sheet1!K224', values:[['Same firm as row 10. CEO confirmed via harvestpartners.com/people. Only info@ published.']]},
    
    {range:'Sheet1!C70', values:[['Founding Partner']]},
    {range:'Sheet1!K70', values:[['Founding Partner confirmed via renovuscapital.com/our-team 2026-02-17. Jesse Serventi also Founding Partner. Only info@ published.']]},
    
    {range:'Sheet1!C239', values:[['Managing Partner']]},
    {range:'Sheet1!K239', values:[['Managing Partner confirmed via aquiline.com/team 2026-02-17. Jeff Greenberg (Partner/Chairman). Only contact@ published.']]},
    
    {range:'Sheet1!K232', values:[['324 staff per cdr.com/team. Vindi Banga (Op Partner), Orla Beggs (Partner HC), Sam Camens (MD). No direct emails. Very large firm.']]},

    {range:'Sheet1!K29', values:[['Only info@sepfunds.com published. No direct email found 2026-02-17.']]},
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: updates }
  });
  console.log('Updated ' + updates.length + ' cells');
})();
