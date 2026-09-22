/**
 * Live Global News Service
 * Multi-region, native-language news aggregation & instant translation engine.
 */

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
    if (!description || description.length < 30 || description.startsWith(title) || description.includes('View Full Coverage')) {
      description = `Live report: "${title}". Real-time updates, local context, and developments reported by ${source}.`;
    }

    const content = `${description}\n\nThis story is curated directly from the ${source} newsroom. Journalists continue to track statements, local reports, and official reactions as this story develops.\n\nTo view the full original reporting and multimedia, click the official publisher link below.`;

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
 * Build feed URLs for a specific regional edition and category
 */
function buildFeedUrls(editionConfig, category) {
  const { hl, gl, ceid } = editionConfig;
  const catKey = (category || 'all').toLowerCase();

  if (catKey === 'all') {
    const urls = [`https://news.google.com/rss?hl=${hl}&gl=${gl}&ceid=${ceid}`];
    if (editionConfig.code === 'en-us') {
      urls.push('https://feeds.bbci.co.uk/news/world/rss.xml');
    } else if (editionConfig.code === 'en-gb') {
      urls.push('https://feeds.bbci.co.uk/news/rss.xml');
    }
    return urls;
  }

  // Topic mapping
  const topicMap = {
    technology: 'TECHNOLOGY',
    sports: 'SPORTS',
    business: 'BUSINESS',
    entertainment: 'ENTERTAINMENT',
    politics: 'POLITICS'
  };

  if (topicMap[catKey]) {
    return [
      `https://news.google.com/rss/headlines/section/topic/${topicMap[catKey]}?hl=${hl}&gl=${gl}&ceid=${ceid}`
    ];
  }

  // Education / custom category searches
  const query = catKey === 'education' ? 'education schools university' : catKey;
  return [
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+when:7d&hl=${hl}&gl=${gl}&ceid=${ceid}`
  ];
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
      const urls = buildFeedUrls(editionConfig, catKey);
      const results = await Promise.allSettled(urls.map(u => fetchWithTimeout(u)));

      const parsedBatches = [];
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value) {
          const catName = catKey === 'all' ? 'World' : (category.charAt(0).toUpperCase() + category.slice(1));
          parsedBatches.push(parseRssXml(res.value, catName, editionConfig));
        }
      });

      const seenTitles = new Set();
      const combined = parsedBatches.flat();

      for (const item of combined) {
        const normTitle = item.title.toLowerCase().substring(0, 30);
        if (!seenTitles.has(normTitle)) {
          seenTitles.add(normTitle);
          articles.push(item);
        }
      }
    }
  } catch (err) {
    console.error(`Error fetching live feeds for edition ${editionConfig.name}:`, err.message);
  }

  // Sort by published_at DESC
  articles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

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

/**
 * Clean headline for search engines by removing publisher names, punctuation,
 * and trimming to the core subject matter.
 */
function cleanHeadlineForSearch(title) {
  if (!title) return '';
  // 1. Remove trailing source suffix e.g. " - BBC News"
  let clean = title.replace(/\s+[-|–—]\s+[^-|–—]+$/, '').trim();
  // 2. Clean punctuation while preserving all unicode letters & numbers
  clean = clean.replace(/["'“”«»()[\]{}—:;,.]/g, ' ').replace(/\s+/g, ' ').trim();
  // 3. Take first 8 words for focused keyword matching
  const words = clean.split(' ').filter(w => w.length > 0);
  if (words.length > 8) {
    clean = words.slice(0, 8).join(' ');
  }
  return clean;
}

/**
 * Fetch and extract the exact real news photo for an individual article story.
 * Multi-tiered:
 * 1. Bing Image Engine (returns exact news publisher photos & edge CDN thumbnails)
 * 2. Wikipedia / Wikimedia API (for recognized global entities, events, leaders)
 * 3. Default category fallback
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

  // Tier 1: Bing Image Search
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(cleanQuery + ' news')}&form=HDRSC2&first=1`;
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    clearTimeout(timeout);

    const html = await res.text();
    const regex = /class="iusc"[^>]*m="([^"]+)"/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      try {
        const decoded = match[1].replace(/&quot;/g, '"');
        const obj = JSON.parse(decoded);
        const murl = obj.murl;
        const turl = obj.turl ? obj.turl.replace(/&amp;/g, '&') : null;

        if (murl || turl) {
          const imageUrl = murl || turl;
          const imageFallback = turl || murl;
          const result = { imageUrl, imageFallback };

          articleImageCache.set(cacheKey, result);
          article.image_url = imageUrl;
          article.image_fallback = imageFallback;
          article.has_real_image = true;
          return result;
        }
      } catch (_) {}
    }
  } catch (err) {
    // Silently proceed to Tier 2
  }

  // Tier 2: Wikipedia API fallback
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(cleanQuery)}&gsrlimit=1&prop=pageimages&pithumbsize=800&format=json&origin=*`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const wikiRes = await fetch(wikiUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'NewsReaderApp/1.0' }
    });
    clearTimeout(timeout);

    const wikiData = await wikiRes.json();
    if (wikiData.query && wikiData.query.pages) {
      const page = Object.values(wikiData.query.pages)[0];
      if (page && page.thumbnail && page.thumbnail.source) {
        const imageUrl = page.thumbnail.source;
        const result = { imageUrl, imageFallback: imageUrl };

        articleImageCache.set(cacheKey, result);
        article.image_url = imageUrl;
        article.image_fallback = imageUrl;
        article.has_real_image = true;
        return result;
      }
    }
  } catch (err) {
    // Silently proceed
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
      if (art.has_real_image) return;
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

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetchWithTimeout(url, 6000);
    const data = JSON.parse(res);

    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0].map(chunk => chunk[0]).join('').trim();
      translationCache.set(cacheKey, translated);
      return translated;
    }
    return trimmed;
  } catch (err) {
    console.warn('Translation service error:', err.message);
    return trimmed;
  }
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
