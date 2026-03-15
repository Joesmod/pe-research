# PE Research & Enrichment - March 11, 2026 3:37 PM

## Summary
- **Total leads needing enrichment:** 54
- **Processed this run:** 15
- **Successfully enriched:** 10 (partial - names + titles only)
- **Apollo API limitations:** Last names obfuscated, emails not provided without credits

## Enrichments Applied
| Row | Firm | Contact | Title | Status |
|-----|------|---------|-------|--------|
| 176 | Hg Capital | Connor Da***g | Vice President | Name + Title only |
| 261 | RoundTable Healthcare Partners | James Do***n | Vice President | Name + Title only |
| 276 | Harkness Capital Partners | Anthony Pi***e | Vice President | Name + Title only |
| 282 | Ronin Equity Partners | Jesse Yao | Managing Partner | Name + Title only |
| 283 | Station Partners | William Ga***n | Partner and COO | Name + Title only |
| 285 | Sentinel Capital Partners | Elvira Lee | Vice President | Name + Title only |
| 286 | Banneker Partners | Justin Ro***h | Vice President | Name + Title only |
| 300 | Avante Capital Partners | Karel Ig***o | Vice President | Name + Title only |
| 305 | Bertram Capital | Sean Ho***h | Vice President | Name + Title only |
| 306 | Mountaingate Capital | Corbin Ba***s | Vice President | Name + Title only |

## Firms NOT Found via Apollo (Need Manual Research)

### High Priority (Large, well-known firms - should have contacts)
1. **Thomas H. Lee Partners**
   - Found on LinkedIn: Mark Bean, Ganesh Rao, Todd Abbrecht, Gregory White (all Managing Directors)
   - Website: No public team page found at thlpartners.com
   - **Action needed:** Manual LinkedIn outreach or email pattern research

2. **The Jordan Company (TJC)**
   - Major middle-market PE firm
   - **Action needed:** Check tjc.com team page

3. **Sentinel Capital Partners**
   - Partial enrichment: Elvira Lee (VP) found but no email

### Medium Priority
4. **WindPoint Partners**
   - **Action needed:** Check windpointpartners.com

5. **Harvest Partners (SCF)**
   - Note: SCF indicates Special Situations/Credit fund
   - **Action needed:** Verify if this is Harvest Partners LP or a different entity

### Low Priority / Potentially Inactive
6. **Keltic Financial Partners**
   - **Research finding:** Acquired by Ares Management LP (source: Law360)
   - **Status:** May no longer operate independently
   - **Action needed:** Confirm if still active target

## Recommendations

### Immediate Actions Needed
1. **Manual research required** for the 5 firms Apollo couldn't find
2. **Web scraping** of company websites for team pages
3. **LinkedIn searches** for Managing Partners / Operating Partners
4. **Alternative data sources** like Pitchbook, Crunchbase, or RocketReach

### For Next Run
1. Implement web scraping fallback for firms Apollo doesn't have
2. Focus on firms with domains for email pattern inference
3. Prioritize firms by AUM/deal size
4. Cross-reference with LinkedIn for full names

## Data Quality Issues

### Apollo API Limitations
- Free tier provides: First names, obfuscated last names, titles
- **Missing:** Full last names, direct emails, LinkedIn URLs
- **Impact:** Can identify contacts but cannot execute outreach without manual follow-up

### Recommended Solutions
1. **Upgrade Apollo plan** to unlock full contact data ($$$)
2. **Use RocketReach / Hunter.io** for email verification
3. **Manual LinkedIn research** for top 20 priority firms
4. **Web scraping** of company team pages (legal/ethical considerations)

## Next Actions

### For Human Review
1. Review the 10 partial enrichments and decide:
   - Keep as research leads (need manual follow-up)
   - Remove if insufficient for outreach
2. Prioritize the 6 firms needing manual research
3. Consider allocating budget for data enrichment tools

### For Next Cron Run
- Continue processing remaining 39 leads
- Focus on firms with known domains for email pattern inference
- Add new firms if time permits (goal: 3-5 mid-market PE firms, $500M-$5B AUM)

## GitHub Sync
Updated dossiers in `pe-research/PE-firms/` → **Pending git push**

