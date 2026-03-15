const { google } = require('googleapis');
const path = require('path');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SHEET_NAME = 'Sheet1';
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Enrichment data from March 9, 9:40 AM research
  const enrichments = [
    {
      row: 988,
      firm: 'Renovus Capital Partners',
      website: 'https://renovuscapital.com',
      contactName: 'Atif Gilani',
      title: 'Founding Partner',
      email: '',  // No direct email found
      linkedin: 'https://www.linkedin.com/company/renovus-capital-partners',
      phone: '',
      status: 'Enriched',
      notes: 'Wayne, PA. $2B+ committed capital. Founded 2010. Knowledge and Talent industry focus (education, healthcare services, professional services, tech services). 100+ portfolio companies. Team: Jason Tanker (MD, Tech Services), Daniel Maine (CFO). Website active but no direct emails published.'
    },
    {
      row: 989,
      firm: 'Linsalata Capital Partners',
      website: '',  // Website appears inactive
      contactName: 'Eric Bacon',
      title: 'Co-President & Senior Managing Director',
      email: '',  // No direct email found
      linkedin: 'https://www.linkedin.com/in/eric-bacon-48411557/',
      phone: '',
      status: 'Enriched',
      notes: 'Cleveland, OH (5900 Landerbrook Drive). Founded 1984. Lower middle market buyout firm. Sectors: aerospace & defense, automotive aftermarket, building products, business services. Website inactive. LinkedIn active.'
    },
    {
      row: 990,
      firm: 'High Road Capital Partners',
      website: 'https://www.highroadcap.com',
      contactName: 'Robert Fitzsimmons',
      title: 'Partner',
      email: '',  // No direct email found
      linkedin: 'https://www.linkedin.com/in/robert-fitzsimmons-7b85558/',
      phone: '',
      status: 'Enriched',
      notes: 'New York. Formed 2007. $470M+ committed capital. 80+ years combined team experience. Smaller end of middle market. Philosophy: "If you take the High Road in life, you\'ll always wind up in a better place."'
    },
    {
      row: 991,
      firm: 'Pharos Capital Group',
      website: 'https://www.pharosfunds.com',
      contactName: 'Kneeland Youngblood',
      title: 'Founding Partner & Chief Investment Officer',
      email: '',  // No direct email found
      linkedin: 'https://www.linkedin.com/company/pharos-capital-group',
      phone: '',
      status: 'Enriched',
      notes: 'Dallas & Nashville. Physician-founded PE firm. Healthcare services, healthcare IT, outsourced care management. 50+ companies. Focus: lower cost of care, improve outcomes, expand access. Youngblood: 27+ years healthcare investment experience.'
    },
    {
      row: 992,
      firm: 'Shoreview Capital',
      website: 'https://www.shoreview.com',
      contactName: 'Peter Zimmerman',
      title: 'Partner',
      email: '',  // No direct email found
      linkedin: 'https://www.linkedin.com/in/peter-zimmerman-a9b4a918/',
      phone: '',
      status: 'Enriched (NOTE: Likely duplicate of ShoreView Industries row 13)',
      notes: 'Full name: ShoreView Industries, LLC. Minneapolis, MN (222 S 9th St Suite 3300). Founded 2002. $1.3B+ committed capital (4 funds). Lower-middle market. Sectors: engineered products, distribution, industrial services, business services, healthcare, niche consumer. Family/entrepreneurial-owned company focus. Other partners: Brett Habstritt, Adam Reeves, Eric Paquette.'
    }
  ];

  const updates = [];

  for (const enrich of enrichments) {
    const row = enrich.row;
    
    // Column B: Website
    if (enrich.website) {
      updates.push({
        range: `${SHEET_NAME}!B${row}`,
        values: [[enrich.website]],
      });
    }
    
    // Column C: Contact Name
    updates.push({
      range: `${SHEET_NAME}!C${row}`,
      values: [[enrich.contactName]],
    });
    
    // Column D: Title
    updates.push({
      range: `${SHEET_NAME}!D${row}`,
      values: [[enrich.title]],
    });
    
    // Column E: Email (empty but keep placeholder)
    if (enrich.email) {
      updates.push({
        range: `${SHEET_NAME}!E${row}`,
        values: [[enrich.email]],
      });
    }
    
    // Column F: LinkedIn
    if (enrich.linkedin) {
      updates.push({
        range: `${SHEET_NAME}!F${row}`,
        values: [[enrich.linkedin]],
      });
    }
    
    // Column J: Status
    updates.push({
      range: `${SHEET_NAME}!J${row}`,
      values: [[enrich.status]],
    });
    
    // Column K: Notes
    updates.push({
      range: `${SHEET_NAME}!K${row}`,
      values: [[enrich.notes]],
    });
  }

  if (updates.length > 0) {
    const batchUpdateRequest = {
      spreadsheetId: SHEET_ID,
      resource: {
        data: updates,
        valueInputOption: 'RAW',
      },
    };

    const response = await sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
    console.log(`Updated ${response.data.totalUpdatedCells} cells across ${updates.length} ranges.`);
    console.log('\nEnriched firms:');
    enrichments.forEach(e => console.log(`- Row ${e.row}: ${e.firm} (${e.contactName}, ${e.title})`));
  } else {
    console.log('No updates to make.');
  }
}

updateSheet().catch(console.error);
