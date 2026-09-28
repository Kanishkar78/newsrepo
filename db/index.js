const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { getLiveNews, getCachedLiveArticle, clearLiveCache, translateText, translateBatch, attachRealImages, EDITIONS } = require('../services/liveNewsService');
const { generateFullArticleContent, detectArticleLanguage } = require('../services/articleContentService');
const { generateHistoricalArticlesForDate } = require('../services/historicalArchiveService');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let pool = null;
let isDbConnected = false;

// Resolve connection settings from DATABASE_URL or individual PG* env vars
function initPool() {
  let dbUrl = process.env.DATABASE_URL || '';
  let user = process.env.PGUSER || 'postgres';
  let password = process.env.PGPASSWORD || '';
  let host = process.env.PGHOST || 'localhost';
  let port = parseInt(process.env.PGPORT, 10) || 5432;
  let database = process.env.PGDATABASE || 'newsdb';

  if (dbUrl && dbUrl.includes('://')) {
    try {
      const parsed = new URL(dbUrl);
      user = decodeURIComponent(parsed.username) || user;
      password = decodeURIComponent(parsed.password) || password;
      host = parsed.hostname || host;
      port = parseInt(parsed.port, 10) || port;
      if (parsed.pathname && parsed.pathname.length > 1) {
        database = parsed.pathname.substring(1);
      }
    } catch (_) {}
  }

  // Explicit env vars take priority
  if (process.env.PGPASSWORD) password = process.env.PGPASSWORD;
  if (process.env.PGUSER) user = process.env.PGUSER;
  if (process.env.PGHOST) host = process.env.PGHOST;
  if (process.env.PGPORT) port = parseInt(process.env.PGPORT, 10);
  if (process.env.PGDATABASE) database = process.env.PGDATABASE;

  if (password === 'your_password_here') {
    return null;
  }

  return new Pool({
    user,
    password,
    host,
    port,
    database,
    ssl: (process.env.NODE_ENV === 'production' && !host.includes('localhost') && !host.includes('postgres')) 
      ? { rejectUnauthorized: false } 
      : false
  });
}

pool = initPool();

// Auto-verify and create table if connected with retry for container startup
async function verifyAndInitDb(retries = 8, delayMs = 2000) {
  if (!pool) return;
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1;');
      isDbConnected = true;
      console.log('✅ PostgreSQL connection established to "newsdb".');
      
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ PostgreSQL table "news" verified and ready in "newsdb".');
      }
      return;
    } catch (err) {
      isDbConnected = false;
      console.warn(`⚠️ PostgreSQL connection attempt ${i + 1}/${retries} waiting: ${err.message}`);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
  }
}

verifyAndInitDb();

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
    for (const art of articles.slice(0, 150)) {
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
 * Helper to check if a published_at timestamp matches a target YYYY-MM-DD date
 */
function matchesDate(publishedAt, targetDate) {
  if (!targetDate) return true;
  if (!publishedAt) return false;
  const d = new Date(publishedAt);
  if (isNaN(d.getTime())) return false;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const utcDate = `${yyyy}-${mm}-${dd}`;
  const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return localDate === targetDate || utcDate === targetDate;
}

/**
 * Helper to determine if a requested date is a historical archive date (>1 day in the past)
 */
function isHistoricalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return false;
  const now = new Date();
  const diffDays = (now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 1;
}

/**
 * Main Get News API function
 * Reads live feeds, persists into PostgreSQL 'newsdb', and queries database.
 * Supports all historical dates from year 2000 to the present with automated archive generation.
 */
async function getNews({ category, search, edition = 'en-us', page = 1, limit = 10, forceRefresh = false, date } = {}) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;
  const cleanDate = date && typeof date === 'string' && date.trim() !== '' ? date.trim() : null;
  const isHistorical = isHistoricalDate(cleanDate);

  // 1. Fetch live worldwide news for recent / live requests (not for historical archives)
  if (!isHistorical) {
    try {
      let liveArticles = await getLiveNews({ category, search, edition, forceRefresh });

      if (liveArticles && liveArticles.length > 0) {
        // Continuously persist live articles to PostgreSQL 'newsdb' in the background
        syncArticlesToDb(liveArticles, edition).catch(() => {});

        if (cleanDate) {
          liveArticles = liveArticles.filter(art => matchesDate(art.published_at, cleanDate));
        }

        // If we have matching live articles for this date/filter, return them
        if (liveArticles.length > 0) {
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
      }
    } catch (liveErr) {
      console.warn('Live news feed unavailable, querying PostgreSQL "newsdb":', liveErr.message);
    }
  }

  // 2. Query PostgreSQL 'newsdb' (with auto-generation for historical archive dates)
  if (pool) {
    try {
      // If historical date requested, ensure archive records exist in database for this specific edition
      if (cleanDate) {
        const targetEdition = (edition && edition !== 'all') ? edition : 'en-us';
        const checkRes = await pool.query(
          `SELECT COUNT(*) FROM news 
           WHERE (DATE(published_at) = $1 OR DATE(published_at AT TIME ZONE 'UTC') = $1)
             AND (edition = $2 OR ($3 = 'all' AND edition = 'en-us'))`,
          [cleanDate, targetEdition, edition || 'en-us']
        );
        const existingCount = parseInt(checkRes.rows[0].count, 10);

        if (existingCount < 6 || forceRefresh) {
          const historicalArticles = await generateHistoricalArticlesForDate(cleanDate, targetEdition);
          if (historicalArticles && historicalArticles.length > 0) {
            for (const art of historicalArticles) {
              await pool.query(`
                INSERT INTO news (
                  title, description, content, image_url, image_fallback,
                  category, source, source_url, author, edition, is_live, published_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              `, [
                art.title,
                art.description,
                art.content,
                art.image_url,
                art.image_fallback,
                art.category,
                art.source,
                art.source_url,
                art.author,
                art.edition,
                false,
                art.published_at
              ]).catch(() => {});
            }
          }

          // If edition === 'all', also generate for other primary editions so 'All News' shows rich diversity
          if (edition === 'all') {
            for (const ed of ['ta-in', 'hi-in']) {
              const extraArts = await generateHistoricalArticlesForDate(cleanDate, ed);
              for (const art of (extraArts || []).slice(0, 4)) {
                await pool.query(`
                  INSERT INTO news (
                    title, description, content, image_url, image_fallback,
                    category, source, source_url, author, edition, is_live, published_at
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `, [
                  art.title, art.description, art.content, art.image_url, art.image_fallback,
                  art.category, art.source, art.source_url, art.author, art.edition, false, art.published_at
                ]).catch(() => {});
              }
            }
          }
        }
      }

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

      if (cleanDate) {
        conditions.push(`(DATE(published_at) = $${paramIdx} OR DATE(published_at AT TIME ZONE 'UTC') = $${paramIdx})`);
        params.push(cleanDate);
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

      // Attach authentic editorial photos for this page
      await attachRealImages(dataResult.rows).catch(() => {});

      // Persist newly resolved real images back to PostgreSQL in the background
      if (pool) {
        for (const art of dataResult.rows) {
          if (art.has_real_image && art.image_url && !art.image_url.includes('unsplash.com')) {
            pool.query(
              'UPDATE news SET image_url = $1, image_fallback = $2 WHERE id = $3',
              [art.image_url, art.image_fallback, art.id.toString()]
            ).catch(() => {});
          }
        }
      }

      return {
        data: dataResult.rows,
        is_live: false,
        source_db: isHistorical ? 'newsdb (archive)' : 'newsdb',
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      };
    } catch (err) {
      console.warn('PostgreSQL "newsdb" query error, falling back to mock dataset:', err.message);
    }
  }

  // 3. In-memory fallback (supports full archive dates)
  let fallbackData = [];
  if (cleanDate) {
    const targetEdition = (edition && edition !== 'all') ? edition : 'en-us';
    fallbackData = await generateHistoricalArticlesForDate(cleanDate, targetEdition);
  } else {
    fallbackData = [...mockNews];
  }

  if (category && category.toLowerCase() !== 'all') {
    fallbackData = fallbackData.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    fallbackData = fallbackData.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q)
    );
  }

  if (cleanDate) {
    fallbackData = fallbackData.filter(item => matchesDate(item.published_at, cleanDate));
  }

  fallbackData.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  const total = fallbackData.length;
  const paginatedData = fallbackData.slice(offset, offset + limitNum);

  // Attach authentic editorial photos for in-memory fallback
  await attachRealImages(paginatedData).catch(() => {});

  return {
    data: paginatedData,
    is_live: false,
    source_db: isHistorical ? 'in-memory archive' : 'mock',
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
}

/**
 * Retrieve article details by ID with guaranteed full multi-paragraph content
 */
async function getNewsById(id) {
  const numericId = parseInt(id, 10);

  async function ensureFullContent(article) {
    if (!article) return article;
    const targetLang = detectArticleLanguage(article);

    const contentStr = typeof article.content === 'string' ? article.content : '';
    let needsGeneration = false;
    if (!contentStr || contentStr.length < 500 || contentStr.includes('To view the full original reporting and multimedia')) {
      needsGeneration = true;
    } else if (targetLang === 'ta' && !/[\u0B80-\u0BFF]/.test(contentStr)) {
      needsGeneration = true;
    } else if (targetLang === 'ml' && !/[\u0D00-\u0D7F]/.test(contentStr)) {
      needsGeneration = true;
    } else if (targetLang === 'hi' && !/[\u0900-\u097F]/.test(contentStr)) {
      needsGeneration = true;
    } else if (targetLang === 'te' && !/[\u0C00-\u0C7F]/.test(contentStr)) {
      needsGeneration = true;
    }

    function hasAnyEnglishParagraph(text) {
      if (!text || typeof text !== 'string') return true;
      const paras = text.split('\n\n');
      for (const p of paras) {
        const engWords = p.match(/[a-zA-Z]{4,}/g) || [];
        if (engWords.length > 4) {
          return true;
        }
      }
      return false;
    }

    const isRegional = targetLang !== 'en' && targetLang !== 'en-us' && targetLang !== 'en-gb';
    if (isRegional && hasAnyEnglishParagraph(contentStr)) {
      needsGeneration = true;
    }

    if (needsGeneration) {
      article.content = await generateFullArticleContent(article, targetLang);
      if (pool && article.id) {
        pool.query('UPDATE news SET content = $1 WHERE id = $2', [article.content, article.id.toString()]).catch(() => {});
      }
    }

    // Clean description if it contains English boilerplate for regional article
    if (isRegional && article.description) {
      const descEngWords = (article.description.match(/[a-zA-Z]{4,}/g) || []).length;
      if (descEngWords > 3 || article.description.includes('Live report:')) {
        const sourceName = article.source || 'செய்தி நிறுவனம்';
        if (targetLang === 'ta') {
          article.description = `${sourceName} வழங்கும் நேரடிச் செய்தி: "${article.title}". கள நிலவரம் மற்றும் முக்கிய நிகழ்வுகளின் நேரடித் தொகுப்பு.`;
        } else if (targetLang === 'ml') {
          article.description = `${sourceName} റിപ്പോർട്ട് ചെയ്യുന്ന വാർത്തകൾ: "${article.title}". തത്സമയ വിവരங்களும் புதிய സംഭവവികാസങ്ങളും.`;
        } else if (targetLang === 'hi') {
          article.description = `${sourceName} द्वारा विशेष रिपोर्ट: "${article.title}". ताजा घटनाक्रम और मुख्य समाचारों का लाइव विवरण.`;
        } else if (targetLang === 'te') {
          article.description = `${sourceName} తాజా వార్త: "${article.title}". క్షేత్రస్థాయి పరిణామాలు మరియు ముఖ్యాంశాలు.`;
        }
        if (pool && article.id) {
          pool.query('UPDATE news SET description = $1 WHERE id = $2', [article.description, article.id.toString()]).catch(() => {});
        }
      }
    }
    return article;
  }

  // 1. Check live memory cache first
  let liveArticle = getCachedLiveArticle(numericId);
  if (liveArticle) {
    await attachRealImages([liveArticle]).catch(() => {});
    return await ensureFullContent(liveArticle);
  }

  // 2. Query PostgreSQL 'newsdb'
  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM news WHERE id = $1', [numericId.toString()]);
      if (result.rows.length > 0) {
        const art = result.rows[0];
        await attachRealImages([art]).catch(() => {});
        if (art.has_real_image && art.image_url && !art.image_url.includes('unsplash.com')) {
          pool.query(
            'UPDATE news SET image_url = $1, image_fallback = $2 WHERE id = $3',
            [art.image_url, art.image_fallback, art.id.toString()]
          ).catch(() => {});
        }
        return await ensureFullContent(art);
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
      return await ensureFullContent(liveArticle);
    }
  } catch (_) {}

  // 4. Fallback to mock dataset
  const mockArt = mockNews.find(item => item.id === numericId) || null;
  if (mockArt) {
    await attachRealImages([mockArt]).catch(() => {});
  }
  return await ensureFullContent(mockArt);
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
