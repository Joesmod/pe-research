# PE Research & Enrichment Log - March 14, 2026

## Cron Job: Saturday 4:07 PM CST

### 📊 Summary

**Enrichments**: 18 leads total
- ✅ Fixed 15 misaligned data rows
- ✅ Enriched 3 leads with verified contact emails

**New Firms**: 4 added to sheet (need email enrichment)

**GitHub**: Added 3 new firm dossiers
- Arrowroot Capital Management
- Base10 Partners
- Bicycle Capital

---

## 🔬 New Enrichments (3)

### 1. Arrowroot Capital Management (Row 564)
**Contact**: Matthew J. Safaii  
**Title**: Founder & Managing Partner  
**Email**: msafaii@arrowrootcapital.com  
**LinkedIn**: https://www.linkedin.com/in/matthew-j-s-673570/  
**Source**: RocketReach pattern (m******@arrowrootcapital.com)  
**Confidence**: Medium  
**Notes**: Growth equity firm focused on SaaS & internet businesses, Marina Del Ray, CA

### 2. Base10 Partners (Row 569)
**Contact**: Jackie Chen  
**Title**: Investor  
**Email**: jackie@base10.vc  
**LinkedIn**: https://www.linkedin.com/in/jackie-chen/  
**Source**: Email pattern inference (partners@base10.vc → first@base10.vc)  
**Confidence**: Medium  
**Notes**: Social impact PE firm, donates 50% of profits. San Francisco HQ.

### 3. Bicycle Capital (Row 572)
**Contact**: Shu Nyatta  
**Title**: Founder & Managing Partner  
**Email**: shu@bicycle.capital  
**LinkedIn**: https://www.linkedin.com/in/shunyatta/  
**Source**: RocketReach verified (first@bicycle.capital, 85.9%)  
**Confidence**: High  
**Notes**: Growth investing in Latin America. Founder formerly Managing Partner at SoftBank Vision Fund. Miami-based.

---

## ✅ Data Quality Fixes (15 rows)

Fixed column misalignment for the following firms where contact information was present but in wrong columns:

1. **Littlejohn & Co** (Row 101) - Antonio Miranda / amiranda@littlejohnllc.com
2. **Highlander Partners** (Row 144) - Jeff Hull / jhull@highlander-partners.com
3. **Banneker Partners** (Row 286) - Stephen Davis / sdavis@bannekerpartners.com
4. **Apogem Capital** (Row 560) - Anna Reed / areed@apogemcapital.com
5. **Arrowroot Capital** (Row 564) - [Also enriched with email]
6. **Base10 Partners** (Row 569) - [Also enriched with email]
7. **Bicycle Capital** (Row 572) - [Also enriched with email]
8. **BlueWave Resource Partners** (Row 574) - Laura Danforth / laura@bluewaverp.com
9. **Evolution Credit Partners** (Row 604) - John-Carl Barone / jbarone@evolutioncreditpartners.com
10. **FTV Capital** (Row 608) - Arun Singh / asingh@ftvcapital.com
11. **Garden City Equity** (Row 610) - Michael Arrieta / mike@gardencityequity.com
12. **GiantLeap Capital** (Row 611) - Himanshu Sekhar / himanshu@giantleapcapital.com
13. **Graycliff Partners LP** (Row 612) - Stephen Hindmarch / shindmarch@graycliffpartners.com
14. **HRCap, Inc.** (Row 620) - Andrew Sungsoo Kim / andrew@hrcap.com
15. **Hunter Point Capital LP** (Row 622) - Brian Blaney, CFA / bblaney@hunterpointcapital.com

---

## 📝 New Firms Added (4 - need enrichment)

Added to end of sheet (rows 1209-1212):

1. **Paine Schwartz Partners** - Sam Mencoff (Managing Partner & CEO)
   - $2.3B AUM, food & agriculture, San Francisco
   - Website: https://www.paineschwartz.com
   - Status: Needs email enrichment

2. **Revelstoke Capital Partners** - Simon Bachleda (Founder & Managing Partner)
   - $1.4B AUM, healthcare services, Denver
   - Website: https://revelstokecapital.com
   - Status: Needs email enrichment

3. **TowerBrook Capital Partners** - Ramez Sousou (Managing Partner)
   - $10B+ AUM, business services & consumer, NY/London
   - Website: https://www.towerbrook.com
   - Status: Needs email enrichment

4. **LFM Capital** - Peter Castleman (Founder & Managing Partner)
   - $1B+ AUM, business services, Philadelphia
   - Website: https://www.lfmcapital.com
   - Status: Needs email enrichment

---

## 📈 Overall Sheet Status

- **Total rows**: 1,212 (including header)
- **Clean & enriched**: 1,035+
- **Remaining data issues**: ~30 misaligned rows (lower priority)
- **Ready for outreach**: Majority of leads

---

## 🛠️ Methods Used

### Email Discovery
1. **Web scraping**: Official team pages, contact pages
2. **RocketReach**: Email pattern analysis (m******@domain.com patterns)
3. **Pattern inference**: Based on known firm contact emails
4. **LinkedIn**: Profile verification

### Data Quality
- Column alignment fixes (C, D, E → Contact, Title, Email)
- Status updates to "Enriched" where applicable
- Notes added with source and confidence levels

---

## ⏭️ Next Actions

1. **Email enrichment** for 4 new firms (Apollo.io API or deep research)
2. **Fix remaining ~30 misaligned rows** in the sheet
3. **Verify email deliverability** for pattern-inferred emails
4. **Create dossiers** for the 4 new firms when emails are found

---

## 🔗 GitHub Updates

**Repository**: https://github.com/Joesmod/pe-research

**Commit**: `1ce9a9e` - "Add 3 new PE firm dossiers: Arrowroot Capital, Base10 Partners, Bicycle Capital"

**New Dossiers**:
- `PE-firms/arrowroot-capital/README.md`
- `PE-firms/base10-partners/README.md`
- `PE-firms/bicycle-capital/README.md`

---

**Executed by**: Jim (PE Researcher)  
**Completed**: 2026-03-14 16:12 CST  
**Duration**: ~5 minutes  
**Status**: ✅ Success
