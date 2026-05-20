# MiDAS AI Research Pipeline — Deployment Guide

## What this is
A live interactive demo of the MiDAS AI Research Pipeline. Type any defence/security topic → the AI generates a real policy brief, executive summary, key findings, dashboard, social posts, and Bahasa Malaysia version — all simultaneously, in front of you.

---

## Prerequisites
You need two things:
1. **Node.js** (free) — download at https://nodejs.org (choose "LTS" version)
2. **An Anthropic API key** — get one at https://console.anthropic.com (requires account + billing, ~$0.05 per demo run)

---

## Run locally (on your own laptop)

**Step 1** — Open Terminal (Mac) or Command Prompt (Windows)

**Step 2** — Navigate to this folder:
```
cd path/to/midas-pipeline
```

**Step 3** — Install dependencies (one time only):
```
npm install
```

**Step 4** — Run the server with your API key:

Mac/Linux:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here node server.js
```

Windows Command Prompt:
```
set ANTHROPIC_API_KEY=sk-ant-your-key-here && node server.js
```

Windows PowerShell:
```
$env:ANTHROPIC_API_KEY="sk-ant-your-key-here"; node server.js
```

**Step 5** — Open your browser and go to:
```
http://localhost:3000
```

That's it. The demo is running.

---

## Deploy to Railway (recommended — free tier, shareable URL)

Railway gives you a live URL you can send to anyone. Free tier is sufficient.

**Step 1** — Push this folder to a GitHub repository
- Go to github.com → New repository → name it `midas-pipeline`
- Upload all files from this folder (server.js, package.json, public/ folder)

**Step 2** — Sign up at railway.app (free, use GitHub login)

**Step 3** — In Railway: click "New Project" → "Deploy from GitHub repo" → select your repo

**Step 4** — Add your API key as an environment variable:
- In Railway project → "Variables" tab
- Add: `ANTHROPIC_API_KEY` = `sk-ant-your-key-here`

**Step 5** — Railway deploys automatically. Your live URL appears in the project dashboard.
- Example: `https://midas-pipeline-production.up.railway.app`

**Cost:** Railway free tier = $5 credit per month. Each demo run costs ~$0.05 in API costs. Hosting itself is free for low-traffic apps.

---

## Deploy to Render (alternative — also free)

**Step 1** — Push to GitHub (same as Railway step 1)

**Step 2** — Sign up at render.com (free)

**Step 3** — New Web Service → Connect GitHub repo → select your repo

**Step 4** — Settings:
- Build Command: `npm install`
- Start Command: `node server.js`
- Environment: Add `ANTHROPIC_API_KEY` = your key

**Step 5** — Click Deploy. Your URL appears when it's live.

**Note:** Render free tier spins down after 15 minutes of inactivity. First visit after inactivity takes ~30 seconds to wake up. Upgrade to paid ($7/month) if this is a problem.

---

## Troubleshooting

**"Cannot find module 'express'"** → Run `npm install` first

**"ANTHROPIC_API_KEY is not set"** → You didn't set the environment variable. See Step 4 above.

**"Invalid API key"** → Check your key at console.anthropic.com. Keys start with `sk-ant-`

**Demo takes too long** → Normal. The AI generates real content. Usually 20-40 seconds.

**Port already in use** → Change the port: `PORT=4000 node server.js` then go to localhost:4000

---

## File structure
```
midas-pipeline/
├── server.js          ← Node.js backend (handles API calls)
├── package.json       ← Dependencies
├── public/
│   └── index.html     ← Complete frontend
└── README.md          ← This file
```

---

*A Mahat Advisory initiative · mahatadvisory.com*
