const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']});

(async()=>{
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  const res = await sheets.spreadsheets.values.get({spreadsheetId:'11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4', range:'Contacts!A:A'});
  const rows = (res.data.values||[]).slice(1).map(r=>r[0]).filter(Boolean);
  const firms = [...new Set(rows)];
  console.log('Total unique firms with contacts:', firms.length);
  
  const res2 = await sheets.spreadsheets.values.get({spreadsheetId:'11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4', range:"Company Intel!A:A"});
  const intelFirms = new Set((res2.data.values||[]).slice(1).map(r=>r[0]).filter(Boolean));
  console.log('Firms with intel:', intelFirms.size);
  
  const needIntel = firms.filter(f=>!intelFirms.has(f));
  console.log('Need intel:', needIntel.length);
  needIntel.slice(0,50).forEach(f=>console.log(f));
})();
