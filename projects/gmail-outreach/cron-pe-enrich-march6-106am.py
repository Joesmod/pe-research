#!/usr/bin/env python3
"""PE Lead Enrichment - March 6, 2026 1:06 AM"""

import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Configuration
SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# Generic email patterns to flag
GENERIC_PATTERNS = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'team@']

def get_sheets_client():
    """Initialize Google Sheets API client"""
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('sheets', 'v4', credentials=creds)

def read_sheet(service):
    """Read all data from Sheet1"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Sheet1!A:M'  # Extended to capture all columns
    ).execute()
    return result.get('values', [])

def needs_enrichment(row):
    """Check if a row needs enrichment"""
    if len(row) < 4:
        return False
    
    # Columns: Company, Website, Contact Name, Title, Email, LinkedIn, Status, Notes...
    company = row[0] if len(row) > 0 else ''
    contact_name = row[2] if len(row) > 2 else ''
    email = row[4] if len(row) > 4 else ''
    status = row[6] if len(row) > 6 else ''
    
    # Skip if no company or already marked as dead/sent
    if not company or status in ['Dead', 'Sent', 'Replied']:
        return False
    
    # Check if contact name is empty
    if not contact_name or contact_name.strip() == '':
        return True
    
    # Check if email is empty or generic
    if not email or email.strip() == '':
        return True
    
    for pattern in GENERIC_PATTERNS:
        if pattern in email.lower():
            return True
    
    return False

def main():
    """Main enrichment workflow"""
    service = get_sheets_client()
    
    # Read current data
    rows = read_sheet(service)
    if not rows:
        print("No data found in sheet")
        return
    
    # Header row
    headers = rows[0] if rows else []
    print(f"Headers: {headers}")
    
    # Find rows needing enrichment
    needs_work = []
    for i, row in enumerate(rows[1:], start=2):  # Skip header, start from row 2
        if needs_enrichment(row):
            company = row[0] if len(row) > 0 else 'Unknown'
            contact = row[2] if len(row) > 2 else '(empty)'
            email = row[4] if len(row) > 4 else '(empty)'
            needs_work.append({
                'row_index': i,
                'company': company,
                'contact_name': contact,
                'email': email,
                'data': row
            })
    
    print(f"\nFound {len(needs_work)} rows needing enrichment")
    
    # Output the first 15 for manual research
    enrichment_targets = needs_work[:15]
    
    output_file = 'enrichment-targets-march6-106am.json'
    with open(output_file, 'w') as f:
        json.dump(enrichment_targets, f, indent=2)
    
    print(f"\nWrote {len(enrichment_targets)} targets to {output_file}")
    print("\nTargets needing enrichment:")
    for target in enrichment_targets:
        print(f"  Row {target['row_index']}: {target['company']} - Contact: {target['contact_name']} - Email: {target['email']}")

if __name__ == '__main__':
    main()
