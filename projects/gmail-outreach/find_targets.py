import json

with open('_sheet1_dump.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

headers = data[0]
rows = data[1:]

needs_enrichment = []

for idx, row in enumerate(rows):
    if len(row) < 9:
        continue
    
    company = row[0] if len(row) > 0 else ''
    contact_name = row[1] if len(row) > 1 else ''
    title = row[2] if len(row) > 2 else ''
    email = row[3] if len(row) > 3 else ''
    website = row[4] if len(row) > 4 else ''
    status = row[8] if len(row) > 8 else ''
    
    # Skip contacted
    if status == 'Contacted':
        continue
    
    # Check if needs enrichment
    empty_contact = not contact_name or contact_name.strip() == ''
    generic_email = email and any(email.lower().startswith(prefix) for prefix in ['info@', 'sales@', 'ir@', 'contact@', 'investor@'])
    
    if empty_contact or generic_email:
        needs_enrichment.append({
            'row': idx + 2,
            'company': company,
            'contact_name': contact_name,
            'title': title,
            'email': email,
            'website': website,
            'status': status,
            'reason': 'Empty contact' if empty_contact else 'Generic email'
        })

print(f'Found {len(needs_enrichment)} firms needing enrichment:\n')

for firm in needs_enrichment[:15]:
    print(f"Row {firm['row']}: {firm['company']}")
    print(f"  Current contact: {firm['contact_name'] or '(empty)'}")
    print(f"  Current email: {firm['email'] or '(empty)'}")
    print(f"  Website: {firm['website']}")
    print(f"  Status: {firm['status']}")
    print(f"  Reason: {firm['reason']}\n")

with open('_enrichment_targets.json', 'w', encoding='utf-8') as f:
    json.dump(needs_enrichment, f, indent=2)

print(f'✅ Saved {len(needs_enrichment)} targets to _enrichment_targets.json')
