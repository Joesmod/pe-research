import json
import requests
import time
from datetime import datetime

# Apollo API Key
APOLLO_API_KEY = "Fx6RpQS0PKxfVgnxWOPWuw"

# Load enrichment needs
with open('active-enrichment-needs.json', 'r', encoding='utf-8') as f:
    needs = json.load(f)

print(f"Loaded {len(needs)} leads needing enrichment")
print("=" * 80)

# Process first 15 leads (as requested)
target_leads = needs[:15]
enriched = []
failed = []

for i, lead in enumerate(target_leads, 1):
    company = lead['company']
    website = lead.get('website', '')
    
    print(f"\n[{i}/15] Searching: {company}")
    print(f"   Website: {website}")
    
    # Search for people at this company using Apollo
    # We'll search for C-level, Partners, Directors, VPs
    search_titles = [
        "CEO", "CTO", "COO", "CMO", "CFO",
        "Partner", "Managing Partner", "General Partner", "Operating Partner",
        "Director", "Managing Director",
        "VP", "Vice President",
        "Head of"
    ]
    
    try:
        # Apollo People Search API
        headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "X-Api-Key": APOLLO_API_KEY
        }
        
        # Build search query
        payload = {
            "q_organization_name": company,
            "page": 1,
            "per_page": 10,
            "person_titles": search_titles[:5]  # Start with top titles
        }
        
        if website:
            domain = website.replace('https://', '').replace('http://', '').split('/')[0]
            payload["q_organization_domains"] = [domain]
        
        response = requests.post(
            "https://api.apollo.io/api/v1/mixed_people/api_search",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            data = response.json()
            people = data.get('people', [])
            
            if people:
                # Get first person with email
                for person in people:
                    name = person.get('name', '')
                    title = person.get('title', '')
                    email = person.get('email', '')
                    linkedin = person.get('linkedin_url', '')
                    
                    if email and '@' in email:
                        print(f"   [OK] Found: {name}")
                        print(f"     Title: {title}")
                        print(f"     Email: {email}")
                        
                        enriched.append({
                            'row': lead['row'],
                            'company': company,
                            'contact_name': name,
                            'title': title,
                            'email': email,
                            'linkedin': linkedin,
                            'source': 'Apollo API',
                            'enriched_at': datetime.now().isoformat()
                        })
                        break
                else:
                    print(f"   [WARN] Found {len(people)} contacts but no verified emails")
                    failed.append({
                        'row': lead['row'],
                        'company': company,
                        'reason': f'Apollo: {len(people)} contacts found but no verified emails'
                    })
            else:
                print(f"   [FAIL] No contacts found")
                failed.append({
                    'row': lead['row'],
                    'company': company,
                    'reason': 'Apollo: No contacts found'
                })
        else:
            print(f"   [FAIL] API error: {response.status_code}")
            failed.append({
                'row': lead['row'],
                'company': company,
                'reason': f'Apollo API error: {response.status_code}'
            })
        
        # Rate limiting: wait 1 second between requests
        time.sleep(1)
        
    except Exception as e:
        print(f"   [ERROR] {str(e)}")
        failed.append({
            'row': lead['row'],
            'company': company,
            'reason': f'Exception: {str(e)}'
        })

print("\n" + "=" * 80)
print(f"\nEnrichment Complete!")
print(f"[OK] Successfully enriched: {len(enriched)}")
print(f"[FAIL] Failed to enrich: {len(failed)}")

# Save results
with open('enrichment-results-606pm.json', 'w', encoding='utf-8') as f:
    json.dump({
        'enriched': enriched,
        'failed': failed,
        'timestamp': datetime.now().isoformat()
    }, f, indent=2, ensure_ascii=False)

print(f"\nResults saved to enrichment-results-606pm.json")

# Print summary for reporting
if enriched:
    print("\n" + "=" * 80)
    print("ENRICHED LEADS:")
    for item in enriched:
        print(f"\nRow {item['row']}: {item['company']}")
        print(f"  Contact: {item['contact_name']} ({item['title']})")
        print(f"  Email: {item['email']}")
        if item['linkedin']:
            print(f"  LinkedIn: {item['linkedin']}")
