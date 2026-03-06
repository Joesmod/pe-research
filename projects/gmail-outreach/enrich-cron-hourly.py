#!/usr/bin/env python3
"""
PE Lead Enrichment - Hourly Cron
Reads Google Sheet, finds firms needing enrichment, updates with verified contacts
"""

import json
import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def read_sheet():
    """Read current sheet data"""
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('sheets', 'v4', credentials=creds)
    
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range='Sheet1!A:K'
    ).execute()
    
    rows = result.get('values', [])
    return rows

def find_enrichment_targets(rows):
    """Find firms needing enrichment (empty contact or generic email)"""
    if not rows or len(rows) < 2:
        return []
    
    headers = rows[0]
    targets = []
    
    # Column indices: A=Firm(0), B=Contact(1), C=Title(2), D=Email(3), E=Website(4), 
    #                 F=LinkedIn(5), G=Sectors(6), H=Description(7), I=Status(8), J=LastContacted(9), K=Notes(10)
    
    for idx, row in enumerate(rows[1:], start=2):  # Start at row 2 (skip header)
        if len(row) < 1:
            continue
            
        firm_name = row[0] if len(row) > 0 else ''
        contact_name = row[1] if len(row) > 1 else ''
        email = row[3] if len(row) > 3 else ''
        status = row[8] if len(row) > 8 else ''
        
        # Skip if already enriched or sent
        if status in ['Sent', 'Enriched', 'Responded', 'Bounced']:
            continue
        
        # Need enrichment if: no contact name OR generic email
        needs_enrichment = False
        if not contact_name or contact_name.strip() == '':
            needs_enrichment = True
        elif email and any(email.lower().startswith(prefix) for prefix in ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'team@']):
            needs_enrichment = True
        
        if needs_enrichment and firm_name:
            targets.append({
                'row': idx,
                'firm': firm_name,
                'contact': contact_name,
                'email': email,
                'website': row[4] if len(row) > 4 else '',
                'linkedin': row[5] if len(row) > 5 else '',
                'status': status
            })
    
    return targets

def main():
    print('🫡 PE Enrichment - Hourly Cron\n')
    print('Reading Google Sheet...\n')
    
    rows = read_sheet()
    targets = find_enrichment_targets(rows)
    
    print(f'Found {len(targets)} firms needing enrichment\n')
    
    # Output targets for manual research
    if targets:
        print('FIRMS NEEDING ENRICHMENT:')
        print('=' * 60)
        for i, t in enumerate(targets[:15], 1):  # Limit to 15
            print(f"\n{i}. {t['firm']} (Row {t['row']})")
            print(f"   Current Contact: {t['contact'] or '(empty)'}")
            print(f"   Current Email: {t['email'] or '(empty)'}")
            print(f"   Website: {t['website']}")
            print(f"   LinkedIn: {t['linkedin']}")
            print(f"   Status: {t['status']}")
        
        # Save to file for processing
        with open('_enrichment_targets_hourly.json', 'w') as f:
            json.dump(targets[:15], f, indent=2)
        
        print('\n' + '=' * 60)
        print(f'\n✅ Saved {min(15, len(targets))} targets to _enrichment_targets_hourly.json')
        print('\nNext: Use web search to find verified contacts for these firms.')
    else:
        print('✅ All firms already have verified contacts!')

if __name__ == '__main__':
    main()
