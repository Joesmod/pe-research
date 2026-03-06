# PE Research & Enrichment - Hourly Cron
## Thursday, March 5th, 2026 — 1:36 AM (CST)

### Summary
- **Total rows in sheet:** 936
- **Firms needing enrichment:** 191 (missing contact name or have generic emails)
- **Enrichment batch selected:** 15 firms
- **Enriched in this run:** 2 (partial research)

### Key Findings

#### 1. Keltic Financial Partners (Row 117)
- **Status:** DEAD LEAD - Acquired by Ares Management in 2014
- **Website:** kelticfp.com (non-functional)
- **Notes:** Company no longer exists as independent entity
- **Action:** Mark as "Dead" in sheet

#### 2. Cardea Group (Row 579)
- **Type:** Executive search/recruiting firm (NOT PE)
- **Website:** thecardeagroup.com (active)
- **Focus:** Recruiting for hedge funds and PE firms
- **Team found:**
  - Andrea (Annie) Colabella - LinkedIn: /in/colabella/
  - Matthew Leitz - LinkedIn: /in/matthew-leitz/
  - Andrew Wong - Executive Recruiter - LinkedIn: /in/andrew-wong-333b22131/
  - Mary C. Dowd - LinkedIn: /in/marydowd/
  - Linda Hudson - LinkedIn: /in/lindaphudson/
- **Status:** Need to find direct emails (no public emails found yet)

### Firms Queued for Next Research Pass

3. HRCap, Inc. (Row 620) - hrcap.com
4. HSP - Henkel Search Partners (Row 621) - henkelsp.com - has info@henkelsp.com
5. Jensen Partners (Row 625) - LinkedIn profile only
6. Jett Capital Advisors (Row 626) - jettcapital.com
7. Kinect Capital (Row 630) - kinectcapital.org
8. Loeb.nyc (Row 635) - no website listed
9. Odyssey Search Partners (Row 654) - odysseysearchpartners.com
10. RCP Advisors (Row 666) - no website listed
11. TAP Advisors (Row 682) - tapadvisors.com - has info@tapadvisors.com
12. TAU Investment Management (Row 683) - tau-investment.com - has info@tau-investment.com
13. Victory Capital (Row 688) - vcm.com - has ir@vcm.com
14. Wall Street Oasis (Row 690) - wallstreetoasis.com (NOT PE - education/forum)
15. Wall Street Prep (Row 691) - wallstreetprep.com (NOT PE - training company)

### Challenges Encountered

1. **Many non-PE firms in the list:** Several entries are recruiting firms, training companies, or forums—not actual PE firms
2. **Stale/dead companies:** Some firms were acquired years ago or no longer exist
3. **Missing direct emails:** Most firms only have generic info@/ir@ emails without decision-maker contact info
4. **Limited public contact info:** Team pages either don't list emails or are behind contact forms

### Recommendations

1. **Filter the sheet:** Review and mark non-PE firms as "Out of Scope" or "Dead Lead"
2. **Use Apollo API:** For remaining legitimate PE firms, use Apollo's people search to find verified contacts
3. **Focus on mid-market PE:** Prioritize firms with $500M-$5B AUM and services-heavy portfolios
4. **Manual research needed:** Many firms require deep web research (team pages, press releases, LinkedIn scraping)

### Next Steps

Given the time investment required for manual enrichment vs. limited viable targets found:
- Recommend using Apollo API for batch enrichment of legitimate PE firms
- Manually research only high-priority/high-fit targets
- Clean up sheet to remove recruiters, training companies, and dead leads first

### Time Investment
- Research time: ~25 minutes
- Firms researched: 2
- Valid contacts found: 0 with direct emails (5 LinkedIn profiles only)

**Status:** Incomplete - Need to pivot to Apollo API or continue manual research in next cron run
