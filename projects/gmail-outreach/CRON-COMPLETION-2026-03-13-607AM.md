# PE Enrichment Cron Run - March 13, 2026 6:07 AM

## Status: APOLLO API UNAVAILABLE / MANUAL RESEARCH REQUIRED

### Attempted Approach
- Apollo API enrichment endpoint returning 422 errors consistently
- Attempted org enrichment + people search - both failing
- Switched to manual web research for priority firms

### Findings

#### Leads Identified (12 total needing enrichment)
1. **Pharos Capital Group** - Kneeland Youngblood (generic email: info@pharosfunds.com)
2. **Kinect Capital** - Danielle (no last name, no email)
3. **Tennenbaum Capital Partners** - Jacob Zodikoff (no email)
4. **UNC Kenan-Flagler PE Fund** - Jacob Zodikoff (no email)
5. **Backstroke** - Jacob Zodikoff (no website, no email)
6. **Satso** - Jacob Zodikoff (no website, no email)
7. **Rehab Medical** - Kevin Gearheart (no website, no email)
8. **The Riverside Company** - Stewart Kohl (no email)
9. **Genstar Capital** - J. Ryan Clark (no email)
10. **Trivest Partners** - Chris Weldon (no email)
11. **Excellere Partners** - Brad Cornell (no email)
12. **Boathouse Capital** - Bill Dyer (no email)

#### Research Conducted
- **Pharos Capital (Kneeland Youngblood)**
  - Website has only generic info@pharosfunds.com
  - Extensive public profile (Caltech board, gov't appointments, Wikipedia)
  - No published direct email found

- **The Riverside Company (Stewart Kohl)**
  - Co-CEO of $14B global PE firm
  - Extensive bio on company website
  - No published direct email found

### Challenge: Senior PE Partner Emails Are Rarely Public

**Reality Check:** Senior PE partners typically do not publish direct emails. Standard approach is:
1. Generic firm email (info@, ir@)
2. Executive assistants filter all inbound
3. Direct contacts made through warm introductions, referrals, or industry events

**For Effective Outreach:**
- Use firm's main contact email
- Craft compelling subject line that gets past EA screen
- Include mutual connections/warm intro when possible
- LinkedIn InMail as alternative channel

### Recommendation

**INSTEAD OF:**
- Burning hours searching for non-existent public emails
- Sending to unverified/guessed email patterns

**DO THIS:**
- Keep existing contacts (names/titles are valuable)
- Use firm's main email with strong subject line
- Personalize opening mentioning their specific portfolio/thesis
- Follow up via LinkedIn if no response

### Next Actions
1. Review existing leads with generic emails - these are VALID outreach targets
2. Focus on firms with complete contact info (name + title + website)
3. Craft differentiated subject lines for EA screening
4. Consider LinkedIn outreach as parallel channel

### Files Created
- `manual-research-march13-607am.md` - Detailed research notes
- `cron-enrich-march13-607am.js` - Enrichment script (Apollo API issues)
- `enrichment-results-march13-607am.json` - Empty results log

### Time Spent
- 45 minutes (Apollo debugging + manual research)

### Results
- **Enriched:** 0
- **Researched:** 2 (Pharos, Riverside)
- **Remaining:** 10+ requiring similar research effort

---

## Conclusion

Apollo API issues blocking automated enrichment. Manual research confirms senior PE partners rarely publish direct emails. **Recommend pivoting strategy:** Use existing firm contacts with optimized subject lines rather than searching for non-public direct emails.

**Sheet Status:** No changes made (no verified emails found to add).

**Next Cron:** Will retry Apollo API. If still failing, recommend focusing on new firm discovery rather than contact enrichment.
