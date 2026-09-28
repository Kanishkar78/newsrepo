/**
 * PulseNews API Client Module
 * Provides typed/async fetching for News, Editions, Translation, and Auth.
 */
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const BASE_URL = API_BASE ? `${API_BASE}/api` : '/api';

export async function fetchNews({ category = 'all', search = '', edition = 'en-us', page = 1, limit = 6, refresh = false, date = '' } = {}) {
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
    let errMsg = `Server returned HTTP ${response.status}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) errMsg = errData.error;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return await response.json();
}

export async function fetchArticleById(id) {
  const response = await fetch(`${BASE_URL}/news/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    let errMsg = `Server returned HTTP ${response.status}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) errMsg = errData.error;
    } catch (_) {}
    throw new Error(errMsg);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchEditions() {
  const response = await fetch(`${BASE_URL}/editions`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

export async function refreshNewsFeed(edition = 'en-us') {
  const response = await fetch(`${BASE_URL}/news/refresh?edition=${encodeURIComponent(edition)}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

export async function translateText(text, target = 'en') {
  if (!text || !text.trim()) return text;
  const response = await fetch(`${BASE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, target })
  });
  if (!response.ok) return text;
  const data = await response.json();
  return data.translation || text;
}

export async function translateBatch(texts, target = 'en') {
  if (!texts || !texts.length) return texts;
  const response = await fetch(`${BASE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, target })
  });
  if (!response.ok) return texts;
  const data = await response.json();
  return data.translations || texts;
}
