#!/usr/bin/env python3
"""
Apply PE lead enrichment to Google Sheet
March 5, 2026 6:36 AM cron run
"""

import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def main():
    # Load enrichment data
    with open('enrichment-updates-march5-636am.json', 'r') as f:
        updates = json.load(f)
    
    # Initialize Google Sheets API
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    # Prepare batch update
    batch_data = []
    
    for update in updates:
        row_num = update['row']
        # Column mapping: C=Contact, D=Title, E=Email, F=Website, G=LinkedIn, I=Portfolio/Notes, J=Status
        range_name = f'Sheet1!C{row_num}:J{row_num}'
        
        values = [[
            update.get('contactName', ''),
            update.get('title', ''),
            update.get('email', ''),
            update.get('website', ''),
            update.get('linkedin', ''),
            '',  # Column H (Sector Focus) - leaving as is
            update.get('notes', ''),
            update.get('status', 'Partial')
        ]]
        
        batch_data.append({
            'range': range_name,
            'values': values
        })
    
    # Execute batch update
    body = {
        'valueInputOption': 'RAW',
        'data': batch_data
    }
    
    result = sheet.values().batchUpdate(
        spreadsheetId=SHEET_ID,
        body=body
    ).execute()
    
    print(f"✅ Updated {len(updates)} rows successfully")
    print(f"Cells updated: {result.get('totalUpdatedCells')}")
    
    # Print summary
    print("\n📊 Enrichment Summary:")
    enriched_count = sum(1 for u in updates if u['status'] == 'Enriched')
    partial_count = sum(1 for u in updates if u['status'] == 'Partial')
    print(f"  - Fully Enriched (verified email): {enriched_count}")
    print(f"  - Partially Enriched (pattern email): {partial_count}")
    print(f"  - Total updated: {len(updates)}")

if __name__ == '__main__':
    main()
