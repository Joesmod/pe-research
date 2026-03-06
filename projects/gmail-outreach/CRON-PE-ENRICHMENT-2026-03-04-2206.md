# PE Research & Enrichment - Hourly Cron Report
**Date:** Wednesday, March 4th, 2026 — 10:06 PM CST
**Task:** Enrich 10-15 leads with empty Contact Name or generic emails

## ⚠️ Technical Issues

### Apollo API Failures
All Apollo API requests returned **422 errors** across 15 firms tested. The API appears to be rejecting domain-based searches. This blocked the automated enrichment pipeline.

Sample error pattern:
```
Apollo people search error for [Firm]: Request failed with status code 422
```

Switched to **manual web research** for remainder of session.

---

## 🔍 Manual Research Findings

### ✅ Firms Successfully Enriched (Partial)

#### 1. **TAU Investment Management**
- **Website:** https://tau-investment.com
- **Focus:** Apparel supply chain, growth equity
- **Location:** New York & Hong Kong
- **Key Contacts Found:**
  - Oliver Niedermaier (Senior leadership, LinkedIn confirmed)
  - Niko Canner (Co-Founder, Advisor)
  - Scott Clark (Managing Director, Head of Business Development)
    - Email pattern: `s******@tau-investment.com` (RocketReach)
  - Ken Katz (Head of Asia Investment)
- **Generic Contact:** info@tau-investment.com
- **Status:** Need to verify individual emails before updating sheet

#### 2. **Valiant Capital**
- **Website:** https://valiant-capital.com (Houston-based)
- **Note:** Different from `valiantcapital.com` in sheet
- **Key Contact Found:**
  - Rick (Senior Partner, Houston)
  - **Verified Email:** rick@valiant-capital.com
- **Status:** Domain mismatch with sheet. Need clarification if same firm.

#### 3. **Bindley Capital Partners**
- **Location:** Indianapolis
- **Key Contact Found:**
  - Keith Burks (Partner)
  - LinkedIn: https://www.linkedin.com/in/keith-burks-80659662/
  - PitchBook shows partial email: `kb@...`
  - **Likely Email:** kb@bindleycapital.com (pattern inference, NOT VERIFIED)
- **Status:** Email inferred but not verified from official source

#### 4. **GiantLeap Capital**
- **Website:** https://www.giantleapcapital.com
- **Focus:** Tech convergence, growth equity
- **Location:** New York
- **Key Contacts Found:**
  - Himanshu Sekhar (Founder & Managing Partner)
    - LinkedIn: https://www.linkedin.com/in/himanshu-sekhar-5308901/
  - Samir Parikh (Co-Founder/Managing Partner)
- **Contact Page:** Generic form only, no direct emails published
- **Status:** Need deeper research for verified emails

#### 5. **Jett Capital Advisors**
- **Website:** https://www.jettcapital.com
- **Focus:** Energy & natural resources investment banking
- **Key Contact Found:**
  - Joseph Jett (Managing Partner)
  - LinkedIn: https://www.linkedin.com/in/josephjett/
  - **Email Pattern:** [first_initial][last_initial]@jettcapital.com (RocketReach)
  - **Likely Email:** jj@jettcapital.com (pattern inference, NOT VERIFIED)
- **Status:** Email inferred but not verified from official source

---

### ❌ Firms Requiring Different Approach

#### 1. **Cardea Group** (http://www.thecardeagroup.com)
- **NOT A PE FIRM** — Executive search/recruiting firm
- Specializes in hedge fund, PE, VC, family office placements
- **Found:** andrea@thecardeagroup.com (recruiter)
- **Action:** Should be flagged/removed from PE outreach list

#### 2. **HRCap, Inc.** (http://www.hrcap.com)
- **NOT A PE FIRM** — HR consulting & executive search
- "Largest Asian-American Executive Search and HR Consulting Firm"
- Partners WITH PE firms but is not a PE investor
- **Action:** Should be flagged/removed from PE outreach list

#### 3. **Victory Capital** (http://www.vcm.com)
- **NOT A PE FIRM** — Large public asset management company
- Focus: Mutual funds, traditional investments
- **Action:** Should be flagged/removed from PE outreach list

#### 4. **Keltic Financial Partners** (https://www.kelticfp.com)
- **Website DOWN** — Domain does not resolve
- **Action:** Mark as inactive/dead lead

---

### 🚧 Firms Requiring Further Research

The following firms need deeper investigation (team pages, LinkedIn mining, press releases, etc.):

1. **Jensen Partners** - Website is a LinkedIn profile URL (needs firm website)
2. **Kinect Capital** - Generic site, no team page found yet
3. **Odyssey Search Partners** - Name suggests recruiting firm, needs verification
4. **TAP Advisors** - Minimal web presence
5. **Virtas Partners** - Need to find team/contact page
6. **HSP - Henkel Search Partners** - Name suggests recruiting firm

---

## 📊 Summary

| Category | Count |
|----------|-------|
| Total leads needing enrichment | 182 |
| Attempted this session | 15 |
| Apollo API failures | 15/15 (100%) |
| Manual research completed | 11 |
| Partial enrichment (contacts found, emails unverified) | 5 |
| Not PE firms (to be removed) | 3 |
| Inactive/dead websites | 1 |
| Requires deeper research | 6 |

---

## 🎯 Next Steps

### Immediate Actions:
1. **Fix Apollo API** - Investigate 422 errors, check API key status, review request format
2. **Verify email patterns** - Cross-reference inferred emails before sheet updates
3. **Clean sheet** - Flag/remove non-PE firms (Cardea, HRCap, Victory Capital)
4. **Mark dead leads** - Update Keltic Financial Partners as inactive

### Alternative Enrichment Strategies:
1. **LinkedIn Sales Navigator** - Direct profile mining for verified contacts
2. **Hunter.io** - Domain-based email verification (already have API key)
3. **Manual team page scraping** - Direct from firm websites
4. **PitchBook data** - If available, cross-reference for verified contacts
5. **Press releases / conference bios** - Search for published contact info

### Recommended Approach for Next Cron:
Instead of bulk API calls, focus on **quality over quantity**:
- Target 5-8 firms per session
- Deep research each firm (team pages, LinkedIn, press)
- Only update sheet with **verified, published emails**
- Document source for each contact (transparency)

---

## 🕐 Time Investment
- **Session Duration:** ~25 minutes
- **Apollo API debugging:** 5 min
- **Manual research:** 20 min
- **Firms researched:** 11
- **Average time per firm:** ~2 minutes

**Conclusion:** Manual enrichment at current pace would require ~6 hours to complete 182 firms. Recommend fixing Apollo API or implementing Hunter.io batch enrichment for efficiency.

---

**Generated:** 2026-03-04 22:06 CST
**Next Cron:** Hourly (top of each hour)
