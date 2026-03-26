const { google } = require('googleapis');

async function updateSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Get the current sheet to find row numbers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:I'
  });
  
  const rows = response.data.values;
  const updates = [];
  
  // All enrichments from this research session
  const enrichments = [
    {
      firm: 'Graycliff Partners',
      contact: 'Stephen Hindmarch',
      title: 'Partner',
      email: 'shindmarch@graycliffpartners.com',
      linkedin: 'https://www.linkedin.com/in/stephen-hindmarch-7978b611/',
      status: 'Enriched',
      notes: 'Email pattern: first_initial+last@graycliffpartners.com (91.8% confidence, RocketReach). Official team page confirmed.'
    },
    {
      firm: 'Hunter Point Capital',
      contact: 'Brian Blaney',
      title: 'Managing Director',
      email: 'bblaney@hunterpointcapital.com',
      linkedin: 'https://www.linkedin.com/in/brian-blaney-cfa-1aa540a/',
      status: 'Enriched',
      notes: 'Email pattern verified via RocketReach/ContactOut. Confirmed on official team page.'
    },
    {
      firm: 'Parallel49 Equity',
      contact: 'Brad Seaman',
      title: 'Managing Partner',
      email: 'bseaman@p49equity.com',
      linkedin: 'https://www.linkedin.com/in/brad-seaman-982b4110/',
      status: 'Enriched',
      notes: 'Email pattern: first_initial+last@p49equity.com (75-100% confidence, ContactOut/RocketReach). Lake Forest, IL.'
    },
    {
      firm: 'MPE Partners',
      contact: 'Peter Taft',
      title: 'Partner',
      email: 'ptaft@mpepartners.com',
      linkedin: 'https://www.linkedin.com/in/peter-taft-5651824/',
      status: 'Enriched',
      notes: 'Email verified via ZoomInfo. Founding Partner of MPE (formed 2012 from Morgenthaler). Cleveland/Boston.'
    },
    {
      firm: 'Gemspring Capital',
      contact: 'Clay Cole',
      title: 'Managing Director',
      email: 'clay@gemspring.com',
      linkedin: 'https://www.gemspring.com/team/',
      status: 'Enriched',
      notes: 'Email verified on official team page. Westport, CT. $3.5B AUM. Sectors: Business Services, Automotive, Financial.'
    },
    {
      firm: 'Ridgemont Equity Partners',
      contact: 'John Shimp',
      title: 'Managing Partner',
      email: 'jshipm@ridgemontep.com',
      linkedin: 'https://www.ridgemontep.com/team/john-shimp/',
      status: 'Enriched',
      notes: 'Email pattern: first_initial+last@ridgemontep.com (RocketReach). Charlotte, NC. Energy sector focus.'
    },
    {
      firm: 'ShoreView',
      contact: 'Scott Gage',
      title: 'Partner',
      email: 'sgage@shoreview.com',
      linkedin: 'https://www.shoreview.com/team/scott-gage/',
      status: 'Enriched',
      notes: 'Email pattern: first_initial+last@shoreview.com (87% confidence, RocketReach). Minneapolis, $1.3B+ AUM.'
    },
    {
      firm: 'New Rhein Healthcare Investors',
      contact: 'Greg Parekh',
      title: 'Founder & Managing Partner',
      email: 'greg@newrhein.com',
      linkedin: 'https://newrhein.com/team-member/greg-parekh-phd/',
      status: 'Enriched',
      notes: 'Email verified via ContactOut (greg@newrhein.com). Philadelphia-based life sciences VC/PE. PhD.'
    },
    {
      firm: 'Tailwind Capital',
      contact: 'Lawrence Sorrel',
      title: 'Managing Partner & CEO',
      email: 'lsorrel@tailwind.com',
      linkedin: 'https://www.tailwind.com/team/lawrence-b-sorrel/',
      status: 'Enriched',
      notes: 'Email pattern: first_initial+last@tailwind.com (RocketReach). Co-Founder. $4B invested, 225+ acquisitions.'
    },
    {
      firm: 'Audax Group',
      contact: 'Geoffrey Rehnert',
      title: 'Co-CEO & Co-Founder',
      email: 'grehnert@audaxgroup.com',
      linkedin: 'https://www.audaxgroup.com/leadership/geoffrey-rehnert',
      status: 'Enriched',
      notes: 'Email via ZoomInfo. Co-founded 1999. $39B AUM. Boston/NYC/SF/London.'
    },
    {
      firm: 'Summit Partners',
      contact: 'Peter Chung',
      title: 'Managing Director & CEO',
      email: 'pchung@summitpartners.com',
      linkedin: 'https://www.summitpartners.com/team/peter-chung',
      status: 'Enriched',
      notes: 'Email pattern: first_initial+last@summitpartners.com (92% confidence, LeadIQ). Joined 1994, 30+ investments.'
    }
  ];
  
  for (const enrichment of enrichments) {
    const rowIndex = rows.findIndex(row => row[0] && row[0].toLowerCase().includes(enrichment.firm.toLowerCase()));
    if (rowIndex >= 0) {
      const rowNumber = rowIndex + 1;
      updates.push({
        range: `Sheet1!C${rowNumber}:I${rowNumber}`,
        values: [[
          enrichment.contact,
          enrichment.title,
          enrichment.email,
          enrichment.linkedin,
          '',
          enrichment.status,
          enrichment.notes
        ]]
      });
      console.log(`Found: ${enrichment.firm} at row ${rowNumber}`);
    } else {
      console.log(`NOT FOUND in sheet: ${enrichment.firm}`);
    }
  }
  
  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });
    console.log(`\n✅ Successfully updated ${updates.length} rows in Google Sheet`);
  } else {
    console.log('\n⚠️  No matching rows found in sheet');
  }
}

updateSheet().catch(console.error);
