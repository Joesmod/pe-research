#!/usr/bin/env python3
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Setup
SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
RANGE = 'Sheet1!A:K'
SERVICE_ACCOUNT_FILE = 'service-account.json'

creds = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)

service = build('sheets', 'v4', credentials=creds)
sheet = service.spreadsheets()

# Read all data
result = sheet.values().get(spreadsheetId=SHEET_ID, range=RANGE).execute()
rows = result.get('values', [])

if not rows:
    print('No data found.')
    exit(1)

# Print all rows as JSON
print(json.dumps(rows, indent=2))
