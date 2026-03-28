# PE Research Repository

Private equity firm research and contact enrichment for Hello Gumbo outreach.

## Structure

```
PE-firms/
  [Firm-Name].md  - Individual firm dossiers
  
Scripts/
  find-rows.js         - Locate specific firms in Google Sheet
  find-empty.js        - Find leads needing enrichment
  fix-rows.js          - Fix data issues in sheet
  append-new.js        - Add new firms to sheet
  update-contacts.js   - Update contact information
```

## Workflow

### 1. Research Phase
- Identify firms needing enrichment (empty contacts or generic emails)
- Search official sources: company websites, press releases, LinkedIn
- Cast wide net for decision-makers: C-level, Partners, Directors, VPs, Heads
- **NEVER guess email patterns** - only use verified published sources

### 2. Verification Phase
- Email must be from official published source (company site, press release, official LinkedIn post)
- Document source and verification date
- Update Google Sheet with verified contact info
- Mark status as "Enriched" when complete

### 3. Documentation Phase
- Create/update firm dossier in PE-firms/
- Include: overview, verified contacts, investment focus, sources
- Commit changes to GitHub
- Push to remote repository

## Google Sheet

**Sheet ID**: `11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4`

### Columns
- A: Company Name
- B: Website/NotebookLM
- C: Contact Name
- D: Title
- E: Email
- F: [Additional field]
- G: LinkedIn URL
- H: Status/Notes
- I: Additional Notes
- J: Status Label

## Recent Updates

### 2026-03-28 (Hourly Cron)
**Fixed Existing Leads (2)**
- Row 18: Gryphon Investors - Fixed email in wrong column
- Row 115: Alpine Investors - Fixed email in wrong column

**Added New Firms (3)**
- Saw Mill Capital - ~$2B AUM, business/healthcare services
- Milestone Partners - $1.8B AUM, business/healthcare services  
- Norwest Equity Partners - $3.5B+ AUM, consumer/healthcare/services

**Verified Contacts (2)**
- Gridiron Capital: Thomas Burger (tburger@gridironcapital.com) ✅
- Yellowstone Capital Partners: Juan Carlos Moreno (juan.moreno@yellowstonecp.com) ✅

## Research Sources

### Primary Sources (Preferred)
- Official company websites (team/contact pages)
- Press releases on company sites
- Official LinkedIn posts
- SEC filings
- Conference speaker bios

### Secondary Sources (Use with caution)
- LinkedIn company pages
- News articles
- Industry publications
- Conference attendee lists

### NOT Acceptable
- RocketReach / ZoomInfo (unless email already published elsewhere)
- Guessed email patterns
- Unverified third-party databases

## Commands

```bash
# Find firms needing enrichment
node find-empty.js

# Find specific firms
node find-rows.js

# Fix data issues
node fix-rows.js

# Add new firms
node append-new.js

# Git workflow
git add .
git commit -m "Update: [description]"
git push origin main
```

## Contact

Maintained by Jim (AI Agent) for Hello Gumbo PE outreach initiative.
