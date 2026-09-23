const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { getNews, getNewsById, getDbStatus, clearLiveCache, translateText, translateBatch, EDITIONS } = require('./db');
const { registerUser, loginUser, getUserByToken, logoutSession } = require('./services/authService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Helper to extract bearer token from headers
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.headers['x-auth-token']) {
    return req.headers['x-auth-token'].trim();
  }
  return null;
}

// ----------------------------------------------------------------------------
// Authentication API Endpoints
// ----------------------------------------------------------------------------

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser({ name, email, password });
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      ...result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Registration failed'
    });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.json({
      success: true,
      message: 'Signed in successfully',
      ...result
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message || 'Login failed'
    });
  }
});

// Get current authenticated user profile
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No token provided'
      });
    }
    const user = await getUserByToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired session'
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to verify session'
    });
  }
});

// Logout user (revoke session)
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = extractToken(req);
    if (token) {
      await logoutSession(token);
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// Database Health & Status endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await getDbStatus();
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

app.get('/api/db-status', async (req, res) => {
  const dbStatus = await getDbStatus();
  res.json(dbStatus);
});

// Available Regional Editions API
app.get('/api/editions', (req, res) => {
  res.json({
    success: true,
    editions: Object.values(EDITIONS)
  });
});

// Translation API endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, texts, target = 'en' } = req.body;

    if (texts && Array.isArray(texts)) {
      const translations = await translateBatch(texts, target);
      return res.json({
        success: true,
        translations
      });
    }

    if (texts && typeof texts === 'object') {
      const translations = await translateBatch(texts, target);
      return res.json({
        success: true,
        translations
      });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Missing text or texts to translate'
      });
    }

    const translation = await translateText(text, target);
    res.json({
      success: true,
      translation
    });
  } catch (err) {
    console.error('Translation endpoint error:', err);
    res.status(500).json({
      success: false,
      error: 'Translation failed'
    });
  }
});

// API Routes
app.get('/api/news', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10, refresh, edition = 'en-us', date } = req.query;
    const forceRefresh = refresh === 'true' || refresh === '1';
    const result = await getNews({ category, search, edition, page, limit, forceRefresh, date });
    res.json({
      success: true,
      edition,
      date: date || null,
      ...result
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve news articles'
    });
  }
});

// Force refresh live cache
app.all('/api/news/refresh', async (req, res) => {
  try {
    const { edition = 'en-us' } = req.query;
    clearLiveCache();
    const result = await getNews({ edition, page: 1, limit: 10, forceRefresh: true });
    res.json({
      success: true,
      message: 'Live news cache cleared and refreshed successfully',
      ...result
    });
  } catch (err) {
    console.error('Error refreshing news cache:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh live news feeds'
    });
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await getNewsById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'News article not found'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve article details'
    });
  }
});

// HTML Routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.redirect('/login?tab=signup');
});

app.get('/article', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'article.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(` Daily News Reader Server Active`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`=================================`);
  });
}

module.exports = app;
