#!/usr/bin/env python3
import json
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
KEY_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def get_client():
    creds = service_account.Credentials.from_service_account_file(KEY_FILE, scopes=SCOPES)
    return build('sheets', 'v4', credentials=creds)

def read_sheet(range_name='Sheet1'):
    service = get_client()
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=range_name
    ).execute()
    return result.get('values', [])

def update_row(row_num, values):
    """Update a specific row (1-indexed, including header)"""
    service = get_client()
    range_name = f'Sheet1!A{row_num}:Z{row_num}'
    body = {'values': [values]}
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=range_name,
        valueInputOption='USER_ENTERED',
        body=body
    ).execute()
    print(f'Updated row {row_num}')

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'read':
        rows = read_sheet()
        if not rows:
            print('(empty)')
        else:
            # Print as JSON for easier parsing
            print(json.dumps(rows, indent=2))
    else:
        print('Usage: python enrich_leads.py read')
