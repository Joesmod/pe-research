const {google} = require('googleapis');
const auth = new google.auth.GoogleAuth({keyFile: 'service-account.json', scopes: ['https://www.googleapis.com/auth/spreadsheets']});
const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

async function main() {
  const sheets = google.sheets({version:'v4', auth: await auth.getClient()});
  
  // Define upgrades: row (1-indexed), new contact, title, email, linkedin, notes prefix
  const upgrades = [
    {
      row: 16, // Greater Sum Ventures - currently Kristin Alm (Press/Communications)
      name: 'Chris Ritchie',
      title: 'CTO, CIO, CSO',
      email: 'chris.ritchie@greatersumventures.com',
      linkedin: 'https://www.linkedin.com/in/snapper-ussery/', // keep existing
      notePrefix: 'UPGRADED from Kristin Alm (Press). Chris Ritchie (CTO/CIO/CSO) verified via Contacts sheet/Apollo. Also: Brian Seagraves (VP Product & Tech), Max Chautin (MD), Bill Nix (MP). CTO = ideal Gumbo target. 2026-02-20 enrichment.'
    },
    {
      row: 19, // Palladium Equity - currently Erick Bronner (IR)
      name: 'Alex Funk',
      title: 'Partner, Head of Services Sector',
      email: 'afunk@palladiumequity.com',
      linkedin: '',
      notePrefix: 'UPGRADED from Erick Bronner (IR). Alex Funk (Partner, Services Sector Head) verified via Contacts sheet/Apollo. Also: Meahgan Martin (Dir Head of BD, mogrady@palladiumequity.com), Ed Moss (MD). Services sector partner = ideal Gumbo target. 2026-02-20 enrichment.'
    },
    {
      row: 29, // Compass Group Equity - currently Brad Fitzgerald (VP Strategic Marketing)
      name: 'Chris Gibson',
      title: 'Managing Partner',
      email: 'chrisg@cgep.com',
      linkedin: '',
      notePrefix: 'UPGRADED from Brad Fitzgerald (VP Marketing). Chris Gibson (Managing Partner) verified via Contacts sheet/Apollo. Joined 2016. 2026-02-20 enrichment.'
    },
    {
      row: 57, // Trivest Partners - currently Belle Verhulst (Head of Marketing)
      name: 'Todd Jerles',
      title: 'Partner, Chief Operating Officer',
      email: 'tjerles@trivest.com',
      linkedin: '',
      notePrefix: 'UPGRADED from Belle Verhulst (Head of Marketing). Todd Jerles (Partner/COO) verified via Contacts sheet/Apollo. Also: Jared Roberts (Dir BD), Arturas Rainys (MD). COO = ideal ops target. 2026-02-20 enrichment.'
    },
    {
      row: 63, // Serent Capital - currently Becca Johnson (Dir of Marketing)
      name: 'Neal Sainani',
      title: 'SVP, Product & Technology',
      email: 'neal.sainani@serentcapital.com',
      linkedin: '',
      notePrefix: 'UPGRADED from Becca Johnson (Dir Marketing). Neal Sainani (SVP Product & Technology) verified via Contacts sheet/Apollo. Also: Olga Kaplan (COO), Kevin Frick (Partner). Product & Tech leader = ideal Gumbo target. 2026-02-20 enrichment.'
    },
    {
      row: 68, // Endeavour Capital - currently Mia Thom (Media Contact)
      name: 'Paul Matthews',
      title: 'Founding Partner',
      email: 'paul.matthews@endeavour-capital.com',
      linkedin: '',
      notePrefix: 'UPGRADED from Mia Thom (Media). Paul Matthews (Founding Partner) verified via Contacts sheet/Apollo. 2026-02-20 enrichment.'
    },
    {
      row: 88, // Diversis Capital - score 9, Kevin Ma already identified but email unverified
      name: 'Kevin Ma',
      title: 'Co-Founder & Managing Partner',
      email: 'kevin@diversis.com',
      linkedin: 'https://www.linkedin.com/in/kevinma',
      notePrefix: 'EMAIL VERIFIED via Contacts sheet/Apollo. Kevin Ma (Co-Founder/MP) email confirmed: kevin@diversis.com. $1.2B Fund III (Oct 2025) explicitly mentions AI. Wharton/Penn M&T (CS+Robotics+EE). 2026-02-20 verification.'
    },
    {
      row: 90, // Edison Partners - currently Iris Tomczyk (VP Marketing)
      name: 'Ryan Ziegler',
      title: 'General Partner',
      email: 'ryan@edisonpartners.com',
      linkedin: '',
      notePrefix: 'UPGRADED from Iris Tomczyk (VP Marketing). Ryan Ziegler (General Partner) verified via Contacts sheet/Apollo. Also: Gregg Michaelson (GP), Joe Gwozdz (Operating Partner). 2026-02-20 enrichment.'
    },
    {
      row: 96, // Waud Capital - currently Philip Kemp (Principal IR)
      name: 'Richard Roggeveen',
      title: 'Principal: Software & Technology',
      email: 'rroggeveen@waudcapital.com',
      linkedin: '',
      notePrefix: 'UPGRADED from Philip Kemp (IR). Richard Roggeveen (Principal, Software & Technology) verified via Contacts sheet/Apollo. Also: Dave Bellaire (Operating Partner), Reeve Waud (Founder/MP). Software & Tech principal = ideal Gumbo target. 2026-02-20 enrichment.'
    },
    {
      row: 97, // Excellere Partners - currently Tracie Kelly (Dir of Marketing)
      name: 'Patrick OKeefe',
      title: 'Managing Partner',
      email: 'pokeefe@excellere.com',
      linkedin: '',
      notePrefix: 'UPGRADED from Tracie Kelly (Dir Marketing). Patrick OKeefe (Managing Partner) verified via Contacts sheet/Apollo. Also: Ryan Glaws (MP), Matt Hicks (MP), Justin Unertl (Partner). 2026-02-20 enrichment.'
    },
    {
      row: 115, // Alpine Investors - currently Audrey Harris (Head of Marketing)
      name: 'Lia Lilleness',
      title: 'VP Operations, Alpine Operations Group',
      email: 'llilleness@alpineinvestors.com',
      linkedin: '',
      notePrefix: 'UPGRADED from Audrey Harris (Head of Marketing). Lia Lilleness (VP Ops, Alpine Operations Group) verified via Contacts sheet/Apollo. Also: Will Chance (Principal), Nora Davis (CEO of Elevation). Ops leader = ideal Gumbo target. 2026-02-20 enrichment.'
    },
  ];

  let updated = 0;
  for (const u of upgrades) {
    const rowData = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID, range: `Sheet1!A${u.row}:M${u.row}`
    });
    const row = rowData.data.values?.[0] || [];
    
    const prevNotes = (row[10] || '').substring(0, 150);
    const notes = u.notePrefix + (prevNotes ? ' Previous: ' + prevNotes : '');
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!B${u.row}:K${u.row}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          u.name,                    // B
          u.title,                   // C
          u.email,                   // D
          row[4] || '',              // E: Website (keep)
          u.linkedin || row[5] || '', // F: LinkedIn
          row[6] || '',              // G: Sector (keep)
          row[7] || '',              // H: Portfolio (keep)
          'Enriched',                // I: Status
          row[9] || '',              // J: Last Contacted (keep)
          notes                      // K: Notes
        ]]
      }
    });
    console.log(`Row ${u.row}: ${row[0]} -> ${u.name} (${u.title}) ✅`);
    updated++;
  }
  
  console.log(`\n=== ${updated} rows upgraded ===`);
}

main().catch(e => console.error(e));
