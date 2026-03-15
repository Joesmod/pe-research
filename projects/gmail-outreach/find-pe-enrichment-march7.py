#!/usr/bin/env python3
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'

# Authenticate
creds = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)

service = build('sheets', 'v4', credentials=creds)
sheet = service.spreadsheets()

# Read sheet
result = sheet.values().get(spreadsheetId=SHEET_ID, range='Sheet1!A:M').execute()
rows = result.get('values', [])

print(f"Loaded {len(rows)} rows\n")

# Find PE firms needing enrichment
needs_enrichment = []

# Not PE keywords
not_pe_keywords = [
    'search partners', 'recruiter', 'recruiting', 'headhunter', 'executive search',
    'hedge fund', 'asset management', 'asset manager', 'mutual fund',
    'financial advisor', 'wealth management', 'ria', 'registered investment',
    'vc firm', 'venture capital', 'seed fund', 'angel',
    'training', 'education', 'university', 'school',
    'media', 'news', 'podcast', 'publication', 'magazine',
    'association', 'trade group', 'nonprofit',
    'crowdfunding', 'platform', 'marketplace',
    'consulting', 'advisory', 'service provider',
    'bank', 'commercial bank', 'investment bank'
]

for i, row in enumerate(rows[1:], start=2):
    if len(row) < 10:
        continue
    
    company = row[0] if len(row) > 0 else ''
    website = row[1] if len(row) > 1 else ''
    contact_name = row[2] if len(row) > 2 else ''
    email = row[4] if len(row) > 4 else ''
    status = row[9] if len(row) > 9 else ''
    
    # Skip if dead or already contacted
    if any(keyword in status.lower() for keyword in ['dead', 'contacted', 'sent', 'replied']):
        continue
    
    # Skip if not PE-related (quick filter)
    company_lower = company.lower()
    is_not_pe = any(keyword in company_lower for keyword in not_pe_keywords)
    if is_not_pe:
        continue
    
    # Check if needs enrichment
    has_generic_email = email and any(prefix in email.lower() for prefix in ['info@', 'sales@', 'ir@', 'contact@', 'press@', 'media@'])
    has_no_contact = not contact_name or contact_name.strip() == '' or contact_name == 'Jacob Zodikoff'
    has_no_email = not email or email.strip() == ''
    
    if (has_generic_email or has_no_contact or has_no_email) and website:
        # Look for PE indicators
        pe_indicators = ['private equity', 'pe', 'partners', 'capital', 'equity', 'investment', 'portfolio']
        has_pe_indicator = any(indicator in company_lower for indicator in pe_indicators)
        
        if has_pe_indicator or 'llp' in company_lower or 'lp' in company_lower:
            needs_enrichment.append({
                'row': i,
                'company': company,
                'website': website,
                'contact_name': contact_name,
                'email': email,
                'status': status,
                'needs_name': has_no_contact or contact_name == 'Jacob Zodikoff',
                'needs_email': has_no_email or has_generic_email
            })

print(f"\nFound {len(needs_enrichment)} PE firms needing enrichment\n")
print("Top 20 firms needing enrichment:\n")

for idx, firm in enumerate(needs_enrichment[:20]):
    print(f"{idx + 1}. {firm['company']}")
    print(f"   Website: {firm['website']}")
    print(f"   Current Contact: {firm['contact_name'] or 'EMPTY'}")
    print(f"   Current Email: {firm['email'] or 'EMPTY'}")
    print(f"   Needs: {'Name + ' if firm['needs_name'] else ''}{'Email' if firm['needs_email'] else ''}")
    print()

# Save to file
with open('pe-enrichment-targets-march7-336am.json', 'w') as f:
    json.dump(needs_enrichment, f, indent=2)

print(f"\nSaved {len(needs_enrichment)} targets to pe-enrichment-targets-march7-336am.json")
