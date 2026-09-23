/**
 * API Client Module for PulseNews
 * Decouples API fetching logic so real news APIs, editions, and translation can be made easily.
 */
const NewsAPI = (function() {
  const BASE_URL = '/api';

  async function getNews({ category = 'all', search = '', edition = 'en-us', page = 1, limit = 9, refresh = false, date = '' } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search && search.trim()) params.append('search', search.trim());
    if (edition) params.append('edition', edition);
    if (date && date.trim()) params.append('date', date.trim());
    params.append('page', page);
    params.append('limit', limit);
    if (refresh) params.append('refresh', 'true');

    const response = await fetch(`${BASE_URL}/news?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }
    return await response.json();
  }

  async function getEditions() {
    const response = await fetch(`${BASE_URL}/editions`);
    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }
    return await response.json();
  }

  async function refreshNews(edition = 'en-us') {
    const response = await fetch(`${BASE_URL}/news/refresh?edition=${encodeURIComponent(edition)}`);
    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }
    return await response.json();
  }

  async function getArticleById(id) {
    const response = await fetch(`${BASE_URL}/news/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Server returned HTTP status ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  }

  async function translate(text, target = 'en') {
    if (!text || !text.trim()) return text;
    const response = await fetch(`${BASE_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target })
    });
    if (!response.ok) {
      throw new Error(`Translation returned HTTP status ${response.status}`);
    }
    const result = await response.json();
    return result.translation;
  }

  async function translateBatch(texts, target = 'en') {
    if (!texts) return texts;
    const response = await fetch(`${BASE_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, target })
    });
    if (!response.ok) {
      throw new Error(`Batch translation returned HTTP status ${response.status}`);
    }
    const result = await response.json();
    return result.translations;
  }

  return {
    getNews,
    getEditions,
    refreshNews,
    getArticleById,
    translate,
    translateBatch
  };
})();
