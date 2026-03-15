import json
import gspread
from google.oauth2.service_account import Credentials

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
KEY_FILE = 'service-account.json'

def get_sheet():
    creds = Credentials.from_service_account_file(
        KEY_FILE,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    client = gspread.authorize(creds)
    return client.open_by_key(SHEET_ID).sheet1

def main():
    sheet = get_sheet()
    data = sheet.get_all_records()
    
    # Find leads needing enrichment
    needs_enrichment = []
    for row in data:
        # Check if Contact Name is empty OR Email is empty/generic
        email = row.get('Email', '').lower().strip()
        contact_name = row.get('Contact Name', '').strip()
        status = row.get('Status', '').strip()
        
        # Skip if status is Dead, Sent, or Bounced
        if status in ['Dead', 'Sent', 'Bounced', 'Replied']:
            continue
            
        # Need enrichment if:
        # - No contact name, OR
        # - No email, OR
        # - Generic email (info@, sales@, ir@, contact@, hello@)
        generic_prefixes = ['info@', 'sales@', 'ir@', 'contact@', 'hello@', 'inquiries@', 'investors@']
        is_generic = any(email.startswith(prefix) for prefix in generic_prefixes)
        
        if not contact_name or not email or is_generic:
            needs_enrichment.append(row)
    
    print(f"\n🔍 Found {len(needs_enrichment)} leads needing enrichment\n")
    
    # Show first 15 for this run
    for i, lead in enumerate(needs_enrichment[:15], 1):
        print(f"{i}. {lead.get('Company', 'N/A')}")
        print(f"   Contact: {lead.get('Contact Name', '(empty)')}")
        print(f"   Email: {lead.get('Email', '(empty)')}")
        print(f"   Status: {lead.get('Status', '(empty)')}")
        print(f"   Website: {lead.get('Website', '(empty)')}\n")
    
    # Save to JSON for processing
    with open('enrich-targets-current.json', 'w') as f:
        json.dump(needs_enrichment[:15], f, indent=2)
    
    print(f"✅ Saved top 15 targets to enrich-targets-current.json")

if __name__ == '__main__':
    main()
