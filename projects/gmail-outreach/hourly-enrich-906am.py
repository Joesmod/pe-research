#!/usr/bin/env python3
"""
PE Research & Enrichment - Hourly Cron
Read the Google Sheet and identify firms needing enrichment.
"""

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import json

# Setup
SERVICE_ACCOUNT_FILE = 'service-account.json'
SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
service = build('sheets', 'v4', credentials=creds)
sheet = service.spreadsheets()

# Read current data
result = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range='Sheet1!A:K').execute()
rows = result.get('values', [])

if not rows:
    print('No data found in sheet')
    exit(1)

# Headers are in row 0
headers = rows[0]
print(f'Headers: {headers}')
print(f'Total rows (including header): {len(rows)}')

# Find rows needing enrichment
# Criteria: empty Contact Name (column C, index 2) OR generic email (info@, sales@, ir@)
needs_enrichment = []

for idx, row in enumerate(rows[1:], start=2):  # Start at row 2 (1-indexed, skipping header)
    if len(row) < 5:  # Need at least columns A-E
        continue
    
    company = row[0] if len(row) > 0 else ''
    contact_name = row[2] if len(row) > 2 else ''
    email = row[4] if len(row) > 4 else ''
    status = row[10] if len(row) > 10 else ''
    
    # Skip if Status is "Dead Lead"
    if status and 'Dead' in status:
        continue
    
    # Check if needs enrichment
    needs_contact = not contact_name or contact_name.strip() == ''
    generic_email = email and any(email.lower().startswith(prefix) for prefix in ['info@', 'sales@', 'ir@', 'contact@'])
    no_email = not email or email.strip() == ''
    
    if needs_contact or generic_email or no_email:
        needs_enrichment.append({
            'row': idx,
            'company': company,
            'contact': contact_name,
            'email': email,
            'reason': 'No contact' if needs_contact else ('Generic email' if generic_email else 'No email')
        })

# Limit to 10-15 for this run
top_targets = needs_enrichment[:15]

print(f'\n=== ENRICHMENT TARGETS (top 15 of {len(needs_enrichment)} total) ===')
for target in top_targets:
    print(f"Row {target['row']}: {target['company']} - {target['reason']}")

# Save targets to JSON for research
with open('enrichment-targets-march5-906am.json', 'w') as f:
    json.dump(top_targets, f, indent=2)

print(f'\nTargets saved to enrichment-targets-march5-906am.json')
print(f'\nNext step: Research these {len(top_targets)} firms for decision-makers with verified contact info.')
