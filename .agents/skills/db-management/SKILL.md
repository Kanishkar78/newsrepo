---
name: db-management
description: Procedures and query patterns for managing, seeding, and troubleshooting the PostgreSQL database (newsdb) in PulseNews.
---

# Database Management Skill — PulseNews

This skill outlines how to maintain the PostgreSQL database schema, seed initial records, execute queries safely, and manage environment configuration.

## 1. Setup & Seeding

```powershell
# Setup table schemas (users, news, sessions)
npm run db:setup

# Seed 980+ multi-edition news articles across 7 categories
npm run db:seed
```

---

## 2. Environment Variables (`.env`)

The database connection is managed via `pg.Pool` in `db/index.js` reading from `.env`:
```env
PORT=3000
PGUSER=postgres
PGPASSWORD=your_password
PGHOST=localhost
PGPORT=5432
PGDATABASE=newsdb
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/newsdb
```

> [!CAUTION]
> Never commit `.env` to Git. Ensure `.env` is listed in `.gitignore` and `.dockerignore`.

---

## 3. Database Schema Overview

### Table: `news`
Stores live and archived news articles:
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR/TEXT NOT NULL)
- `description` (TEXT)
- `content` (TEXT)
- `image_url` (TEXT)
- `category` (VARCHAR(50): Sports, Politics, Technology, Business, Entertainment, Education)
- `edition` (VARCHAR(20): en-us, ta-in, ml-in, etc.)
- `source` (VARCHAR(100))
- `author` (VARCHAR(100))
- `published_at` (TIMESTAMP)
- `created_at` (TIMESTAMP DEFAULT NOW())

### Table: `users`
Stores authenticated user accounts:
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100) NOT NULL)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `password_hash` (TEXT NOT NULL)
- `created_at` (TIMESTAMP DEFAULT NOW())

### Table: `user_sessions`
Tracks active user session tokens:
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id) ON DELETE CASCADE)
- `token` (VARCHAR(255) UNIQUE NOT NULL)
- `created_at` (TIMESTAMP DEFAULT NOW())
- `expires_at` (TIMESTAMP)

---

## 4. Query & Security Rules

1. **Always Use Parameterized Placeholders:**
   Never concatenate SQL strings. Always use `$1, $2, ...` placeholders to prevent SQL injection.
   ```javascript
   // Correct:
   await pool.query('SELECT * FROM news WHERE category = $1 AND edition = $2', [category, edition]);
   
   // Forbidden:
   // await pool.query(`SELECT * FROM news WHERE category = '${category}'`);
   ```
2. **Password Cryptography:**
   Never store plain-text passwords. Use cryptographic hashing with salt in `services/authService.js`.
3. **Connection Pooling:**
   Always release clients back to the pool or use `pool.query()` directly.
