# PE Research & Enrichment Cron - March 9, 2026 8:36 AM

## Summary

**Mission:** Enrich PE leads with empty Contact Name or generic emails

**Target:** 127 leads identified needing enrichment  
**Processed:** 30 leads (2 batches of 15)  
**Successfully Enriched:** 20 firms with verified contacts  
**Success Rate:** 66.7%

---

## Batch 1: ✅ Written to Sheet

Successfully enriched and updated in Google Sheet:

1. **Long Point Capital** → Will Albertus (Principal)  
   walbertus@lpcfund.com | [LinkedIn](http://www.linkedin.com/in/will-albertus-5876605)

2. **Pine Brook Partners** → Connor Johns (Vice President - Energy)  
   cjohns@pinebrookpartners.com | [LinkedIn](http://www.linkedin.com/in/connor-johns-a51a25b0)

3. **Marlin Equity Partners** → James Markarian (CTO)  
   jmarkarian@marlinoperations.com | [LinkedIn](http://www.linkedin.com/in/jamesmarkarian)

4. **BV Investment Partners** → Maggie Carter (President and COO)  
   mcarter@bvlp.com | [LinkedIn](http://www.linkedin.com/in/maggie-carter-064b0b8)

5. **Sheridan Capital Partners** → Stephen Lestyan (Vice President)  
   stephen.lestyan@sheridancp.com | [LinkedIn](http://www.linkedin.com/in/slestyan)

6. **Siris Capital Group** → John Abram (Vice President)  
   abram@siris.com | [LinkedIn](http://www.linkedin.com/in/john-abram-7ab380b0)

7. **AEA Investors** → Tom Pryma (Chief Operating Officer and Partner)  
   tpryma@aeainvestors.com | [LinkedIn](http://www.linkedin.com/in/tom-pryma-99505724)

8. **FFL Partners** → Jake Lavan (Vice President)  
   jlavan@fflpartners.com | [LinkedIn](http://www.linkedin.com/in/jakelavan)

9. **Oak HC/FT** → Maddie Hilal (Vice President)  
   maddie@oakhcft.com | [LinkedIn](http://www.linkedin.com/in/maddie-hilal)

10. **JMI Equity** → Randy Guttman (General Partner & COO)  
    rguttman@jmi.com | [LinkedIn](http://www.linkedin.com/in/randy-guttman-1589346)

---

## Batch 2: ⏳ Pending (Hit Rate Limit)

Found contacts but hit Google Sheets API quota. **Action required:** Wait 1 hour for quota reset, then update manually or re-run script.

Data saved to: `enrichment-batch2-pending.json`

1. **Tenex Capital Management** → Michael Green (CEO)
2. **Behrman Capital** → Kern Vijayvargiya (Vice President)
3. **Oak Investment Partners** → Grace Ames (COO & CFO)
4. **MSD Partners** → Bong Shinn (Partner & CTO) | bshinn@bdtmsd.com
5. **RoundTable Healthcare Partners** → James Dorman (Vice President)
6. **Harkness Capital Partners** → Christina Christopoulos (Vice President)
7. **Ronin Equity Partners** → Jack Burke (Principal)
8. **Station Partners** → William Gadsden (Partner and COO)
9. **Sentinel Capital Partners** → Michael Griffin (Vice President)
10. **Banneker Partners** → Justin Goschie (Vice President)

---

## Remaining Work

- **107 leads** still need enrichment (out of 127 original)
- Continue enrichment after quota resets (~1 hour)
- Estimated 7-8 more batches needed to complete all 127 leads

---

## Technical Notes

**Issues Encountered:**
- Google Sheets API rate limit: 60 write requests/minute for service accounts
- Fixed by implementing batchUpdate (reduces 50 calls → 1 call)

**Apollo API Performance:**
- 66.7% success rate finding verified emails
- Common failures: Company not found in Apollo DB, or no senior contacts in system

**Search Strategy:**
- Targets: Managing Partner, Partner, VP, Principal, CTO, CIO, COO, Director
- Only verified emails (not pattern-matched or "likely")

---

## Next Actions

1. ⏳ **Wait 1 hour** for Google Sheets quota reset
2. 📝 **Manual update:** Add Batch 2 contacts to sheet (or re-run script)
3. 🔄 **Continue enrichment:** Run script again for remaining 107 leads
4. 📂 **GitHub dossiers:** Update pe-research/PE-firms/ with new contacts
5. 🎯 **Outreach:** Ready to contact the 20 newly enriched firms

---

## Files Generated

- `enrichment-log-march9-836am.json` - Batch 1 details
- `enrichment-batch2-pending.json` - Batch 2 pending writes
- `cron-enrich-march9-836am.js` - Enrichment script (now with batch updates)

**Repository:** https://github.com/Joesmod/pe-research  
**Working Directory:** C:\Users\aljen\.openclaw\workspace-jim\projects\gmail-outreach
