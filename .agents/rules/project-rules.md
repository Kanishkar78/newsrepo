# PulseNews — Workspace Project Rules

## Development Rules for AI Agents

1. **Frontend Stack:**
   - Use React 19 + Vite in `client/` with React Router.
   - Use custom Vanilla CSS design system tokens in `client/src/index.css`.

2. **Docker & Container Environment:**
   - Multi-stage Dockerfile: Node.js builds React client (`npm run build`) -> Nginx on Alpine serves `/news`.
   - In development, mount the `client/dist` directory via `-v "${PWD}\client\dist:/news"` to preserve live updates without image rebuilds.
   - Container port 80 maps to host port 80.
   - Nginx handles `/api/` proxying to `http://host.docker.internal:3000/api/` and SPA clean routes with `try_files $uri $uri/ /index.html`.

3. **Navigation & Session Invariants:**
   - Mousepad / trackpad horizontal two-finger swiping must remain disabled using both `overscroll-behavior: none` and JS non-passive wheel/touch listeners in `ThemeContext.jsx`.
   - On the Dashboard, clicking the browser Back button MUST terminate the user session immediately (purge `localStorage`, revoke backend session, and redirect to `/login?reason=session_killed`).
   - If an authenticated user lands on `/login`, their session must be purged immediately to avoid stale session loops.

4. **Pagination:**
   - Always use sliding window pagination with ellipsis (`...`) in `client/src/components/Pagination.jsx`. Never render raw unconstrained loops of page buttons.

5. **Security:**
   - Parameterized SQL queries only (`$1, $2`).
   - Never expose database credentials in client-side code.
