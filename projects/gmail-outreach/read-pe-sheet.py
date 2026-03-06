import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Sheet ID
SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'

# Setup credentials
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)

# Build service
service = build('sheets', 'v4', credentials=credentials)
sheet = service.spreadsheets()

# Read the sheet
result = sheet.values().get(
    spreadsheetId=SHEET_ID,
    range='Sheet1!A1:Z1000'
).execute()

values = result.get('values', [])

if not values:
    print('No data found.')
else:
    # Print header
    header = values[0] if values else []
    print(f"Found {len(values)-1} rows")
    print(f"Columns: {header}")
    
    # Save to JSON for analysis
    output = []
    for i, row in enumerate(values[1:], 2):  # Start from row 2
        if len(row) > 0:  # Skip empty rows
            lead = {}
            for j, col in enumerate(header):
                lead[col] = row[j] if j < len(row) else ''
            lead['_row'] = i
            output.append(lead)
    
    with open('current-pe-data.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved {len(output)} leads to current-pe-data.json")
    
    # Count enrichment needs
    needs_enrichment = []
    for lead in output:
        contact = lead.get('Contact Name', '').strip()
        email = lead.get('Email', '').strip().lower()
        status = lead.get('Status', '').strip()
        
        # Check if needs enrichment
        if (not contact or 
            not email or 
            email.startswith('info@') or 
            email.startswith('sales@') or 
            email.startswith('ir@') or 
            email.startswith('contact@')):
            if status not in ['Dead', 'Invalid', 'Bounced', 'Sent']:
                needs_enrichment.append({
                    'row': lead['_row'],
                    'company': lead.get('Company', ''),
                    'contact': contact,
                    'email': email,
                    'status': status
                })
    
    print(f"\n{len(needs_enrichment)} leads need enrichment:")
    for i, lead in enumerate(needs_enrichment[:15], 1):
        print(f"{i}. Row {lead['row']}: {lead['company']} - {lead['contact'] or '(no contact)'} - {lead['email'] or '(no email)'}")
