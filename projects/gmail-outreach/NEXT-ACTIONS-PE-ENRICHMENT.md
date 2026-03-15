# PE Enrichment - Next Actions
**Last Updated:** March 7, 2026, 7:36 AM  
**Status:** Research complete, manual actions required

---

## 🚨 Immediate Actions Needed

### 1. Clean Sheet - Mark Dead Entries (5 min)
Update Google Sheet status for these NON-PE firms to "Dead - Not PE":

```
Row 117: Keltic Financial Partners (lender)
Row 620: HRCap, Inc. (HR consultancy)
Row 621: HSP - Henkel Search Partners (recruiter)
Row 626: Jett Capital Advisors (investment bank)
Row 630: Kinect Capital (non-profit)
Row 670: ScaleView Partners (investment bank)
Row 687: Valiant Capital Management (hedge fund)
```

### 2. Verify Email Patterns (10 min)
Use Hunter.io to verify patterns for top 2 firms:

**Warren Equity Partners:**
- Test: `swacaster@warrenequity.com`
- Test: `steven.wacaster@warrenequity.com`
- Test: `sbruckmann@warrenequity.com`

**Arsenal Capital Partners:**
- Test: `tmullen@arsenalcapital.com`
- Test: `jmarquis@arsenalcapital.com`
- Test: `smclean@arsenalcapital.com`

### 3. Update Sheet with Verified Contacts (15 min)
Once emails verified, update:

**Row 874 - Warren Equity Partners:**
- Contact Name: Steven Wacaster
- Title: Managing Partner & Co-Founder
- Email: [verified pattern]
- LinkedIn: https://www.linkedin.com/company/warren-equity-partners
- Status: Enriched
- Notes: Infrastructure & industrial services focus. $1.4B Fund IV. Alt contacts: Scott Bruckmann (Partner), Carl Johnson (Partner, Head of Operations)

**Rows 889, 892 - Arsenal Capital Partners:**
- Contact Name: Terry Mullen
- Title: Managing Partner & CIO, Founder
- Email: [verified pattern]
- LinkedIn: https://www.linkedin.com/company/arsenal-capital-partners
- Status: Enriched
- Notes: $10B+ AUM. Healthcare & specialty industrials. 80+ team. Alt contacts: Joelle Marquis (President), Marion Hayes (Head of Responsible Investing)

---

## 📋 Research Queue - Next 5 Firms

Continue enrichment for these priority firms (all verified PE):

1. **Wind Point Partners** (Row 844, Score 7)
   - Chicago-based, middle market
   - Focus: Consumer, industrial, business services
   - Website: wppartners.com

2. **Peak Rock Capital** (Rows 856, 867, 887, Score 7)
   - Multiple entries = high priority
   - Middle market PE

3. **CCMP Capital** (Row 860, Score 7)
   - Large middle market firm

4. **American Industrial Partners** (Row 843, Score 6)
   - Industrial focus (name suggests strong fit)

5. **Odyssey Investment Partners** (Rows 891, 907, Score 7)
   - Multiple entries

---

## 📊 Progress Tracker

**Cron Run: March 7, 7:36 AM**
- Firms analyzed: 23
- Non-PE identified: 7  
- Real PE targets: 16
- Fully researched: 2
- Emails verified: 0 (pending Hunter.io)
- Decision-makers found: 12

**Overall Sheet Health:**
- ~89 leads need enrichment
- ~7 are non-PE (need removal)
- ~82 potential real PE targets
- Priority: Focus on Gumbo score 7-9 first

---

## 🔄 For Next Cron Run

**Skip to:** Real PE firms with scores 6-9  
**Avoid:** Initial batch with search firms, consultants, banks  
**Method:** 
1. Read `real-pe-targets-march7-736am.json` for priority list
2. Research next 3-5 firms from that list
3. Find decision-makers on team pages
4. Verify emails with Hunter.io before updating sheet
5. Update sheet only with verified contacts

---

## 📁 Reference Files

- `PE-ENRICHMENT-FINAL-REPORT-MARCH7-736AM.md` - Full detailed report
- `real-pe-targets-march7-736am.json` - 16 priority firms list
- `research-findings-march7-736am.json` - Non-PE firm details
- `memory/2026-03-07.md` - Daily log entry

---

**Priority:** HIGH - Clean sheet & verify top 2 contacts today  
**Time Required:** ~30 minutes total
