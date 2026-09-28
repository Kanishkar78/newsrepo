# PulseNews — Historical Project Memory & Architecture Decision Records (ADRs)

This document records key decisions, resolved challenges, root causes, and architectural invariants discovered during the development of PulseNews. Any AI or human developer working on this codebase should consult these records to avoid repeating known issues.

---

## ADR 1: Trackpad Horizontal Swipe Triggering Browser History Navigation
- **Context:** Users swiping with two fingers horizontally on laptop mousepads/touchpads inadvertently triggered Chrome/Edge browser back/forward navigation.
- **Root Cause:** By default, Chromium interprets horizontal overscroll on the root document as a gesture to navigate history.
- **Decision & Fix:**
  - Applied CSS `overscroll-behavior-x: none`, `overscroll-behavior: none`, and `touch-action: pan-y pinch-zoom` to `html, body`.
  - Added non-passive `wheel` and `touchmove` listeners in `public/js/theme.js` to inspect `deltaX` vs `deltaY` and call `e.preventDefault()` for any horizontal gesture occurring outside elements with legitimate horizontal scroll (`overflow-x: auto/scroll` and `scrollWidth > clientWidth`).

---

## ADR 2: Chromium History Manipulation Intervention & Session-Kill on Back
- **Context:** User requested that clicking the browser Back button while on the Dashboard must terminate the user's session instead of navigating back to Login with an active session.
- **Challenge:** Chromium has a built-in "History Manipulation Intervention" that skips script-added `history.pushState()` entries if they were created without a user gesture on that page. Simply pushing state on page load can be skipped by Chrome when the user clicks Back.
- **Decision & Fix:**
  - Implemented defense-in-depth:
    1. In `public/index.html`: `popstate` listener immediately purges `pulsenews_token` and `pulsenews_user`, sends `/api/auth/logout` via `keepalive: true`, and navigates to `/login?reason=session_killed`.
    2. In `public/login.html`: Any arrival on the login page while a token is present in `localStorage` (via back navigation or bfcache `pageshow`) is treated as a session exit; the token is immediately purged and a session terminated notice is shown.
    3. Forward navigation back into the Dashboard is blocked because `index.html` requires a valid token.

---

## ADR 3: Pagination Viewport Overflow on 165+ Pages
- **Context:** Database contains 980+ news articles. With 6 articles per page, `totalPages` exceeds 165. The original code used a raw loop `for (let i = 1; i <= totalPages; i++)`, generating 165 buttons that stretched ~7,500px off-screen horizontally.
- **Decision & Fix:**
  - Replaced raw loop in `public/js/ui.js` with smart sliding-window pagination and ellipsis (`...`):
    - Page 1 to 4: `[Prev] 1 2 3 4 5 ... 165 [Next]`
    - Middle pages: `[Prev] 1 ... 19 20 21 ... 165 [Next]`
    - Near end: `[Prev] 1 ... 161 162 163 164 165 [Next]`
  - Added `window.scrollTo({ top: 0, behavior: 'smooth' })` on page change.
  - Added CSS `flex-wrap: wrap` to `.pagination`.

---

## ADR 4: Docker Live Volume Mounting vs Static Image Layers
- **Context:** When running the Alpine + Nginx container using `COPY public/ /news/`, code changes made in the workspace were not reflected on the site without rebuilding the Docker image.
- **Decision & Fix:**
  - In development, always run container with live host volume mount:
    `docker run -d -p 80:80 -v "${PWD}\public:/news" --name news-container news-frontend:alpine`
  - Added no-cache headers in `nginx.conf`:
    `expires -1; add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;`
  - This guarantees that local edits appear immediately upon browser refresh.

---

## ADR 5: Nginx 502 HTML Errors Breaking JSON Fetch Calls
- **Context:** When the Node.js backend server was not running on port 3000, Nginx returned an HTML error page (`<!DOCTYPE html>... 502 Bad Gateway`). Client-side JavaScript calling `await response.json()` threw `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.
- **Decision & Fix:**
  - In `nginx.conf`, added `proxy_intercept_errors on` and error page routing `@api_gateway_error` to return valid JSON `{ "success": false, "error": "Backend API is offline..." }`.
  - In `public/js/auth.js`, wrapped `response.json()` calls in try/catch blocks with friendly fallback error messages.
