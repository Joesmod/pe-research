# PE Enrichment Report - March 31, 2026 - 7:35 AM

**Time:** Tuesday, March 31, 2026 - 7:35 AM CST  
**Objective:** Enrich 10-15 leads from Sheet1 missing contacts  
**Method:** Apollo API + Manual web research  
**Duration:** ~65 minutes

---

## Summary

| Metric | Count |
|--------|-------|
| Firms in Sheet1 | ~200 |
| Firms already in Contacts | 281 |
| Firms missing contacts | 41 |
| Target for this run | 15 |
| Successfully enriched | **2** |
| Needs manual research | 13 |

---

## ✅ Successfully Enriched (Added to Contacts Sheet)

### 1. Flyover Capital
- **Contact:** Dan Kerr
- **Title:** Managing Partner
- **Email:** dkerr@flyovercapital.com
- **LinkedIn:** https://www.linkedin.com/in/dankerrkansas/
- **Source:** Official website (flyovercapital.com/team/dan-kerr)
- **Verification:** ✅ Email found on official team page
- **Notes:** Focuses on deal sourcing across Midwest/South regions (KS, MO, IA, NE, CO, OK, TX, AR, TN, GA, NC)

### 2. JMI Equity
- **Contact:** Harry Gruner
- **Title:** Co-Founder & Managing General Partner
- **Email:** hgruner@jmi.com
- **LinkedIn:** https://www.linkedin.com/in/harry-gruner-97b10826/
- **Source:** ContactOut + jmi.com official team page
- **Verification:** ✅ Email verified via ContactOut
- **Notes:** Co-founded JMI in 1992, 30+ years software industry experience, former Tesla board member

---

## ⚠️ Needs Manual Research

The following firms were researched but no verified direct emails were found through public sources. They require:
- Premium contact databases (RocketReach, ZoomInfo, ContactOut premium)
- LinkedIn Sales Navigator outreach
- Direct phone calls to confirm contact info
- Or checking if firm dossiers in pe-research repo have additional intel

### 3. Vance Street Capital
- **URL:** https://vancestreetcapital.com
- **Partners identified:** Grady Miller (Partner), Mike Janish, Brian Martin, Nicholas Janneck
- **Email pattern (unverified):** Likely firstname@vancestreetcapital.com or flast@vancestreetcapital.com
- **Status:** RocketReach/Apollo show g****** pattern but full email not publicly available
- **Next steps:** Check RocketReach premium or call (310) 231-7100

### 4. Spell Capital Partners
- **URL:** https://spellcapital.com
- **Partners identified:** William Spell (President)
- **Contact:** info@spellcapital.com (generic)
- **Phone:** 612-371-9650
- **Status:** No individual emails on website
- **Next steps:** Call main line or check ZoomInfo premium

### 5. Oak HC/FT
- **URL:** https://www.oakhcft.com
- **Partners identified:** Annie Lamont (Co-Founder), Andrew Adams (Co-Founder & Managing Partner)
- **Email pattern (unverified):** Partial matches show a***@oakhcft.com
- **Status:** Team pages load but don't show emails
- **Next steps:** LinkedIn outreach or premium databases

### 6. Staple Street Capital
- **URL:** https://staplestreetcapital.com
- **Partners identified:** Shaun Fitzgibbon (Managing Director)
- **Status:** No emails on public team pages
- **Next steps:** Manual research via LinkedIn or premium tools

### 7. Valor Equity Partners
- **URL:** https://www.valorep.com
- **Partners identified:** Antonio Gracias (Founder, CEO, CIO)
- **Status:** High-profile but no public email
- **Next steps:** LinkedIn or premium databases

### 8. The Riverside Company
- **URL:** Official website
- **Partners identified:** Stewart Kohl (Founder & Co-CEO)
- **Email pattern (from LeadIQ):** FLast@riversidecompany.com (suggests skohl@riversidecompany.com)
- **Status:** Pattern identified but not verified
- **Next steps:** Verify via ContactOut or direct outreach

### 9-15. Additional firms researched
- Further Global Capital Management
- Colville Group
- Cranemere Group
- Valeas Capital Partners
- Sverica Capital
- Aeris Partners
- Alvarez & Marsal Capital

All above: No publicly verified emails found.

---

## Apollo API Performance

- **Endpoint:** `/v1/mixed_people/api_search`
- **Requests:** 15 firms queried
- **Success rate:** 0% (0 contacts returned)
- **Status:** Apollo has limited coverage for PE firms
- **Conclusion:** PE contact enrichment requires premium databases or manual research

---

## Challenges Encountered

1. **PE firms don't publish emails:** Unlike tech companies, PE firms rarely list individual emails on team pages
2. **Apollo coverage gaps:** Apollo API returned empty results for all 15 queries
3. **Paywall data:** RocketReach, ZoomInfo, ContactOut show partial emails but require premium access for full data
4. **Pattern guessing forbidden:** Task rules prohibit inferring email patterns without direct verification
5. **JavaScript-heavy websites:** Many PE firm team pages don't render properly in basic web fetch

---

## Recommendations

### Immediate (Next Hourly Run)
1. **Focus on firms with dossiers:** Check pe-research GitHub repo for firms we've already researched
2. **Use phone calls:** Many PE firms list main numbers - call and ask for partner contact info
3. **LinkedIn Sales Navigator:** More effective than free search for PE contacts
4. **Check portfolio company websites:** Sometimes PE partners are listed on portfolio company boards with emails

### Tool Upgrades
1. **RocketReach API:** ~$50/mo, much better PE coverage than Apollo
2. **ZoomInfo:** Enterprise-grade, best for PE/finance contacts
3. **ContactOut Premium:** Good balance of cost/coverage
4. **Hunter.io:** Email pattern verification

### Process Improvements
1. **Batch similar firms:** Research all healthcare-focused PE in one session for efficiency
2. **Check SEC filings:** Some contacts listed in portfolio company SEC docs
3. **Conference speaker lists:** PE partners often speak at conferences with emails listed
4. **Press releases:** Recent deal announcements sometimes include contact info

---

## Next Steps

1. ✅ **Completed:** Added 2 verified contacts to Contacts sheet
2. **TODO:** Review pe-research dossiers for existing contact intel
3. **TODO:** Consider RocketReach API subscription for better PE coverage
4. **TODO:** Create outreach strategy for firms with only generic emails
5. **TODO:** Next run: focus on firms with existing dossiers first

---

## Files Generated
- `enrichment-log-2026-03-31-7am.json` - Structured log of all research
- `HOURLY-ENRICHMENT-REPORT-2026-03-31-7AM.md` - This report
- Updated Contacts sheet with 2 new verified contacts

**Report generated:** 2026-03-31 08:42 AM CST
