#!/usr/bin/env python3
import json
import sys
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'

# Authenticate
creds = Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)
service = build('sheets', 'v4', credentials=creds)

# Read sheet
result = service.spreadsheets().values().get(
    spreadsheetId=SHEET_ID,
    range='Sheet1!A:N'
).execute()
rows = result.get('values', [])

if not rows:
    print("No data found")
    sys.exit(1)

# Parse headers
headers = rows[0]
data = rows[1:]

# Find indices
try:
    company_idx = headers.index('Company')
    contact_idx = headers.index('Contact Name')
    email_idx = headers.index('Email')
    status_idx = headers.index('Status')
    notes_idx = headers.index('Notes') if 'Notes' in headers else None
except ValueError as e:
    print(f"Error finding column: {e}")
    sys.exit(1)

# Identify leads needing enrichment
needs_enrichment = []
for i, row in enumerate(data, start=2):  # start=2 because row 1 is headers
    if len(row) <= max(company_idx, contact_idx, email_idx, status_idx):
        # Skip incomplete rows
        continue
    
    company = row[company_idx].strip() if company_idx < len(row) else ''
    contact = row[contact_idx].strip() if contact_idx < len(row) else ''
    email = row[email_idx].strip() if email_idx < len(row) else ''
    status = row[status_idx].strip() if status_idx < len(row) else ''
    
    # Skip if already enriched or dead
    if status in ['Enriched', 'Dead', 'Sent']:
        continue
    
    # Check if needs enrichment
    needs_enrich = False
    reason = []
    
    if not contact:
        needs_enrich = True
        reason.append('no contact')
    if not email or email.startswith('info@') or email.startswith('sales@') or email.startswith('ir@') or email.startswith('contact@'):
        needs_enrich = True
        reason.append('generic/missing email')
    
    if needs_enrich and company:
        needs_enrichment.append({
            'row': i,
            'company': company,
            'contact': contact,
            'email': email,
            'status': status,
            'reason': ', '.join(reason)
        })

# Output results
print(f"\n=== ENRICHMENT NEEDS: {len(needs_enrichment)} firms ===\n")
for lead in needs_enrichment[:15]:
    print(f"Row {lead['row']}: {lead['company']}")
    print(f"  Current contact: {lead['contact'] or '(empty)'}")
    print(f"  Current email: {lead['email'] or '(empty)'}")
    print(f"  Reason: {lead['reason']}")
    print()

# Save to file
with open('enrich-targets-march8-506pm.json', 'w') as f:
    json.dump(needs_enrichment[:15], f, indent=2)

print(f"Saved {min(15, len(needs_enrichment))} targets to enrich-targets-march8-506pm.json")
