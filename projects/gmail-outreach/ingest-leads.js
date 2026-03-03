/**
 * ingest-leads.js — Reads leads.csv from mvp-studio-leads repo,
 * extracts email subject/body from pitch files, and queues sends.
 *
 * Usage:
 *   node ingest-leads.js preview          — show what would be sent
 *   node ingest-leads.js send [batchSize] — send emails (default 5)
 *   node ingest-leads.js status           — show sent/pending counts
 */

const fs = require('fs');
const path = require('path');

const REPO_DIR = process.env.LEADS_REPO || path.join(process.env.TEMP || '/tmp', 'mvp-studio-leads');
const CSV_PATH = path.join(REPO_DIR, 'leads.csv');
const SENT_LOG = path.join(__dirname, 'sent-leads.json');
const SEND_JS = path.join(__dirname, 'send.js');

// --- CSV parsing (simple, no deps) ---
function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = parseLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseLine(line);
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (vals[i] || '').trim());
    return obj;
  });
}

function parseLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { result.push(current); current = ''; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

// --- Extract email subject + body from pitch markdown ---
function extractEmail(pitchPath) {
  const fullPath = path.join(REPO_DIR, pitchPath);
  if (!fs.existsSync(fullPath)) return null;

  const content = fs.readFileSync(fullPath, 'utf8');

  // Find ## Email / ## Draft Pitch Email / ## Draft Email section
  const emailMatch = content.match(/## (?:Draft )?(?:Pitch )?Email\s*\n([\s\S]*?)(?=\n## |\n---\s*\n## |$)/i);
  if (!emailMatch) return null;

  const emailSection = emailMatch[1].trim();

  // Extract subject
  const subjectMatch = emailSection.match(/\*\*Subject:\*\*\s*(.+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : null;
  if (!subject) return null;

  // Body is everything after the subject line
  const subjectEnd = emailSection.indexOf(subject) + subject.length;
  let body = emailSection.slice(subjectEnd).trim();
  if (!body) return null;

  // Clean up: strip leading --- separators and **To:** lines
  body = body.replace(/^---\s*/m, '').trim();
  body = body.replace(/^\*\*To:\*\*.*\n?/i, '').trim();

  // Replace Kah signature with Jim
  body = body.replace(/Best,\s*\nKah\nAI Integration Specialist\nkah@agentmail\.to/g,
    'Best,\nJim\nAI Integration Specialist\njim@noonchorus.com');
  body = body.replace(/—\s*Kah/g, '— Jim');

  return { subject, body };
}

// --- Sent tracking ---
function getSentLog() {
  if (!fs.existsSync(SENT_LOG)) return {};
  return JSON.parse(fs.readFileSync(SENT_LOG, 'utf8'));
}

function markSent(email, company) {
  const log = getSentLog();
  log[email.toLowerCase()] = { company, sentAt: new Date().toISOString() };
  fs.writeFileSync(SENT_LOG, JSON.stringify(log, null, 2));
}

// --- Main ---
async function main() {
  const cmd = process.argv[2] || 'preview';

  if (!fs.existsSync(CSV_PATH)) {
    console.error('❌ leads.csv not found at', CSV_PATH);
    console.error('   Clone the repo or set LEADS_REPO env var');
    process.exit(1);
  }

  const leads = parseCSV(fs.readFileSync(CSV_PATH, 'utf8'));
  const sent = getSentLog();

  // Filter to sendable leads
  const sendable = leads.filter(l => {
    if (!l.email || l.email.includes('(verify)') || l.email.includes('generic')
        || l.email.includes('guess') || l.email.includes('estimated')
        || l.email.includes('or via') || l.email.includes('careers@')
        || l.email.includes('/') || l.email.includes('(')
        || !l.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return false;
    if (sent[l.email.toLowerCase()]) return false;
    if (!l.pitch_file) return false;
    const email = extractEmail(l.pitch_file);
    return email !== null;
  }).map(l => ({
    ...l,
    ...extractEmail(l.pitch_file),
  }));

  if (cmd === 'status') {
    console.log(`📊 Total leads: ${leads.length}`);
    console.log(`📧 With email: ${leads.filter(l => l.email).length}`);
    console.log(`✅ Already sent: ${Object.keys(sent).length}`);
    console.log(`📬 Ready to send: ${sendable.length}`);
    return;
  }

  if (cmd === 'preview') {
    console.log(`📬 ${sendable.length} leads ready to send:\n`);
    sendable.slice(0, 10).forEach((l, i) => {
      console.log(`${i + 1}. ${l.company} → ${l.email}`);
      console.log(`   Subject: ${l.subject}`);
      console.log('');
    });
    if (sendable.length > 10) console.log(`   ... and ${sendable.length - 10} more`);
    return;
  }

  if (cmd === 'send') {
    const batchSize = parseInt(process.argv[3]) || 5;
    const batch = sendable.slice(0, batchSize);

    if (batch.length === 0) {
      console.log('✅ No new leads to send.');
      return;
    }

    // Dynamic import of send function
    const { execSync } = require('child_process');

    console.log(`📤 Sending ${batch.length} emails...\n`);
    let successCount = 0;

    for (const lead of batch) {
      try {
        // Use send.js CLI
        const emailClean = lead.email.replace(/\s*\(verify\)/g, '').trim();
        const result = execSync(
          `node "${SEND_JS}" send "${emailClean}" "${lead.subject.replace(/"/g, '\\"')}" "${lead.body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
          { encoding: 'utf8', timeout: 30000 }
        );
        console.log(`✅ ${lead.company} → ${emailClean}`);
        markSent(emailClean, lead.company);
        successCount++;

        // Small delay between sends
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`❌ ${lead.company}: ${err.message}`);
      }
    }

    console.log(`\n📊 Sent ${successCount}/${batch.length}`);
    return;
  }

  console.log('Usage: node ingest-leads.js [preview|send|status] [batchSize]');
}

main().catch(console.error);
