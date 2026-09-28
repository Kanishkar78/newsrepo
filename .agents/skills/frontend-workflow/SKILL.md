---
name: frontend-workflow
description: Guidelines, UX rules, gesture constraints, and state management procedures for developing PulseNews frontend.
---

# Frontend Workflow Skill — PulseNews

This skill outlines guidelines for modifying and extending the Vanilla JavaScript frontend in `public/`.

## 1. Architectural Principles

- **Pure Vanilla Stack:** HTML5, modern Vanilla CSS, ES6+ JavaScript. No React, Vue, Svelte, or Tailwind.
- **Design Tokens:** Defined in `:root` and `[data-theme="light"]` in `public/css/style.css`.
- **Modular Controller Pattern:**
  - `auth.js`: Handles session tokens, login, signup, and header user avatar rendering.
  - `api.js`: Decoupled API calls to `/api/news`, `/api/translate`, `/api/editions`.
  - `main.js`: Dashboard orchestration, category filters, search debounce, date pickers.
  - `article.js`: Full article view, native language toggle, text-to-speech, read time.
  - `theme.js`: Dark/Light theme toggle, OS preference listeners, trackpad gesture protection.
  - `ui.js`: DOM rendering, card creation, skeleton loaders, sliding pagination.

---

## 2. Invariant Rules & Procedures

### A. Trackpad / Mousepad Horizontal Swipe Navigation Protection
- **Rule:** Horizontal two-finger swiping on touchpads/mousepads must NEVER trigger browser history back/forward navigation.
- **Implementation:**
  - CSS: `html, body { overscroll-behavior-x: none; overscroll-behavior: none; touch-action: pan-y pinch-zoom; }`
  - JS (`theme.js`): Non-passive `wheel` and `touchmove` listeners that call `e.preventDefault()` for horizontal gestures unless the element legitimately scrolls horizontally (e.g. `.category-nav`).

### B. Session-Kill on Dashboard Back Navigation
- **Rule:** When an authenticated user is on the Dashboard (`/`), clicking the browser Back button MUST terminate the session immediately.
- **Implementation:**
  - `index.html`: Registers `popstate` listener that clears `localStorage` tokens, calls `/api/auth/logout`, and redirects to `/login?reason=session_killed`.
  - `login.html`: On arrival, checks if a token exists or if `event.persisted` in `pageshow` is set. If so, immediately wipes `localStorage` and shows session terminated alert.

### C. Sliding-Window Pagination
- **Rule:** Never render an unconstrained loop of all page buttons.
- **Implementation (`ui.js`):**
  - Displays sliding window: `[Prev] 1 2 3 4 5 ... 165 [Next]` or `[Prev] 1 ... 19 20 21 ... 165 [Next]`.
  - Smoothly scrolls to the top of the feed (`window.scrollTo({ top: 0, behavior: 'smooth' })`) on page change.

---

## 3. Adding New Categories or Regional Editions

1. **New News Category:**
   - Add button to `.category-nav` in `public/index.html`.
   - Add accent color variable to `public/css/style.css` (e.g. `--category-science: #06b6d4;`).
   - Add category badge style mapping in `public/js/ui.js`.
2. **New Regional Edition:**
   - Register in `EDITIONS` dictionary in `db/index.js`.
   - Add `<option>` to `#edition-select` in `public/index.html`.
