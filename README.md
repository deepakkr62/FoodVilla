# 🍴 Food Villa

An elegant, full-stack food ordering platform inspired by Zomato. Built end-to-end by **[Deepak Kumar](https://github.com/deepakkr62)** as a real, deployable product — not a tutorial demo.

> Browse 125+ restaurants across 10 Indian cities · place orders with Stripe or COD · track them live via WebSockets · review when delivered.

---

## ✨ Highlights

| | |
|---|---|
| 🏪 **125+ restaurants** across 12 cuisines × 10 cities — fully seeded into Atlas | 🛒 **Cart that survives reloads** (Zustand + localStorage), with per-restaurant min-order enforcement |
| 🗺 **Geo-filtered discovery** — "Near me" uses browser geolocation + 2dsphere MongoDB index | 💳 **Stripe Checkout** in test mode, with a graceful fake-success fallback for keyless dev |
| 🔴 **Real-time order tracking** — Socket.io rooms per order + per restaurant | ⭐ **Reviews gated on delivery** — only completed orders can be reviewed; ratings auto-recalculate |
| 🧑‍🍳 **Restaurant owner dashboard** with live incoming orders + menu management | 🤖 **AI-style help chatbot** with a 14-entry knowledge base |
| 🔐 **JWT auth** (access + refresh) with role-based route guards | ✅ **150+ tests** (Jest, Supertest, React Testing Library, Playwright) |

---

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| **State** | Zustand (cart, auth) |
| **Backend** | Node.js 20, Express 4, TypeScript |
| **Database** | MongoDB Atlas (Mongoose) |
| **Real-time** | Socket.io |
| **Payments** | Stripe Checkout |
| **Auth** | JWT (access + refresh), bcrypt password hashing |
| **Testing** | Jest, Supertest, React Testing Library, Playwright, mongodb-memory-server |
| **CI/CD** | GitHub Actions |
| **Deploy** | Vercel (frontend) · Render (backend) · MongoDB Atlas (db) |

---

## 🚀 Quick start (5 minutes)

```powershell
# 1. Clone & install (uses npm workspaces — installs all three projects)
git clone https://github.com/deepakkr62/food-villa.git
cd food-villa
npm install

# 2. Copy env templates
cp .env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Run in dev mode (no MongoDB install needed — uses an in-memory DB)
npm run dev
```

Open **http://localhost:3000** — the app boots with **6 hand-curated + 119 procedurally generated restaurants** already seeded.

### Demo accounts (password is `demo1234` for all)

| Email | Role |
|---|---|
| `customer@demo.local` | Customer |
| `spice-villa@demo.local` | Restaurant owner |
| `sushi-spot@demo.local` | Restaurant owner |
| `royal-tandoor-pune@demo.local` | Restaurant owner |
| *(any seeded restaurant slug)*`@demo.local` | Restaurant owner |

---

## 📁 Project structure

```
food-villa/
├── backend/                    Express + Mongoose API
│   ├── src/
│   │   ├── controllers/        HTTP handlers
│   │   ├── models/             Mongoose schemas
│   │   ├── routes/             Express routers
│   │   ├── services/           tokenService, stripeService, socketService
│   │   ├── middleware/         auth, errorHandler
│   │   ├── seed/catalog.ts     Cuisine templates for the dev seed
│   │   ├── devSeed.ts          Seeds 125 restaurants into the DB
│   │   ├── app.ts              Express wiring
│   │   └── server.ts           HTTP + Socket.io bootstrap
│   └── src/__tests__/          75+ Jest tests
│
├── frontend/                   Next.js App Router
│   ├── src/
│   │   ├── app/                Route segments (login, restaurants, orders, owner, ...)
│   │   ├── components/         Shared UI (RestaurantCard, FilterPanel, ChatBot, ...)
│   │   ├── lib/                API clients, Zustand stores
│   │   └── hooks/              useOrderSocket, ...
│   └── src/__tests__/          60+ Jest + RTL tests
│
├── e2e/                        Playwright E2E tests
│   ├── playwright.config.ts
│   ├── homepage.spec.ts
│   ├── browse.spec.ts
│   └── order-flow.spec.ts
│
├── .github/workflows/ci.yml    GitHub Actions CI
├── render.yaml                 Render blueprint for backend deploy
├── vercel.json                 Vercel config for frontend deploy
└── docs/DEPLOY.md              Step-by-step production deployment guide
```

---

## 🛠 Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start backend (`:5000`) + frontend (`:3000`) in dev mode with HMR |
| `npm run build` | Production build for both |
| `npm run start` | Run production builds |
| `npm test` | Run all Jest tests (backend + frontend) — **150+ tests** |
| `npm run e2e` | Run Playwright E2E tests (auto-starts the servers) |
| `npm run e2e:ui` | Run Playwright in UI mode for debugging |
| `npm run lint` | ESLint both projects |

---

## 🔐 Environment variables

### Backend (`backend/.env`)

| Var | Required | Default | Purpose |
|---|---|---|---|
| `USE_MEMORY_DB` | yes | `1` | `1` = in-memory MongoDB with seed data, `0` = use `MONGODB_URI` |
| `MONGODB_URI` | when `USE_MEMORY_DB=0` | — | Atlas connection string |
| `JWT_ACCESS_SECRET` | yes | dev placeholder | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | yes | dev placeholder | Signs refresh tokens (must differ) |
| `STRIPE_SECRET_KEY` | optional | placeholder → uses fake fallback | Real `sk_test_...` from Stripe |
| `STRIPE_WEBHOOK_SECRET` | optional | placeholder | `whsec_...` from Stripe CLI |
| `FRONTEND_URL` | yes | `http://localhost:3000` | CORS + Stripe redirect target |

### Frontend (`frontend/.env.local`)

| Var | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Where the browser calls the API |
| `NEXT_PUBLIC_SOCKET_URL` | yes | WebSocket URL (usually same as API URL) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | optional | Real `pk_test_...` from Stripe |

Generate strong JWT secrets:
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 🌐 Deployment

The app is one `git push` away from a live deployment. See **[docs/DEPLOY.md](./docs/DEPLOY.md)** for the full guide. TL;DR:

1. Push the repo to GitHub
2. Connect **Vercel** to `/frontend` → set env vars → deploy
3. Connect **Render** to `/backend` (use `render.yaml`) → set env vars → deploy
4. Set `MONGODB_URI` in Render to your Atlas connection string
5. Set `NEXT_PUBLIC_API_URL` in Vercel to your Render URL
6. Done — first deploy takes ~5 minutes

---

## 🧪 Testing

| Layer | Tool | Count |
|---|---|---|
| Backend API + DB | Jest + Supertest + mongodb-memory-server | 75+ |
| Frontend components + stores | Jest + React Testing Library | 64+ |
| Critical user journeys | Playwright | 8+ |

```powershell
npm test           # Run all unit tests (backend + frontend)
npm run e2e        # Run Playwright tests in headless mode
npm run e2e:ui     # Interactive Playwright UI for debugging
```

---

## 🗺 Roadmap

### ✅ Phase 1 — shipped
Customer + Restaurant Owner roles, full ordering lifecycle, payments, live tracking, reviews.

### 🛠 Phase 2 — planned
- Admin role: approval workflow, analytics, dispute resolution
- Delivery Partner role: job board, live GPS tracking
- Refunds & disputes UI
- Password reset email flow
- Promo code engine (the `/offers` page is currently static)
- Real Cloudinary file uploads (currently URL inputs)

---

## 👤 About the developer

**Deepak Kumar** — Full-stack Developer

- 📧 [deepakkr220399@gmail.com](mailto:deepakkr220399@gmail.com)
- 🐙 [@deepakkr62](https://github.com/deepakkr62)
- 💼 [Deepak Kumar on LinkedIn](https://www.linkedin.com/in/kumardeepak1999/)

A one-person team that built every layer of Food Villa — the Mongoose schemas, JWT auth, Socket.io rooms, Next.js routes, Tailwind theme, Playwright tests. The goal: ship a real product worth using, not a tutorial demo.

---

## 📄 License

MIT.

> Hungry? Open the app and order something. 🍴
