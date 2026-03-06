#!/usr/bin/env python3
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '11TRs92xmRWJ_FEQ_0nnLDrUkPPJRSqTG_iBSYBjGov4'
SERVICE_ACCOUNT_FILE = 'service-account.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def update_enriched_leads():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    # Load enrichment data
    with open('enrichment-march5-506pm.json', 'r') as f:
        enrichment_data = json.load(f)
    
    print(f"\nProcessing {len(enrichment_data['verified_contacts'])} enrichment records...\n")
    
    # Updates to apply
    updates = []
    
    for contact in enrichment_data['verified_contacts']:
        # Skip if no verified email
        if not contact.get('email'):
            print(f"⏭️  Skipping {contact['company']} - {contact['contact_name']}: No verified email")
            continue
        
        row = contact['row']
        
        # Column mapping (1-indexed for range notation):
        # A(Date), B(Company), C(Position/Title), D(Contact Name), 
        # E(Email), F(LinkedIn), G(Status), H(Notes)
        
        update_data = {
            'range': f'Sheet1!C{row}:H{row}',  # Update Title through Notes
            'values': [[
                contact['title'],                     # C: Position/Title
                contact['contact_name'],              # D: Contact Name
                contact['email'],                     # E: Email
                contact['linkedin'],                  # F: LinkedIn
                'Enriched',                           # G: Status
                f"Source: {contact['source']} | {contact['notes']}"  # H: Notes
            ]]
        }
        
        updates.append(update_data)
        
        print(f"✅ Row {row}: {contact['company']} → {contact['contact_name']} ({contact['title']}) - {contact['email']}")
    
    # Batch update
    if len(updates) == 0:
        print('\n⚠️  No updates to apply (no verified emails found)')
        return
    
    print(f"\n📤 Applying {len(updates)} updates to Google Sheet...")
    
    try:
        body = {
            'valueInputOption': 'RAW',
            'data': updates
        }
        result = sheet.values().batchUpdate(
            spreadsheetId=SHEET_ID,
            body=body
        ).execute()
        
        print(f"\n✅ Successfully updated {len(updates)} rows in Google Sheet!")
        print(f"\n📊 Summary:")
        print(f"   - Total researched: {enrichment_data['summary']['total_researched']}")
        print(f"   - Verified emails found: {enrichment_data['summary']['verified_emails_found']}")
        print(f"   - Contacts with names only: {enrichment_data['summary']['contacts_with_names_only']}")
        print(f"   - Firms enriched: {enrichment_data['summary']['firms_enriched']}")
        
    except Exception as error:
        print(f'❌ Error updating sheet: {error}')
        raise

if __name__ == '__main__':
    update_enriched_leads()
