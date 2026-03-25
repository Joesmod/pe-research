# PE Enrichment Report - 2026-03-13 21:37 CST

## Summary
Attempted enrichment of 10-15 leads from Google Sheet. Most firms have JavaScript-rendered team pages or only publish generic contact emails (info@, ir@).

## Firms Researched (No Verified Direct Emails Found)

### Aurora Capital Partners
- Los Angeles, CA
- $1.1B Fund VII (2025)
- **Status:** Only generic emails found (info@auroracap.com, ir@auroracap.com)
- **Team identified:** Matthew Laycock (Partner), Matt Asperheim, Scott Erickson, George Doran
- **Email pattern:** first_initial last@auroracap.com (80.3% per RocketReach)
- **Issue:** No verified individual emails from official published sources

### Abry Partners
- Boston, MA
- $10B+ AUM
- **Status:** Only generic office emails found
- **Contacts:** info@abry.com (Boston), charlotte@abry.com, london@abry.com
- **Issue:** No individual contact emails in recent press releases or website

### Pamlico Capital
- Charlotte, NC
- $1.4B AUM
- **Team identified:** Gillian Rhew (Director of Business Development), Tracey Chaffin (CFO and Partner)
- **Status:** Team page is JS-rendered, no content extractable
- **Issue:** No press releases with verified emails found

### Trivest Partners
- Miami, FL
- $1B AUM, 500+ investments since 1981
- **Team identified:** Frank Hapak (Managing Director per RocketReach)
- **Status:** Contact page is privacy consent blocker
- **Issue:** Unable to extract team emails from website

## Firms Still Needing Enrichment (High Priority)

### Patient Square Capital
- Multiple inferred emails but NOT VERIFIED:
  - Sam Saini - Head of Technology
  - Ryan Peabody - Data Analytics Lead
  - Karr Narula - Founding Partner, Head of Transformation
- **Action needed:** Verify emails from official published sources

### Sagewind Capital
- Co-Founder & CEO: Steve Lefkowitz
- Status: Research - No Email
- **Action needed:** Find verified contact

### CIP Capital
- Status: Research - No Email
- **Action needed:** Find verified contact

### Diversis Capital
- Managing Partner: Kevin Ma (deeply technical, CS+Robotics+EE background)
- Status: Research - No Email, website partially broken
- **Action needed:** Alternative research methods

## Challenges Encountered
1. **JS-rendered websites:** Most modern PE firm sites require JavaScript to display team pages
2. **Generic-only emails:** Many firms only publish office-wide emails (info@, ir@)
3. **No recent press releases:** Many firms haven't issued press releases with individual contact info in 2024-2025
4. **Privacy/GDPR compliance:** Some sites block automated access or require consent

## Recommendations
1. **Use Apollo API** for verified contacts (quota may be limited)
2. **LinkedIn Sales Navigator** for direct messaging to bypass email discovery
3. **Focus on press releases** - most reliable source for verified emails
4. **Pattern inference as last resort** - only when email pattern is confirmed from multiple verified examples
5. **Prioritize firms with recent news** - more likely to have published contacts

## Time Spent
- ~30 minutes of research
- 4 firms thoroughly investigated
- 0 new verified emails added to sheet

## Next Steps for Next Hourly Run
1. Try Apollo API enrichment for Patient Square Capital contacts
2. Search for recent BusinessWire/PRNewswire press releases (last 6 months) for any of the "Research - No Email" firms
3. Focus on firms that recently closed funds (more likely to have press releases with contacts)
