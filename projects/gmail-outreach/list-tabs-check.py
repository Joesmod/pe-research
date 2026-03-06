from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)

service = build('sheets', 'v4', credentials=credentials)
sheet_metadata = service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
sheets = sheet_metadata.get('sheets', [])

print("Available tabs:")
for sheet in sheets:
    print(f"  - {sheet['properties']['title']}")
