# PE Research & Enrichment Report
**Date:** March 29, 2026 - 5:05 AM
**Session:** Hourly Cron Job

## Summary
Attempted enrichment of 26 leads requiring contact information. Encountered systematic challenges finding publicly available email addresses for PE firm contacts.

## Methodology Attempted
1. **Apollo API Search** - No results returned for any queries
2. **Web Search + Firm Websites** - Most PE firms do not publicly list email addresses on team pages
3. **Contact Databases** (RocketReach, ZoomInfo) - Showed partial results but behind paywalls
4. **LinkedIn Profiles** - Confirmed roles and companies but no direct email access

## Key Findings

### Data Quality Issues Identified

**Michael Knigin**
- Sheet lists: "HIG Capital"
- Actually at: **Highlander Partners** (Managing Director)
- Source: https://highlander-partners.com/team/michael-knigin/
- LinkedIn: Confirmed
- Email: Not publicly available (partial shown in RocketReach: m***@highlander-partners.com)

**Claire Bissot**
- Sheet lists: "mgpfund"
- Actually at: **Kainos Capital** (HR role - SPHR)
- LinkedIn: https://www.linkedin.com/in/clairebissot/
- Note: Not a deal team member - may not be correct target for PE outreach

**Tonka Bay Equity Partners - Kyle Largent**
- Website: https://tonkabayequity.com/
- Team page exists but Kyle Largent not listed publicly
- May be junior/unlisted team member
- Email: Not found through public sources

**Searchlight Capital - Keval Patel**
- Large team (~100+ members on website)
- Keval Patel not found in public team directory
- May be incorrect firm or junior role
- Email: Not found

**Mountain Group Partners (MGP Fund)**
- Confirmed firm exists - recently closed MGP Venture Fund III at $128M
- Claire Bissot not associated with this firm

## Challenges Encountered

1. **Email Privacy**: PE firms systematically do not publish direct email addresses on websites
2. **Apollo API**: Returned zero results for all searches despite valid API key
3. **Contact Databases**: RocketReach/ZoomInfo show partial data but require paid subscriptions
4. **Data Accuracy**: Several sheet entries have wrong firms or outdated information

## Recommendations

### Immediate Actions Needed
1. **Manual Verification**: Review and correct company assignments for:
   - Michael Knigin → Change from "HIG" to "Highlander Partners"
   - Claire Bissot → Verify if she's the right contact (HR role, not deal team)
   
2. **Alternative Sourcing Methods**:
   - **LinkedIn Sales Navigator** (if available) - More reliable than Apollo
   - **Email Pattern Inference** - Once we confirm one email format for a firm, can infer others
   - **Press Releases** - Sometimes contain email addresses in contact sections
   - **SEC Filings** - May list contact information for portfolio companies
   - **Conference Speaker Bios** - Often include direct emails

3. **Focus Strategy Shift**:
   - Prioritize firms where we've already confirmed contacts
   - Build relationships to get introductions to other firms
   - Use Apollo for company/firm intelligence rather than contact discovery

### Research Priority Queue

**High Priority - Needs Correction:**
- Row 39: Michael Knigin - Update company to "Highlander Partners"
- Row 48: Claire Bissot - Verify if correct target or remove

**Medium Priority - Needs Deep Research:**
- Resurgenstech - Fred Sturgis & Seth Boro (2 contacts, same firm)
- Mountaingate - Sue Cho
- Pinebrook - Joe Gantz
- Marlin - Nathan Pingelton

**LinkedIn Profiles Available (Need Email Discovery):**
- Most leads have LinkedIn URLs in sheet
- Can attempt pattern matching based on firm email formats

## Alternative Approach: Email Pattern Discovery

**Strategy:**
1. Find ONE confirmed email for each firm (from press release, news article, PDF)
2. Identify pattern (firstname.lastname@, flastname@, firstinitiallastname@)
3. Apply pattern to other contacts at same firm
4. Verify with email validation tool before sending

**Firms to Research for Patterns:**
- Highlander Partners (we know Mike Knigin is there)
- Tonka Bay Equity
- Searchlight Capital
- Marlin Equity

## Next Steps

1. **Sheet Cleanup**: Update confirmed corrections (Highlander Partners for Michael Knigin)
2. **Pattern Research**: Deep dive on 3-5 priority firms to find email patterns
3. **LinkedIn Outreach**: Consider InMail as alternative to direct email
4. **GitHub Update**: Document these findings in firm dossiers

## Technical Notes

**Apollo API Status:**
- API Key: Fx6RpQS0PKxfVgnxWOPWuw
- Test queries returned 0 results
- May need to verify API key permissions or query format
- Consider reaching out to Apollo support

**Sheet Structure:**
- Columns: Date | Company | Contact | Email | Subject | Status | Title | LinkedIn | Notes
- Some rows have misaligned data (needs manual cleanup)

## Time Investment
- Research time: ~20 minutes
- Leads researched: 5 (Michael Knigin, Claire Bissot, Kyle Largent, Keval Patel, MGP verification)
- Emails found: 0 publicly available
- Companies verified: 2 (Highlander Partners, Kainos Capital)

---

**Conclusion:** Email discovery for PE contacts requires deeper manual research or paid database access. Apollo API needs troubleshooting. Recommend shifting to email pattern discovery and leveraging existing confirmed contacts for introductions.
