---
name: docker-ops
description: Runbooks and operational procedures for building, running, and debugging the Alpine Nginx Docker container for PulseNews.
---

# Docker Operations Skill — PulseNews

This skill outlines how to build, run, mount, and debug the containerized backend, PostgreSQL database, and frontend for PulseNews.

## 1. Quick Reference Commands

### Full-Stack Docker Compose (Backend + PostgreSQL)
Run both the Node.js backend container and PostgreSQL container together on a shared bridge network with persistent volume storage:
```powershell
# Build and start all containers in background
docker compose up -d --build

# Inspect logs from both containers
docker compose logs -f

# Check running containers & health status
docker compose ps

# Stop containers
docker compose down
```

### Standalone Backend & Database Containers
```powershell
# 1. Create bridge network
docker network create news-net

# 2. Run PostgreSQL container with persistent volume and schema
docker run -d --name news-postgres --network news-net -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=newsdb -v "${PWD}/db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" -v "pgdata:/var/lib/postgresql/data" -p 5433:5432 postgres:15-alpine

# 3. Build & Run Node.js Backend Container
docker build -t news-backend:latest -f Dockerfile.backend .
docker run -d --name news-backend --network news-net -p 3000:3000 -e PGHOST=news-postgres -e PGPASSWORD=postgres news-backend:latest
```

### Frontend Alpine Nginx Container (Optional Port 80 Proxy)
```powershell
docker build -t news-frontend:alpine .
docker run -d -p 80:80 --name news-container news-frontend:alpine
docker rm -f news-container
```

---

## 2. Architecture & Networking Details

1. **Host-to-Container Mapping:**
   - Host Port: `80` (Standard HTTP)
   - Container Port: `80` (Configured in `/etc/nginx/http.d/default.conf`)
2. **Reverse Proxying to Node.js Backend:**
   - Inside Nginx, all `/api/` traffic is reverse-proxied to `http://host.docker.internal:3000/api/`.
   - Node.js Express server must be running on host port `3000` via `npm start`.
3. **Error Interception:**
   - If the backend is down, Nginx intercepts 502/503/504 errors and returns a JSON payload (`{ "success": false, "error": "Backend API is offline..." }`) instead of standard Nginx HTML error pages. This prevents JSON parsing syntax errors in client `fetch()` calls.
4. **Development Cache Invalidation:**
   - `nginx.conf` sends `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` to ensure local browsers do not cache outdated JavaScript or CSS files during development.

---

## 3. Troubleshooting Runbook

| Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| `HTTP 502 Bad Gateway` on API calls | Backend Node.js server not running on port 3000 | Run `npm start` in the project root on the host machine. |
| Changes in `public/` not appearing | Container running static build without volume mount | Re-run with `-v "${PWD}\public:/news"`. |
| Port 80 conflict error on launch | Another service (IIS, Skype, or container) occupying port 80 | Run `netstat -ano \| findstr :80` to identify and stop conflicting process, or stop conflicting container via `docker rm -f`. |
| `host.docker.internal` unreachable | Docker Desktop network host bridge failure | Ensure Docker Desktop WSL2/Hyper-V integration is healthy and host firewall permits port 3000. |
