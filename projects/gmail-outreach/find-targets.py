import json

with open('sheet-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

header = data[0]
rows = data[1:]

print("Firms needing enrichment:\n")
print("=" * 80)

targets = []
for idx, row in enumerate(rows):
    if len(row) < 10:
        continue
    
    company = row[0] if len(row) > 0 else ''
    contact = row[1] if len(row) > 1 else ''
    title = row[2] if len(row) > 2 else ''
    email = row[3] if len(row) > 3 else ''
    status = row[8] if len(row) > 8 else ''
    
    # Skip already contacted
    if status in ['Contacted', 'Meeting Scheduled', 'Replied - Call Requested', 
                  'Replied - Warm Intro Offered', 'DUPLICATE']:
        continue
    
    # Check for generic emails or missing contact
    generic = any(email.lower().startswith(prefix) for prefix in 
                  ['info@', 'sales@', 'ir@', 'contact@', 'admin@', 
                   'general@', 'inquiries@', 'support@'])
    
    needs_work = not contact or not email or generic or status == 'Dead Lead'
    
    if needs_work and company:
        row_num = idx + 2  # +2 for header and 1-indexed
        targets.append({
            'row': row_num,
            'company': company,
            'contact': contact,
            'title': title,
            'email': email,
            'status': status
        })

# Show first 15
for i, target in enumerate(targets[:15], 1):
    print(f"\n{i}. Row {target['row']}: {target['company']}")
    print(f"   Contact: {target['contact'] or '(EMPTY)'}")
    print(f"   Title: {target['title'] or '(EMPTY)'}")
    print(f"   Email: {target['email'] or '(EMPTY)'}")
    print(f"   Status: {target['status'] or '(EMPTY)'}")

print(f"\n" + "=" * 80)
print(f"Total firms needing enrichment: {len(targets)}")
