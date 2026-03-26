const {google} = require('googleapis');
const {JWT} = require('google-auth-library');
const creds = require('./service-account.json');

async function main() {
  const auth = new JWT({email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
  const sheets = google.sheets({version:'v4', auth});
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Get all rows to find matching firms
  const res = await sheets.spreadsheets.values.get({spreadsheetId, range: 'Sheet1!A:K'});
  const rows = res.data.values || [];
  
  // Enrichment data: company name -> {contact, title, email}
  const enrichments = {
    'Audax': {contact: 'Geoffrey Rehnert', title: 'Co-CEO', email: 'PELPrequests@audaxprivateequity.com'},
    'Shore Capital': {contact: 'Justin Ishbia', title: 'Managing Partner', email: ''},
    'Align Capital': {contact: 'Rob Langley', title: 'Co-Founder and Managing Partner', email: ''},
    'Charlesbank': {contact: 'Michael Choe', title: 'Managing Partner, CEO', email: 'pro-charlesbank@prosek.com'},
    'Compass Group': {contact: 'Chris Gibson', title: 'Managing Partner', email: ''},
    'Gemspring': {contact: 'Bret Wiener', title: 'Founder & CEO', email: ''},
    'Gryphon': {contact: 'N/A', title: '', email: 'info@gryphoninvestors.com'},
    'Harvest Partners': {contact: 'Michael DeFlorio', title: 'CEO', email: 'info@harvestpartners.com'},
    'HGGC': {contact: 'Rich Lawson', title: 'CEO & Managing Partner', email: ''},
    'Huron Capital': {contact: 'Brian Demkowicz', title: 'Chairman & Founding Partner', email: 'lierardi@huroncapital.com'},
    'Incline Equity': {contact: 'Jack Glover', title: 'Managing Partner', email: ''},
    'Kelso': {contact: 'Chris Collins', title: 'Co-CEO', email: ''},
    'Knox Lane': {contact: 'John Bailey', title: 'Managing Partner & Founder', email: 'info@knoxlane.com'},
    'Olympus Partners': {contact: 'Rob Morris', title: 'CEO & Chairman', email: ''},
    'Peak Rock': {contact: 'Anthony DiSimone', title: 'CEO', email: 'ir@peakrockcapital.com'},
    'Roark Capital': {contact: 'Neal Aronson', title: 'Founder and Managing Partner', email: 'naronson@roarkcapital.com'},
    'Seidler': {contact: 'N/A', title: '', email: 'info@sepfunds.com'},
    'Sentinel Capital': {contact: 'David S. Lobel', title: 'Managing Partner', email: 'info@sentinelpartners.com'},
    'ShoreView': {contact: 'Thomas D\'Ovidio', title: 'Partner', email: 'info@shoreview.com'},
    'Trilantic': {contact: 'Charlie Ayres', title: 'Chairman and Managing Partner', email: ''},
  };

  const updates = [];
  for (let i = 1; i < rows.length; i++) {
    const companyName = (rows[i][0] || '').trim();
    for (const [key, data] of Object.entries(enrichments)) {
      if (companyName.toLowerCase().includes(key.toLowerCase())) {
        const rowNum = i + 1;
        // Update contact name (B), title (C), email (D)
        if (data.contact && data.contact !== 'N/A') {
          updates.push({range: `Sheet1!B${rowNum}`, values: [[data.contact]]});
        }
        if (data.title) {
          updates.push({range: `Sheet1!C${rowNum}`, values: [[data.title]]});
        }
        if (data.email) {
          updates.push({range: `Sheet1!D${rowNum}`, values: [[data.email]]});
        }
        console.log(`Row ${rowNum}: ${companyName} -> ${data.contact} / ${data.email || 'no email'}`);
        break;
      }
    }
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {valueInputOption: 'USER_ENTERED', data: updates},
    });
    console.log(`Updated ${updates.length} cells across PE firms.`);
  } else {
    console.log('No matching rows found to update.');
  }
}

main().catch(e => console.error(e.message));
