#!/usr/bin/env python3
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Load service account credentials
with open('service-account.json', 'r') as f:
    creds_data = json.load(f)

credentials = service_account.Credentials.from_service_account_info(
    creds_data,
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)

# Build the Sheets API service
service = build('sheets', 'v4', credentials=credentials)

# Read the sheet
SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
RANGE_NAME = 'Sheet1!A:M'  # Extended to include all relevant columns

result = service.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID,
    range=RANGE_NAME
).execute()

values = result.get('values', [])

if not values:
    print('No data found.')
else:
    # Print header
    print(f"Total rows: {len(values)}")
    if values:
        print(f"Headers: {values[0]}")
    
    # Find rows that need enrichment (empty Contact Name or generic Email)
    needs_enrichment = []
    generic_emails = ['info@', 'sales@', 'ir@', 'contact@', 'hello@']
    
    for i, row in enumerate(values[1:], start=2):  # Skip header, start counting from row 2
        if len(row) < 8:  # Ensure we have enough columns
            continue
            
        firm_name = row[0] if len(row) > 0 else ''
        contact_name = row[2] if len(row) > 2 else ''
        email = row[4] if len(row) > 4 else ''
        status = row[7] if len(row) > 7 else ''
        
        # Check if needs enrichment
        if status.lower() in ['active', 'unresearched', '']:
            if not contact_name or not email or any(generic in email.lower() for generic in generic_emails):
                needs_enrichment.append({
                    'row': i,
                    'firm': firm_name,
                    'contact': contact_name,
                    'email': email,
                    'status': status
                })
    
    print(f"\n=== LEADS NEEDING ENRICHMENT: {len(needs_enrichment)} ===\n")
    for lead in needs_enrichment[:20]:  # Show first 20
        print(f"Row {lead['row']}: {lead['firm']} | Contact: '{lead['contact']}' | Email: '{lead['email']}' | Status: {lead['status']}")
    
    # Save to file for processing
    with open('enrichment-needs.json', 'w') as f:
        json.dump(needs_enrichment, f, indent=2)
    
    print(f"\n✓ Saved {len(needs_enrichment)} leads to enrichment-needs.json")
