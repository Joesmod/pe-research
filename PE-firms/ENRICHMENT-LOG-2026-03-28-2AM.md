# PE Research Enrichment Log - 2026-03-28 2:05 AM

**Session:** Hourly Cron Job - PE Research & Enrichment  
**Focus:** Enrich existing leads in Google Sheet (Priority task)

## Summary
Researched 6 companies from the Google Sheet that needed enrichment (empty Contact Name or generic emails). Successfully identified decision-makers for 5 firms, marked 1 as Dead (not a PE firm). **NO direct email addresses were found from officially published sources**, following strict enrichment guidelines.

## Companies Researched

### ✅ Enriched - Research Complete (5 firms)

#### 1. **Amity Search Partners** (Row 448)
- **Contact:** Pamela Hickory Esterson
- **Title:** Founding Partner & CEO
- **LinkedIn:** https://www.linkedin.com/in/pamesterson/
- **Website:** https://amitysearchpartners.com/
- **Email:** NOT VERIFIED from official sources
- **Notes:** Executive search firm (not PE, but serves PE clients). Founded 2009, 20+ team members.
- **Status:** Research Complete

#### 2. **Anplify** (Row 498)
- **Contact:** Himanshu Anand
- **Title:** Founder and CEO
- **LinkedIn:** https://www.linkedin.com/in/himanshuanand/
- **Website:** https://anplify.com/
- **Email:** NOT VERIFIED from official sources
- **Notes:** Investment banking research KPO firm serving PE funds and banks.
- **Status:** Research Complete

#### 3. **Champlain Advisors** (Row 582)
- **Contact:** Terence (Terry) Crikelair
- **Title:** Managing Partner
- **LinkedIn:** https://www.linkedin.com/in/terence-terry-crikelair-2987821/
- **Website:** https://www.champlainadvisors.com/
- **Email:** Generic info@champlainadvisors.com only (no direct email)
- **Notes:** Fund placement/advisory firm (serves PE, not a PE firm). Founded 2003.
- **Status:** Research Complete

#### 4. **EquityZen** (Row 602)
- **Contact:** Atish Davda
- **Title:** CEO & Founder
- **LinkedIn:** https://www.linkedin.com/in/atishdavda/
- **Website:** https://equityzen.com/
- **Email:** Generic support@equityzen.com only (no direct email)
- **Notes:** Secondary market platform for private company shares.
- **Status:** Research Complete

#### 5. **K1 Investment Management** (Row 954)
- **Contact:** Hasan Askari
- **Title:** Managing Partner (Co-Founder, 2011)
- **LinkedIn:** https://www.linkedin.com/in/hasan-askari-19512019/
- **Website:** https://k1.com
- **Email:** NOT VERIFIED from official sources
- **Notes:** Major PE firm focused on enterprise AI-powered software, $20B+ AUM. Co-founded in 2011 at age 26.
- **Status:** Research Complete
- **GitHub:** Updated dossier with co-founder info and firm details

### ❌ Dead - Not PE Firm (1 firm)

#### 6. **Apercen Partners LLC** (Row 704)
- **Reason:** NOT A PE FIRM - Tax consulting firm serving PE partners, entrepreneurs, and executives
- **Website:** https://www.apercen.com/
- **Services:** Tax planning/compliance services for high net-worth individuals
- **Status:** Dead

## Email Verification Challenge

### Issue
Despite finding decision-makers at all firms, **NO officially published direct email addresses were found**. Third-party data aggregators (RocketReach, ContactOut, ZoomInfo, Success.ai) showed email patterns, but these do not qualify as "official published sources" per enrichment guidelines.

### Sources Checked
- ✅ Company websites (contact pages, team pages)
- ✅ LinkedIn profiles
- ✅ Press releases (search)
- ✅ Conference bios/speaker lists (search)
- ✅ Official contact forms
- ❌ SEC filings (not applicable for most)
- ❌ Published PDFs/brochures (none found with emails)

### Sources NOT Used (Third-Party, Non-Official)
- ❌ RocketReach
- ❌ ContactOut
- ❌ ZoomInfo
- ❌ Success.ai
- ❌ Apollo (not used in this session)

### Guidance for Future
To obtain verified email addresses, consider:
1. **Apollo API** - Previous enrichment batches successfully used Apollo for verified contacts
2. **Direct outreach** - LinkedIn InMail or contact forms to request direct contact info
3. **Conference materials** - Download actual speaker bios/programs (PDFs) that list emails
4. **Press contacts** - Some press releases include PR contact emails that may forward
5. **SECfilings** - For publicly traded firms or those with public filings

## Google Sheet Updates

All 6 rows updated with:
- Contact names and titles (where found)
- LinkedIn URLs
- Websites
- Status updates (Research Complete or Dead)
- Notes explaining research findings and email availability

**Sheet Status:** 6 rows enriched/updated, 0 new verified emails added (email verification not possible from public sources)

## GitHub Commit

**Repository:** https://github.com/Joesmod/pe-research  
**Commit:** 97c4e7c - "PE Research Enrichment 2026-03-28: Updated K1 Investment Management with co-founder Hasan Askari contact info and expanded firm details"

### Changes
- Updated K1 Investment Management dossier
  - Added Hasan Askari (Managing Partner, Co-Founder 2011)
  - Expanded firm overview with AUM, founding details, focus areas
  - Merged with existing contacts (Ron Cano, Jean Kisaka, Brian Beard, William Johnson)
  - Updated status to "Fully Enriched"

## Time & Efficiency

- **Session Start:** 2:05 AM
- **Companies Researched:** 6
- **Time per Company:** ~5-10 minutes (research + documentation)
- **Total Session Time:** ~40 minutes

## Next Steps

1. **Email verification strategy:** Recommend using Apollo API for next enrichment session to obtain verified direct emails
2. **Continue enrichment:** Only 6 rows needed enrichment in current batch; consider adding new firms to sheet
3. **Quality over quantity:** Prefer verified contacts from Apollo/official sources over pattern-guessed emails

## Notes

- Strict adherence to "ONLY use emails found on official published sources" guideline
- All contact names, titles, and LinkedIn profiles verified from official company websites
- Research complete but email verification requires different approach (Apollo API recommended)
- Several firms enriched are service providers TO PE firms rather than PE firms themselves
