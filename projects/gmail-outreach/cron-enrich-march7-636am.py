#!/usr/bin/env python3
import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def main():
    print('🔍 PE Research & Enrichment - March 7, 6:36 AM')
    print('=' * 60)

    # Auth
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    service = build('sheets', 'v4', credentials=creds)
    
    # Read sheet
    print('\n📊 Reading CRM sheet...')
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Outreach Log!A:J'
    ).execute()
    
    rows = result.get('values', [])
    if not rows:
        print('❌ No data found')
        return
    
    headers = rows[0]
    print(f'Headers: {headers}')
    
    # Find columns
    col_company = headers.index('Company') if 'Company' in headers else -1
    col_contact = headers.index('Contact Name') if 'Contact Name' in headers else -1
    col_email = headers.index('Email') if 'Email' in headers else -1
    col_status = headers.index('Status') if 'Status' in headers else -1
    col_title = headers.index('Position/Title') if 'Position/Title' in headers else -1
    
    print(f'\nColumn indices: Company={col_company}, Contact={col_contact}, Email={col_email}, Status={col_status}')
    
    # Find leads needing enrichment
    needs_enrichment = []
    for i, row in enumerate(rows[1:], start=1):
        if len(row) <= max(col_company, col_contact, col_email, col_status):
            # Pad row if needed
            row = row + [''] * (max(col_company, col_contact, col_email, col_status) + 1 - len(row))
        
        company = row[col_company] if col_company >= 0 and len(row) > col_company else ''
        contact = row[col_contact] if col_contact >= 0 and len(row) > col_contact else ''
        email = row[col_email] if col_email >= 0 and len(row) > col_email else ''
        status = row[col_status] if col_status >= 0 and len(row) > col_status else ''
        
        # Skip if already enriched or sent
        if status in ['Enriched', 'Sent', 'Replied']:
            continue
        
        # Need enrichment if:
        # 1. No contact name, OR
        # 2. No email, OR
        # 3. Generic email (info@, sales@, ir@, contact@)
        has_contact_name = contact and contact.strip() and contact != 'TBD'
        has_email = email and email.strip()
        is_generic_email = any(email.lower().startswith(prefix + '@') for prefix in ['info', 'sales', 'ir', 'contact', 'admin', 'support']) if has_email else False
        
        if not has_contact_name or not has_email or is_generic_email:
            reason = 'No contact name' if not has_contact_name else ('Generic email' if is_generic_email else 'No email')
            needs_enrichment.append({
                'rowIndex': i + 1,  # 1-indexed for Sheets
                'company': company,
                'contact': contact,
                'email': email,
                'status': status,
                'reason': reason
            })
    
    print(f'\n✅ Found {len(needs_enrichment)} leads needing enrichment')
    
    # Take first 15
    targets = needs_enrichment[:15]
    print(f'\n🎯 Processing {len(targets)} targets:\n')
    
    for idx, t in enumerate(targets):
        print(f"{idx + 1}. {t['company']} (Row {t['rowIndex']}) - {t['reason']}")
    
    # Save targets for manual research
    with open('enrich-targets-march7-636am.json', 'w') as f:
        json.dump(targets, f, indent=2)
    
    print(f'\n📝 Targets saved to enrich-targets-march7-636am.json')
    print('\n🔬 Next: Manual research for these targets...')

if __name__ == '__main__':
    main()
