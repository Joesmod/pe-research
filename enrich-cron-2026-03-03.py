#!/usr/bin/env python3
"""
PE Research & Enrichment Cron Job
Enrich leads with missing contacts or generic emails
"""

import json
import codecs

# Read active targets (UTF-16 encoded)
with codecs.open('projects/gmail-outreach/active-targets.json', 'r', 'utf-16-le') as f:
    active_targets = json.load(f)

# Find leads needing enrichment
needs_enrichment = []
for target in active_targets:
    email = target.get('email', '').strip()
    
    # Check if needs enrichment
    if not email or email.startswith('info@') or email.startswith('ir@') or email.startswith('sales@'):
        needs_enrichment.append(target)

# Take first 15
needs_enrichment = needs_enrichment[:15]

print(f"Found {len(needs_enrichment)} leads needing enrichment:\n")
for i, lead in enumerate(needs_enrichment, 1):
    print(f"{i}. Row {lead.get('row')}: {lead.get('company')}")
    print(f"   Contact: {lead.get('contact', 'NONE')}")
    print(f"   Title: {lead.get('title', 'N/A')}")
    print(f"   Email: {lead.get('email', 'EMPTY')}")
    print(f"   Status: {lead.get('status', 'N/A')}")
    print(f"   Website: {lead.get('website', 'N/A')}")
    print()

# Save enrichment targets for further processing
with open('projects/gmail-outreach/enrichment-targets-2026-03-03-0536.json', 'w') as f:
    json.dump(needs_enrichment, f, indent=2)

print(f"\n✅ Saved {len(needs_enrichment)} targets to enrichment-targets-2026-03-03-0536.json")
