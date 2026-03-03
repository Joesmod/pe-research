const fs = require('fs');
const { google } = require('googleapis');
const { checkDedup } = require('./dedup-guard.js');

const selected = JSON.parse(fs.readFileSync('_selected_contacts.json', 'utf8'));

// Auth helper
function getAuth() {
  const creds = JSON.parse(fs.readFileSync(__dirname + '/credentials.json'));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(__dirname + '/token.json'));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

// Send email function
async function sendEmail(to, subject, body) {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  // If body already contains HTML tags, use as-is; otherwise convert plain text to HTML
  const isHtml = /<[a-z][\s\S]*>/i.test(body);
  const htmlBody = isHtml ? body : body
    .split(/\n\n+/)
    .map(para => para.replace(/\n/g, ' ').trim())
    .join('<br><br>');

  // BCC jeff and alex on all outgoing emails
  const bcc = 'jeff@hellogumbo.com, alex@hellogumbo.com';

  const signature = `<br><br>--<br>Jim Jensen<br><a href="https://hellogumbo.com">Gumbo</a> | <a href="https://hellogumbo.com">hellogumbo.com</a><br>AI-first engineering, served simple.<br><a href="mailto:jim@hellogumbo.com">jim@hellogumbo.com</a>`;

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nBcc: ${bcc}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}${signature}</div>`
  ).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  return res.data;
}

// Generate personalized email for each contact
function generateEmail(contact) {
  const firstName = contact['Contact Name'].split(' ')[0];
  const company = contact.Company;
  const title = contact.Title;
  const sectorFocus = contact._sectorFocus || 'various sectors';
  const portfolio = contact._portfolio || 'their portfolio companies';
  
  // Generate subject line variations based on sector/role
  let subject;
  if (title.toLowerCase().includes('asia') || title.toLowerCase().includes('international')) {
    subject = `AI infrastructure for ${company}'s portfolio expansion`;
  } else if (sectorFocus.toLowerCase().includes('healthcare')) {
    subject = `AI automation for healthcare services portfolios`;
  } else if (sectorFocus.toLowerCase().includes('software') || sectorFocus.toLowerCase().includes('tech')) {
    subject = `AI value creation for ${company}'s tech portfolio`;
  } else if (sectorFocus.toLowerCase().includes('industrial') || sectorFocus.toLowerCase().includes('manufacturing')) {
    subject = `Operational AI for industrial services portfolios`;
  } else {
    subject = `AI-driven ops automation for ${company} portfolio companies`;
  }
  
  // Generate personalized intro based on sector/portfolio
  let intro;
  if (sectorFocus && portfolio) {
    intro = `${company}'s focus on ${sectorFocus.toLowerCase()} -- especially ${portfolio} -- caught my attention. At that scale, operational improvements compound quickly across portfolio companies.`;
  } else if (sectorFocus) {
    intro = `${company}'s ${sectorFocus.toLowerCase()} portfolio caught my attention. Operational improvements at the platform level can drive significant EBITDA impact across portfolio companies.`;
  } else {
    intro = `${company}'s portfolio caught my attention. At scale, even small operational improvements compound fast across multiple portfolio companies.`;
  }
  
  // Role-specific positioning
  let positioning;
  if (title.toLowerCase().includes('operating') || title.toLowerCase().includes('value creation')) {
    positioning = `Given your operating role, I imagine you are constantly evaluating tools and systems that can drive measurable improvements across portfolio companies.`;
  } else if (title.toLowerCase().includes('technology') || title.toLowerCase().includes('digital') || title.toLowerCase().includes('ai')) {
    positioning = `Given your technology focus, I imagine you are already exploring how AI can drive value creation beyond just cost reduction.`;
  } else {
    positioning = `I imagine you are constantly looking for ways to drive operational improvements and EBITDA growth across the portfolio.`;
  }
  
  const body = `Hi ${firstName},<br><br>${intro}<br><br>We are <a href="https://hellogumbo.com">Gumbo</a>, an AI-first engineering agency that builds custom automation and AI tools for PE portfolio companies. We focus on internal workflow automation, data pipeline modernization, and AI-assisted decision-making -- the kind of work that drives measurable EBITDA impact without massive headcount increases.<br><br>A few examples: automated reporting dashboards that replace manual Excel workflows, AI agents that handle customer service or internal ops tasks, and integration layers that connect fragmented tech stacks across portfolio companies.<br><br>${positioning}<br><br>Would it make sense to set up a quick call to explore where AI could move the needle across ${company}'s portfolio?`;

  return { subject, body };
}

async function main() {
  const results = {
    sent: [],
    failed: []
  };
  
  console.log(`\n=== SENDING TO ${selected.length} CONTACTS ===\n`);
  
  for (const contact of selected) {
    const email = contact.Email;
    const name = contact['Contact Name'].split(' ')[0];
    const company = contact.Company;
    
    // Generate personalized email first (need subject for dedup check)
    const { subject, body } = generateEmail(contact);
    
    console.log(`Checking dedup for ${name} at ${company} (${email})...`);
    
    // Check dedup
    const dedupResult = await checkDedup(email, subject);
    if (dedupResult.blocked) {
      console.log(`SKIPPED: ${dedupResult.reason}\n`);
      results.failed.push({
        name,
        company,
        email,
        reason: dedupResult.reason
      });
      continue;
    }
    
    // Send
    try {
      await sendEmail(email, subject, body);
      console.log(`✅ SENT to ${name} @ ${company}`);
      console.log(`   Subject: "${subject}"\n`);
      
      results.sent.push({
        name,
        company,
        email,
        subject
      });
      
      // Update CRM
      // Note: send.js already logs to outreach tracker, but we should also update
      // the Contacts sheet "Last Contacted" field
      // This requires Sheet API integration - for now, send.js handles it
      
      // Rate limit: wait 2s between sends
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (err) {
      console.error(`❌ FAILED to send to ${email}: ${err.message}\n`);
      results.failed.push({
        name,
        company,
        email,
        reason: err.message
      });
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Sent: ${results.sent.length}`);
  console.log(`Failed: ${results.failed.length}`);
  
  if (results.sent.length > 0) {
    console.log('\n✅ Successfully sent to:');
    results.sent.forEach(r => {
      console.log(`  - ${r.name} @ ${r.company} (${r.email})`);
      console.log(`    "${r.subject}"`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed/Skipped:');
    results.failed.forEach(r => {
      console.log(`  - ${r.name} @ ${r.company} (${r.email})`);
      console.log(`    ${r.reason}`);
    });
  }
}

main().catch(console.error);
