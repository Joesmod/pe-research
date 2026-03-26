# PE Research & Enrichment - Saturday March 7, 2026 7:36 PM

## ⚠️ Technical Limitation Encountered

**Issue**: Node.js not available in PATH on Windows PowerShell environment  
**Impact**: Unable to execute read-sheet.js or other enrichment scripts directly  
**Workaround**: Manual web research and documentation

## Enrichment Findings

### 1. Brandon White - Charlesbank Capital Partners (NOT Aeris Partners)

**Issue in Sheet**: Row 9 lists company as "Aeris Partners" but contact Brandon White actually works at Charlesbank Capital Partners

**Research Findings**:
- **Name**: Brandon White
- **Title**: Managing Director & Co-Head of Flagship
- **Company**: Charlesbank Capital Partners (NOT Aeris Partners)
- **Email Pattern**: {first_initial}{last}@charlesbank.com (89.6% confidence per RocketReach)
- **Likely Email**: bwhite@charlesbank.com
- **LinkedIn**: https://www.charlesbank.com/team/brandon-white/
- **Location**: Boston, MA
- **Background**: Member of Charlesbank investment team since 1997 (inception), Management Committee member
- **Source**: Charlesbank official website, ZoomInfo, RocketReach

**Note**: Aeris Partners is actually an M&A advisory/investment banking firm, not a traditional PE firm. Only contact available is info@aerispartners.com.

**Recommendation**: UPDATE row 9 to reflect correct company (Charlesbank Capital Partners) or find actual Aeris Partners contact.

---

## Non-PE Firms Identified (Should Review for Removal)

From enrich-targets-march7-507pm.json, several companies are NOT traditional mid-market PE firms:

1. **Tennenbaum Capital Partners** - Acquired by BlackRock in 2018
2. **Trinity Capital** - Public BDC (NASDAQ: TRIN), venture debt focus
3. **TriplePoint Capital** - Equipment leasing/venture debt, not traditional PE
4. **414 Capital** - M&A advisory in Mexico, services PE but doesn't invest
5. **Aeris Partners** - Investment banking/M&A advisory, not PE investor
6. **All Raise** - Nonprofit organization supporting women in VC
7. **Allvue Systems** - Software company serving PE/VC (portfolio company, not investor)
8. **Anthemis Group** - FinTech VC, not mid-market PE

**Recommendation**: Filter enrichment targets to actual PE firms with $500M-$5B AUM and services/tech focus.

---

## Technical Notes

**Environment**:
- Working directory: C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach
- Node.js: Not in PATH (unable to execute .js scripts)
- Python: Not available
- Sheet ID: 11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4
- Service account: projects/gmail-outreach/service-account.json exists

**Files Reviewed**:
- enrich-targets-march7-507pm.json (15 targets, mostly non-PE)
- sheet-current.json (encoding issues, UTF-16 BOM)

**Next Steps for Human/Team**:
1. Fix Node.js PATH issue or provide alternative execution method
2. Review and clean enrichment target list (remove non-PE firms)
3. Validate company-contact mismatches (like Aeris/Charlesbank issue)
4. Re-run enrichment with corrected target list

---

## Time & Effort

**Started**: 7:36 PM CST  
**Completed**: 7:45 PM CST (9 minutes research)  
**Firms Researched**: 1 (Brandon White/Charlesbank)  
**Non-PE Flagged**: 8  
**Verified Emails**: 1 (pattern-based, not confirmed delivery)

**Status**: Partial completion due to technical constraints
