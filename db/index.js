const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { getLiveNews, getCachedLiveArticle, clearLiveCache, translateText, translateBatch, attachRealImages, EDITIONS } = require('../services/liveNewsService');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let pool = null;
let isDbConnected = false;

// Resolve connection settings from DATABASE_URL or individual PG* env vars
function initPool() {
  const dbUrl = process.env.DATABASE_URL || '';
  const pwd = process.env.PGPASSWORD || '';

  // Skip connecting if password is still placeholder
  if (dbUrl.includes('your_password_here') || pwd === 'your_password_here') {
    return null;
  }

  if (pwd) {
    return new Pool({
      user: process.env.PGUSER || 'postgres',
      password: pwd,
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT, 10) || 5432,
      database: process.env.PGDATABASE || 'newsdb',
      ssl: false
    });
  }

  if (dbUrl && dbUrl.startsWith('postgres')) {
    return new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' || dbUrl.includes('neon.tech') || dbUrl.includes('render.com') 
        ? { rejectUnauthorized: false } 
        : false
    });
  }

  return null;
}

pool = initPool();

// Auto-verify and create table if connected
if (pool) {
  pool.query('SELECT 1;')
    .then(() => {
      isDbConnected = true;
      console.log('✅ PostgreSQL connection established to "newsdb".');
      
      // Auto-apply schema if table does not exist
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      return pool.query(schemaSql);
    })
    .then(() => {
      console.log('✅ PostgreSQL table "news" verified and ready in "newsdb".');
    })
    .catch((err) => {
      isDbConnected = false;
      console.warn('⚠️ PostgreSQL connection to "newsdb" not active:', err.message);
    });
}

// In-memory fallback dataset for offline or unconfigured testing
const mockNews = [
  {
    id: 1,
    title: 'Breakthrough in Next-Gen Quantum Microprocessors',
    description: 'Researchers announce a major milestone in fault-tolerant quantum computing chips operating at room temperature.',
    content: 'In a landmark paper published today, quantum computing researchers revealed a novel chip architecture capable of maintaining quantum coherence at significantly higher temperatures than previously possible. This achievement could accelerate commercial quantum applications by standardizing silicon manufacturing processes and eliminating ultra-deep cryogenic requirements.\n\nIndustry leaders predict that practical deployment in cryptography, molecular simulation, and complex logistics could begin as early as next year. "We are seeing the transition from speculative physics to scalable engineering," stated lead project engineer Dr. Elena Vance.',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    image_fallback: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    category: 'Technology',
    source: 'TechCrunch Daily',
    source_url: 'https://techcrunch.com',
    author: 'Alexander Wright',
    edition: 'en-us',
    is_live: false,
    published_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    title: 'Autonomous AI Agents Transforming Modern Software Engineering',
    description: 'Developer productivity metrics skyrocket as autonomous coding assistants handle routine bug fixes and testing.',
    content: 'Software teams worldwide are rapidly adopting autonomous AI subagents into their daily build pipelines. Recent industry benchmark studies indicate a 40% reduction in cycle time for routine pull requests, code reviews, and dependency updates.\n\nWhile engineering management celebrates the acceleration, lead architects emphasize the growing importance of system verification and architectural governance. Human developers are shifting their focus toward strategic system design, safety bounds, and domain modeling.',
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    image_fallback: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    category: 'Technology',
    source: 'Wired Chronicle',
    source_url: 'https://wired.com',
    author: 'Sarah Chen',
    edition: 'en-us',
    is_live: false,
    published_at: new Date(Date.now() - 10800000).toISOString(),
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 3,
    title: 'Next-Generation Solar Cells Cross 34% Efficiency Barrier',
    description: 'Perovskite-silicon tandem solar panels achieve historic efficiency rating in certified laboratory trials.',
    content: 'Clean energy engineers have broken the 34% conversion efficiency threshold using advanced perovskite-silicon tandem cells. The breakthrough promises to double energy output per square meter compared to traditional silicon-only arrays.\n\nCommercial scale-up is already underway with pilot manufacturing lines scheduled to supply utility-scale solar farms by late 2027.',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    image_fallback: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    category: 'Technology',
    source: 'CleanTech World',
    source_url: 'https://cleantechnica.com',
    author: 'David Miller',
    edition: 'en-us',
    is_live: false,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 4,
    title: 'Global Central Banks Announce Coordinated Monetary Strategy',
    description: 'Major economic institutions pivot toward stability policies amid shifting international trade corridors.',
    content: 'Financial markets responded with positive momentum following a joint briefing by central bank governors across major global economies. The coordinated strategy focuses on inflation stabilization while expanding credit access for green infrastructure and technological research.\n\nMarket analysts noted a surge in green bonds and long-term equity confidence as volatility indices dropped to multi-year lows.',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    image_fallback: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    category: 'Business',
    source: 'Financial Times Express',
    source_url: 'https://ft.com',
    author: 'Marcus Thorne',
    edition: 'en-us',
    is_live: false,
    published_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 5,
    title: 'Underdog Squad Wins World Football Championship in Stunning Final',
    description: 'A stoppage-time goal secures an unforgettable 3-2 victory in one of the most thrilling finals in tournament history.',
    content: 'In an extraordinary display of tactical discipline and grit, the underdog squad emerged victorious in the final seconds of extra time. Fans erupted across the stadium as striker Lucas Silva headed home the winning goal in the 94th minute.\n\n"We never stopped believing," said team captain Mateo Rossi during the trophy presentation. "This victory belongs to everyone who supported us through the hardest training sessions."',
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    image_fallback: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    category: 'Sports',
    source: 'Sports Illustrated Today',
    source_url: 'https://si.com',
    author: 'Carlos Mendez',
    edition: 'en-us',
    is_live: false,
    published_at: new Date(Date.now() - 1800000).toISOString(),
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString()
  }
];

// Asynchronously upsert live articles into PostgreSQL 'newsdb'
async function syncArticlesToDb(articles, edition = 'en-us') {
  if (!pool || !articles || articles.length === 0) return;
  try {
    for (const art of articles.slice(0, 30)) {
      if (!art.title) continue;
      
      const articleId = art.id ? BigInt(art.id) : null;
      const title = art.title;
      const description = art.description || '';
      const content = art.content || '';
      const imageUrl = art.image_url || null;
      const imageFallback = art.image_fallback || null;
      const category = art.category || 'World';
      const source = art.source || 'Global News Wire';
      const sourceUrl = art.source_url || '';
      const author = art.author || source;
      const ed = art.edition || edition || 'en-us';
      const publishedAt = art.published_at ? new Date(art.published_at) : new Date();

      if (articleId) {
        await pool.query(`
          INSERT INTO news (
            id, title, description, content, image_url, image_fallback,
            category, source, source_url, author, edition, is_live, published_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            image_url = COALESCE(EXCLUDED.image_url, news.image_url),
            image_fallback = COALESCE(EXCLUDED.image_fallback, news.image_fallback),
            updated_at = CURRENT_TIMESTAMP;
        `, [
          articleId.toString(),
          title,
          description,
          content,
          imageUrl,
          imageFallback,
          category,
          source,
          sourceUrl,
          author,
          ed,
          true,
          publishedAt
        ]).catch(() => {});
      }
    }
  } catch (err) {
    // Non-blocking background sync log
  }
}

/**
 * Main Get News API function
 * Reads live feeds, persists into PostgreSQL 'newsdb', and queries database.
 */
async function getNews({ category, search, edition = 'en-us', page = 1, limit = 10, forceRefresh = false } = {}) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  // 1. Fetch live worldwide news for requested edition
  try {
    const liveArticles = await getLiveNews({ category, search, edition, forceRefresh });

    if (liveArticles && liveArticles.length > 0) {
      // Continuously persist live articles to PostgreSQL 'newsdb' in the background
      syncArticlesToDb(liveArticles, edition).catch(() => {});

      const total = liveArticles.length;
      const paginatedData = liveArticles.slice(offset, offset + limitNum);

      // Attach real news photos for current page
      await attachRealImages(paginatedData).catch(() => {});

      return {
        data: paginatedData,
        is_live: true,
        source_db: pool ? 'newsdb (syncing)' : 'in-memory',
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      };
    }
  } catch (liveErr) {
    console.warn('Live news feed unavailable, querying PostgreSQL "newsdb":', liveErr.message);
  }

  // 2. Query PostgreSQL 'newsdb'
  if (pool) {
    try {
      let conditions = [];
      let params = [];
      let paramIdx = 1;

      if (edition && edition !== 'all') {
        conditions.push(`edition = $${paramIdx++}`);
        params.push(edition);
      }

      if (category && category.toLowerCase() !== 'all') {
        conditions.push(`LOWER(category) = LOWER($${paramIdx++})`);
        params.push(category);
      }

      if (search && search.trim() !== '') {
        conditions.push(`(LOWER(title) LIKE $${paramIdx} OR LOWER(description) LIKE $${paramIdx} OR LOWER(content) LIKE $${paramIdx})`);
        params.push(`%${search.trim().toLowerCase()}%`);
        paramIdx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      const countQuery = `SELECT COUNT(*) FROM news ${whereClause}`;
      const countResult = await pool.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0].count, 10);

      const dataParams = [...params, limitNum, offset];
      const dataQuery = `
        SELECT * FROM news 
        ${whereClause} 
        ORDER BY published_at DESC 
        LIMIT $${paramIdx++} OFFSET $${paramIdx}
      `;
      const dataResult = await pool.query(dataQuery, dataParams);

      if (dataResult.rows.length > 0) {
        return {
          data: dataResult.rows,
          is_live: false,
          source_db: 'newsdb',
          pagination: {
            total: totalCount,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalCount / limitNum) || 1
          }
        };
      }
    } catch (err) {
      console.warn('PostgreSQL "newsdb" query error, falling back to mock dataset:', err.message);
    }
  }

  // 3. In-memory fallback
  let filtered = [...mockNews];

  if (category && category.toLowerCase() !== 'all') {
    filtered = filtered.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  const total = filtered.length;
  const paginatedData = filtered.slice(offset, offset + limitNum);

  return {
    data: paginatedData,
    is_live: false,
    source_db: 'mock',
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
}

/**
 * Retrieve article details by ID
 */
async function getNewsById(id) {
  const numericId = parseInt(id, 10);

  // 1. Check live memory cache first
  let liveArticle = getCachedLiveArticle(numericId);
  if (liveArticle) {
    await attachRealImages([liveArticle]).catch(() => {});
    return liveArticle;
  }

  // 2. Query PostgreSQL 'newsdb'
  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM news WHERE id = $1', [numericId.toString()]);
      if (result.rows.length > 0) {
        return result.rows[0];
      }
    } catch (err) {
      console.warn('PostgreSQL getNewsById error:', err.message);
    }
  }

  // 3. Fallback: Warm cache and re-check
  try {
    await getLiveNews({ category: 'all' });
    liveArticle = getCachedLiveArticle(numericId);
    if (liveArticle) {
      await attachRealImages([liveArticle]).catch(() => {});
      return liveArticle;
    }
  } catch (_) {}

  // 4. Fallback to mock dataset
  return mockNews.find(item => item.id === numericId) || null;
}

/**
 * Health check & DB Status reporting
 */
async function getDbStatus() {
  if (!pool) {
    return {
      connected: false,
      database: 'newsdb',
      message: 'PostgreSQL pool not initialized. Please configure credentials in .env and run npm run db:setup.'
    };
  }

  try {
    const res = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM news) as total_articles,
        (SELECT COUNT(DISTINCT edition) FROM news) as total_editions,
        (SELECT COUNT(DISTINCT category) FROM news) as total_categories,
        current_database() as database_name;
    `);

    const row = res.rows[0];
    return {
      connected: true,
      database: row.database_name,
      total_articles: parseInt(row.total_articles, 10),
      total_editions: parseInt(row.total_editions, 10),
      total_categories: parseInt(row.total_categories, 10),
      message: `Connected to PostgreSQL "${row.database_name}". All data is persistently stored.`
    };
  } catch (err) {
    return {
      connected: false,
      database: 'newsdb',
      error: err.message
    };
  }
}

module.exports = {
  getNews,
  getNewsById,
  getDbStatus,
  clearLiveCache,
  translateText,
  translateBatch,
  EDITIONS
};
