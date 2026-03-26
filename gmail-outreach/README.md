# Gmail Outreach Tool

Send outreach emails via Gmail API for sales/BD.

## Setup (5 min)

1. **Google Cloud Console** → https://console.cloud.google.com
   - Create or select a project
   - Enable **Gmail API** (APIs & Services → Library → search "Gmail API")

2. **Create OAuth Credentials**
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Desktop app**
   - Download JSON → save as `credentials.json` in this folder

3. **Authorize**
   ```bash
   node auth.js
   ```
   Opens a browser URL — sign in with the Gmail account you want to send from. One-time setup.

## Usage

```bash
# Send an email
node index.js send --to "prospect@company.com" --subject "Quick question" --body "<p>Hi there...</p>"

# List recent emails
node index.js list

# Search emails
node index.js list "from:someone@gmail.com"
```

## Files

- `credentials.json` — OAuth client credentials (from Google Cloud Console)
- `token.json` — Generated after auth, contains access/refresh tokens
- `index.js` — Main tool (send/list)
- `auth.js` — One-time auth flow

## Security

- `credentials.json` and `token.json` are gitignored
- Never share these files
