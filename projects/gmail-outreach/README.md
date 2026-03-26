# Gumbo PE Outreach Scripts

Email blast automation for Hello Gumbo's private equity outreach campaign.

## Overview

This repo contains the scripts used to manage PE firm outreach:
- Gmail sending via OAuth2
- Google Sheets CRM integration
- Batch email generation
- Tracking and analytics

## Core Scripts

### 1. `send.js` - Gmail Send/Inbox Manager
Main script for sending emails and checking inbox.

**Usage:**
```bash
# Send an email
node send.js send recipient@example.com "Subject" "Body text"

# Check inbox
node send.js inbox 10
```

**Features:**
- OAuth2 authentication
- HTML email formatting
- Auto-signature
- BCC to jeff@hellogumbo.com and alex@hellogumbo.com
- Domain blocking (prevents accidental sends to wrong domains)

---

### 2. `sheets.js` - Google Sheets CRM Interface
Read/write to the Gumbo Leads CRM Google Sheet.

**Usage:**
```bash
# Read all data
node sheets.js read

# Write a row
node sheets.js write "Company,Contact,Email,..."
```

**CRM Sheet:** https://docs.google.com/spreadsheets/d/11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4

---

### 3. `batch-emails-2026-03-12.js` - Batch Email Generator
Example script for generating 25-email batches from CRM.

**Features:**
- Pulls uncontacted leads from Google Sheets
- Filters by Gumbo Score >= 8
- Personalizes subject lines per firm
- Sends preview to alex@hellogumbo.com
- Waits for approval before sending batch

**Usage:**
```bash
node batch-emails-2026-03-12.js
```

---

### 4. `get-sent-emails.js` - Gmail Sent Email Extractor
Pulls all sent emails from jim@hellogumbo.com inbox.

**Features:**
- Retrieves up to 500 sent messages
- Extracts: date, recipient, subject
- Saves to `sent-emails.json`
- Filters out lemwarmup/test emails

**Usage:**
```bash
node get-sent-emails.js
```

**Output:** `sent-emails.json`

---

### 5. `create-tracking-sheet.js` - Outreach Log Generator
Creates "Outreach Log" sheet in CRM with all sent PE emails.

**Features:**
- Reads `sent-emails.json`
- Filters out warmup/test emails
- Infers company names from email domains
- Creates new sheet in Google Sheets CRM
- Tracks: Date, Company, Contact, Email, Subject, Status

**Usage:**
```bash
# Run after get-sent-emails.js
node create-tracking-sheet.js
```

**Result:** New "Outreach Log" tab in CRM

---

### 6. `create-uncontacted-sheet.js` - Uncontacted Leads Filter
Creates "Uncontacted Leads" sheet by subtracting Outreach Log from Contacts.

**Features:**
- Cross-references Contacts sheet with Outreach Log
- Filters to only uncontacted emails
- Creates new sheet with 1,500+ fresh prospects

**Usage:**
```bash
node create-uncontacted-sheet.js
```

**Result:** New "Uncontacted Leads" tab in CRM

---

## Setup

### 1. Install Dependencies
```bash
npm install googleapis
```

### 2. Configure Gmail OAuth2
1. Create OAuth2 credentials in Google Cloud Console
2. Save as `credentials.json`
3. Run any script - it will prompt for OAuth authorization
4. Token saved to `token.json`

### 3. Configure Service Account (for Sheets)
1. Create service account in Google Cloud Console
2. Download JSON key as `service-account.json`
3. Share Google Sheet with service account email

### 4. Required Files (NOT in repo - add locally)
- `credentials.json` - OAuth2 credentials for Gmail
- `token.json` - OAuth2 access token (auto-generated)
- `service-account.json` - Service account for Google Sheets

---

## Workflow

### Daily Outreach Batch (25 emails/day)

1. **Generate batch:**
   ```bash
   node batch-emails-2026-03-12.js
   ```

2. **Preview sent to alex@hellogumbo.com**

3. **Alex approves via Slack**

4. **Batch executes automatically**

5. **Update tracking sheets:**
   ```bash
   node get-sent-emails.js
   node create-tracking-sheet.js
   node create-uncontacted-sheet.js
   ```

---

## CRM Sheet Structure

### "Contacts" Sheet
All PE firm contacts (1,860 total)

### "Outreach Log" Sheet
All sent emails (245 sends to 179 unique contacts)

### "Uncontacted Leads" Sheet
Contacts NOT yet emailed (1,522 fresh prospects)

---

## Email Format

**From:** Jim from Gumbo <jim@hellogumbo.com>  
**BCC:** jeff@hellogumbo.com, alex@hellogumbo.com  
**Format:** HTML with auto-signature  

**Signature:**
```
--
Jim Jensen
Gumbo | hellogumbo.com
AI-first engineering, served simple.
jim@hellogumbo.com
```

---

## Safety Features

- Domain blocking (prevents sends to wrong domains)
- Preview-before-send workflow
- Auto-BCC to jeff + alex
- Lemwarmup filter (excludes warmup emails from tracking)
- Duplicate contact prevention (via Uncontacted Leads sheet)

---

## Stats (as of March 15, 2026)

- **Total contacts:** 1,860
- **Contacted:** 179 (9.6%)
- **Uncontacted:** 1,522 (82%)
- **Outreach cadence:** 25 emails/day
- **Average open rate:** TBD
- **Meetings booked:** TBD

---

## GitHub Repo

**URL:** (Alex to add)

**Maintained by:** Jim (jim@hellogumbo.com)  
**Last updated:** March 15, 2026
