import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import CategoryNav from '../components/CategoryNav';
import NewsCard from '../components/NewsCard';
import Pagination from '../components/Pagination';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Footer from '../components/Footer';
import { fetchNews, refreshNewsFeed } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { isAuthenticated, killSession } = useAuth();

  // --------------------------------------------------------------------------
  // Invariant: Kill session if user clicks browser Back button on Dashboard
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated) return;

    // Push active dashboard state so there is a state entry to pop
    window.history.pushState({ page: 'dashboard' }, document.title, window.location.href);

    const handlePopState = () => {
      // User clicked browser Back button while on Dashboard
      killSession('session_killed');
      window.location.replace('/login?reason=session_killed');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, killSession]);

  // Feed State
  const [edition, setEdition] = useState(() => localStorage.getItem('pulsenews_edition') || 'en-us');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  const [articles, setArticles] = useState([]);
  const [paginationData, setPaginationData] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadArticles = useCallback(async (isRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (isRefresh) {
        setRefreshing(true);
        await refreshNewsFeed(edition);
      }
      const res = await fetchNews({
        category,
        search,
        edition,
        page,
        limit,
        date,
        refresh: isRefresh
      });
      setArticles(res.data || []);
      setPaginationData(res.pagination || { page: 1, totalPages: 1, total: 0 });
      setIsLive(Boolean(res.is_live));
    } catch (err) {
      console.error('Error loading news:', err);
      setError(err.message || 'Failed to retrieve news articles.');
      setArticles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, search, edition, page, limit, date]);

  useEffect(() => {
    if (isAuthenticated) {
      loadArticles();
    }
  }, [loadArticles, isAuthenticated]);

  const handleEditionChange = (newEdition) => {
    setEdition(newEdition);
    localStorage.setItem('pulsenews_edition', newEdition);
    setPage(1);
  };

  const handleCategorySelect = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
  };

  const handleSearchChange = (query) => {
    setSearch(query);
    setPage(1);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setPage(1);
  };

  const handleClearDate = () => {
    setDate('');
    setPage(1);
  };

  const handleResetFilters = () => {
    setCategory('all');
    setSearch('');
    setDate('');
    setPage(1);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="app-container">
      <Header
        search={search}
        onSearchChange={handleSearchChange}
        edition={edition}
        onEditionChange={handleEditionChange}
      />

      <CategoryNav
        activeCategory={category}
        onSelectCategory={handleCategorySelect}
      />

      <main className="main-content">
        <div className="status-bar">
          <div className="status-left">
            <h1 className="section-title" id="section-title">
              {date 
                ? (category === 'all' ? `Headlines — ${date}` : `${category} News — ${date}`) 
                : (category === 'all' ? 'Latest Headlines' : `${category} News`)}
            </h1>
            <div className={`live-status-pill ${date ? 'archive-mode' : ''}`}>
              <span className={`live-dot ${date ? 'archive-dot' : ''}`}></span>
              <span className="live-text">{date ? `ARCHIVE (${date})` : 'LIVE WORLDWIDE'}</span>
            </div>
          </div>

          <div className="status-right">
            {/* Date Filter Control */}
            <div className="date-filter-wrapper" title="Filter articles by date from year 2000 to present">
              <div className="date-filter-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <input
                type="date"
                id="date-filter-input"
                className="date-filter-input"
                min="2000-01-01"
                max={todayStr}
                value={date}
                onChange={handleDateChange}
                aria-label="Filter news by date (2000 to present)"
                title="Filter news by date (2000 to present)"
              />
              {date && (
                <button
                  id="clear-date-btn"
                  className="clear-date-btn"
                  onClick={handleClearDate}
                  aria-label="Clear date filter"
                  title="Clear date filter"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            <span className="result-count" id="result-count">
              {loading 
                ? (date ? 'Retrieving historical archive...' : 'Loading live news...') 
                : `${paginationData.total} ${date ? 'Archive Articles' : (isLive ? 'Live Stories' : 'Articles')}`}
            </span>

            <button
              id="refresh-btn"
              className="refresh-action-btn"
              onClick={() => loadArticles(true)}
              disabled={refreshing || loading}
              title="Refresh breaking news feeds"
            >
              <svg
                className={`refresh-icon ${refreshing ? 'spinning' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="news-grid" id="news-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <ErrorState message={error} onRetry={() => loadArticles(true)} />
        )}

        {/* Empty State */}
        {!loading && !error && articles.length === 0 && (
          <EmptyState onReset={handleResetFilters} />
        )}

        {/* News Grid */}
        {!loading && !error && articles.length > 0 && (
          <div className="news-grid" id="news-grid">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <Pagination
            page={paginationData.page}
            totalPages={paginationData.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
