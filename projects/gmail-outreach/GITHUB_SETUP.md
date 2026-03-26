# GitHub Setup Instructions

## Option 1: Create New GitHub Repo

1. Go to https://github.com/new
2. Name: `gumbo-pe-outreach` (or your preferred name)
3. Description: "Email blast automation for Hello Gumbo PE outreach"
4. **Keep it Private** (contains business logic)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

## Option 2: Push to Existing Repo

If you want to add to an existing repo, skip to step 3.

## Step 3: Push Local Code to GitHub

Run these commands from `projects/gmail-outreach/`:

```bash
# Add remote (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/gumbo-pe-outreach.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Verify

1. Visit your GitHub repo URL
2. Confirm all 9 files are present:
   - README.md
   - send.js
   - sheets.js
   - batch-emails-2026-03-12.js
   - get-sent-emails.js
   - create-tracking-sheet.js
   - create-uncontacted-sheet.js
   - package.json
   - .gitignore

3. **Confirm credentials ARE NOT visible:**
   - credentials.json should NOT be in repo
   - token.json should NOT be in repo
   - service-account.json should NOT be in repo

## Security Notes

✅ **Safe to commit:**
- All .js scripts (no hardcoded credentials)
- README.md
- package.json
- .gitignore

❌ **Never commit:**
- credentials.json (OAuth2 secrets)
- token.json (access tokens)
- service-account.json (service account key)
- .env files
- sent-emails.json (contains real email data)

These are blocked by .gitignore automatically.

## Sharing Access

To share with team members:
1. Go to repo Settings → Collaborators
2. Add: jeff@hellogumbo.com, alex@hellogumbo.com
3. Set permissions as needed

## Current Repo Status

```
✅ Git initialized
✅ 9 files committed
✅ Credentials excluded via .gitignore
⏳ Awaiting GitHub remote setup
```

**Ready to push!**
