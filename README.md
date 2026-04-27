# 🧠 Cognitive Load Tracker

A full-stack web app that estimates your cognitive workload based on browser interaction patterns — tab switching, typing activity, idle time, and context switching.

---

## Project Structure

```
cognitive-load-tracker/
├── backend/                  # Node.js + Express API
│   ├── server.js
│   ├── routes/
│   │   ├── activity.js       # POST /api/activity, GET /api/activity/:id
│   │   └── session.js        # GET /api/session/daily, /all
│   ├── models/
│   │   └── Session.js        # Mongoose schema
│   ├── utils/
│   │   └── scoreCalculator.js  # Scoring formula + recommendations
│   └── .env
└── frontend/                 # React + Vite + Tailwind CSS
    ├── src/
    │   ├── hooks/
    │   │   └── useActivityTracker.js  # Browser activity tracking
    │   ├── components/
    │   │   ├── ScoreDisplay.jsx       # Animated score ring
    │   │   ├── MetricsGrid.jsx        # 4-metric card grid
    │   │   ├── LoadChart.jsx          # Recharts line chart
    │   │   ├── Recommendations.jsx    # Smart suggestions
    │   │   ├── Notification.jsx       # High-load toast alert
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx          # Live dashboard
    │   │   └── DailySummary.jsx       # Daily stats + bar chart
    │   └── utils/
    │       └── sessionId.js
    └── index.html
```

---

## Setup & Running

### 1. Backend

```bash
cd backend
npm install
# Optional: set MONGO_URI in .env for persistence
npm run dev        # or: node server.js
# Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

> The frontend proxies `/api/*` to `localhost:5000` automatically via Vite config.

### 3. MongoDB (optional)

If you have MongoDB running locally, the app will persist session data automatically.  
Without it, the app works fully — scores are calculated in-memory and the Daily Summary shows demo data.

---

## Scoring Formula

```
Load Score = (App_Count × 2) + (Switches_Per_Min × 5) + (Typing_Interruptions × 3) + (Idle_Fluctuation × 2)
```

| Score | Level  | Color  |
|-------|--------|--------|
| 0–20  | Low    | 🟢 Green  |
| 21–50 | Medium | 🟡 Yellow |
| 51+   | High   | 🔴 Red    |

---

## What's Tracked (Browser-Only, Privacy-Friendly)

| Signal | Method |
|--------|--------|
| Tab switches | `visibilitychange` event |
| Typing activity | `keydown` event listener |
| Mouse movement | `mousemove` event |
| Idle detection | Timeout after 5s of no activity |
| App count | Simulated from tab switch frequency |

No sensitive data is collected. All tracking is behavioral and anonymous.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/activity` | Submit metrics, get score + recommendations |
| `GET` | `/api/activity/:sessionId` | Get session history |
| `GET` | `/api/session/daily` | Get today's summary |
| `GET` | `/api/health` | Health check |

### Sample POST body

```json
{
  "sessionId": "abc-123",
  "appCount": 6,
  "switchesPerMin": 4.5,
  "typingInterruptions": 3,
  "idleFluctuation": 2
}
```

### Sample response

```json
{
  "score": 47,
  "level": "Medium",
  "recommendations": [
    "Reduce tab switching to improve focus.",
    "Close unused tabs to reduce distractions."
  ],
  "timestamp": "2026-04-25T10:30:00.000Z"
}
```
