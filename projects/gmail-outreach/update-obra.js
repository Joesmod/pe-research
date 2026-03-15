const { google } = require('googleapis');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function updateObra() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read current row 770
  const currentData = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A770:J770',
  });
  
  console.log('Current Obra Capital row:', currentData.data.values[0]);
  
  // Column structure appears to be: Company Name, NotebookLM, Contact Name, Title, Email, Website, LinkedIn, Sector Focus, Portfolio Companies, Status
  // Based on header: ['Company Name','NotebookLM','Contact Name','Title','Email','Website','LinkedIn','Sector Focus','Portfolio Companies','Status']
  
  const notesText = `$6.9B AUM alternative asset manager. Decision-makers: 1) Peter Polanskyj (CIO) peter.polanskyj@obra.com, 2) Zach Ainsberg (MD, Chief of Staff) zach.ainsberg@obra.com, 3) Dr. Joseph Hwang (MD, Special Situations) joseph.hwang@obra.com. Source: ZoomInfo, LinkedIn, RocketReach verified pattern.`;
  
  const values = [[
    'Obra Capital',                        // A: Company Name
    notesText,                             // B: NotebookLM/Notes  
    'Peter Polanskyj',                     // C: Contact Name
    'Chief Investment Officer',             // D: Title
    'peter.polanskyj@obra.com',            // E: Email
    'http://www.obra.com',                 // F: Website
    'https://www.linkedin.com/in/peter-polanskyj-28670869', // G: LinkedIn
    'Alternative Assets, Structured Credit, ILS', // H: Sector Focus
    '',                                    // I: Portfolio Companies
    'Enriched'                            // J: Status
  ]];
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A770:J770',
    valueInputOption: 'RAW',
    requestBody: { values }
  });
  
  console.log('✓ Updated Obra Capital (row 770) with CIO Peter Polanskyj + 2 additional MDs in notes');
}

updateObra().catch(console.error);
