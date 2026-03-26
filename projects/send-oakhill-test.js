const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

const CREDS_PATH = path.join(__dirname, 'gmail-outreach', 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'gmail-outreach', 'token.json');

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

  // Convert plain text to HTML paragraphs
  const htmlBody = body
    .split(/\n\n+/)
    .map(para => para.replace(/\n/g, ' ').trim())
    .join('<br><br>');

  const raw = Buffer.from(
    `From: Jim from Gumbo <jim@hellogumbo.com>\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<div dir="ltr">${htmlBody}</div>`
  ).toString('base64url');

  const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  console.log('Sent:', res.data.id);
}

const to = 'alex@hellogumbo.com';
const subject = 'Oak Hill test - fixed formatting v2';
const body = `Hi Jennifer,

I'm reaching out from Gumbo, an AI-first product and engineering studio. We build production AI systems -- LLM integrations, agent workflows, RAG pipelines, and computer vision -- as embedded teams that ship weekly.

Oak Hill's portfolio across essential services, financial services, and digital infrastructure caught my attention. We've found that services businesses in particular are sitting on high-ROI AI opportunities -- whether that's automating back-office operations, building intelligent customer-facing tools, or using data pipelines to drive better decision-making across the portfolio.

We work as dedicated pods that plug directly into your portfolio companies' existing teams and tech stacks. No long ramp-up, no bloated SOWs -- just senior engineers shipping production code from week one.

Would it make sense to connect for 15 minutes? I'd love to hear what you're seeing across the portfolio and where AI could move the needle.

Best,
Jim
Gumbo | hellogumbo.com`;

sendEmail(to, subject, body).catch(console.error);
