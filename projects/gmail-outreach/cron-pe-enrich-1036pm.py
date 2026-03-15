#!/usr/bin/env python3
"""PE Research & Enrichment - Hourly Cron"""
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT = 'service-account.json'

def read_sheet():
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT,
        scopes=['https://www.googleapis.com/auth/spreadsheets'])
    service = build('sheets', 'v4', credentials=creds)
    
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Sheet1!A:K'
    ).execute()
    
    rows = result.get('values', [])
    if not rows:
        print("No data found")
        return []
    
    return rows

def find_needs_enrichment(rows):
    """Find leads with empty Contact Name or generic/empty Email"""
    if not rows:
        return []
    
    headers = rows[0]
    needs = []
    
    # Find column indices
    try:
        company_idx = headers.index('Company')
        contact_idx = headers.index('Contact Name')
        email_idx = headers.index('Email')
        status_idx = headers.index('Status')
    except ValueError as e:
        print(f"Column not found: {e}")
        return []
    
    for i, row in enumerate(rows[1:], start=2):  # Skip header, row number starts at 2
        if len(row) <= max(company_idx, contact_idx, email_idx, status_idx):
            continue
        
        company = row[company_idx].strip() if company_idx < len(row) else ''
        contact = row[contact_idx].strip() if contact_idx < len(row) else ''
        email = row[email_idx].strip() if email_idx < len(row) else ''
        status = row[status_idx].strip() if status_idx < len(row) else ''
        
        # Skip if marked Dead or already Enriched
        if status in ['Dead', 'Enriched', 'Sent']:
            continue
        
        # Check if needs enrichment
        if not contact or not email or email.startswith(('info@', 'sales@', 'ir@', 'contact@')):
            needs.append({
                'row': i,
                'company': company,
                'contact': contact,
                'email': email,
                'status': status
            })
    
    return needs

def main():
    print("📊 Reading Google Sheet...")
    rows = read_sheet()
    print(f"Total rows: {len(rows)}")
    
    needs = find_needs_enrichment(rows)
    print(f"\n🔍 Found {len(needs)} leads needing enrichment")
    
    # Save to file
    with open('enrich-targets-march7-1036pm.json', 'w') as f:
        json.dump(needs, f, indent=2)
    
    # Show first 15
    print("\n📋 Top 15 targets:")
    for lead in needs[:15]:
        print(f"  Row {lead['row']}: {lead['company']}")
        print(f"    Contact: {lead['contact'] or '(empty)'}")
        print(f"    Email: {lead['email'] or '(empty)'}")
        print()
    
    return needs

if __name__ == '__main__':
    main()
