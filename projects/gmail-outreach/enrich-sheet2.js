const { google } = require('googleapis');

async function enrichSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read current data first
  const readResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:K',
  });
  
  const rows = readResponse.data.values;
  console.log(`Total rows: ${rows.length}`);
  
  // Find rows to update
  const updates = [];
  
  // Map: Firm Name -> Row Index for quick lookup
  const firmRowMap = {};
  rows.forEach((row, idx) => {
    if (idx > 0 && row[0]) { // Skip header, ensure firm name exists
      firmRowMap[row[0].trim()] = idx;
    }
  });
  
  // Additional enrichments based on research (ONLY VERIFIED CONTACTS)
  const enrichments = [
    {
      firm: 'SpaceFund',
      contact: 'Meagan Crawford',
      title: 'Co-Founder and Managing Partner',
      email: 'meagan@spacefund.com',
      linkedin: 'https://www.linkedin.com/in/meagan-crawford/',
      status: 'Enriched',
      notes: 'Email from Emerging Manager Monthly public directory'
    },
    {
      firm: 'Sunstone Partners',
      contact: 'Gus Alberelli',
      title: 'Co-Founder & Managing Partner',
      email: '',
      linkedin: '',
      status: 'Enriched',
      notes: 'Team info from official website; co-founder with Mike Biggee'
    },
    {
      firm: 'Sunstone Partners',
      contact: 'Mike Biggee',
      title: 'Co-Founder & Managing Partner',
      email: '',
      linkedin: '',
      status: 'Enriched',
      notes: 'Team info from official website'
    },
    {
      firm: 'TAP Advisors',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'Dead - Investment Bank',
      notes: 'Investment banking advisory firm, not PE'
    },
    {
      firm: 'Springboard Enterprises',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'Dead - Accelerator',
      notes: 'Accelerator/support network for women entrepreneurs, not PE firm'
    },
    {
      firm: 'Soho Square Solutions',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'Dead - Consulting',
      notes: 'Staffing/consulting firm for financial services, not PE'
    },
    {
      firm: 'Space Capital',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'Researching',
      notes: 'VC firm focused on space tech; team page redirects, needs more research'
    },
    {
      firm: 'Ribbit Capital',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'Researching',
      notes: 'VC firm focused on fintech; no public team page, difficult to source contacts'
    },
    {
      firm: 'Sidekick Partners',
      contact: '',
      title: '',
      email: '',
      linkedin: '',
      status: 'Researching',
      notes: 'Early-stage VC firm; limited public contact information available'
    }
  ];
  
  // Process updates
  for (const enrichment of enrichments) {
    const rowIdx = firmRowMap[enrichment.firm];
    if (rowIdx !== undefined) {
      const row = rows[rowIdx];
      const range = `Sheet1!C${rowIdx + 1}:K${rowIdx + 1}`;
      
      // Only update if we have new data to add
      const hasNewData = enrichment.contact || enrichment.title || enrichment.email || enrichment.status || enrichment.notes;
      
      if (hasNewData) {
        // Columns: C=Position/Title, D=Contact Name, E=Email, F=LinkedIn, G=Status, H=Website, I=Notes, J=Lead Source, K=Date Added
        const values = [
          enrichment.title || row[2] || '',        // C - Title
          enrichment.contact || row[3] || '',      // D - Contact Name
          enrichment.email || row[4] || '',        // E - Email
          enrichment.linkedin || row[5] || '',     // F - LinkedIn
          enrichment.status || row[6] || 'Enriched', // G - Status
          row[7] || '',  // H - Website (preserve existing)
          enrichment.notes || row[8] || '',        // I - Notes
          row[9] || '',  // J - Lead Source (preserve existing)
          row[10] || ''  // K - Date Added (preserve existing)
        ];
        
        updates.push({
          range,
          values: [values]
        });
        
        console.log(`Queueing update for ${enrichment.firm} at row ${rowIdx + 1}`);
      }
    } else {
      console.log(`⚠️  Firm not found in sheet: ${enrichment.firm}`);
    }
  }
  
  // Batch update
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });
    console.log(`✅ Updated ${updates.length} firms`);
  } else {
    console.log('No updates to apply');
  }
}

enrichSheet().catch(console.error);
