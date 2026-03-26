const { google } = require('googleapis');
const fs = require('fs');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'C:\\Users\\aljen\\.openclaw\\workspace-jim\\projects\\gmail-outreach\\service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

  // Read current data to find row numbers
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K'
  });
  
  const rows = readRes.data.values;
  const updates = [];

  // Helper to find row by firm name
  const findRow = (firmName) => {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toLowerCase().includes(firmName.toLowerCase())) {
        return i + 1; // +1 for 1-indexed
      }
    }
    return null;
  };

  // Enrichment data with verified info
  const enrichments = [
    {
      firm: 'Aquiline Capital Partners',
      contact: 'Mike Szymanski',
      title: 'Managing Director',
      email: '', // No verified public email
      linkedin: 'https://www.linkedin.com/in/mszymanski1/',
      status: 'Contact Found - Needs Email',
      notes: 'MD on credit team (joined 2025). Official team page aquiline.com/team. No public email found.'
    },
    {
      firm: 'Arrowroot Capital',
      contact: 'Thomas Oh',
      title: 'Partner',
      email: '', // Pattern only, not verified public
      linkedin: 'https://www.linkedin.com/in/thomasoh52/',
      status: 'Contact Found - Needs Email',
      notes: 'Partner confirmed on arrowrootcapital.com/team. Software-focused PE. No public email found.'
    },
    {
      firm: 'District Partners',
      contact: 'Kevin Gerrity',
      title: 'Managing Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/kevingerrityjr/',
      status: 'Dead - Not PE Firm',
      notes: 'Executive search/recruiting firm serving PE, not an investor. Should remove from target list.'
    },
    {
      firm: 'Drake Star Partners',
      contact: 'James Turino',
      title: 'Managing Partner & Co-Founder',
      email: '', // Phone on site: +1 917 757 0212
      linkedin: 'https://www.linkedin.com/in/james-turino-5486475/',
      status: 'Dead - Not PE Firm',
      notes: 'Investment bank (M&A advisory), not PE investor. Phone: +1 917 757 0212. drakestar.com'
    },
    {
      firm: 'Eastward Partners',
      contact: 'Lindsey Webb',
      title: 'Managing Director, Professional Services',
      email: '',
      linkedin: 'https://www.linkedin.com/in/webblindsey/',
      status: 'Dead - Not PE Firm',
      notes: 'Executive search firm (recruiting for PE), not an investor. eastwardpartners.com'
    },
    {
      firm: 'Energy Impact Partners',
      contact: 'Lindsay Luger',
      title: 'Co-Founder & Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/lindsay-luger-76b35037/',
      status: 'Contact Found - Needs Email',
      notes: 'VC firm focused on energy/climate tech. Official: energyimpactpartners.com/team. No public email.'
    },
    {
      firm: 'EquityZen',
      contact: 'Phil Haslett',
      title: 'Founder & Chief Strategy Officer',
      email: '',
      linkedin: 'https://www.linkedin.com/in/philhaslett/',
      status: 'Dead - Not PE Firm',
      notes: 'Marketplace/platform for private shares, not a PE investor. equityzen.com'
    },
    {
      firm: 'Evolution Credit Partners',
      contact: 'John-Carl Barone',
      title: 'Managing Director',
      email: '',
      linkedin: 'https://www.linkedin.com/in/jcbarone/',
      status: 'Contact Found - Needs Email',
      notes: 'MD at alternative credit firm ($3B AUM), joined April 2024. evolutioncreditpartners.com/team/jc-barone. No public email.'
    },
    {
      firm: 'FTV Capital',
      contact: 'Arun Singh',
      title: 'Principal',
      email: '', // Pattern only
      linkedin: 'https://www.linkedin.com/in/arun0201/',
      status: 'Contact Found - Needs Email',
      notes: 'Growth equity investor 5+ years at FTV. ftvcapital.com/team-member/arun-singh. No public email found.'
    },
    {
      firm: 'Flyover Capital',
      contact: 'Patrick Berry',
      title: 'Senior Associate',
      email: '',
      linkedin: '', // Could search but not priority
      status: 'Contact Found - Needs Email',
      notes: 'Senior Associate (not Principal). VC firm, Kansas City. flyovercapital.com/team/patrick-berry. No public email.'
    },
    {
      firm: 'Garden City Equity',
      contact: 'Michael Arrieta',
      title: 'Founder & CEO',
      email: '',
      linkedin: 'https://www.linkedin.com/in/michaelarrieta/',
      status: 'Contact Found - Needs Email',
      notes: 'Founder/CEO of holding company acquiring family businesses. gardencityequity.com/team/michael-arrieta. No business email found.'
    },
    {
      firm: 'GiantLeap Capital',
      contact: 'Himanshu Sekhar',
      title: 'Co-Founder & Managing Partner',
      email: '',
      linkedin: '', // Not priority for now
      status: 'Contact Found - Needs Email',
      notes: 'Growth equity, tech convergence fund. giantleapcapital.com/team/himanshu. NYC-based. No public email.'
    },
    {
      firm: 'Graycliff Partners',
      contact: 'Stephen Hindmarch',
      title: 'Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/stephen-hindmarch-7978b611/',
      status: 'Contact Found - Needs Email',
      notes: 'Partner per graycliffpartners.com/our-team-1. Seattle-based PE. No public email found.'
    },
    {
      firm: 'Griffin Capital',
      contact: 'William Messori',
      title: 'Director, Development',
      email: '',
      linkedin: '',
      status: 'Dead - Real Estate Focus',
      notes: 'Real estate investment firm, not traditional PE. griffincapital.com/team. Should remove from target list.'
    },
    {
      firm: 'Sun Capital Partners',
      contact: 'Matthew Garff',
      title: 'Senior Managing Director & Partner',
      email: '',
      linkedin: 'https://www.linkedin.com/in/matthew-garff-a2b254b/',
      status: 'Contact Found - Needs Email',
      notes: 'SMD & Partner, Co-Head of US Transaction Team, LA office. 23 years at firm. suncappart.com/team/matthew-n-garff. No public email.'
    },
    {
      firm: 'Svoboda Capital Partners',
      contact: 'Tom Brooker',
      title: 'Managing Director & Operating Partner',
      email: 'tbrooker@svoco.com',
      linkedin: '',
      status: 'Enriched',
      notes: 'MD & Operating Partner per svoco.com/our-team. Email found on ContactOut (tbrooker@svoco.com). Chicago-based PE.'
    }
  ];

  // Build batch update request
  const data = [];
  
  for (const enrich of enrichments) {
    const rowNum = findRow(enrich.firm);
    if (!rowNum) {
      console.log(`Could not find row for ${enrich.firm}`);
      continue;
    }

    // Update columns: C=Contact Name, D=Title, E=Email, G=LinkedIn, H=Status, I=Notes
    if (enrich.contact) {
      data.push({
        range: `Sheet1!C${rowNum}`,
        values: [[enrich.contact]]
      });
    }
    if (enrich.title) {
      data.push({
        range: `Sheet1!D${rowNum}`,
        values: [[enrich.title]]
      });
    }
    if (enrich.email) {
      data.push({
        range: `Sheet1!E${rowNum}`,
        values: [[enrich.email]]
      });
    }
    if (enrich.linkedin) {
      data.push({
        range: `Sheet1!G${rowNum}`,
        values: [[enrich.linkedin]]
      });
    }
    if (enrich.status) {
      data.push({
        range: `Sheet1!H${rowNum}`,
        values: [[enrich.status]]
      });
    }
    if (enrich.notes) {
      data.push({
        range: `Sheet1!I${rowNum}`,
        values: [[enrich.notes]]
      });
    }
  }

  if (data.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: data
      }
    });
    console.log(`Updated ${enrichments.length} firms with ${data.length} field updates`);
  }
}

updateSheet().catch(console.error);
