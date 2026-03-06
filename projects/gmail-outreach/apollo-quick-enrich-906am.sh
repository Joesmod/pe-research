#!/bin/bash
# Quick Apollo enrichment for remaining partial leads
# Run this in bash/WSL if PowerShell Node access is blocked

API_KEY="Fx6RpQS0PKxfVgnxWOPWuw"

echo "=== Apollo.io Quick Enrichment - March 5, 2026 9:06 AM ==="
echo

# Genstar Capital - search for Ryan Clark
echo "1. Enriching: Ryan Clark @ Genstar Capital"
curl -s -X POST "https://api.apollo.io/v1/people/match" \
  -H "Content-Type: application/json" \
  -H "Cache-Control: no-cache" \
  -H "X-Api-Key: ${API_KEY}" \
  -d '{
    "first_name": "Ryan",
    "last_name": "Clark",
    "organization_name": "Genstar Capital"
  }' | jq '.person | {name, title, email, email_status, linkedin_url}'

echo
echo "2. Enriching: Dave Finley @ Sverica Capital"
curl -s -X POST "https://api.apollo.io/v1/people/match" \
  -H "Content-Type: application/json" \
  -H "Cache-Control: no-cache" \
  -H "X-Api-Key: ${API_KEY}" \
  -d '{
    "first_name": "Dave",
    "last_name": "Finley",
    "organization_name": "Sverica Capital"
  }' | jq '.person | {name, title, email, email_status, linkedin_url}'

echo
echo "=== Enrichment Complete ==="
