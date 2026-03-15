#!/usr/bin/env python3
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'

credentials = Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
)

service = build('sheets', 'v4', credentials=credentials)
sheet = service.spreadsheets()

result = sheet.values().get(
    spreadsheetId=SHEET_ID,
    range='Sheet1!A:J'
).execute()

rows = result.get('values', [])
print(json.dumps(rows, indent=2))
