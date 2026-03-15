const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';

// Enrichments - verifiable contact info with sources
const enrichments = [
  // Row 489 - GIIN already has email in title field
  {
    rowIndex: 489,
    company: 'The Global Impact Investing Network',
    contactName: 'Jessica Rose',
    title: 'Contact',
    email: 'jrose@thegiin.org',
    website: 'https://thegiin.org',
    linkedin: 'https://www.linkedin.com/company/the-global-impact-investing-network',
    status: 'Enriched',
    notes: 'Email found on website contact page. GIIN is a nonprofit network, not a PE firm.'
  }
];

// New firms to add (mid-market PE, $500M-$5B AUM, services-heavy)
const newFirms = [
  {
    company: 'Bow River Capital',
    notebookLM: '',
    contactName: 'Greg Hiatrides',
    title: 'Partner, Head of Private Equity',
    email: 'ghiatrides@bowrivercapital.com',
    website: 'https://www.bowrivercapital.com',
    linkedin: 'https://www.linkedin.com/company/bow-river-capital-partners',
    sectorFocus: 'Healthcare Services, Industrials, Lower Middle Market Software',
    portfolioCompanies: '',
    status: 'Enriched',
    notes: 'Denver-based, ~$2.5B AUM. Email format: last@bowrivercapital.com (94.6%). Source: bowrivercapital.com/team'
  },
  {
    company: 'Cressey & Company',
    notebookLM: '',
    contactName: 'Peter Ehrich',
    title: 'Managing Partner',
    email: 'pehrich@cresseyco.com',
    website: 'https://www.cresseyco.com',
    linkedin: 'https://www.linkedin.com/company/cressey-and-company',
    sectorFocus: 'Healthcare Services, Healthcare IT',
    portfolioCompanies: '',
    status: 'Enriched',
    notes: 'Chicago-based, founded 2008. 40+ years healthcare investing experience. Email format: first_initial last@cresseyco.com (92.9%). Source: cresseyco.com/team'
  },
  {
    company: 'K1 Investment Management',
    notebookLM: '',
    contactName: 'Ron Cano',
    title: 'Managing Partner',
    email: 'rcano@k1.com',
    website: 'https://k1.com',
    linkedin: 'https://www.linkedin.com/company/k1im',
    sectorFocus: 'Enterprise Software, SaaS, AI-Powered Systems of Record',
    portfolioCompanies: '',
    status: 'Enriched',
    notes: 'Manhattan Beach, CA. One of largest small-cap enterprise software investors. Email format: first_initial last@k1.com. Source: k1.com/team, LinkedIn'
  }
];

// Alternative contacts for new firms (for variety)
const altContacts = [
  {
    company: 'Bow River Capital',
    notebookLM: '',
    contactName: 'Jeremy Held',
    title: 'Partner, Head of Evergreen Private Equity',
    email: 'jheld@bowrivercapital.com',
    website: 'https://www.bowrivercapital.com',
    linkedin: 'https://www.linkedin.com/company/bow-river-capital-partners',
    sectorFocus: 'Healthcare Services, Industrials, Lower Middle Market Software',
    portfolioCompanies: '',
    status: 'Enriched',
    notes: 'Denver-based, ~$2.5B AUM. Email format: last@bowrivercapital.com. Source: bowrivercapital.com/team'
  },
  {
    company: 'Cressey & Company',
    notebookLM: '',
    contactName: 'Bryan Cressey',
    title: 'Managing Partner',
    email: 'bcressey@cresseyco.com',
    website: 'https://www.cresseyco.com',
    linkedin: 'https://www.linkedin.com/company/cressey-and-company',
    sectorFocus: 'Healthcare Services, Healthcare IT',
    portfolioCompanies: '',
    status: 'Enriched',
    notes: 'Chicago-based, founded 2008. Email format: first_initial last@cresseyco.com. Source: cresseyco.com/team'
  }
];

async function updateSheet() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // Read current sheet to get the last row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  
  const rows = res.data.values || [];
  const lastRow = rows.length;
  
  console.log(`Current last row: ${lastRow}`);
  
  // Prepare new rows to append
  const newRows = [];
  
  for (const firm of newFirms) {
    newRows.push([
      firm.company,
      firm.notebookLM,
      firm.contactName,
      firm.title,
      firm.email,
      firm.website,
      firm.linkedin,
      firm.sectorFocus,
      firm.portfolioCompanies,
      `${firm.status} - ${firm.notes}`
    ]);
  }
  
  for (const contact of altContacts) {
    newRows.push([
      contact.company,
      contact.notebookLM,
      contact.contactName,
      contact.title,
      contact.email,
      contact.website,
      contact.linkedin,
      contact.sectorFocus,
      contact.portfolioCompanies,
      `${contact.status} - ${contact.notes}`
    ]);
  }
  
  // Append new firms
  if (newRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      resource: {
        values: newRows
      }
    });
    
    console.log(`\nAdded ${newRows.length} new firms/contacts to the sheet`);
  }
  
  // Update enrichments for existing rows
  for (const enrich of enrichments) {
    const range = `Sheet1!C${enrich.rowIndex + 1}:J${enrich.rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: [[
          enrich.contactName,
          enrich.title,
          enrich.email,
          enrich.website,
          enrich.linkedin,
          enrich.sectorFocus || '',
          enrich.portfolioCompanies || '',
          `${enrich.status} - ${enrich.notes}`
        ]]
      }
    });
    
    console.log(`Updated row ${enrich.rowIndex + 1}: ${enrich.company}`);
  }
  
  console.log('\n✅ Sheet enrichment complete!');
  console.log(`Total enriched: ${enrichments.length} existing leads`);
  console.log(`Total new: ${newFirms.length} firms + ${altContacts.length} alternate contacts = ${newRows.length} rows added`);
}

updateSheet().catch(console.error);
