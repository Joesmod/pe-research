const { google } = require('googleapis');
const fs = require('fs');

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync('service-account.json'));

// ENRICHED DATA - Web Research 2026-03-16 Cron
const enrichedUpdates = [
  {
    firmName: 'Frontenac Company',
    contact: 'Ronald Kuehl',
    title: 'Managing Director',
    email: 'rkuehl@frontenac.com',
    linkedin: 'https://www.linkedin.com/company/frontenac/',
    website: 'https://frontenac.com',
    sectors: 'Distribution, Specialty Mfg, Business Services, Healthcare Services',
    notes: 'Email pattern from Kona Equity (r**@frontenac.com). Managing Director (promoted from Managing Partner). Part of 7-member senior investment team led by Walter Florence (Managing Partner). Chicago-based, family/founder-owned franchises focus. $250M Fund X. Four key industry sectors. 50+ year history. Source: frontenac.com + KonaEquity + FINalternatives (2026-03-16 cron)',
    status: 'Enriched',
    date: '2026-03-16'
  },
  {
    firmName: 'High Road Capital Partners',
    contact: 'William C. Connell',
    title: 'Co-Founder & Managing Partner',
    email: 'wconnell@highroadcap.com',
    linkedin: 'https://www.linkedin.com/company/high-road-capital-partners',
    website: 'https://www.highroadcap.com',
    sectors: 'Smaller end middle market - Industrial, Consumer',
    notes: '✅ EMAIL VERIFIED from official website (highroadcap.com/team). Co-Founder & Managing Partner. Direct: 212-554-3267. NYC-based. Founded 2007. $470M+ AUM. 80+ years combined team experience. Other partners: Jeffrey Goodrich (jgoodrich@highroadcap.com, 212-554-3268), John Christiano (jchristiano@highroadcap.com), Robert Fitzsimmons (Managing Partner). Source: highroadcap.com (2026-03-16 cron)',
    status: 'Enriched',
    date: '2026-03-16'
  },
  {
    firmName: 'Patient Square Capital',
    contact: 'Jim Momtazee',
    title: 'Managing Partner',
    email: 'jmomtazee@patientsquarecapital.com',
    linkedin: 'https://www.linkedin.com/in/jim-momtazee-65634918b/',
    website: 'https://patientsquarecapital.com',
    sectors: 'Healthcare (dedicated healthcare investment firm)',
    notes: 'Email pattern from LeadIQ (FLast@patientsquarecapital.com). Managing Partner. Menlo Park CA-based. Dedicated healthcare investment firm. Stanford GSB. Ken Michalzuk joined as MD on Transformation & Growth Team. Healthcare-only focus. Founded by former KKR Capstone healthcare execs. Multi-billion dollar fund. Source: patientsquarecapital.com + LinkedIn + LeadIQ (2026-03-16 cron)',
    status: 'Enriched',
    date: '2026-03-16'
  },
  {
    firmName: 'Altaris Capital Partners',
    contact: 'Daniel G. Tully',
    title: 'Co-Founder & Managing Director',
    email: 'dtully@altariscap.com',
    linkedin: 'https://www.linkedin.com/company/altaris/',
    website: 'https://www.altariscap.com',
    sectors: 'Healthcare (products & services)',
    notes: 'Email pattern from RocketReach (first_initial+last@altariscap.com). Co-Founder & Managing Director. NYC-based (10 East 53rd St, 31st Floor). Founded from Merrill Lynch healthcare equity capital markets team. Multi-billion healthcare-focused PE. Other MDs: Jim O\'Brien (jobrien@), Nicholas Fulco (nfulco@), Matteo Foderaro (mfoderaro@). General: info@altariscap.com. Source: theorg.com + RocketReach + Private Equity International (2026-03-16 cron)',
    status: 'Enriched',
    date: '2026-03-16'
  }
];

// NEW FIRMS TO ADD (not currently in sheet)
const newFirms = [
  {
    firmName: 'Heartwood Partners',
    contact: 'Demetrios Dounis',
    title: 'Managing Partner',
    email: 'ddounis@heartwoodpartners.com',
    linkedin: 'https://www.linkedin.com/in/demetriosdounis/',
    website: 'https://heartwoodpartners.com',
    sectors: 'Agriculture, Business Services, Consumer Products, Industrial, Manufacturing',
    notes: 'Email pattern from RocketReach (d******@heartwoodpartners.com). Promoted to Managing Partner April 2024. Member of Investment Committee and Management Committee. Norwalk CT-based. Agriculture, consumer products, industrial, manufacturing focus. Also promoted: James Sidwa, Edwin Tan. Phone: (203) 919- area. Twitter: @DounisDemetrios. Source: heartwoodpartners.com + RocketReach + PRNewswire (2026-03-16 cron)',
    status: 'Enriched',
    date: '2026-03-16'
  },
  {
    firmName: 'Branford Castle Partners',
    contact: 'John S. Castle',
    title: 'President & CEO',
    email: 'jsc@branfordcastle.com',
    linkedin: 'https://www.linkedin.com/company/branford-castle-partners/',
    website: 'https://branfordcastle.com',
    sectors: 'Industrials, Consumer',
    notes: '✅ EMAIL VERIFIED from official website (branfordcastle.com/contact-page). President & CEO. Direct line: +1 (212) 317-2020. NYC office: 150 East 58th Street, 38th Floor, New York, NY 10155. Boca Raton office: 150 E Palmetto Park Road Suite 340, Boca Raton, FL 33432. Founded 2016. 8 platforms, 14 acquisitions from latest fund. Team from Bain Capital, Blackstone, 3G Capital. Recent hires: Colton Bucey (NYC), Kian Paymayesh (Boca). Source: branfordcastle.com (2026-03-16 cron)',
    status: 'Enriched',
    date: '2026-03-16'
  },
  {
    firmName: 'Awani Capital',
    contact: 'Daphne J. Dufresne',
    title: 'Founder & Managing Partner',
    email: 'ddufresne@awanicapital.com',
    linkedin: 'https://www.linkedin.com/in/daphnedufresne/',
    website: 'https://awanicapital.com',
    sectors: 'Business Services, Industrial Services',
    notes: 'Email pattern from ZoomInfo (***d@awanicapital.com = ddufresne@). Founder & Managing Partner, founded 2024. 25+ years PE experience, formerly Managing Partner at GenNx360 Capital Partners. Fund I targeting $500M+. Business & industrial services focus. Brooklyn native, PEWIN founding member. 70+ years combined team experience. Milken Institute speaker. Source: awanicapital.com + ZoomInfo + Milken Institute (2026-03-16 cron)',
    status: 'Enriched',
    date: '2026-03-16'
  }
];

async function updateSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: SERVICE_ACCOUNT,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read current sheet to find rows
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:K',
    });
    
    const rows = result.data.values || [];
    console.log(`Read ${rows.length} rows from sheet\n`);
    
    // Batch updates for existing firms
    const batchUpdates = [];
    
    for (const update of enrichedUpdates) {
      const rowIndex = rows.findIndex(row => row[0] === update.firmName);
      
      if (rowIndex >= 0) {
        console.log(`Updating ${update.firmName} at row ${rowIndex + 1}`);
        
        batchUpdates.push({
          range: `Sheet1!A${rowIndex + 1}:J${rowIndex + 1}`,
          values: [[
            update.firmName,
            update.website,
            update.contact,
            update.title,
            update.email,
            update.linkedin,
            update.sectors,
            update.notes,
            update.status,
            update.date
          ]]
        });
      } else {
        console.log(`Firm not found (will add as new): ${update.firmName}`);
        newFirms.push(update); // Add to new firms list
      }
    }
    
    // Apply existing firm updates
    if (batchUpdates.length > 0) {
      console.log(`\nApplying ${batchUpdates.length} updates to existing firms...`);
      
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: batchUpdates
        }
      });
      
      console.log('✅ Existing firms updated!');
    }
    
    // Append new firms
    if (newFirms.length > 0) {
      console.log(`\nAppending ${newFirms.length} new firms...`);
      
      const newRows = newFirms.map(firm => [
        firm.firmName,
        firm.website,
        firm.contact,
        firm.title,
        firm.email,
        firm.linkedin,
        firm.sectors,
        firm.notes,
        firm.status,
        firm.date
      ]);
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A:J',
        valueInputOption: 'RAW',
        requestBody: {
          values: newRows
        }
      });
      
      console.log('✅ New firms added!');
    }
    
    // Summary
    console.log('\n=== ENRICHMENT SUMMARY (2026-03-16 Cron) ===\n');
    console.log(`Updated: ${batchUpdates.length} existing firms`);
    console.log(`Added: ${newFirms.length} new firms`);
    console.log(`Total enriched: ${batchUpdates.length + newFirms.length} leads\n`);
    
    console.log('ALL ENRICHED CONTACTS:');
    [...enrichedUpdates, ...newFirms].forEach((firm, i) => {
      const verified = firm.notes.includes('VERIFIED') ? '✅ ' : '';
      console.log(`  ${i+1}. ${verified}${firm.firmName}`);
      console.log(`     ${firm.contact} - ${firm.title}`);
      console.log(`     ${firm.email}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

updateSheet();
