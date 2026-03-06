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
    
    if status in ['Dead', 'Invalid', 'Bounced', 'Sent']:
        return False
    
    if not contact or contact == 'Jacob Zodikoff':  # Placeholder name
        return True
    if not email or any(email.startswith(p) for p in ['info@', 'sales@', 'ir@', 'contact@', 'support@']):
        return True
    
    return False

def is_midmarket_pe(lead):
    """Check if this looks like a mid-market PE firm"""
    company = lead.get('Company Name', '').lower()
    sector = lead.get('Sector Focus', '').lower()
    notes = lead.get('Notes', '').lower()
    
    # Keywords indicating PE firm
    pe_keywords = ['private equity', 'capital partners', 'equity partners', 'investment', 
                   'growth capital', 'buyout', 'pe firm', 'aum']
    
    # Exclude non-PE
    exclude = ['search partners', 'wall street', 'oasis', 'prep', 'consulting']
    
    text = f"{company} {sector} {notes}"
    
    has_pe = any(kw in text for kw in pe_keywords)
    is_excluded = any(ex in company for ex in exclude)
    
    return has_pe and not is_excluded

def search_apollo_broad(company_name, domain):
    """Broader Apollo search - ANY senior contact"""
    try:
        headers = {
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_API_KEY
        }
        
        # Broader search - just look for anyone at the company
        data = {
            "q_organization_domains": domain if domain else None,
            "page": 1,
            "per_page": 50
        }
        
        if not domain:
            data["q_organization_name"] = company_name
        
        response = requests.post(
            f'{APOLLO_BASE_URL}/mixed_people/search',
            headers=headers,
            json=data,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            people = result.get('people', [])
            
            # Filter for decision-makers
            senior_titles = ['ceo', 'cto', 'coo', 'cfo', 'cmo', 'partner', 'managing', 'operating',
                           'director', 'vp', 'vice president', 'head', 'chief', 'president',
                           'founder', 'owner', 'general', 'principal']
            
            contacts = []
            for person in people:
                title = person.get('title', '').lower()
                email = person.get('email', '')
                
                # Must have email and senior title
                if email and '@' in email and any(st in title for st in senior_titles):
                    contacts.append({
                        'name': person.get('name', ''),
                        'title': person.get('title', ''),
                        'email': email,
                        'linkedin': person.get('linkedin_url', ''),
                        'source': 'Apollo API'
                    })
            
            # Sort by title seniority (rough heuristic)
            def title_rank(contact):
                t = contact['title'].lower()
                if 'ceo' in t or 'chief executive' in t: return 0
                if 'managing partner' in t or 'founder' in t: return 1
                if 'partner' in t: return 2
                if 'president' in t: return 3
                if 'vp' in t or 'vice president' in t: return 4
                if 'director' in t: return 5
                return 6
            
            contacts.sort(key=title_rank)
            return contacts[:5]  # Top 5
        
        return []
    
    except Exception as e:
        print(f"  ERROR: {e}")
        return []

# Find PE firms needing enrichment
targets = []
for lead in leads:
    if needs_enrichment(lead) and is_midmarket_pe(lead):
        score = int(lead.get('Gumbo Score', '0') or '0')
        targets.append((score, lead))

# Sort by Gumbo Score (high to low)
targets.sort(key=lambda x: x[0], reverse=True)
targets = [t[1] for t in targets[:20]]  # Top 20 by score

print(f"Found {len(targets)} mid-market PE firms needing enrichment")
print(f"Will process top 15...\n")

enrichment_results = []
enriched_count = 0

for i, lead in enumerate(targets[:15], 1):
    company = lead.get('Company Name', '')
    website = lead.get('Website', '').strip()
    row = lead.get('_row')
    score = lead.get('Gumbo Score', '0')
    
    print(f"\n{i}. Row {row}: {company} (Score: {score})")
    print(f"   Current: {lead.get('Contact Name', '(none)')} - {lead.get('Email', '(none)')}")
    
    if not website:
        print(f"   No website - skipping")
        continue
    
    # Extract domain
    domain = website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
    
    print(f"   Searching: {domain}...")
    contacts = search_apollo_broad(company, domain)
    
    if contacts:
        print(f"   SUCCESS: Found {len(contacts)} senior contacts")
        for c in contacts[:3]:
            print(f"      {c['name']} - {c['title']}")
            print(f"      {c['email']}")
        
        # Use the best contact
        best = contacts[0]
        enrichment_results.append({
            'row': row,
            'company': company,
            'contact_name': best['name'],
            'title': best['title'],
            'email': best['email'],
            'linkedin': best['linkedin'],
            'source': 'Apollo API (broad search)',
            'gumbo_score': score
        })
        enriched_count += 1
    else:
        print(f"   No contacts found")
    
    time.sleep(2)  # Rate limit

# Save results
output_file = 'enrichment-midmarket-march5-1206pm.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(enrichment_results, f, indent=2, ensure_ascii=False)

print(f"\n\n=== ENRICHMENT COMPLETE ===")
print(f"Enriched: {enriched_count}/15")
print(f"Results saved to: {output_file}")

if enrichment_results:
    print(f"\n=== SUMMARY ===")
    for r in enrichment_results:
        print(f"\nRow {r['row']}: {r['company']} (Score: {r['gumbo_score']})")
        print(f"  {r['contact_name']} - {r['title']}")
        print(f"  {r['email']}")
