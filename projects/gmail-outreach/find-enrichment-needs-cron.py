import json

# Load the current data
with open('current-pe-data.json', 'r', encoding='utf-8') as f:
    leads = json.load(f)

print(f"Analyzing {len(leads)} leads...")

# Find leads needing enrichment
needs_enrichment = []
for lead in leads:
    contact = lead.get('Contact Name', '').strip()
    email = lead.get('Email', '').strip().lower()
    status = lead.get('Status', '').strip()
    company = lead.get('Company Name', '').strip()
    
    # Skip leads that have been sent or are dead
    if status in ['Dead', 'Invalid', 'Bounced', 'Sent', 'Replied']:
        continue
    
    # Check if needs enrichment
    needs_enrich = False
    reason = []
    
    if not contact or contact == '':
        needs_enrich = True
        reason.append('no contact')
    
    if not email or email == '':
        needs_enrich = True
        reason.append('no email')
    elif any(email.startswith(prefix) for prefix in ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 'support@']):
        needs_enrich = True
        reason.append('generic email')
    
    if needs_enrich and company:
        needs_enrichment.append({
            'row': lead.get('_row'),
            'company': company,
            'contact': contact if contact else '(empty)',
            'email': email if email else '(empty)',
            'status': status,
            'website': lead.get('Website', ''),
            'reason': ', '.join(reason)
        })

print(f"\n{len(needs_enrichment)} leads need enrichment\n")
print("=" * 80)

# Show first 20
for i, lead in enumerate(needs_enrichment[:20], 1):
    print(f"\n{i}. Row {lead['row']}: {lead['company']}")
    print(f"   Current: {lead['contact']} / {lead['email']}")
    print(f"   Status: {lead['status']} | Reason: {lead['reason']}")
    if lead['website']:
        print(f"   Website: {lead['website']}")

print("\n" + "=" * 80)
print(f"\nTotal needing enrichment: {len(needs_enrichment)}")

# Save full list for processing
with open('enrichment-needs-cron.json', 'w', encoding='utf-8') as f:
    json.dump(needs_enrichment, f, indent=2, ensure_ascii=False)

print(f"Saved full list to enrichment-needs-cron.json")
