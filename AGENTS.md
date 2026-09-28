# PulseNews — Master Agent Development Guidelines (`AGENTS.md`)

This document defines the complete architecture, behavioral rules, skills runbooks, and historical memory for AI agents (and human developers) operating on the **PulseNews (Daily News Reader)** repository.

---

## 1. Project Overview & Tech Stack

PulseNews is a full-stack, responsive, multilingual news-reading web application.

- **Frontend:** React 19 + Vite (`client/`), React Router (`react-router-dom`), Vanilla CSS3 Design System with CSS variables and responsive glassmorphism.
- **Backend API:** Node.js with Express (`server.js`).
- **Database:** PostgreSQL (`newsdb`), managed with the `pg` client library.
- **Containerization:** Multi-stage Dockerfile (Node.js builds React with Vite -> Alpine Linux + Nginx serves from `/news` on port 80, reverse-proxying `/api/` to host port 3000).
- **Hosting / Deploy Target:** Docker Desktop locally, Vercel compatible (`vercel.json`).

---

## 2. Repository Layout

```
NewsReader/
├── AGENTS.md                  # Universal agent instruction & knowledge file
├── Dockerfile                 # Multi-stage Docker build (Vite React + Alpine Nginx)
├── nginx.conf                 # Nginx reverse proxy, SPA fallback & dev no-cache
├── .dockerignore              # Docker build exclusions
├── .env                       # Environment variables (DB credentials, PORT)
├── package.json               # Root scripts (start, dev, client:dev, client:build)
├── server.js                  # Express API server & static fallback
├── client/                    # React 19 + Vite Frontend Application
│   ├── index.html             # Vite entry HTML (Google Fonts & theme initialization)
│   ├── package.json           # React dependencies (react, react-dom, react-router-dom)
│   ├── vite.config.js         # Vite configuration with /api proxy to localhost:3000
│   └── src/
│       ├── main.jsx           # React root mount
│       ├── App.jsx            # Router configuration (Dashboard, Login, Article)
│       ├── index.css          # Master design system (Dark/Light mode tokens & styles)
│       ├── context/
│       │   ├── AuthContext.jsx   # Authentication state, sessions & session-kill logic
│       │   └── ThemeContext.jsx  # Dark/Light theme & trackpad gesture protection
│       ├── services/
│       │   └── api.js            # News, translation & edition API client
│       ├── components/
│       │   ├── Header.jsx        # Brand logo, edition selector, search & user menu
│       │   ├── CategoryNav.jsx   # Category filter pills
│       │   ├── NewsCard.jsx      # Card with 1-click English translation
│       │   ├── Pagination.jsx    # Smart sliding-window pagination with ellipsis
│       │   ├── SkeletonCard.jsx  # Loading state skeleton
│       │   ├── EmptyState.jsx    # Empty search/filter state
│       │   ├── ErrorState.jsx    # Error recovery state
│       │   └── Footer.jsx        # Footer component
│       └── pages/
│           ├── DashboardPage.jsx     # Main feed with Back-button session termination
│           ├── LoginPage.jsx         # Sign in & Sign up with password strength meter
│           └── ArticleDetailPage.jsx # Deep reading view with text-to-speech & translation
├── .agents/                   # Customization Root for Agent Systems
│   ├── rules/
│   │   └── project-rules.md   # Enforced coding and architecture constraints
│   ├── skills/
│   │   ├── docker-ops/        # Container management runbook (SKILL.md)
│   │   ├── db-management/     # PostgreSQL queries and seeding runbook (SKILL.md)
│   │   └── frontend-workflow/ # React UI controllers, gestures & pagination (SKILL.md)
│   └── memory/
│       └── project-memory.md  # Architectural Decision Records (ADRs) & past gotchas
├── db/
│   ├── index.js               # PostgreSQL connection pool & queries
│   ├── setup.js               # Database table schemas
│   └── seed.js                # Initial seed data
└── services/
    └── authService.js         # User registration, authentication & tokens
```

---

## 3. Core Architectural Rules & Invariants

### 3.1 Frontend Philosophy
- **Stack:** React 19 with functional components, hooks, Context API, and React Router.
- **Styling:** Custom Vanilla CSS Design System with tokens in `:root` and `[data-theme="light"]` in `client/src/index.css`.
- **Typography:** Modern Google Fonts (`Outfit` for headings, `Inter` for body text).

### 3.2 Trackpad & Gesture Protection
- Mousepad / trackpad horizontal two-finger swiping must **never** trigger browser history back/forward navigation.
- **Enforcement:**
  - CSS: `overscroll-behavior-x: none`, `overscroll-behavior: none`, and `touch-action: pan-y pinch-zoom` on `html, body`.
  - JS (`client/src/context/ThemeContext.jsx`): Non-passive `wheel` and `touchmove` listeners that block horizontal swipe navigation outside of legitimately scrollable elements (e.g., category navigation pills).

### 3.3 Authentication & Session Lifecycle
- Authenticated state is driven by `pulsenews_token` and `pulsenews_user` in `localStorage`, managed globally via `AuthContext`.
- **Session-Kill on Dashboard Back Navigation:**
  - When an authenticated user is on the Dashboard (`/`), clicking the browser Back button must **kill the session immediately** (clear `localStorage`, revoke backend session token via `/api/auth/logout`, and redirect to `/login?reason=session_killed`).
  - Navigating back to `/login` must never preserve an active session. `LoginPage.jsx` immediately purges any stale session tokens upon arrival.
- **Explicit Logout:**
  - Clicking **Sign Out** calls `logout()`, clears session tokens, and navigates to `/login`.

### 3.4 Pagination Behavior
- Articles use a smart **sliding-window pagination with ellipsis (`...`)** in `client/src/components/Pagination.jsx`.
- Never render all page buttons in a raw loop (the database contains 165+ pages; rendering all buttons overflows the viewport).
- Clicking any page button must smoothly scroll back to the top of the feed (`window.scrollTo({ top: 0, behavior: 'smooth' })`).

---

## 4. Skills & Operational Procedures

### Skill: Docker Operations
- **Full-Stack Docker Compose (Backend + PostgreSQL Container)**:
  ```powershell
  # Start both containers (builds React + Node.js backend & mounts PostgreSQL)
  docker compose up -d --build

  # View real-time logs
  docker compose logs -f

  # Stop containers
  docker compose down
  ```
- **Run Frontend Nginx container with live volume mount** (edits in `client/dist` reflect immediately):
  ```powershell
  docker run -d -p 80:80 -v "${PWD}\client\dist:/news" --name news-container news-frontend:alpine
  ```
- **Rebuild Frontend Nginx image**:
  ```powershell
  docker build -t news-frontend:alpine .
  ```
- **Nginx Architecture**:
  - Exposes port 80.
  - Proxies `/api/` to `http://host.docker.internal:3000/api/` (or `backend:3000/api/`).
  - Serves React SPA with `try_files $uri $uri/ /index.html`.
  - Intercepts 502/503/504 errors and converts them to JSON format.
  - Disables client caching with `Cache-Control: no-store` headers during development.

### Skill: Database Management (PostgreSQL `newsdb`)
- **Initialize tables**: `npm run db:setup`
- **Seed initial articles**: `npm run db:seed`
- **Parameterized queries only**: Always use `$1, $2` parameters in `db/index.js` to guard against SQL injection.
- **Credentials safety**: Credentials live in `.env` and must never be committed to Git or exposed in client bundles.

---

## 5. Development Commands Cheatsheet

### Node.js Backend Server (Host Native)
```powershell
# Start backend server on port 3000
npm start
```

### React Frontend (Vite Dev Server with Proxy)
```powershell
# Start Vite development server with hot-module replacement on port 5173
npm run client:dev

# Build production bundle into client/dist/
npm run client:build
```

### Containerized Environment (Docker Compose)
```powershell
# Start PostgreSQL & Backend containers on ports 5433 & 3000
docker compose up -d --build

# Access in browser:
# http://localhost:3000
```
