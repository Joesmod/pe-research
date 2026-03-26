# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

### Apollo (People Search / Prospecting)
- API Key: Fx6RpQS0PKxfVgnxWOPWuw
- Docs: https://apolloio.github.io/apollo-api-docs/
- Use for: PE contact prospecting (titles, firms, verified emails)

### Gmail

- Email: jim@hellogumbo.com
- Project: `projects/gmail-outreach/`
- Send: `node send.js send <to> <subject> <body>`
- Inbox: `node send.js inbox [count]`
- Auth: OAuth2 via credentials.json + token.json
- Status: ✅ Working (verified 2026-02-17)
- **From name**: "Jim from Gumbo" (set in send.js From header)
- **ALWAYS send full body** — never send stub/placeholder text
- **Send as HTML** — send.js now converts to HTML automatically. Plain text \n breaks cause Gmail to insert hard line breaks mid-paragraph. The fix: Content-Type text/html, paragraphs joined with `<br><br>`, no mid-paragraph breaks.
- **Straight quotes and regular dashes only** — no smart quotes or em dashes
- **Double-check recipient addresses** before sending
- **When resending**: include the complete email body, not a reference to a previous send

### CRM Auto-Logging

- After every send: `node auto-log.js log "<company>" "<contact>" "<email>" "<subject>"`
- Sync all from tracker: `node auto-log.js sync`
- Check for replies: `node auto-log.js check`
- Update reply status: `node auto-log.js reply <email> <status>`
- Logs to "Outreach Log" sheet in CRM spreadsheet
- Columns: Date, Company, Position/Title, Contact, Email, Subject, Status, Notes

---

Add whatever helps you do your job. This is your cheat sheet.
