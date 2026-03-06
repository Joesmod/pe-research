#!/usr/bin/env python3
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json

# Auth
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name('service-account.json', scope)
client = gspread.authorize(creds)

# Open sheet
sheet_id = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
sheet = client.open_by_key(sheet_id).sheet1

# Get all records
records = sheet.get_all_records()

# Find leads needing enrichment
needs_enrich = []
for idx, row in enumerate(records, start=2):  # start=2 because row 1 is header
    company = row.get('Company', '').strip()
    contact_name = row.get('Contact Name', '').strip()
    email = row.get('Email', '').strip()
    status = row.get('Status', '').strip()
    
    # Check if needs enrichment
    if company and status not in ['Dead', 'Sent', 'Replied']:
        # Missing contact or generic email
        if not contact_name or email.lower().startswith(('info@', 'sales@', 'ir@', 'contact@')):
            needs_enrich.append({
                'row': idx,
                'company': company,
                'contact_name': contact_name,
                'email': email,
                'status': status,
                'website': row.get('Website', '').strip(),
                'linkedin': row.get('LinkedIn', '').strip()
            })

# Output
print(json.dumps(needs_enrich[:15], indent=2))
