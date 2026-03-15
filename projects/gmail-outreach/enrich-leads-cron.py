#!/usr/bin/env python3
"""
PE Research & Enrichment - Hourly Cron Job
Enrich leads with missing Contact Name or generic emails
"""

import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Configuration
SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def get_sheets_service():
    """Initialize Google Sheets API service"""
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('sheets', 'v4', credentials=creds)

def read_sheet(service):
    """Read all data from the main sheet"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Sheet1!A:Z'
    ).execute()
    values = result.get('values', [])
    
    if not values:
        return [], []
    
    headers = values[0]
    rows = values[1:]
    return headers, rows

def find_col_index(headers, col_name):
    """Find column index by name"""
    try:
        return headers.index(col_name)
    except ValueError:
        return -1

def needs_enrichment(row, headers):
    """Check if a row needs enrichment"""
    contact_idx = find_col_index(headers, 'Contact Name')
    email_idx = find_col_index(headers, 'Email')
    status_idx = find_col_index(headers, 'Status')
    
    if contact_idx == -1 or email_idx == -1:
        return False
    
    # Skip if already marked as Dead Lead, Sent, Replied, etc.
    if status_idx != -1 and len(row) > status_idx:
        status = row[status_idx].strip().lower()
        if status in ['dead lead', 'sent', 'replied', 'bounced', 'unsubscribed']:
            return False
    
    # Check if Contact Name is empty
    contact_empty = len(row) <= contact_idx or not row[contact_idx].strip()
    
    # Check if Email is empty or generic
    email_empty_or_generic = False
    if len(row) <= email_idx or not row[email_idx].strip():
        email_empty_or_generic = True
    else:
        email = row[email_idx].strip().lower()
        generic_prefixes = ['info@', 'contact@', 'sales@', 'ir@', 'investor@', 'admin@']
        email_empty_or_generic = any(email.startswith(prefix) for prefix in generic_prefixes)
    
    return contact_empty or email_empty_or_generic

def main():
    """Main enrichment process"""
    print("🔍 PE Research & Enrichment - Hourly Run")
    print("=" * 60)
    
    # Initialize Google Sheets service
    service = get_sheets_service()
    
    # Read current sheet data
    print("\n📊 Reading Google Sheet...")
    headers, rows = read_sheet(service)
    print(f"   Total rows: {len(rows)}")
    
    # Find leads needing enrichment
    print("\n🔎 Identifying leads needing enrichment...")
    needs_enrich = []
    company_idx = find_col_index(headers, 'Company')
    website_idx = find_col_index(headers, 'Website')
    
    for idx, row in enumerate(rows):
        if needs_enrichment(row, headers):
            company = row[company_idx] if len(row) > company_idx else "Unknown"
            website = row[website_idx] if len(row) > website_idx else ""
            needs_enrich.append({
                'row_num': idx + 2,  # +2 because row 1 is headers, and we're 0-indexed
                'company': company,
                'website': website
            })
    
    print(f"   Found {len(needs_enrich)} leads needing enrichment")
    
    # Limit to 10-15 leads for this run
    target_count = min(15, len(needs_enrich))
    to_enrich = needs_enrich[:target_count]
    
    print(f"\n🎯 Enriching {len(to_enrich)} leads:")
    for lead in to_enrich:
        print(f"   Row {lead['row_num']}: {lead['company']}")
    
    # Save enrichment targets for manual research
    output_file = 'enrichment-targets-current.json'
    with open(output_file, 'w') as f:
        json.dump(to_enrich, f, indent=2)
    
    print(f"\n💾 Saved enrichment targets to: {output_file}")
    print("\n⚠️  Manual research required:")
    print("   For each firm, search:")
    print("   - Firm website team/contact pages")
    print("   - site:linkedin.com queries")
    print("   - Press releases, conference bios")
    print("   - SEC filings, PDFs, brochures")
    print("\n   Target roles:")
    print("   - C-level: CEO, CTO, COO, CMO, CFO")
    print("   - Partners: Managing, Operating, General")
    print("   - Directors: Technology, Product, Ops, Marketing")
    print("   - VPs: Technology, Operations, Digital")
    print("   - Heads of: Value Creation, Portfolio Ops")
    print("\n✅ Enrichment targets prepared!")
    print(f"   Next: Research these {len(to_enrich)} firms and update the sheet")

if __name__ == '__main__':
    main()
