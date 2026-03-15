#!/usr/bin/env python3
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'

# Authenticate
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)

service = build('sheets', 'v4', credentials=credentials)
sheet = service.spreadsheets()

# Read sheet
result = sheet.values().get(
    spreadsheetId=SHEET_ID,
    range='Sheet1!A:M'
).execute()

rows = result.get('values', [])
headers = rows[0] if rows else []

print(f'Headers: {headers}')
print(f'Total rows: {len(rows) - 1}')

# Find column indices
company_idx = headers.index('Company') if 'Company' in headers else 0
contact_idx = headers.index('Contact Name') if 'Contact Name' in headers else -1
email_idx = headers.index('Email') if 'Email' in headers else -1
status_idx = headers.index('Status') if 'Status' in headers else -1

# Find leads needing enrichment
needs_enrichment = []
for i in range(1, len(rows)):
    row = rows[i]
    # Pad row to match headers length
    while len(row) < len(headers):
        row.append('')
    
    company = row[company_idx] if len(row) > company_idx else ''
    contact = row[contact_idx] if contact_idx >= 0 and len(row) > contact_idx else ''
    email = row[email_idx] if email_idx >= 0 and len(row) > email_idx else ''
    status = row[status_idx] if status_idx >= 0 and len(row) > status_idx else ''
    
    # Skip if already processed
    if status in ['Enriched', 'Sent', 'Dead']:
        continue
    
    # Check if needs enrichment
    needs_contact = not contact or contact.strip() == ''
    is_generic = any(x in email.lower() for x in ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'support@'])
    needs_email = not email or email.strip() == '' or is_generic
    
    if needs_contact or needs_email:
        reason = 'No contact' if needs_contact else 'Generic/empty email'
        needs_enrichment.append({
            'rowIndex': i,
            'company': company,
            'contact': contact,
            'email': email,
            'status': status,
            'reason': reason
        })

print(f'\nLeads needing enrichment: {len(needs_enrichment)}')
print('\nFirst 15 to enrich:')
for idx, lead in enumerate(needs_enrichment[:15]):
    print(f"{idx + 1}. {lead['company']} (Row {lead['rowIndex'] + 1}) - {lead['reason']}")
    print(f"   Current: {lead['contact']} <{lead['email']}>\n")

# Save to file
with open('enrich-targets-march7-936pm.json', 'w') as f:
    json.dump(needs_enrichment[:15], f, indent=2)

print(f'\nSaved to enrich-targets-march7-936pm.json')
