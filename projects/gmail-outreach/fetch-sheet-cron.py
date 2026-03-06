#!/usr/bin/env python3
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

def fetch_sheet():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    result = sheet.values().get(
        spreadsheetId=SHEET_ID,
        range='Sheet1!A:I'
    ).execute()
    
    rows = result.get('values', [])
    
    if not rows:
        print('No data found.')
        return
    
    header = rows[0]
    print(f'Header: {header}')
    print(f'\nTotal rows: {len(rows) - 1}\n')
    
    # Find column indices
    company_col = header.index('Company') if 'Company' in header else -1
    contact_col = header.index('Contact Name') if 'Contact Name' in header else -1
    title_col = header.index('Position/Title') if 'Position/Title' in header else -1
    email_col = header.index('Email') if 'Email' in header else -1
    status_col = header.index('Status') if 'Status' in header else -1
    notes_col = header.index('Notes') if 'Notes' in header else -1
    
    # Find rows needing enrichment
    needs_enrichment = []
    
    for i in range(1, len(rows)):
        row = rows[i]
        
        # Pad row to match header length
        while len(row) < len(header):
            row.append('')
        
        company = row[company_col] if company_col >= 0 else ''
        contact = row[contact_col] if contact_col >= 0 else ''
        email = row[email_col] if email_col >= 0 else ''
        status = row[status_col] if status_col >= 0 else ''
        
        # Check if needs enrichment
        no_contact = not contact or contact.strip() == ''
        generic_email = email and any(x in email.lower() for x in ['info@', 'sales@', 'ir@', 'contact@'])
        
        if company and (no_contact or generic_email) and status != 'Dead' and 'Dead' not in status:
            needs_enrichment.append({
                'row': i + 1,
                'company': company,
                'contact': contact,
                'email': email,
                'status': status,
                'reason': 'No contact' if no_contact else 'Generic email'
            })
    
    print(f'\n📊 Rows needing enrichment: {len(needs_enrichment)}\n')
    
    # Show first 15
    to_show = needs_enrichment[:15]
    for item in to_show:
        print(f"Row {item['row']}: {item['company']}")
        print(f"  Contact: {item['contact'] or '(empty)'}")
        print(f"  Email: {item['email'] or '(empty)'}")
        print(f"  Status: {item['status'] or '(empty)'}")
        print(f"  Reason: {item['reason']}")
        print('')
    
    # Save to file
    with open('enrichment-targets-march5-506pm.json', 'w') as f:
        json.dump(needs_enrichment, f, indent=2)
    
    print(f'\n✅ Saved {len(needs_enrichment)} targets to enrichment-targets-march5-506pm.json')

if __name__ == '__main__':
    fetch_sheet()
