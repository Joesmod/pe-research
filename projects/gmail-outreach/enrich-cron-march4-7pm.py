import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Load service account
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
SERVICE_ACCOUNT_FILE = 'service-account.json'
SPREADSHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'

creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
service = build('sheets', 'v4', credentials=creds)

# Load enrichment targets
with open('enrichment-targets-hourly-2026-03-04.json', 'r') as f:
    targets = json.load(f)

print(f"Total leads needing enrichment: {len(targets)}")
print("\nFirst 15 targets:")
for i, target in enumerate(targets[:15]):
    print(f"{i+1}. Row {target['rowNum']}: {target['company']} - {target['website']}")
