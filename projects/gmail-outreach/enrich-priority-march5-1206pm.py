import json
import requests
import time

# Load current PE data
with open('current-pe-data.json', 'r', encoding='utf-8') as f:
    leads = json.load(f)

# Apollo API setup
APOLLO_API_KEY = 'Fx6RpQS0PKxfVgnxWOPWuw'
APOLLO_BASE_URL = 'https://api.apollo.io/v1'

def needs_enrichment(lead):
    """Check if a lead needs enrichment"""
    contact = lead.get('Contact Name', '').strip()
    email = lead.get('Email', '').strip().lower()
    status = lead.get('Status', '').strip()
    
    # Skip if already sent, dead, bounced, etc
    if status in ['Dead', 'Invalid', 'Bounced', 'Sent']:
        return False
    
    # Needs enrichment if:
    # - No contact name
    # - No email or generic email
    if not contact:
        return True
    if not email or any(email.startswith(p) for p in ['info@', 'sales@', 'ir@', 'contact@', 'support@']):
        return True
    
    return False

def search_apollo_contacts(company_name, domain):
    """Search Apollo for decision-makers at a company"""
    try:
        headers = {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Api-Key': APOLLO_API_KEY
        }
        
        # Search for senior roles
        data = {
            "q_organization_domains": domain if domain else company_name,
            "page": 1,
            "per_page": 25,
            "person_titles": [
                "CEO", "CTO", "COO", "Managing Partner", "General Partner",
                "Operating Partner", "Director", "VP", "Head of",
                "Chief Technology Officer", "Chief Operating Officer",
                "VP Technology", "VP Operations", "VP Digital"
            ]
        }
        
        response = requests.post(
            f'{APOLLO_BASE_URL}/mixed_people/search',
            headers=headers,
            json=data,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            people = result.get('people', [])
            
            contacts = []
            for person in people[:10]:  # Top 10
                if person.get('email') and '@' in person['email']:
                    contacts.append({
                        'name': person.get('name', ''),
                        'title': person.get('title', ''),
                        'email': person['email'],
                        'linkedin': person.get('linkedin_url', ''),
                        'source': 'Apollo API'
                    })
            
            return contacts
        
        return []
    
    except Exception as e:
        print(f"  ERROR Apollo: {e}")
        return []

# Find leads needing enrichment
enrichment_targets = []
for lead in leads:
    if needs_enrichment(lead):
        enrichment_targets.append(lead)

print(f"Found {len(enrichment_targets)} leads needing enrichment")
print(f"Will enrich top 15...\n")

# Prioritize: those with websites first
enrichment_targets.sort(key=lambda x: (
    bool(x.get('Website')),
    -int(x.get('Gumbo Score', '0') or '0')
), reverse=True)

enrichment_results = []
enriched_count = 0

for i, lead in enumerate(enrichment_targets[:15], 1):
    company = lead.get('Company Name', '')
    website = lead.get('Website', '').strip()
    row = lead.get('_row')
    
    print(f"\n{i}. Row {row}: {company}")
    print(f"   Current: {lead.get('Contact Name', '(none)')} - {lead.get('Email', '(none)')}")
    
    if not website:
        print(f"   WARNING: No website - skipping Apollo search")
        continue
    
    # Extract domain
    domain = website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
    
    print(f"   Searching Apollo for {domain}...")
    contacts = search_apollo_contacts(company, domain)
    
    if contacts:
        print(f"   SUCCESS: Found {len(contacts)} contacts:")
        for c in contacts[:3]:
            print(f"      - {c['name']} ({c['title']}) - {c['email']}")
        
        # Use the first (best) contact
        best = contacts[0]
        enrichment_results.append({
            'row': row,
            'company': company,
            'contact_name': best['name'],
            'title': best['title'],
            'email': best['email'],
            'linkedin': best['linkedin'],
            'source': best['source']
        })
        enriched_count += 1
    else:
        print(f"   FAIL: No contacts found")
    
    # Rate limit
    time.sleep(1.5)

# Save results
output_file = 'enrichment-results-march5-1206pm.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(enrichment_results, f, indent=2, ensure_ascii=False)

print(f"\n\n=== ENRICHMENT COMPLETE ===")
print(f"Enriched: {enriched_count}/15")
print(f"Results saved to: {output_file}")

# Print summary for update
if enrichment_results:
    print(f"\n=== UPDATE THESE ROWS ===")
    for r in enrichment_results:
        print(f"\nRow {r['row']}: {r['company']}")
        print(f"  Contact Name: {r['contact_name']}")
        print(f"  Title: {r['title']}")
        print(f"  Email: {r['email']}")
        print(f"  LinkedIn: {r['linkedin']}")
        print(f"  Status: Enriched")
        print(f"  Notes: Apollo-verified {r['source']} - {time.strftime('%Y-%m-%d')}")
