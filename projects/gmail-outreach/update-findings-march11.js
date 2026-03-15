const { google } = require('googleapis');

const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateFindings() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Update Thomas H. Lee Partners (Row 161)
  // Joshua Nelson, Managing Director, Head of Healthcare Vertical
  // Email: jnelson@thl.com (confirmed from website)
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      data: [
        { range: 'Sheet1!C161', values: [['Joshua Nelson']] },
        { range: 'Sheet1!D161', values: [['Managing Director, Head of Healthcare Vertical']] },
        { range: 'Sheet1!E161', values: [['jnelson@thl.com']] },
        { range: 'Sheet1!G161', values: [['N/A']] },
        { range: 'Sheet1!J161', values: [['Enriched']] },
        { range: 'Sheet1!L161', values: [['Web research: Found from THL website article. Email confirmed published on thl.com bioprocessing article. Pattern: [first initial][last name]@thl.com. Senior healthcare lead. 2026-03-11']] }
      ],
      valueInputOption: 'RAW'
    }
  });
  
  console.log('✅ Updated Thomas H. Lee Partners (Row 161) - Joshua Nelson');
  
  // Update Hg Capital (Row 176)
  // Nic Humphries, Senior Partner & Executive Chairman
  // Email pattern likely: [first name].[last name]@hgcapital.com
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      data: [
        { range: 'Sheet1!C176', values: [['Nic Humphries']] },
        { range: 'Sheet1!D176', values: [['Senior Partner & Executive Chairman']] },
        { range: 'Sheet1!E176', values: [['nic.humphries@hgcapital.com']] },
        { range: 'Sheet1!G176', values: [['https://hgcapital.com/team/Nic-Humphries']] },
        { range: 'Sheet1!J176', values: [['Enriched']] },
        { range: 'Sheet1!L176', values: [['Web research: Found from Hg Capital website. Top executive, founded Hg software team 2001. Email pattern likely: [first].[last]@hgcapital.com (NOT VERIFIED - test carefully). 2026-03-11']] }
      ],
      valueInputOption: 'RAW'
    }
  });
  
  console.log('✅ Updated Hg Capital (Row 176) - Nic Humphries');
  
  console.log('\n📊 Manual enrichment complete!');
  console.log('✅ 2 firms enriched with decision-maker contacts');
  console.log('⚠️ Hg Capital email not verified - may bounce');
}

updateFindings().catch(console.error);
