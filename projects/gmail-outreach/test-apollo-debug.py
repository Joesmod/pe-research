import json
import requests

# Apollo API Key
APOLLO_API_KEY = "Fx6RpQS0PKxfVgnxWOPWuw"

# Test with one company
company = "Genstar Capital"

headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "X-Api-Key": APOLLO_API_KEY
}

# Simple search
payload = {
    "q_organization_name": company,
    "page": 1,
    "per_page": 10
}

print(f"Searching Apollo for: {company}")
print(f"Payload: {json.dumps(payload, indent=2)}")

response = requests.post(
    "https://api.apollo.io/api/v1/mixed_people/api_search",
    headers=headers,
    json=payload
)

print(f"\nStatus: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
