import json

# Read the current PE data
with open('current-pe-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find firms needing enrichment
needs_enrichment = []
for row in data:
    name = (row.get('Contact Name') or '').strip()
    email = (row.get('Email') or '').strip()
    
    # Empty contact name OR generic/empty email
    empty_name = not name
    generic_email = email and any(email.startswith(prefix + '@') for prefix in 
        ['info', 'sales', 'ir', 'contact', 'hello', 'admin', 'support'])
    empty_email = not email
    
    if empty_name or generic_email or empty_email:
        needs_enrichment.append(row)

print(f"Found {len(needs_enrichment)} firms needing enrichment")
print("\nFirst 15 firms to enrich:\n")

for idx, firm in enumerate(needs_enrichment[:15]):
    print(f"{idx + 1}. {firm.get('Company Name', 'N/A')}")
    print(f"   Website: {firm.get('Website', 'N/A')}")
    print(f"   Current Contact: {firm.get('Contact Name') or '[EMPTY]'}")
    print(f"   Current Email: {firm.get('Email') or '[EMPTY]'}")
    print(f"   Status: {firm.get('Status', 'N/A')}")
    print()

# Save the enrichment targets
with open('enrich-targets-536pm.json', 'w', encoding='utf-8') as f:
    json.dump(needs_enrichment[:15], f, indent=2, ensure_ascii=False)

print("\nSaved enrichment targets to enrich-targets-536pm.json")
