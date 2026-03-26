# 📋 Task Board

Minimal Trello-style task board. Dark theme, drag-and-drop, shared & server-backed.

## Run Locally

```bash
npm install
npm start
# → http://localhost:3000
```

Data persists to `data.json`. All users share the same board. The app polls every 5 seconds for real-time sync.

## Deploy to Render.com (Free Tier)

### One-Click (Blueprint)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
3. Connect your repo — Render reads `render.yaml` and deploys automatically

### Manual

1. **New** → **Web Service** → connect your repo
2. **Build Command:** `npm install`
3. **Start Command:** `node server.js`
4. Render sets `PORT` automatically — the server uses it

### Docker

```bash
docker build -t taskboard .
docker run -p 3000:3000 taskboard
```

> **Note:** Render free tier disk is ephemeral — `data.json` resets on redeploy. For persistent data, use a database or Render's persistent disk ($0.25/GB/mo).

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cards` | Get all cards |
| PUT | `/api/cards` | Replace all cards |
| POST | `/api/cards` | Add a single card |
| PATCH | `/api/cards/:id` | Update a card |
| DELETE | `/api/cards/:id` | Delete a card |

## Keyboard Shortcuts

- **N** — New card
- **Esc** — Close modal
