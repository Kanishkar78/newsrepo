/**
 * Live Global News Service
 * Multi-region, native-language news aggregation & instant translation engine.
 */

const { generateFullArticleContent } = require('./articleContentService');

// Curated high-resolution editorial imagery per category
const CATEGORY_IMAGES = {
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80'
  ],
  sports: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80'
  ],
  politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80'
  ],
  business: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'
  ],
  education: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80'
  ],
  all: [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  ]
};

// Supported Regional & Native Language Editions
const EDITIONS = {
  'en-us': {
    code: 'en-us',
    name: 'Global / United States',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    hl: 'en-US',
    gl: 'US',
    ceid: 'US:en'
  },
  'ta-in': {
    code: 'ta-in',
    name: 'Tamil Nadu (தமிழ்நாடு)',
    nativeName: 'தமிழ் (Tamil)',
    flag: '🇮🇳',
    hl: 'ta',
    gl: 'IN',
    ceid: 'IN:ta'
  },
  'ml-in': {
    code: 'ml-in',
    name: 'Kerala (കേരളം)',
    nativeName: 'മലയാളം (Malayalam)',
    flag: '🇮🇳',
    hl: 'ml',
    gl: 'IN',
    ceid: 'IN:ml'
  },
  'en-gb': {
    code: 'en-gb',
    name: 'London / United Kingdom',
    nativeName: 'English (UK)',
    flag: '🇬🇧',
    hl: 'en-GB',
    gl: 'GB',
    ceid: 'GB:en'
  },
  'de-de': {
    code: 'de-de',
    name: 'Germany (Deutschland)',
    nativeName: 'Deutsch (German)',
    flag: '🇩🇪',
    hl: 'de',
    gl: 'DE',
    ceid: 'DE:de'
  },
  'hi-in': {
    code: 'hi-in',
    name: 'India (भारत)',
    nativeName: 'हिन्दी (Hindi)',
    flag: '🇮🇳',
    hl: 'hi',
    gl: 'IN',
    ceid: 'IN:hi'
  },
  'te-in': {
    code: 'te-in',
    name: 'Andhra & Telangana',
    nativeName: 'తెలుగు (Telugu)',
    flag: '🇮🇳',
    hl: 'te',
    gl: 'IN',
    ceid: 'IN:te'
  },
  'fr-fr': {
    code: 'fr-fr',
    name: 'France',
    nativeName: 'Français (French)',
    flag: '🇫🇷',
    hl: 'fr',
    gl: 'FR',
    ceid: 'FR:fr'
  },
  'es-es': {
    code: 'es-es',
    name: 'Spain / Latin America',
    nativeName: 'Español (Spanish)',
    flag: '🇪🇸',
    hl: 'es',
    gl: 'ES',
    ceid: 'ES:es'
  },
  'ja-jp': {
    code: 'ja-jp',
    name: 'Japan (日本)',
    nativeName: '日本語 (Japanese)',
    flag: '🇯🇵',
    hl: 'ja',
    gl: 'JP',
    ceid: 'JP:ja'
  },
  'ar-ae': {
    code: 'ar-ae',
    name: 'Arab World (العالم العربي)',
    nativeName: 'العربية (Arabic)',
    flag: '🇦🇪',
    hl: 'ar',
    gl: 'AE',
    ceid: 'AE:ar'
  },
  'it-it': {
    code: 'it-it',
    name: 'Italy (Italia)',
    nativeName: 'Italiano (Italian)',
    flag: '🇮🇹',
    hl: 'it',
    gl: 'IT',
    ceid: 'IT:it'
  },
  'ru-ru': {
    code: 'ru-ru',
    name: 'Russia (Россия)',
    nativeName: 'Русский (Russian)',
    flag: '🇷🇺',
    hl: 'ru',
    gl: 'RU',
    ceid: 'RU:ru'
  },
  'zh-cn': {
    code: 'zh-cn',
    name: 'China (中国)',
    nativeName: '中文 (Chinese)',
    flag: '🇨🇳',
    hl: 'zh-CN',
    gl: 'CN',
    ceid: 'CN:zh-Hans'
  }
};

// In-Memory Cache (TTL: 5 minutes)
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

// Translation Cache
const translationCache = new Map();

// Deterministic ID generator from string
function generateNumericId(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & 0x7FFFFFFF;
  }
  return hash || Math.floor(Math.random() * 1000000) + 1;
}

// Clean HTML tags and decode common entities
function cleanText(text) {
  if (!text) return '';
  let str = text.replace(/<!\[CDATA\[(.*?)\]\]>/gis, '$1');
  str = str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  str = str.replace(/<[^>]+>/g, ' ');
  return str.replace(/\s+/g, ' ').trim();
}

// Extract image url from item XML if present
function extractImage(itemXml, category, index) {
  const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch && mediaMatch[1] && !mediaMatch[1].includes('placeholder')) {
    return mediaMatch[1];
  }

  const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch && enclosureMatch[1] && (enclosureMatch[1].endsWith('.jpg') || enclosureMatch[1].endsWith('.png') || enclosureMatch[1].includes('image'))) {
    return enclosureMatch[1];
  }

  const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (thumbMatch && thumbMatch[1]) {
    return thumbMatch[1];
  }

  const catKey = (category || 'all').toLowerCase();
  const pool = CATEGORY_IMAGES[catKey] || CATEGORY_IMAGES.all;
  return pool[index % pool.length];
}

// Parse raw RSS XML into structured news objects
function parseRssXml(xml, defaultCategory = 'All', editionInfo = null) {
  const articles = [];
  const itemRegex = /<item[\s\S]*?>([\s\S]*?)<\/item>/gi;
  let match;
  let idx = 0;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const getTag = (tag) => {
      const m = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? m[1] : '';
    };

    let title = cleanText(getTag('title'));
    if (!title) continue;

    let source = '';
    const titleParts = title.split(' - ');
    if (titleParts.length > 1) {
      source = titleParts.pop().trim();
      title = titleParts.join(' - ').trim();
    }

    const sourceTag = cleanText(getTag('source'));
    if (sourceTag) source = sourceTag;
    if (!source) source = editionInfo ? `${editionInfo.name} News` : 'Global News Wire';

    let link = cleanText(getTag('link'));
    if (!link) {
      const guid = cleanText(getTag('guid'));
      if (guid && guid.startsWith('http')) link = guid;
    }

    let pubDateStr = cleanText(getTag('pubDate'));
    let publishedAt = new Date().toISOString();
    if (pubDateStr) {
      const parsed = new Date(pubDateStr);
      if (!isNaN(parsed.getTime())) {
        publishedAt = parsed.toISOString();
      }
    }

    let description = cleanText(getTag('description'));
    const isTa = /[\u0B80-\u0BFF]/.test(title) || (editionInfo && editionInfo.code === 'ta-in');
    const isMl = /[\u0D00-\u0D7F]/.test(title) || (editionInfo && editionInfo.code === 'ml-in');
    const isHi = /[\u0900-\u097F]/.test(title) || (editionInfo && editionInfo.code === 'hi-in');
    const isTe = /[\u0C00-\u0C7F]/.test(title) || (editionInfo && editionInfo.code === 'te-in');

    if (!description || description.length < 30 || description.startsWith(title) || description.includes('View Full Coverage') || ((isTa || isMl || isHi || isTe) && (description.match(/[a-zA-Z]{4,}/g) || []).length > 3)) {
      if (isTa) {
        description = `${source} வழங்கும் நேரடிச் செய்தி: "${title}". கள நிலவரம் மற்றும் முக்கிய நிகழ்வுகளின் நேரடித் தொகுப்பு.`;
      } else if (isMl) {
        description = `${source} റിപ്പോർട്ട് ചെയ്യുന്ന വാർത്തകൾ: "${title}". തത്സമയ വിവരങ്ങളും പുതിയ സംഭവവികാസങ്ങളും.`;
      } else if (isHi) {
        description = `${source} द्वारा विशेष रिपोर्ट: "${title}". ताजा घटनाक्रम और मुख्य समाचारों का लाइव विवरण.`;
      } else if (isTe) {
        description = `${source} తాజా వార్త: "${title}". క్షేత్రస్థాయి పరిణామాలు మరియు ముఖ్యాంశాలు.`;
      } else {
        description = `Live report: "${title}". Real-time updates, local context, and developments reported by ${source}.`;
      }
    }

    const content = generateFullArticleContent({
      title,
      description,
      category: defaultCategory,
      source,
      author: source,
      publishedAt
    });

    const imageUrl = extractImage(itemXml, defaultCategory, idx);
    const id = generateNumericId(link || title);

    articles.push({
      id,
      title,
      description,
      content,
      image_url: imageUrl,
      image_fallback: imageUrl,
      has_real_image: false,
      category: defaultCategory,
      source,
      source_url: link,
      author: source,
      published_at: publishedAt,
      created_at: publishedAt,
      updated_at: new Date().toISOString(),
      edition: editionInfo ? editionInfo.code : 'en-us',
      is_live: true
    });

    idx++;
  }

  return articles;
}

// Fetch with timeout protection
async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NewsReader/1.0'
      }
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Build feed targets for a specific regional edition and category.
 * When category is 'all', returns target URLs for every category (World, Technology, Sports, Politics, Business, Entertainment, Education)
 * so 'All News' shows comprehensive coverage from every section.
 */
function buildFeedTargets(editionConfig, category) {
  const { hl, gl, ceid } = editionConfig;
  const catKey = (category || 'all').toLowerCase();

  if (catKey === 'all') {
    const targets = [
      { url: `https://news.google.com/rss?hl=${hl}&gl=${gl}&ceid=${ceid}`, categoryName: 'World' },
      { url: `https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=${hl}&gl=${gl}&ceid=${ceid}`, categoryName: 'Technology' },
      { url: `https://news.google.com/rss/headlines/section/topic/SPORTS?hl=${hl}&gl=${gl}&ceid=${ceid}`, categoryName: 'Sports' },
      { url: `https://news.google.com/rss/headlines/section/topic/POLITICS?hl=${hl}&gl=${gl}&ceid=${ceid}`, categoryName: 'Politics' },
      { url: `https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=${hl}&gl=${gl}&ceid=${ceid}`, categoryName: 'Business' },
      { url: `https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=${hl}&gl=${gl}&ceid=${ceid}`, categoryName: 'Entertainment' },
      { url: `https://news.google.com/rss/search?q=${encodeURIComponent('education schools university')}+when:7d&hl=${hl}&gl=${gl}&ceid=${ceid}`, categoryName: 'Education' }
    ];

    if (editionConfig.code === 'en-us') {
      targets.push({ url: 'https://feeds.bbci.co.uk/news/world/rss.xml', categoryName: 'World' });
    } else if (editionConfig.code === 'en-gb') {
      targets.push({ url: 'https://feeds.bbci.co.uk/news/rss.xml', categoryName: 'World' });
    }
    return targets;
  }

  // Topic mapping for specific category
  const topicMap = {
    technology: { topic: 'TECHNOLOGY', name: 'Technology' },
    sports: { topic: 'SPORTS', name: 'Sports' },
    business: { topic: 'BUSINESS', name: 'Business' },
    entertainment: { topic: 'ENTERTAINMENT', name: 'Entertainment' },
    politics: { topic: 'POLITICS', name: 'Politics' }
  };

  if (topicMap[catKey]) {
    return [{
      url: `https://news.google.com/rss/headlines/section/topic/${topicMap[catKey].topic}?hl=${hl}&gl=${gl}&ceid=${ceid}`,
      categoryName: topicMap[catKey].name
    }];
  }

  // Education / custom category searches
  const query = catKey === 'education' ? 'education schools university' : catKey;
  const displayName = catKey === 'education' ? 'Education' : (category.charAt(0).toUpperCase() + category.slice(1));
  return [{
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+when:7d&hl=${hl}&gl=${gl}&ceid=${ceid}`,
    categoryName: displayName
  }];
}

/**
 * Helper to interleave top stories from every category for 'All News'
 * so users see a vibrant variety across Technology, Sports, Politics, etc. on the initial pages
 */
function balanceArticlesByCategory(articles) {
  if (!articles || articles.length <= 1) return articles;

  const groups = {};
  for (const art of articles) {
    const cat = art.category || 'World';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(art);
  }

  const balanced = [];
  const catNames = Object.keys(groups);
  let round = 0;
  let hasMore = true;

  // Interleave the first 3 items from each category
  while (hasMore && round < 3) {
    hasMore = false;
    for (const cat of catNames) {
      if (groups[cat].length > round) {
        balanced.push(groups[cat][round]);
        hasMore = true;
      }
    }
    round++;
  }

  // Follow with all remaining items sorted chronologically
  const remaining = [];
  for (const cat of catNames) {
    if (groups[cat].length > 3) {
      remaining.push(...groups[cat].slice(3));
    }
  }
  remaining.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  return [...balanced, ...remaining];
}

/**
 * Fetch live worldwide news for a specific regional edition
 */
async function getLiveNews({ category = 'all', search = '', edition = 'en-us', forceRefresh = false } = {}) {
  const editionKey = (edition || 'en-us').toLowerCase();
  const editionConfig = EDITIONS[editionKey] || EDITIONS['en-us'];
  const catKey = (category || 'all').toLowerCase();
  const trimmedSearch = (search || '').trim().toLowerCase();
  const cacheKey = `${editionConfig.code}:${catKey}:${trimmedSearch}`;

  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }
  }

  let articles = [];

  try {
    if (trimmedSearch) {
      const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(trimmedSearch)}+when:7d&hl=${editionConfig.hl}&gl=${editionConfig.gl}&ceid=${editionConfig.ceid}`;
      const xml = await fetchWithTimeout(searchUrl);
      articles = parseRssXml(xml, category && category !== 'all' ? category : 'World', editionConfig);
    } else {
      const feedTargets = buildFeedTargets(editionConfig, catKey);
      const results = await Promise.allSettled(
        feedTargets.map(async (target) => {
          const xml = await fetchWithTimeout(target.url);
          return parseRssXml(xml, target.categoryName, editionConfig);
        })
      );

      const parsedBatches = [];
      results.forEach((res) => {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          parsedBatches.push(res.value);
        }
      });

      const seenTitles = new Set();
      const combined = parsedBatches.flat();

      for (const item of combined) {
        const normTitle = item.title.toLowerCase().substring(0, 32);
        if (!seenTitles.has(normTitle)) {
          seenTitles.add(normTitle);
          articles.push(item);
        }
      }
    }
  } catch (err) {
    console.error(`Error fetching live feeds for edition ${editionConfig.name}:`, err.message);
  }

  // For 'All News', balance diversity across categories so all categories appear on front pages
  if (catKey === 'all') {
    articles = balanceArticlesByCategory(articles);
  } else {
    articles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }

  // Pre-resolve real news photos for the top articles of this feed in parallel
  if (articles.length > 0) {
    await attachRealImages(articles.slice(0, 12)).catch(() => {});
  }

  // Store in cache
  if (articles.length > 0) {
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: articles
    });

    for (const art of articles) {
      cache.set(`article:${art.id}`, {
        timestamp: Date.now(),
        data: art
      });
    }
  }

  return articles;
}

// In-Memory Story Image Cache (key -> { imageUrl, imageFallback })
const articleImageCache = new Map();

// Stopwords to strip when extracting core historical and entity search topics
const WIKI_STOPWORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'with', 'by', 'from',
  'and', 'or', 'as', 'into', 'first', 'conclude', 'celebrate', 'deliver', 'enter',
  'across', 'under', 'amid', 'during', 'major', 'historic', 'historically',
  'announce', 'announces', 'begins', 'begin', 'launches', 'launch', 'unveil', 'unveils',
  'global', 'international', 'national', 'world', 'report', 'reports', 'record', 'records'
]);

/**
 * Clean headline for search engines by removing localized prefixes, publisher names,
 * and trimming to the core subject matter.
 */
function cleanHeadlineForSearch(title) {
  if (!title) return '';
  let clean = title.trim();

  // 1. Remove localized category and historical prefixes across all supported languages
  clean = clean.replace(/^[^\s:]*(?:\s+[^\s:]*)?\s*(?:வரலாற்றுச் செய்தி|வரலாற்றுப் பதிவு|வரலாற்று ஆவணம்|வரலாற்று அறிக்கை|வரலாறு)\s*:\s*/i, '');
  clean = clean.replace(/^[^\s:]*(?:\s+[^\s:]*)?\s*(?:ऐतिहासिक समाचार|पुरालेख रिपोर्ट|ऐतिहासिक अभिलेख)\s*:\s*/i, '');
  clean = clean.replace(/^[^\s:]*(?:\s+[^\s:]*)?\s*(?:ചരിത്രരേഖ|ചരിത്രവാർത്ത)\s*:\s*/i, '');
  clean = clean.replace(/^[^\s:]*(?:\s+[^\s:]*)?\s*(?:Archivbericht|Dépêche d'époque|Archivo Histórico)\s*:\s*/i, '');
  clean = clean.replace(/^(?:World|Technology|Business|Sports|Politics|Entertainment|Education)\s*(?:Historical News|Archive Report|History|News)?\s*:\s*/i, '');

  // 2. Remove trailing year in parentheses e.g. " (2026)" or " (2000)"
  clean = clean.replace(/\s*\(\d{4}\)\s*$/, '').trim();

  // 3. Strip trailing publisher suffix only if after the last dash and reasonably short (< 30 chars)
  const lastDash = clean.lastIndexOf(' - ');
  if (lastDash !== -1 && clean.length - lastDash < 30) {
    clean = clean.substring(0, lastDash).trim();
  }

  // 4. Remove quotation marks, colons, brackets, and extra punctuation while preserving all unicode letters
  clean = clean.replace(/["'“”«»()[\]{}—:;,]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').filter(w => w.length > 0);
  if (words.length > 9) {
    clean = words.slice(0, 9).join(' ');
  }
  return clean;
}

/**
 * Tier 1: Bing News Search
 * Dedicated editorial news engine indexing verified news publishers worldwide.
 * Returns authentic publisher photos hosted on Microsoft CDN (th.bing.com).
 * Validates that an actual news card exists and discards static page banners.
 */
async function fetchFromBingNews(query) {
  try {
    const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&form=NWRFSH`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,ta;q=0.8,hi;q=0.8,ml;q=0.7,te;q=0.7,de;q=0.7,fr;q=0.7'
      }
    });
    clearTimeout(timeout);

    const html = await res.text();

    // Check for "No results" page to avoid grabbing static site teaser banners
    if (html.includes('There are no results') || html.includes('No results') || html.includes('no results for') || html.includes('முடிவுகள் இல்லை') || html.includes('कोई परिणाम नहीं')) {
      return null;
    }

    // Match image specifically inside an actual news card or news item, NOT the page banner
    const match = html.match(/class="[^"]*(?:news-card|newsitem|ans|card|na_c)[^"]*"[\s\S]*?data-src-hq="((?:https?:)?\/\/[^"]+th\?id=[^"]+)"/i) ||
                  html.match(/class="[^"]*(?:news-card|newsitem|ans|card|na_c)[^"]*"[\s\S]*?src="((?:https?:)?\/\/[^"]+th\?id=[^"]+pid=News[^"]*)"/i);

    if (match) {
      let rawImg = match[1].replace(/&amp;/g, '&');
      if (rawImg.startsWith('//')) {
        rawImg = 'https:' + rawImg;
      } else if (rawImg.startsWith('/')) {
        rawImg = 'https://www.bing.com' + rawImg;
      }

      // Upgrade dimensions for high resolution
      const hiResImg = rawImg.replace(/&w=\d+/, '&w=1200').replace(/&h=\d+/, '&h=675');
      return {
        imageUrl: hiResImg,
        imageFallback: rawImg
      };
    }
  } catch (_) {}
  return null;
}

/**
 * Tier 2: Wikipedia / Wikimedia PageImages API
 * Real editorial photos for recognized global events, people, places, institutions, and science.
 * Iterates through candidate search entities for maximum hit rate.
 */
async function fetchFromWikipedia(query) {
  // Extract candidate search queries: full query, first 3-4 words, and non-stopword core nouns
  const words = query.split(' ').filter(w => w.length > 0);
  const candidates = [query];

  if (words.length > 3) {
    candidates.push(words.slice(0, 4).join(' '));
    candidates.push(words.slice(0, 3).join(' '));
  }

  const coreNouns = words.filter(w => !WIKI_STOPWORDS.has(w.toLowerCase()));
  if (coreNouns.length >= 2) {
    candidates.push(coreNouns.slice(0, 3).join(' '));
    candidates.push(coreNouns.slice(0, 2).join(' '));
  }

  for (const q of [...new Set(candidates)]) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=3&prop=pageimages&pithumbsize=1200&format=json&origin=*`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'NewsReaderApp/1.0' }
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (data.query && data.query.pages) {
        for (const page of Object.values(data.query.pages)) {
          if (page && page.thumbnail && page.thumbnail.source) {
            const src = page.thumbnail.source;
            // Filter out raw SVG icons, disambiguation pages, and Wikipedia cleanup placeholders
            if (!src.endsWith('.svg') && !src.includes('Disambig') && !src.includes('Question_book')) {
              return {
                imageUrl: src,
                imageFallback: src
              };
            }
          }
        }
      }
    } catch (_) {}
  }
  return null;
}

/**
 * Tier 3: Filtered Web Images Search
 * Fallback with strict negative filters excluding e-commerce, clipart, and stock illustrations.
 */
async function fetchFromFilteredWebImages(query) {
  const BAD_DOMAINS = [
    'walmart', 'amazon', 'ebay', 'aliexpress', 'temu', 'shein', 'target',
    'homedepot', 'wayfair', 'etsy', 'freepik', 'vector', 'clipart',
    'shutterstock', 'istockphoto', 'depositphotos', '123rf', 'dreamstime'
  ];

  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:imagesize-large&first=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,ta;q=0.8,hi;q=0.8'
      }
    });
    clearTimeout(timeout);

    const html = await res.text();
    const regex = /class="iusc"[^>]*m="([^"]+)"/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      try {
        const raw = match[1].replace(/&quot;/g, '"');
        const item = JSON.parse(raw);
        if (!item.murl || !item.murl.startsWith('http')) continue;

        const murlLower = item.murl.toLowerCase();
        if (BAD_DOMAINS.some(d => murlLower.includes(d))) continue;

        const fallback = item.turl ? item.turl.replace(/&amp;/g, '&') : item.murl;
        return {
          imageUrl: item.murl,
          imageFallback: fallback
        };
      } catch (_) {}
    }
  } catch (_) {}
  return null;
}

// Curated authentic historical and documentary fallback photos from Wikimedia Commons
const HISTORICAL_CATEGORY_IMAGES = {
  World: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Vladimir_Putin_at_the_Millennium_Summit_6-8_September_2000-6.jpg/1280px-Vladimir_Putin_at_the_Millennium_Summit_6-8_September_2000-6.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Kyoto_Protocol_parties.svg/1280px-Kyoto_Protocol_parties.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Euro_Series_Banknotes_%282019%29_-_centered.png/1280px-Euro_Series_Banknotes_%282019%29_-_centered.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Peace_and_Reconciliation%2C_Astana.jpg/1280px-Palace_of_Peace_and_Reconciliation%2C_Astana.jpg'
  ],
  Technology: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/The_station_pictured_from_the_SpaceX_Crew_Dragon_5.jpg/1280px-The_station_pictured_from_the_SpaceX_Crew_Dragon_5.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/LHC.svg/1280px-LHC.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Nasdaq_Composite_dot-com_bubble.svg/1280px-Nasdaq_Composite_dot-com_bubble.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Thin_Film_Flexible_Solar_PV_Installation_2.JPG/1280px-Thin_Film_Flexible_Solar_PV_Installation_2.JPG'
  ],
  Business: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Lehman_Brothers_Times_Square_by_David_Shankbone.jpg/1280px-Lehman_Brothers_Times_Square_by_David_Shankbone.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/A6-EDY_A380_Emirates_31_jan_2013_jfk_%288442269364%29_%28cropped%29.jpg/1280px-A6-EDY_A380_Emirates_31_jan_2013_jfk_%288442269364%29_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/London_Stock_Exchange_outside.jpg/1280px-London_Stock_Exchange_outside.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Headquarter_of_Toyota_Motor_Corporation_3.JPG/1280px-Headquarter_of_Toyota_Motor_Corporation_3.JPG'
  ],
  Sports: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Phelpsbeijing-2.jpg/1280px-Phelpsbeijing-2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/NISSANSTADIUM20080608.JPG/1280px-NISSANSTADIUM20080608.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Disney%27s_Wide_World_of_Sports_%287426504780%29.jpg/1280px-Disney%27s_Wide_World_of_Sports_%287426504780%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/London_Wembley.jpg/1280px-London_Wembley.jpg'
  ],
  Politics: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/International_Criminal_Court_%E2%80%93_State_Parties.svg/1280px-International_Criminal_Court_%E2%80%93_State_Parties.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Great_Seal_of_the_United_States_%28obverse%29.svg/1280px-Great_Seal_of_the_United_States_%28obverse%29.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/United_States_Capitol_west_front_edit2.jpg/1280px-United_States_Capitol_west_front_edit2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/G20_leaders_at_the_2008_G-20_Washington_summit.jpg/1280px-G20_leaders_at_the_2008_G-20_Washington_summit.jpg'
  ],
  Entertainment: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Lord_of_the_rings_fellowship_of_the_ring.jpg/1280px-Lord_of_the_rings_fellowship_of_the_ring.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Cannes_Film_Festival_logo.svg/1280px-Cannes_Film_Festival_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palais_des_Festivals_Cannes.jpg/1280px-Palais_des_Festivals_Cannes.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Rock_and_Roll_Hall_of_Fame_2014.jpg/1280px-Rock_and_Roll_Hall_of_Fame_2014.jpg'
  ],
  Education: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Phoenix_landing.jpg/1280px-Phoenix_landing.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/JWST_spacecraft_model_2.png/1280px-JWST_spacecraft_model_2.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Logo_HGP.jpg/1280px-Logo_HGP.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hubble_2009_close-up_2.jpg/1280px-Hubble_2009_close-up_2.jpg'
  ]
};

/**
 * Fetch and extract the exact real editorial news photo for an individual article story.
 * Multi-tiered:
 * 1. For historical articles (or titles with past years): Prioritizes Wikipedia / Wikimedia
 *    which has authentic archival photos for global events from 2000-2026.
 *    If Wikipedia does not match, uses authentic historical category imagery (NEVER random web scraping).
 * 2. For live breaking articles: Queries Bing News Search for current publisher editorial photos.
 * 3. Filtered Web Images Search as fallback for live news only.
 */
async function resolveSingleStoryImage(article) {
  if (!article || !article.title) return null;

  const cacheKey = article.title.trim().toLowerCase();
  if (articleImageCache.has(cacheKey)) {
    const cached = articleImageCache.get(cacheKey);
    if (cached) {
      article.image_url = cached.imageUrl;
      article.image_fallback = cached.imageFallback;
      article.has_real_image = true;
      return cached;
    }
  }

  const cleanQuery = cleanHeadlineForSearch(article.title);
  if (!cleanQuery) return null;

  const isHistorical = article.is_live === false ||
                       /\(\d{4}\)/.test(article.title) ||
                       (article.published_at && (Date.now() - new Date(article.published_at).getTime()) > 30 * 86400000);

  let result = null;

  if (isHistorical) {
    // For historical news: Wikipedia has authentic encyclopedic & editorial photos for every era event
    result = await fetchFromWikipedia(cleanQuery);
    if (!result) {
      // Clean fallback: Use authentic historical category imagery
      const catKey = (article.category && typeof article.category === 'string') ? article.category.trim() : 'World';
      const catPool = HISTORICAL_CATEGORY_IMAGES[catKey] || HISTORICAL_CATEGORY_IMAGES.World;
      const charSum = cleanQuery.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const chosenUrl = catPool[charSum % catPool.length];
      result = {
        imageUrl: chosenUrl,
        imageFallback: chosenUrl
      };
    }
  } else {
    // For live/current news: Bing News has real photos from today's news agencies
    result = await fetchFromBingNews(cleanQuery);
    if (!result) {
      result = await fetchFromWikipedia(cleanQuery);
    }
    if (!result) {
      result = await fetchFromFilteredWebImages(cleanQuery);
    }
  }

  if (result) {
    articleImageCache.set(cacheKey, result);
    article.image_url = result.imageUrl;
    article.image_fallback = result.imageFallback;
    article.has_real_image = true;
    return result;
  }

  return null;
}

/**
 * Concurrently attach real article photos to a list of articles
 */
async function attachRealImages(articles) {
  if (!Array.isArray(articles) || articles.length === 0) return articles;

  await Promise.allSettled(
    articles.map(async (art) => {
      // If it already has an authentic editorial photo (and not unsplash/placeholder), skip
      const isStockOrEmpty = !art.image_url || art.image_url.includes('unsplash.com') || art.image_url.includes('placeholder');
      if (!isStockOrEmpty && art.has_real_image) return;
      await resolveSingleStoryImage(art);
    })
  );

  return articles;
}

/**
 * Get single article from live cache
 */
function getCachedLiveArticle(id) {
  const numId = parseInt(id, 10);
  const cached = cache.get(`article:${numId}`);
  if (cached && cached.data) {
    return cached.data;
  }
  for (const entry of cache.values()) {
    if (Array.isArray(entry.data)) {
      const found = entry.data.find(a => a.id === numId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Invalidate all cached news
 */
function clearLiveCache() {
  cache.clear();
  translationCache.clear();
}

/**
 * Helper to translate a single text chunk with multi-tier fallback
 */
async function translateSingleChunk(trimmed, targetLang = 'en') {
  if (!trimmed) return trimmed;

  // Tier 1: Google Translate dict-chrome-ex (high reliability, low rate limiting)
  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${targetLang}&q=${encodeURIComponent(trimmed)}`;
    const res = await fetchWithTimeout(url, 6000);
    const data = JSON.parse(res);
    if (Array.isArray(data)) {
      if (Array.isArray(data[0]) && typeof data[0][0] === 'string') {
        return data.map(item => Array.isArray(item) ? item[0] : item).join(' ').trim();
      } else if (typeof data[0] === 'string') {
        return data.join(' ').trim();
      }
    }
  } catch (err) {
    // Fall through to Tier 2
  }

  // Tier 2: Google Translate gtx
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetchWithTimeout(url, 6000);
    const data = JSON.parse(res);
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map(chunk => chunk[0]).join('').trim();
    }
  } catch (err) {
    // Fall through to Tier 3
  }

  // Tier 3: MyMemory Translation API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=auto|${targetLang}`;
    const res = await fetchWithTimeout(url, 6000);
    const data = JSON.parse(res);
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText.replace(/<[^>]+>/g, '').trim();
    }
  } catch (err) {
    // All tiers exhausted
  }

  return trimmed;
}

/**
 * Translate text into English (or another target language)
 */
async function translateText(text, targetLang = 'en') {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return text;
  }

  const trimmed = text.trim();
  const cacheKey = `${targetLang}:${trimmed}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // For multi-paragraph content, translate paragraph-by-paragraph to preserve formatting
  if (trimmed.includes('\n\n')) {
    const paras = trimmed.split('\n\n');
    const translatedParas = [];
    for (const para of paras) {
      if (para.trim()) {
        const trans = await translateSingleChunk(para.trim(), targetLang);
        translatedParas.push(trans);
      } else {
        translatedParas.push('');
      }
    }
    const combined = translatedParas.join('\n\n');
    translationCache.set(cacheKey, combined);
    return combined;
  }

  const result = await translateSingleChunk(trimmed, targetLang);
  if (result && result !== trimmed) {
    translationCache.set(cacheKey, result);
  }
  return result;
}

/**
 * Batch translation helper
 */
async function translateBatch(items, targetLang = 'en') {
  if (Array.isArray(items)) {
    return Promise.all(items.map(t => translateText(t, targetLang)));
  } else if (typeof items === 'object' && items !== null) {
    const result = {};
    for (const [k, v] of Object.entries(items)) {
      result[k] = await translateText(v, targetLang);
    }
    return result;
  }
  return translateText(items, targetLang);
}

module.exports = {
  getLiveNews,
  getCachedLiveArticle,
  clearLiveCache,
  translateText,
  translateBatch,
  attachRealImages,
  EDITIONS
};
