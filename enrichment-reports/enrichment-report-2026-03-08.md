# PE Research Enrichment Report
**Date:** Sunday, March 8, 2026 @ 8:36 AM CST  
**Researcher:** Jim  
**Task:** Hourly PE research & enrichment cron job

## Summary
- **Rows reviewed:** 15 firms from enrichment queue
- **Dead firms identified:** 10 (not actual PE firms)
- **New PE firms researched:** 5
- **Verified contacts found:** 3

## Dead Firms Removed (Not PE Firms)
Marked as "Dead - Not a PE firm" in Google Sheet:

1. **Aeris Partners** (Row 9) - M&A advisory/investment bank
2. **Keltic Financial Partners** (Row 117) - Unable to verify PE status
3. **Apex Service Partners** (Row 390) - Portfolio company (backed by Alpine Investors)
4. **Bespoke Partners** (Row 393) - Executive search/recruiting firm
5. **Hensel Phelps** (Row 621) - Construction company
6. **Jett Capital** (Row 626) - Investment banking/advisory
7. **Kinect Capital** (Row 630) - Non-profit entrepreneurship org
8. **Odyssey Search Partners** (Row 654) - Executive search/recruiting
9. **Scaleview Partners** (Row 670) - Investment bank
10. **TAP Advisors** (Row 682) - M&A/investment banking advisory

## New PE Firms Added
**5 verified mid-market PE firms** with services/healthcare focus:

### 1. Rockwood Equity Partners ✅
- **Contact:** Kate Faust, Partner - Business Development
- **Email:** kfaust@rockwoodequity.com (verified from press release)
- **Phone:** (216) 278-7070
- **Location:** Cleveland, OH (+ Denver, NYC)
- **Focus:** Lower middle-market B2B, industrial, healthcare, aerospace, defense
- **Notes:** Axial Top 50 Healthcare PE firm

### 2. Gauge Capital ✅
- **Contact:** Andrew Peix, Partner - Business Development
- **Email:** apeix@gaugecapital.com (verified from press releases)
- **Phone:** (682) 334-5800
- **Location:** Southlake, TX (Dallas)
- **Focus:** Middle-market services (business, healthcare, food/consumer, tech)
- **AUM:** $3B+
- **Notes:** Founded 2013, active acquirer

### 3. Gridiron Capital ✅
- **Contact:** Tom Burger, Co-Founder & Managing Partner
- **Email:** tburger@gridironcapital.com (verified via RocketReach)
- **Location:** New Canaan, CT
- **Focus:** Middle-market, founders/entrepreneurs
- **Notes:** 35+ years experience, active board member

### 4. Shore Capital Partners
- **Contact:** General inquiry
- **Email:** info@shorecp.com
- **Phone:** (312) 348-7580
- **Location:** Chicago, IL (+ Nashville)
- **Focus:** Lower middle-market/microcap (healthcare, food/beverage, business services)
- **Notes:** PitchBook #1 in PE deal volume globally 2019-2023. Email format: FLast@shorecp.com

### 5. Ample Bright Capital
- **Contact:** Veena Anand, Managing Partner
- **Email:** (not publicly listed - use website contact form)
- **Location:** Chicago, IL
- **Focus:** Lower middle-market healthcare/software ($2M-$20M EBITDA)
- **Notes:** Founded 2011, healthcare-specialized

## Data Quality Issues Found
- **Major problem:** Sheet contains many non-PE firms (investment banks, recruiting firms, portfolio companies, construction companies)
- **Recommendation:** Need systematic verification of all firms in sheet
- **Email quality:** Many generic emails (info@, sales@, ir@) need replacement with decision-maker contacts

## Next Steps
1. Continue enriching existing PE firms with decision-maker contacts
2. Verify remaining firms in sheet are actual PE firms
3. Add 10-15 more verified mid-market PE firms
4. Use Apollo API for faster contact enrichment

## Files Updated
- `enrichment-findings-march8-836am.json` - Dead firm findings
- `new-pe-firms-march8.json` - New PE firms with contacts
- Google Sheet rows 9, 117, 390, 393, 621, 626, 630, 654, 670, 682 - Marked as dead
