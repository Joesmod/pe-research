// Quick scan of sheet to find enrichment candidates
const fs = require('fs');

// Read the sheet data from our previous fetch
const sheetFile = 'sheet-data.json';

async function analyzeLSheet() {
  let leads;
  
  if (fs.existsSync(sheetFile)) {
    leads = JSON.parse(fs.readFileSync(sheetFile, 'utf8'));
  } else {
    console.log('No cached sheet data found');
    return;
  }
  
  const needsEnrichment = [];
  
  for (let i = 1; i < leads.length && i < 100; i++) { // Sample first 100
    const row = leads[i];
    if (!row || row.length < 5) continue;
    
    const [firm, website, contact, title, email, , , , , status] = row;
    
    // Skip if already enriched or dead
    if (status && (status.toLowerCase().includes('enriched') || status.toLowerCase().includes('dead'))) continue;
    
    // Check if needs enrichment
    const hasGenericEmail = email && (
      email.includes('info@') || 
      email.includes('sales@') || 
      email.includes('ir@') ||
      email.includes('team@') ||
      email.includes('contact@') ||
      email.includes('@domain.com') ||
      email.includes('email_not_unlocked') ||
      email.length < 10
    );
    
    const missingContact = !contact || contact.trim().length < 3;
    const missingEmail = !email || email.trim().length < 8;
    
    if ((missingContact || missingEmail || hasGenericEmail) && firm && firm.length > 2) {
      needsEnrichment.push({
        row: i + 1, // Excel row number (header is row 1)
        firm: firm.substring(0, 50),
        contact: contact || 'MISSING',
        email: email || 'MISSING',
        website: website || '',
        status: status || 'New - Unresearched'
      });
    }
  }
  
  console.log(`Found ${needsEnrichment.length} leads needing enrichment\n`);
  console.log('TOP 15 CANDIDATES:');
  console.log(JSON.stringify(needsEnrichment.slice(0, 15), null, 2));
}

analyzeLSheet().catch(console.error);
