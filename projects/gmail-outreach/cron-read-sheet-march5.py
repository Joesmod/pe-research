#!/usr/bin/env python3
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def read_sheet():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('sheets', 'v4', credentials=creds)
    
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Sheet1!A:L'
    ).execute()
    
    rows = result.get('values', [])
    
    if not rows:
        print('No data found.')
        return
    
    print(json.dumps(rows, indent=2))

if __name__ == '__main__':
    read_sheet()
