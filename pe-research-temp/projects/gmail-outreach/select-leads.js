const { google } = require('googleapis');
const fs = require('fs');

async function selectLeads() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4';
  
  // Read Contacts sheet
  const contacts = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Contacts!A:I',
  });
  
  const today = new Date('2026-03-03');
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const rows = contacts.data.values.slice(1); // Skip header
  const qualified = [];
  const companiesSeen = new Set();
  
  for (const row of rows) {
    const [company, scoreStr, name, title, email, status, linkedin, notes, lastContacted] = row;
    
    // Skip if already selected a contact from this company
    if (companiesSeen.has(company)) continue;
    
    // Skip if no email or not verified
    if (!email || status !== 'verified') continue;
    
    // Skip if Gumbo Score < 8
    const score = parseInt(scoreStr) || 0;
    if (score < 8) continue;
    
    // Check if contacted in last 7 days
    if (lastContacted) {
      try {
        const contactDate = new Date(lastContacted);
        if (contactDate > sevenDaysAgo) {
          continue;
        }
      } catch (e) {
        // Invalid date, treat as never contacted
      }
    }
    
    // Check for tech/AI/value creation roles (priority)
    const techKeywords = [
      'cto', 'chief technology', 'chief information', 'cio', 'ciso',
      'chief ai', 'ai officer', 'head of technology', 'head of data',
      'vp product', 'vp technology', 'operating partner', 'portfolio growth',
      'value creation', 'digital transformation', 'innovation', 'software',
      'data science', 'analytics', 'chief digital'
    ];
    
    const lowerTitle = (title || '').toLowerCase();
    const hasTechRole = techKeywords.some(kw => lowerTitle.includes(kw));
    
    qualified.push({
      company,
      name,
      title,
      email,
      score,
      hasTechRole,
      notes: notes || '',
      linkedin: linkedin || '',
      lastContacted: lastContacted || 'never'
    });
    
    companiesSeen.add(company);
  }
  
  // Sort: tech roles first, then by score descending
  qualified.sort((a, b) => {
    if (a.hasTechRole !== b.hasTechRole) return b.hasTechRole ? 1 : -1;
    return b.score - a.score;
  });
  
  // Take top 25
  const top25 = qualified.slice(0, 25);
  
  console.log('\\n=== TOP 25 QUALIFIED LEADS ===\\n');
  top25.forEach((lead, i) => {
    const techMarker = lead.hasTechRole ? ' 🎯 TECH ROLE' : '';
    console.log(`${i+1}. ${lead.company}${techMarker}`);
    console.log(`   ${lead.name} (${lead.title}) - Score: ${lead.score}`);
    console.log(`   ${lead.email}`);
    console.log(``);
  });
  
  fs.writeFileSync('top25-leads.json', JSON.stringify(top25, null, 2));
  console.log('✅ Saved to top25-leads.json\\n');
}

selectLeads().catch(console.error);
