# PE Lead Enrichment Roadmap

## Current State (2026-03-15)
- **Sheet Size**: 500+ PE firms tracked
- **Enriched Firms**: ~350 with verified contacts
- **Needs Work**: ~150 with generic/missing emails

## Prioritization Framework

### Tier 1: High-Value Targets (30 firms)
**Criteria**: AUM $1B+, US-based, business services/healthcare/industrial focus, currently has generic email only

**Target Firms**:
1. Gryphon Investors - businessdevelopment@gryphoninvestors.com (need Partner contact)
2. The Riverside Company - info@riversidecompany.com ($14B AUM)
3. Abry Partners - info@abry.com ($17B AUM)
4. Caltius Equity Partners - info@caltius.com (LA-based, business services)
5. Thomas H. Lee Partners - need research
6. [Add 25 more from sheet analysis]

### Tier 2: Mid-Priority (50 firms)
**Criteria**: AUM $500M-$1B, good sector fit, partial data available

### Tier 3: Lower Priority (70 firms)
**Criteria**: Smaller firms, less relevant sectors, or already have decent contact info

## Enrichment Methods

### Method 1: Apollo.io API (Best for Volume)
- **Cost**: 1 credit per lookup
- **Accuracy**: ~70-80% for verified emails
- **Speed**: Batch 50 searches in ~5 minutes
- **Current Status**: Need to check remaining credits

### Method 2: Manual Web Research (Best for Accuracy)
- **Sources**: Firm website team pages, LinkedIn, press releases
- **Time**: 5-10 min per firm
- **Accuracy**: 95%+ when verified from official source
- **Best For**: Tier 1 high-value targets

### Method 3: Email Pattern Inference
- **Tools**: RocketReach, ZoomInfo, ContactOut
- **Confidence**: 80-95% depending on source
- **Process**: Verify pattern with 2+ examples, then infer for Partners
- **Risk**: Unverified patterns may bounce

## Recommended Workflow

### Hourly Cron Jobs (Automated)
1. **Pick 5 firms** from Tier 1 queue
2. **Try Apollo API first** - if hit, update sheet immediately
3. **Fallback to web research** for high-priority misses
4. **Document findings** in memory log
5. **Update GitHub** dossiers with new data

### Manual Research Sessions (As Needed)
- **Frequency**: 1-2x per week
- **Duration**: 30-60 min
- **Focus**: Tier 1 firms that failed automation
- **Output**: Verified contacts with direct emails

## Success Metrics

### Week 1 Goals
- [ ] Enrich 15 Tier 1 firms (50% of target)
- [ ] Verify Apollo API status
- [ ] Create prioritized queue (30 Tier 1 firms)
- [ ] Update MEMORY.md with enrichment patterns

### Month 1 Goals
- [ ] Complete all 30 Tier 1 enrichments
- [ ] Start Tier 2 batch processing
- [ ] Achieve 90%+ contact quality across top 100 firms
- [ ] Set up automated pattern detection

## Tools & Resources

### APIs
- **Apollo.io**: Fx6RpQS0PKxfVgnxWOPWuw
- **Google Sheets**: Service account configured

### Scripts
- `apollo-search.js` - Batch Apollo lookups
- `sheets.js` - Read/write Google Sheets
- `auto-log.js` - Track outreach activity

### Reference Docs
- [Apollo API Docs](https://apolloio.github.io/apollo-api-docs/)
- [PE Firm Research Checklist](TOOLS.md)

## Notes
- **DO NOT** send outreach emails during research crons
- **ALWAYS** verify emails before logging to CRM
- **NEVER** guess email patterns - mark as "inferred" if not verified
- **UPDATE** status column immediately after enrichment
