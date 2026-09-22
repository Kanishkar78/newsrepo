/**
 * Authentication Service
 * User registration, secure password hashing with crypto.scrypt, session management.
 * Persists users and sessions in PostgreSQL ('newsdb').
 */
const crypto = require('crypto');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let pool = null;

function getPool() {
  if (pool) return pool;

  const dbUrl = process.env.DATABASE_URL || '';
  const pwd = process.env.PGPASSWORD || '';

  if (pwd && pwd !== 'your_password_here') {
    pool = new Pool({
      user: process.env.PGUSER || 'postgres',
      password: pwd,
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT, 10) || 5432,
      database: process.env.PGDATABASE || 'newsdb',
      ssl: false
    });
    return pool;
  }

  if (dbUrl && dbUrl.startsWith('postgres') && !dbUrl.includes('your_password_here')) {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' || dbUrl.includes('neon.tech') ? { rejectUnauthorized: false } : false
    });
    return pool;
  }

  return null;
}

// In-memory fallback if database is temporarily disconnected
const memUsers = new Map();
const memSessions = new Map();

/**
 * Hash password securely using Node.js crypto.scryptSync with 16-byte random salt
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify password against stored salt:hash using timingSafeEqual
 */
function verifyPassword(password, storedHash) {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (_) {
    return false;
  }
}

/**
 * Generate 64-character cryptographically strong session token
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate that name contains only letters and spaces (strictly no numbers)
 */
function validateName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed || trimmed.length < 2) {
    return { valid: false, message: 'Please enter your full name (at least 2 characters).' };
  }
  if (/[0-9]/.test(trimmed)) {
    return { valid: false, message: 'Name cannot contain numbers. Please use letters only.' };
  }
  if (!/^[A-Za-z\s'\-\.]+$/.test(trimmed)) {
    return { valid: false, message: 'Name can only contain alphabetic letters and spaces.' };
  }
  return { valid: true, name: trimmed };
}

/**
 * Validate password meets security rules (>= 8 chars, uppercase, lowercase, number, special character)
 */
function validatePasswordSecurity(password) {
  const pwd = password || '';
  if (pwd.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(pwd)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(pwd)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(pwd)) {
    return { valid: false, message: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd)) {
    return { valid: false, message: 'Password must contain at least one special symbol (!@#$%^&* etc.).' };
  }
  return { valid: true };
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Register a new user
 */
async function registerUser({ name, email, password }) {
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    throw new Error(nameValidation.message);
  }
  const trimmedName = nameValidation.name;

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    throw new Error('Please provide a valid email address.');
  }

  const rawPassword = password || '';
  const pwdValidation = validatePasswordSecurity(rawPassword);
  if (!pwdValidation.valid) {
    throw new Error(pwdValidation.message);
  }

  const p = getPool();

  if (p) {
    // Check if email already exists
    const existing = await p.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      throw new Error('An account with this email address already exists. Please sign in.');
    }

    const passwordHash = hashPassword(rawPassword);

    const insertResult = await p.query(`
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at;
    `, [trimmedName, normalizedEmail, passwordHash]);

    const user = insertResult.rows[0];

    // Create session (expires in 30 days)
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await p.query(`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES ($1, $2, $3);
    `, [token, user.id, expiresAt]);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      }
    };
  }

  // Fallback in-memory
  if (memUsers.has(normalizedEmail)) {
    throw new Error('An account with this email address already exists. Please sign in.');
  }

  const passwordHash = hashPassword(rawPassword);
  const user = {
    id: memUsers.size + 1,
    name: trimmedName,
    email: normalizedEmail,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  };
  memUsers.set(normalizedEmail, user);

  const token = generateSessionToken();
  memSessions.set(token, {
    userId: user.id,
    user,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at }
  };
}

/**
 * Login user
 */
async function loginUser({ email, password }) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const rawPassword = password || '';

  if (!normalizedEmail || !rawPassword) {
    throw new Error('Please enter both email and password.');
  }

  const p = getPool();

  if (p) {
    const result = await p.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      throw new Error('Invalid email or password.');
    }

    const user = result.rows[0];
    const isValid = verifyPassword(rawPassword, user.password_hash);

    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    // Create new session token
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await p.query(`
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES ($1, $2, $3);
    `, [token, user.id, expiresAt]);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      }
    };
  }

  // Fallback in-memory
  const user = memUsers.get(normalizedEmail);
  if (!user || !verifyPassword(rawPassword, user.password_hash)) {
    throw new Error('Invalid email or password.');
  }

  const token = generateSessionToken();
  memSessions.set(token, {
    userId: user.id,
    user,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at }
  };
}

/**
 * Verify session token and retrieve current user
 */
async function getUserByToken(token) {
  if (!token || typeof token !== 'string') return null;

  const p = getPool();

  if (p) {
    try {
      const result = await p.query(`
        SELECT u.id, u.name, u.email, u.created_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP;
      `, [token.trim()]);

      if (result.rows.length > 0) {
        return result.rows[0];
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // Fallback in-memory
  const sess = memSessions.get(token.trim());
  if (sess && sess.expiresAt > Date.now()) {
    return sess.user;
  }
  return null;
}

/**
 * Logout session
 */
async function logoutSession(token) {
  if (!token) return true;

  const p = getPool();
  if (p) {
    try {
      await p.query('DELETE FROM sessions WHERE id = $1', [token.trim()]);
    } catch (_) {}
  }

  memSessions.delete(token.trim());
  return true;
}

module.exports = {
  registerUser,
  loginUser,
  getUserByToken,
  logoutSession,
  validateName,
  validatePasswordSecurity
};
