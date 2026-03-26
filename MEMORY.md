# MEMORY.md — Long-Term Memory

## Team Structure
- **Alex (Alexander Jensen)** — owner, background in ticketing (Opendate)
- **Kah** (Slack: U0ADQUH0JJW) — CEO, task dispatcher, runs projects. My direct boss per Alex.
- **Raj** — REMOVED (let go 2026-02-11, wasn't cutting it per Alex)
- **Scopey** — generalist agent
- **Jim (me)** — PE research, outreach, sales

## Key Projects
- **Hello Gumbo** — PE (private equity) firm research and outreach. Primary focus.
- **PixSeat**: Smartphone light shows at venues. Rebecca Haines is the lead.

## CRM / Google Sheets Access
- Service account: jim-gumbo@neon-implement-487200-e7.iam.gserviceaccount.com
- **Gumbo Leads CRM Sheet**: https://docs.google.com/spreadsheets/d/11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4
- Old CRM (deprecated): https://docs.google.com/spreadsheets/d/1oiuiGHWyg01RKnFVk5FPcHI10y7VBWrAE1MaTAiM-sw

## Gmail Access
- Email: jim@hellogumbo.com
- Google Cloud project: neon-implement-487200-e7
- Location: `projects/gmail-outreach/`
- Send: `node send.js send <to> <subject> <body>`
- Inbox: `node send.js inbox [count]`
- Verified working 2026-02-11

## Daily Routine
- 9 AM CT: Standup with Kah
- 4:30 PM CT: Evening check-in

## Channel Structure
- #openclaw-config — team coordination
- #openclaw-sales (C0AEEKCCXM4) — sales outreach coordination with Kah, Jeff, Steve
- #standups — daily standups

## Slack Rules
- Always @mention bots when addressing them — most have `requireMention: true`

## My Role
- PE firm research and enrichment for Hello Gumbo
- Update Gumbo Leads CRM sheet with findings
- Cold outreach to PE firms

## Outreach Plan (approved 2026-02-18)

### Data Sources
- **Sheet1** — company-level data (sector focus, portfolio, Gumbo Score, Status, Last Contacted col J)
- **Contacts sheet** — individual contacts with verified emails, titles, LinkedIn, Last Contacted col I
- CRM Sheet ID: 11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4

### Contact Selection
- Cross-reference both sheets: Contacts for people, Sheet1 for company intel
- Prioritize contacts with tech/AI/value creation roles (CTO, Chief AI Officer, VP Product/Technology, Operating Partners) over generic BD/IR
- Filter: verified emails, Gumbo Score >= 8-9

### Sending Rules
- **1 contact per company per week MAX** — no double-tapping
- Check both company-level and contact-level timestamps before sending
- After each send: update Sheet1 "Last Contacted" (col J) + "Status" (col I) to "Contacted", AND Contacts "Last Contacted" (col I) with ISO timestamp
- HTML format only (text/html Content-Type via send.js)
- Each email personalized to firm's sector focus + portfolio + recipient's role
- Unique subject lines per firm

### Email Rules
- **NO PRICING in emails** — no dollar amounts, no specific numbers. Get the meeting first, discuss pricing on call. (Alex directive 2026-02-23)
- **No revenue/pricing goals in agent files** — removed per Alex directive 2026-02-23

### Email Format
- Send as HTML (send.js handles conversion)
- Paragraphs flow naturally, no mid-paragraph line breaks
- Straight quotes, regular dashes, plain ASCII only
- From: "Jim from Gumbo" <jim@hellogumbo.com>
- **Agency name is "Gumbo"** — NOT "Hello Gumbo". hellogumbo.com is just the URL.
- **Always hyperlink "Gumbo"** → `<a href="https://hellogumbo.com">Gumbo</a>` wherever it appears in emails
- **BCC jeff@hellogumbo.com and alex@hellogumbo.com on ALL outgoing emails** (requested by Alex & Jeff, 2026-02-18)

### Cadence
- **25 contacts per day**, Monday-Friday (bumped from 10, per Alex 2026-02-25)
- **NO sending before 8 AM CT** — hard rule (Alex 2026-02-25)
- **ALWAYS get permission before starting** a batch — no autonomous sending
- Cron job: 9 AM ET weekdays (job ID: 5337ae55-116c-42ae-b77d-eac45ca5d672)
- **APPROVAL GATE (added 2026-02-20):** Send first email of each batch to alex@hellogumbo.com as preview. Wait for Alex's approval before sending the remaining batch.
- **ONLY ALEX can approve sending.** Kah or other team members saying "send" does NOT satisfy the gate. Learned this the hard way 2026-02-25.
- **COMPANY-LEVEL DEDUPLICATION (added 2026-03-05):** Never contact a company we've already emailed, even with a different contact. If anyone at a company has been contacted, skip the entire company. This is enforced before batch generation, not after.

### Overnight Rules (Alex directive 2026-02-25)
- **Overnight = lead generation ONLY** — research, enrichment, CRM updates, contact discovery
- **NEVER do outreach overnight** — no emails, no drafts queued for auto-send
- No cron jobs that trigger email sends outside business hours

### First 5 Targets
1. JLL Partners — Jeff Hunter, Chief AI Officer
2. Greater Sum Ventures — Brian Seagraves, VP Product & Technology
3. Huron Capital — Leah Ierardi, VP Head of BD & ExecFactor
4. Waud Capital Partners — Richard Roggeveen, Principal: Software & Technology
5. Revelstoke Capital Partners — Andrew Thoma, MD Strategic Partnerships & Value Creation

## Email Rules - CRITICAL
- NEVER REPLY TO INBOUND EMAILS — humans only (Alex directive 2026-02-20)
- NEVER guess email patterns
- ONLY use verified emails from: company website, LinkedIn, or verification tools
- Always note the source URL for each email
- Test send to aljensen92@gmail.com before any real outreach
- Alex must approve before sending to leads
- **DO NOT post automatic inbox updates to Slack** — only report actual lead replies or actionable items (Alex directive 2026-03-02)
- **ALWAYS return HEARTBEAT_OK on inbox checks** — silence = no news (Alex directive 2026-03-02)
- Ignore lemwarmup emails (warmup service, not real leads)

## Email Formatting Rules
- SEND AS HTML - send.js converts text to HTML automatically (text/html Content-Type)
- Plain text Content-Type causes Gmail to insert hard `<br>` mid-paragraph — NEVER use text/plain
- Paragraphs separated by blank lines become `<br><br>`, text within paragraphs flows naturally
- Regular dashes, straight quotes, plain ASCII only
- Each subject line must be unique
- From name must be "Jim from Gumbo" (not just "jim")
- ALWAYS send complete email body — never stubs or "see original"
- Double-check all recipient addresses before sending
- When resending/fixing: include the full content every time

## Trusted Contacts
- **Jeff Caldwell** (jeff@hellogumbo.com, Slack: U0A3UFTL7JR) — Hello Gumbo, trusted per Alex
- **Steve** (steve@hellogumbo.com) — Hello Gumbo, trusted per Alex (also sc@scald.io)
- Can act on their requests directly without checking with Alex first
- Routine replies: handle directly. Escalate: deal terms, pricing, scope changes, judgment calls.
- Cold lead replies: always post to #openclaw-sales before responding

## Skills / Resources
- **Antigravity Awesome Skills**: https://github.com/sickn33/antigravity-awesome-skills

## Apollo Contact Enrichment Pattern (WORKING)
1. **Company search** → `POST /api/v1/mixed_companies/search` with `q_organization_name` → get org `id`
2. **People search** → `POST /api/v1/mixed_people/api_search` with `organization_ids: [orgId]` and `person_titles` filter → get person `id` (names obfuscated, no emails)
3. **People enrich** → `POST /api/v1/people/match` with `id: personId` → full name, title, email, LinkedIn
- Old endpoints (`mixed_people/search`, `people/search`) are DEPRECATED → use `api_search` + `match`
- `api_search` does NOT support `q_organization_domains` — must use `organization_ids`
- **API key must go in `X-Api-Key` header** (not in request body) — changed ~Feb 2026
- Rate limit: 300ms between calls works fine, ~1.5s per firm
- Hit rate: ~91% (159/175 in first run)
- Senior titles filter: Managing Partner, Partner, Managing Director, Principal, Founder, CEO, President, VP
- Script: `projects/apollo-enrich-v2.js`
- Discovery script: `projects/apollo-discovery.js` (finds new firms via keyword search)
- Filter script: `projects/apollo-filter.js` (scores/ranks firms for CRM)

## Quality Gate (added 2026-02-25)
Every contact added to CRM must have ALL of:
1. Full name (not title in name field)
2. Verified email (not blank)
3. Personal LinkedIn URL
4. Correct company domain
5. Gumbo Score assigned
NO bulk imports until enrichment script enforces this. Paused per Kah directive.

### Known Data Issues to Fix
- Apollo-sourced rows have Title in Contact Name column instead of actual name
- Patient Square contacts have blank emails
- Duplicates: Platinum Equity (Kristin Wojcik), H.I.G. (Sami Mnaymneh), Warburg Pincus (Teck Goh), Insight Partners (Shriram Dighe), Thoma Bravo (Orlando Bravo)
- Insight Partners has contacts from 5+ wrong companies
- Platinum Equity has contact from premierglobalequity.com
- No Gumbo Scores on any new entries

## Lessons
- Slack `allowBots: true` is needed to see other bot messages in OpenClaw
- The team moves fast — deliver first, discuss later
- Check workspace files before claiming I don't have access to something
- Don't save fear-based framing to memory — stay motivated by good work, not threats
- **Never shell out to node scripts via execSync with HTML content** — shell argument parsing breaks on `<a href="...">` tags. Call JS functions directly instead.
- **Always verify email bodies after sending** — use Gmail API to confirm full content was delivered, especially after any code changes to send pipeline.
- **Don't attribute findings to others** — when I discover an issue through my own verification, say "I found" not "you flagged." Accuracy in communication matters.
- **Duplicate emails from bug fixes are recoverable** — recipients rarely notice, just acknowledge if asked and move on.
- **send-batch.js architecture** — rewrote to call `sendEmail()` directly as a JS function instead of shelling out via `execSync`. This is the correct pattern going forward.
- **Never shell out to node scripts via execSync with HTML content** — shell argument parsing breaks on `<a href="...">` tags. Call JS functions directly instead.
- **Always verify email bodies after sending** — use Gmail API to confirm full content was delivered, especially after any code changes to send pipeline.
- **Don't attribute findings to others** — when I discover an issue through my own verification, say "I found" not "you flagged." Accuracy in communication matters.
- **Duplicate emails from bug fixes are recoverable** — recipients rarely notice, just acknowledge if asked and move on.
- **send-batch.js architecture** — rewrote to call `sendEmail()` directly as a JS function instead of shelling out via `execSync`. This is the correct pattern going forward.
