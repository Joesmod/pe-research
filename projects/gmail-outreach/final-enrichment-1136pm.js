const { google } = require('googleapis');
const key = require('./service-account.json');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Comprehensive enrichment data from research session
const enrichments = [
  {
    row: 762,
    company: 'Manulife | Comvest Credit Partners',
    contact: 'David Gibson',
    title: 'Managing Director',
    email: '', 
    linkedin: 'https://www.linkedin.com/in/david-gibson-350b878/',
    status: 'Partial',
    notes: 'Research 03/06: David Gibson (MD). Alt: Chris O\'Donnell (MD). Team page: comvest.com/team-members'
  },
  {
    row: 778,
    company: 'Pzena Investment Management',
    contact: 'Evan Fire',
    title: 'Managing Partner',
    email: '', 
    linkedin: 'https://www.linkedin.com/in/evankfire/',
    status: 'Partial',
    notes: 'Research 03/06: Evan Fire (Managing Partner). Alt: Richard Pzena (Founder/Co-CIO). General: compliance@pzena.com, (212) 355-1600'
  },
  {
    row: 785,
    company: 'Riverwood Capital',
    contact: 'Francisco Alvarez-Demalde',
    title: 'Co-Founder, Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/company/riverwood-capital',
    status: 'Partial',
    notes: 'Research 03/06: Francisco Alvarez-Demalde (Co-Founder, Managing Partner). Alt: Jeff Parks (Co-Founder, Managing Partner). Growth-stage tech PE.'
  },
  {
    row: 790,
    company: 'Sageview Capital',
    contact: 'Scott Stuart',
    title: 'Founding Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/in/scott-stuart-58aba918/',
    status: 'Partial',
    notes: 'Research 03/06: Scott Stuart (Founding Partner). Growth capital for lower middle-market tech-enabled businesses.'
  },
  {
    row: 794,
    company: 'Silver Oak Services Partners',
    contact: 'Daniel M. Gill',
    title: 'Co-Founder & Managing Partner',
    email: '',
    linkedin: 'https://www.silveroaksp.com/team',
    status: 'Partial',
    notes: 'Research 03/06: Daniel M. Gill (Co-Founder & Managing Partner). Alt: Gregory Barr (Managing Partner). Focus: lower middle-market services businesses.'
  },
  {
    row: 799,
    company: 'STORY3 Capital Partners',
    contact: 'Peter Comisar',
    title: 'Managing Partner & CEO',
    email: '',
    linkedin: 'https://www.story3capital.com/team',
    status: 'Partial',
    notes: 'Research 03/06: Peter Comisar (Managing Partner & CEO). Alt: Samir Shah (Partner). Phone: +1 (310) 425-3000. Focus: consumer brands, media, tech.'
  },
  {
    row: 800,
    company: 'Strategic Value Partners',
    contact: 'Victor Khosla',
    title: 'Founder',
    email: '',
    linkedin: 'https://www.linkedin.com/company/strategic-value-partners-llc',
    status: 'Partial',
    notes: 'Research 03/06: Victor Khosla (Founder). $18B AUM, distressed/event-driven PE. Greenwich CT office: no direct contact page.'
  },
  {
    row: 802,
    company: 'Thrive Capital',
    contact: 'Joshua Kushner',
    title: 'Founder and Managing Partner',
    email: '',
    linkedin: 'https://www.linkedin.com/company/thrive-capital',
    status: 'Partial',
    notes: 'Research 03/06: Joshua Kushner (Founder and Managing Partner). NYC-based venture capital focused on software/internet. NOTE: Likely too early-stage for our outreach.'
  }
];

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`\n=== ENRICHMENT RUN: March 6, 2026 11:36 PM ===`);
  console.log(`Updating ${enrichments.length} leads with contact information...\n`);

  for (const enrich of enrichments) {
    const rowIdx = enrich.row;
    
    const updates = [];
    
    // Update Contact Name (column C)
    if (enrich.contact) {
      updates.push({
        range: `Sheet1!C${rowIdx}`,
        values: [[enrich.contact]]
      });
    }
    
    // Update Title (column D)
    if (enrich.title) {
      updates.push({
        range: `Sheet1!D${rowIdx}`,
        values: [[enrich.title]]
      });
    }
    
    // Update LinkedIn (column G)
    if (enrich.linkedin) {
      updates.push({
        range: `Sheet1!G${rowIdx}`,
        values: [[enrich.linkedin]]
      });
    }
    
    // Update Status (column J)
    if (enrich.status) {
      updates.push({
        range: `Sheet1!J${rowIdx}`,
        values: [[enrich.status]]
      });
    }
    
    // Update Notes (column L)
    if (enrich.notes) {
      updates.push({
        range: `Sheet1!L${rowIdx}`,
        values: [[enrich.notes]]
      });
    }

    // Batch update this row
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      console.log(`✓ Row ${rowIdx}: ${enrich.company}`);
      console.log(`  → ${enrich.contact} (${enrich.title})`);
    }
  }

  console.log(`\n=== ENRICHMENT COMPLETE ===`);
  console.log(`Total leads enriched: ${enrichments.length}`);
  console.log(`Status: All set to 'Partial' - contacts found but emails not verified`);
  console.log(`\nNOTE: Direct emails were NOT found through public sources.`);
  console.log(`NEXT STEPS:`);
  console.log(`1. Use Apollo.io API to find verified emails for these contacts`);
  console.log(`2. Verify LinkedIn URLs are accurate`);
  console.log(`3. Update status to 'Enriched' once emails are found`);
  console.log(`4. Consider manual outreach via LinkedIn InMail if emails remain unfound`);
}

main().catch(console.error);
