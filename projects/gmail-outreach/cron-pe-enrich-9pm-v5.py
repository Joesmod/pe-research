#!/usr/bin/env python3
"""
PE Research Enrichment Cron - 9PM March 4, 2026
Enrich leads with empty Contact Name or generic emails
"""
import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def main():
    # Load credentials
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    # Read the sheet
    result = sheet.values().get(spreadsheetId=SHEET_ID, range='Sheet1!A:N').execute()
    values = result.get('values', [])
    
    if not values:
        print('No data found.')
        return
    
    headers = values[0]
    print(f"Headers: {headers}")
    
    # Find columns
    try:
        company_idx = headers.index('Company')
        contact_idx = headers.index('Contact Name')
        email_idx = headers.index('Email')
        status_idx = headers.index('Status')
    except ValueError as e:
        print(f"Error finding columns: {e}")
        return
    
    # Find firms needing enrichment
    needs_enrichment = []
    
    for i, row in enumerate(values[1:], start=2):
        if len(row) <= max(company_idx, contact_idx, email_idx, status_idx):
            continue
        
        company = row[company_idx] if company_idx < len(row) else ''
        contact = row[contact_idx] if contact_idx < len(row) else ''
        email = row[email_idx] if email_idx < len(row) else ''
        status = row[status_idx] if status_idx < len(row) else ''
        
        # Skip if already marked as dead, sent, or replied
        if status.lower() in ['dead', 'sent', 'replied', 'bounced']:
            continue
        
        # Check if needs enrichment
        needs_enrich = False
        reason = []
        
        if not contact or contact.strip() == '':
            needs_enrich = True
            reason.append('no contact')
        
        if not email or email.strip() == '':
            needs_enrich = True
            reason.append('no email')
        elif any(prefix in email.lower() for prefix in ['info@', 'sales@', 'ir@', 'contact@', 'hello@']):
            needs_enrich = True
            reason.append('generic email')
        
        if needs_enrich:
            needs_enrichment.append({
                'row': i,
                'company': company,
                'contact': contact,
                'email': email,
                'status': status,
                'reason': ', '.join(reason)
            })
    
    print(f"\n=== ENRICHMENT TARGETS ({len(needs_enrichment)} firms) ===\n")
    
    for firm in needs_enrichment[:15]:
        print(f"Row {firm['row']}: {firm['company']}")
        print(f"  Current contact: {firm['contact'] or '(empty)'}")
        print(f"  Current email: {firm['email'] or '(empty)'}")
        print(f"  Reason: {firm['reason']}")
        print()
    
    # Save to JSON
    with open('enrichment-targets-9pm.json', 'w') as f:
        json.dump(needs_enrichment[:15], f, indent=2)
    
    print(f"Saved first 15 targets to enrichment-targets-9pm.json")
    print(f"\nTotal needing enrichment: {len(needs_enrichment)}")

if __name__ == '__main__':
    main()
