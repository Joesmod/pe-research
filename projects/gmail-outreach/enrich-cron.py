#!/usr/bin/env python3
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'

def main():
    # Auth
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    # Read current data
    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range='Sheet1!A:J'
    ).execute()
    
    rows = result.get('values', [])
    if not rows:
        print('No data found.')
        return
    
    headers = rows[0]
    print(f'Headers: {headers}')
    print(f'\nTotal rows: {len(rows) - 1}')
    
    # Find leads needing enrichment
    needs_enrichment = []
    for i in range(1, len(rows)):
        row = rows[i]
        company = row[0] if len(row) > 0 else ''
        contact_name = row[2] if len(row) > 2 else ''
        email = row[4] if len(row) > 4 else ''
        website = row[5] if len(row) > 5 else ''
        
        # Check if needs enrichment
        has_empty_contact = not contact_name or contact_name.strip() == ''
        has_generic_email = (not email or 
                            'info@' in email or 
                            'sales@' in email or 
                            'ir@' in email or 
                            'contact@' in email or
                            email.strip() == '')
        
        if (has_empty_contact or has_generic_email) and company:
            needs_enrichment.append({
                'row_index': i,
                'company': company,
                'website': website,
                'contact_name': contact_name,
                'email': email
            })
    
    print(f'\n=== Found {len(needs_enrichment)} leads needing enrichment ===\n')
    
    # Show first 15
    for idx, lead in enumerate(needs_enrichment[:15]):
        print(f"{idx + 1}. {lead['company']}")
        print(f"   Contact: {lead['contact_name'] or '(empty)'}")
        print(f"   Email: {lead['email'] or '(empty)'}")
        print(f"   Website: {lead['website']}")
        print(f"   Row: {lead['row_index'] + 1}")
        print()

if __name__ == '__main__':
    main()
