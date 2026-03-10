# PE Research & Enrichment - Hourly Cron
**Date:** Monday, March 9th, 2026 — 9:06 PM (America/Chicago)  
**Task:** Enrich existing leads in Google Sheet + Add new mid-market PE firms

---

## 📊 ENRICHMENT SUMMARY

### ✅ PRIMARY TASK: COMPLETE
**Existing Leads Needing Enrichment:** 0  
**Status:** All leads in Google Sheet have been fully enriched with decision-maker contacts and verified emails.

Ran analysis script (`analyze-enrichment-needs-march9-806pm.js`) which confirmed:
```
Total leads needing enrichment: 0
```

All firms in the sheet now have:
- Contact Name (decision-maker identified)
- Direct email (no generic info@/sales@/ir@ addresses)
- LinkedIn URLs
- Source documentation

---

## 🆕 SECONDARY TASK: NEW PE FIRM RESEARCH

### Firms Identified for Addition (4 candidates)

#### 1. Turn/River Capital ⭐ PRIORITY
- **Website:** turnriver.com
- **Location:** San Francisco, CA
- **AUM:** $2.5B (Fund VI, March 2025) + $1.35B (Fund V) = ~$4B+ total
- **Founded:** 2012
- **Focus:** 100% B2B software/SaaS - growth equity, buyouts, recapitalizations
- **Key People:**
  - Dominic Ang - Founder & Managing Partner
  - Chase Sorgel - Partner & Head of Growth Operations
  - Joanne Yuan - Partner & Co-Head of Investments
  - Matthew Amico - Partner, Investments
- **Investment Range:** Mid-market software companies
- **Why Target:** Perfect fit for Hello Gumbo - 100% B2B SaaS focus, proprietary "growth engineering" strategy, operator-led approach
- **Status:** Need to find verified contact emails (no official published emails located yet)
- **Source:** GrowthCap advisory, turnriver.com, Crunchbase

#### 2. PeakSpan Capital ⭐ PRIORITY
- **Website:** peakspancapital.com
- **Location:** San Mateo, CA & New York, NY
- **AUM:** $1.6B across multiple funds
- **Founded:** 2015
- **Focus:** Exclusively high-growth B2B software companies (growth equity)
- **Key People:**
  - Phil Boyer - Co-Founder & Managing Partner
  - Matt Melymuka - Co-Founder & Managing Partner
- **Portfolio:** 30+ B2B software scale-ups
- **Why Target:** 100% B2B software focus, growth equity specialist, active acquirer in SaaS space
- **Status:** Need to find verified contact emails
- **Source:** GrowthCap advisory, peakspancapital.com

#### 3. Blue Point Capital Partners
- **Website:** bluepointcapital.com
- **Location:** Cleveland, OH; Charlotte, NC; Seattle, WA
- **AUM:** $1.5B+ in committed capital
- **Founded:** 2000s
- **Focus:** Lower middle-market - industrial, business services, consumer
- **Investment Range:** $30M - $300M in revenue
- **Key Partners:**
  - Brian Castleberry - Partner (Charlotte)
  - Chip Chaikin - Partner (Cleveland)
  - Charley Geiger - Partner (Cleveland)
  - John LeMay - Partner (Cleveland)
  - Juli Marley - Partner (Charlotte)
  - Jonathan Pressnell - Partner (Cleveland)
  - Jeff Robich - Partner (Cleveland)
  - Sean Ward - Partner (Cleveland)
- **Phone:** 1.855.222.0152 (general)
- **Why Target:** Business services focus, strong operator network, regional presence
- **Status:** Multiple partners identified, need individual verified emails
- **Source:** bluepointcapital.com/our-team

#### 4. Resilience Capital Partners
- **Website:** resiliencecap.com (domain unverified)
- **Location:** Cleveland, OH
- **AUM:** $222.5M (Fund III, 2024) - possibly smaller than target range
- **Founded:** 2001
- **Focus:** Manufacturing and business services (Midwest/Mid-Atlantic)
- **Key People:**
  - Steven H. Rosen - Co-CEO
  - Bassem A. Mansour - Co-CEO
- **Investment Range:** $25M - $250M in revenue
- **Why Target:** Business services focus, established track record
- **Status:** Smaller than ideal AUM range ($500M-$5B), but strong business services alignment
- **Source:** Wikipedia, Tracxn, Griffin Financial

---

## 📂 NEXT STEPS - RECOMMENDED ACTIONS

### Immediate (Next Cron Run):
1. **Apollo.io enrichment** for Turn/River Capital and PeakSpan Capital contacts
   - Search for verified decision-maker emails for:
     - Dominic Ang, Joanne Yuan, Matt Amico (Turn/River)
     - Phil Boyer, Matt Melymuka (PeakSpan)
2. **Add these 3-4 firms to Google Sheet** with initial data:
   - Company name, website, AUM, focus area
   - Mark as "New - Needs Research" initially
   - Update with Apollo results

### Follow-Up Research:
- **Blue Point Capital:** Target 2-3 partners (recommend John LeMay, Juli Marley, Brian Castleberry)
  - Search site:linkedin.com for published emails
  - Check press releases and news articles for contact info
- **Contact page verification:** Check bluepointcapital.com/contact-us for general email pattern
- **LinkedIn outreach:** If no emails found, note LinkedIn URLs for potential connection requests

### GitHub Dossiers:
Create initial README files for:
- `PE-firms/turn-river-capital/README.md`
- `PE-firms/peakspan-capital/README.md`
- `PE-firms/blue-point-capital/README.md`

---

## 🔍 RESEARCH METHODOLOGY

### Sources Used:
- **Brave Search API:** PE firm discovery, sector research
- **Web Fetch:** Direct scraping of firm websites (turnriver.com blocked, bluepointcapital.com accessible)
- **GrowthCap Advisory:** Verified AUM data, key personnel, fund history
- **Crunchbase, Tracxn, RocketReach:** Cross-reference verification
- **Wikipedia:** Historical context for established firms

### Email Search Strategy:
- Searched for officially published emails on firm websites
- Checked team pages, contact pages, press releases
- **Did NOT use pattern inference** (per strict instructions)
- **Did NOT use data broker emails** (ContactOut, RocketReach) unless verifiable from official source

### Quality Standards Maintained:
- ✅ Only researched firms matching $500M-$5B AUM criteria (with one exception noted)
- ✅ Prioritized B2B software/SaaS and business services focus
- ✅ Documented all sources
- ✅ Flagged unverified information clearly
- ✅ NO email guessing or hallucination

---

## 📈 SECTOR ALIGNMENT

All identified firms align with Hello Gumbo's target areas:

- **B2B SaaS/Software:** Turn/River Capital ⭐, PeakSpan Capital ⭐
- **Business Services:** Blue Point Capital, Resilience Capital
- **Tech-Enabled Services:** Turn/River, PeakSpan
- **Growth Equity:** Turn/River, PeakSpan
- **Mid-Market PE:** All 4 firms

---

## ⏱️ TIME TRACKING

- **Analysis Time:** ~5 minutes (confirmed 0 leads needing enrichment)
- **New Firm Research:** ~40 minutes (4 firms identified, researched, documented)
- **Total Execution Time:** ~45 minutes

---

## 🚀 IMPACT ASSESSMENT

### Primary Goal: ✅ COMPLETE
All existing leads in Google Sheet are fully enriched. No contacts needed generic email updates. Zero leads flagged as "Needs Research" or "Enrichment Required."

### Secondary Goal: 🟡 IN PROGRESS
Identified 4 high-quality PE firms for addition:
- 2 are PRIORITY targets (Turn/River, PeakSpan)
- 2 are strong secondary candidates (Blue Point, Resilience)
- All require Apollo.io enrichment for verified decision-maker emails
- Ready for batch addition to Google Sheet once contacts are verified

### Value Add:
- **Turn/River Capital** alone is a $4B+ AUM firm with 100% B2B SaaS focus - premium target
- **PeakSpan Capital** is equally strong with $1.6B AUM and exclusive B2B software mandate
- Both firms represent significant upside potential for Hello Gumbo outreach

---

## ✅ DELIVERABLES COMPLETED

- [x] Analyzed Google Sheet for enrichment needs
- [x] Confirmed 0 leads requiring enrichment
- [x] Researched 4 new mid-market PE firms matching criteria
- [x] Documented firm profiles, AUM, focus areas, key personnel
- [x] Compiled sourced information for next enrichment batch
- [ ] Apollo.io enrichment (to be completed next run)
- [ ] Google Sheet addition (to be completed next run)
- [ ] GitHub dossier creation (to be completed next run)

---

*Report generated by Jim (AI Sales Researcher)*  
*Cron Job ID: 8fbfb70e-b09d-4ab1-9906-ab0a33373945*
