# FitDeck — All-in-One Fitness Platform

> Trained by Anmol Gupta

A full-stack React fitness management platform for gyms, trainers, and clients.

---

## Quick Start

### Frontend (React + Vite + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

Runs at **http://localhost:5173**

### Demo Accounts (click quick login on the login page)

| Role | Email | What you see |
|------|-------|-------------|
| Gym Admin | admin@fitdeck.app | Full gym overview, trainers, clients, attendance, billing |
| Trainer | trainer@fitdeck.app | Client management, attendance marking, workout plans |
| Client | ankit@example.com | Dashboard, food log, body tracker, steps, workout plan |

---

### Backend (Node + Express + Prisma + PostgreSQL)

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL in .env

npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Runs at **http://localhost:4000**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Tailwind CSS v3, Plus Jakarta Sans |
| State | Zustand (persisted), React Hot Toast |
| Charts | Recharts |
| HTTP | Axios |
| Backend | Node.js, Express |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT (Bearer token) |
| Realtime | Socket.io |

---

## Features Built (Phase 1 + 2)

### Gym Admin
- [x] Gym registration (3-step onboarding)
- [x] Dashboard with attendance chart + revenue stats
- [x] Trainer management + email invite
- [x] Client master list with search, filter, CSV export
- [x] Attendance reports (14-day calendar view)
- [x] Follow-up centre (auto-flagged alerts)
- [x] Billing & subscription management

### Trainer
- [x] Dashboard with today's attendance summary
- [x] My Clients list with streak and goal data
- [x] Client profile view (body chart, macros, insights, notes)
- [x] Mark attendance (present/absent, bulk actions)
- [x] Workout plan library + create/assign plans

### Client (End User)
- [x] 3-step onboarding (account → body profile → goal)
- [x] Home dashboard (calorie ring, steps, workout, streak)
- [x] Food logger (search DB, add items, macro breakdown, junk vs healthy chart)
- [x] Body tracker (weight chart, measurements, history)
- [x] Steps & achievements (streak, badges, bar chart)
- [x] My Workout Plan (day-by-day, mark exercises done)
- [x] Food Explorer (browse by category, goal tags, macro calculator)
- [x] Weekly Analysis (5 insight cards with scores)
- [x] Consult Trainer — 1:1 chat (Premium)
- [x] Medical Plan — condition-specific guidance (Premium)

---

## Project Structure

```
gym/
├── frontend/           # React + Vite app
│   └── src/
│       ├── api/        # Axios instance + mock data
│       ├── components/ # Layout, UI primitives, Charts
│       ├── pages/      # admin/, trainer/, client/, auth/
│       ├── store/      # Zustand stores
│       └── utils/      # cn(), format helpers
└── backend/            # Express API
    ├── prisma/         # Schema + migrations
    └── src/
        ├── controllers/
        ├── middleware/ # JWT auth, role guards
        └── routes/     # All API routes
```

---

## Subscription Tiers

| Feature | Core | Premium |
|---------|------|---------|
| Macro & food logging | ✓ | ✓ |
| Body tracker | ✓ | ✓ |
| Steps & achievements | ✓ | ✓ |
| Workout plan | ✓ | ✓ |
| Food explorer | ✓ | ✓ |
| Weekly analysis | ✓ | ✓ |
| 1:1 Chat with trainer | — | ✓ |
| Voice calls | — | ✓ |
| Medical condition plan | — | ✓ |
| Trainer check-in calls | — | ✓ |

---

*FitDeck v1.0 · Trained by Anmol Gupta*
