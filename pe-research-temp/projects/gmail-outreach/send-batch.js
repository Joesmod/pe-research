const fs = require('fs');
const { google } = require('googleapis');

const CREDS_PATH = __dirname + '/credentials.json';
const TOKEN_PATH = __dirname + '/token.json';

function getAuth() {
  const creds = JSON.parse(fs.readFileSync(CREDS_PATH));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000/callback');
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function sendEmail(to, subject, body) {
  const auth = getAuth();
  const gmail = google.gmail({ version: 'v1', auth });

  // BCC jeff and alex on all emails
  const bcc = 'jeff@hellogumbo.com, alex@hellogumbo.com';

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nBcc: ${bcc}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${body}</div>`
  ).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  return res.data.id;
}

async function sendBatch() {
  const batch = JSON.parse(fs.readFileSync('email-batch.json', 'utf8'));
  
  console.log(`📧 Sending ${batch.length} emails...\n`);
  
  const results = [];
  
  for (let i = 0; i < batch.length; i++) {
    const email = batch[i];
    
    try {
      console.log(`[${i+1}/${batch.length}] Sending to ${email.name} (${email.company})...`);
      const messageId = await sendEmail(email.to, email.subject, email.body);
      
      results.push({
        success: true,
        to: email.to,
        company: email.company,
        name: email.name,
        messageId
      });
      
      console.log(`✅ Sent (ID: ${messageId})\n`);
      
      // Rate limit: 2 second delay between sends
      if (i < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ FAILED: ${error.message}\n`);
      results.push({
        success: false,
        to: email.to,
        company: email.company,
        name: email.name,
        error: error.message
      });
    }
  }
  
  // Save results
  fs.writeFileSync('batch-results.json', JSON.stringify(results, null, 2));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n=== BATCH COMPLETE ===`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📄 Results saved to batch-results.json\n`);
}

sendBatch().catch(console.error);
