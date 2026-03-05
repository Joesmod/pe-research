# PE Research & Enrichment - Cron Run
**Date:** March 5, 2026 - 4:36 AM CST  
**Session:** Hourly PE enrichment cron job  
**Operator:** Jim (Sales Researcher)

## 📊 Summary

- **Total leads in sheet:** 937
- **Leads needing enrichment:** ~200 (estimated)
- **Apollo API attempts:** 200+
- **Successfully enriched:** 0
- **Sheet updates:** 0
- **Manual research attempts:** 3 firms (GiantLeap, 3G Capital)

## 🚫 Blockers

### 1. Apollo API Issues
- **Error 422 (Unprocessable Entity):** API rejects all requests
- **Error 429 (Rate Limited):** Hit rate limit after ~150 failed attempts
- **Root cause:** Request format incompatible with Apollo's people search endpoint
- **PE firm coverage:** Apollo finds organizations but returns no people data for PE firms

### 2. Manual Research Limitations
- **GiantLeap Capital:** Website has no published team emails, only contact form
- **3G Capital:** Team page returned 404, no direct contact info
- **Pattern observed:** PE firms universally hide decision-maker contact info
  - Contact forms only
  - Generic info@ emails
  - LinkedIn profiles without email
  - No published email patterns

### 3. Data Quality Issues
Many rows have structural problems:
- **"Jacob Zodikoff" placeholder** in hundreds of rows
- **Website column contains LinkedIn URLs** instead of firm websites
- **Missing domains** for many firms
- **Service providers mixed with PE firms** (need cleanup)

## 🔍 Findings

### Firms to Mark as "Dead" (Not PE Firms)
Based on previous research, these are service providers:
1. **Cardea Group** - Executive recruiting firm
2. **Jensen Partners** - Executive search/recruiting  
3. **Kinect Capital** - Nonprofit venture accelerator
4. **Wall Street Oasis** - Financial careers website
5. **Wall Street Prep** - Training/education company
6. **Wefunder** - Crowdfunding platform
7. **Odyssey Search Partners** - Executive search
8. **Atlas Search LLC** - Recruiting firm

### Verified Contacts (Already in Sheet)
- **GiantLeap Capital:** Samir Parikh (Co-Founder & Managing Partner) - samir@giantleapcapital.com ✓
- (This was already enriched in a previous run)

### Key Decision-Makers Identified (No Direct Email)
- **3G Capital:** Alex Behring (Co-Founder & Co-Managing Partner), Daniel Schwartz (Co-Managing Partner)
- No direct emails published

## 🛠️ Recommended Next Steps

### Immediate Actions (Before Next Cron Run)

1. **Clean up data structure**
   - Mark service providers as "Dead" status
   - Fix rows where Website column has LinkedIn URLs
   - Remove "Jacob Zodikoff" placeholders

2. **Switch enrichment strategy**
   - **Option A:** Use Hunter.io domain search (better PE coverage than Apollo)
   - **Option B:** Use ZoomInfo/LinkedIn Sales Navigator (paid, high accuracy)
   - **Option C:** Inferred email validation:
     - Pattern: [first].[last]@[domain]
     - Verify with Email Hippo or NeverBounce
     - Risk: May bounce, need validation step

3. **Manual research for top 25 firms**
   - Focus on mid-market PE ($500M-$5B AUM)
   - Use LinkedIn site search: `site:linkedin.com "3G Capital" "Managing Partner"`
   - Cross-reference with Crunchbase, PitchBook, firm press releases
   - Extract from team bios in portfolio company announcements

### Alternative Outreach Strategies

**A. LinkedIn-First Approach**
- Send LinkedIn connection requests to Partners/MDs
- Message with intro after acceptance
- Ask for direct email or schedule call
- **Pros:** No email needed, direct access
- **Cons:** Time-intensive, lower response rate

**B. Company Contact Forms**
- Use website contact forms for initial outreach
- Ask for appropriate contact person
- Follow up if they provide direct contact
- **Pros:** Official channel, gets routed internally
- **Cons:** Often goes to generic inbox, slow

**C. Warm Introductions**
- Leverage existing portfolio company relationships
- Ask for intros to PE firm partners
- Use mutual connections on LinkedIn
- **Pros:** Highest conversion rate
- **Cons:** Requires existing network

**D. Event-Based Outreach**
- Target PE conferences/events (SuperReturn, ACG)
- Follow up with attendees post-event
- Reference shared session/panel
- **Pros:** Context, timing advantage
- **Cons:** Seasonal, requires event access

## 📋 Priority Enrichment Targets (Next Run)

If we can fix Apollo API or use Hunter.io, prioritize these firms:

### Tier 1: Mid-Market PE with Services Portfolio (High Value)
1. **HGGC** (hggc.com) - Kevin Schwartz
2. **Gemspring Capital** (gemspring.com) - Chip Baird
3. **Incline Equity Partners** (inclineequity.com) - Andrew Weinstein
4. **Triton Pacific Capital Partners** (trilanticnorthamerica.com) - Tim DeVries
5. **SEP Funds** (sepfunds.com) - Ryan Milligan

### Tier 2: Growth Equity / Tech-Enabled Services
6. **Nautic Partners** (nautic.com) - Andrew Sandler
7. **Gryphon Investors** (gryphon-inv.com) - Lee Mlotek
8. **Shore Capital Partners** (shoreviewindustries.com) - Richard Erickson
9. **Bluestar Innovation Partners** (bluestarinnovationpartners.com) - Kirk Adamson
10. **Cornell Capital** (cornellcapllc.com) - Dan Shockley

## 📁 Files Created

- `cron-enrich-march5-436am.js` - Enrichment script (hit API limits)
- `enrichment-log-march5-436am.json` - Empty results log
- `CRON-PE-ENRICHMENT-2026-03-05-436AM.md` - This report

## 🎯 Mission Impact

**Blocker Status:** CRITICAL - Cannot scale enrichment without fixing API/strategy  
**Current state:** 200+ leads still need verified contacts before outreach  
**Estimated manual research time:** 10-20 hours for 200 firms (6-12 minutes each)

## Recommended Decision Point

**QUESTION FOR ALEX:**
Given PE firms hide contact info and APIs have poor coverage, which strategy should we prioritize?

1. **Pay for ZoomInfo/LeadIQ** (~$500-2000/mo, high accuracy, fast)
2. **Manual LinkedIn research** (free, time-intensive, 10-20 hours)
3. **Hunter.io batch enrichment** (~$200/mo, moderate coverage, automated)
4. **LinkedIn-first outreach** (skip emails, go direct via InMail/connections)
5. **Hybrid:** Enrich top 50 manually, use contact forms for rest

---

**Next cron run:** March 5, 2026 - 5:36 AM CST  
**Status:** Awaiting strategy decision before proceeding  
**Follow-up:** Need to fix Apollo API request format OR switch to Hunter.io
