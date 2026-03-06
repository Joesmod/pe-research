# PE Research & Enrichment - March 6, 2026 4:06 PM - FINAL SUMMARY

## Executive Summary

- **Total leads analyzed**: 945 rows in sheet
- **Leads flagged for enrichment**: 91 leads
- **Primary issue**: Email field contains job titles instead of actual emails (not actual email addresses)
- **Leads successfully enriched this hour**: 1 confirmed
- **Data quality issues identified**: Several contact names don't match current firm rosters

## Key Findings

### Successfully Enriched

#### 1. Thesis Capital Partners (Row 4)
**ISSUE**: Original contact "Larry Flanagan" not found on current team roster
**RECOMMENDATION**: Replace with current partner
**NEW CONTACT**: Ian J.H. Reynolds
**TITLE**: Partner
**EMAIL**: ian@thesiscapital.com (VERIFIED)
**PHONE**: 281-455-4921
**LINKEDIN**: https://www.linkedin.com/company/thesis-capital
**SOURCE**: Official website team page (https://www.thesiscapital.com/who-we-are)
**STATUS**: Ready to update

**Alternative contacts at Thesis Capital**:
- Connor Chakeen - Partner - connor.chakeen@thesiscapital.com
- Joshua Wolf - Partner - Joshua.Wolf@thesiscapital.com
- Tim Belton - Independent Director - tim.b@thesiscapital.com

### Data Quality Issues Identified

#### 2. Charlesbank Capital Partners (Row 20)
**ISSUE**: Contact "Dominic Ang" listed as "Managing Partner & Co-Founder"
**RESEARCH FINDING**: Dominic Ang is Founder & Managing Partner at **Turn/River Capital**, NOT Charlesbank
**CHARLESBANK TEAM**: Found 100+ team members on official site, Dominic Ang not among them
**RECOMMENDATION**: Replace with actual Charlesbank partner
**POTENTIAL CONTACTS**:
- Michael Choe - Managing Partner, CEO - michaelchoe@charlesbank.com (pattern)
- Kim Davis - Founding Partner
- Mark Rosen - Founding Partner
**SOURCE**: https://www.charlesbank.com/team/
**ACTION**: Needs further research to find verified email

### Firms Requiring Additional Research

#### 3. SDC Capital Partners (Row 7)
- Contact: Abdul R. Hussein - Co-Founder & Managing Partner
- Issue: Website (sdccapital.com) has no readable content
- LinkedIn: Abdul R. Hussein found at HumanityCorp, not SDC Capital
- Action: Contact appears mismatched - needs verification

#### 4. Rockbridge Growth Equity, LLC (Row 8)
- Contact: Joshua Liebow - President & Founder
- Website: rbequity.com - Team page found but no individual contact details
- Generic email: info@rbequity.com
- Action: Need LinkedIn search or Apollo API

#### 5. Casa Verde Capital (Row 12)
- Contact: Karan Wadhera - Founder & CEO
- Action: Not yet researched

#### 6. Knox Capital (Row 17)
- Contact: Barry Siadat - Founder & Managing Partner
- Action: Not yet researched

#### 7. Palladium Equity Partners (Row 19)
- Contact: Kenneth E. Aboussie, Jr. - Co-Founder & Managing Partner
- Action: Not yet researched

#### 8. HGGC (Row 23)
- Contact: Kevin Schwartz - Managing Director & Founder
- Action: Not yet researched

#### 9. Incline Equity Partners (Row 26)
- Contact: Andrew Weinstein - Founder & CEO
- Action: Not yet researched

#### 10. Abry Partners (Row 31)
- Contact: Jonathan Litinger - Managing Partner
- Action: Not yet researched

## Enrichment Strategy Moving Forward

### Immediate Actions (Next 30 minutes)
1. Update Row 4 (Thesis Capital) with verified Ian Reynolds contact
2. Flag Row 20 (Charlesbank) for data correction - wrong company for Dominic Ang
3. Continue research on remaining 8 firms

### Research Methods to Apply
1. **Official websites**: Check /team, /about, /contact pages
2. **LinkedIn**: Search individual profiles and company pages
3. **Apollo API**: Batch search for verified decision-maker contacts
4. **Press releases**: Check for recent announcements with contact info
5. **PitchBook/Crunchbase**: Cross-reference team rosters

### Data Quality Concerns
- **Pattern identified**: Several contacts may be from outdated data sources
- **Recommendation**: Cross-check all existing contacts against current firm rosters
- **Risk**: Outreach to wrong/outdated contacts damages credibility

## GitHub Update Needed
- Create/update dossier for Thesis Capital Partners in pe-research/PE-firms/
- Document Dominic Ang data quality issue
- Commit findings with timestamp

## Sheet Update Plan

### Row 4 - Thesis Capital Partners
```
Contact Name: Ian J.H. Reynolds
Title: Partner  
Email: ian@thesiscapital.com
LinkedIn: https://www.linkedin.com/company/thesis-capital
Status: Enriched - Web Research 2026-03-06
Notes: Original contact (Larry Flanagan) not found on current roster. Updated to current partner. Source: https://www.thesiscapital.com/who-we-are
```

### Row 20 - Charlesbank Capital Partners
```
Notes: DATA QUALITY ISSUE - Dominic Ang is at Turn/River Capital, not Charlesbank. Needs replacement contact.
Status: Needs Re-research
```

## Metrics
- **Time spent**: ~30 minutes
- **Firms researched**: 3 (Thesis, SDC, Rockbridge, Charlesbank)
- **Verified emails found**: 1
- **Data errors identified**: 2
- **Remaining targets**: 88

## Next Hour Goals
- Complete research for firms 5-15
- Update sheet with 10+ enriched contacts
- Git commit all findings
- Prepare Apollo API batch search for remaining firms
