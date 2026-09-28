import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchArticleById, translateText } from '../services/api';

const CATEGORY_FALLBACKS = {
  Technology: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Large_Hadron_Collider_mock-up.jpg/1280px-Large_Hadron_Collider_mock-up.jpg',
  Business: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Lehman_Brothers_at_Times_Square.jpg/1280px-Lehman_Brothers_at_Times_Square.jpg',
  Science: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/International_Space_Station_after_undocking_of_STS-132.jpg/1280px-International_Space_Station_after_undocking_of_STS-132.jpg',
  Health: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/SARS-CoV-2_without_background.png/1280px-SARS-CoV-2_without_background.png',
  Sports: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Olympic_rings_without_rims.svg/1280px-Olympic_rings_without_rims.svg.png',
  Entertainment: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Hollywood_Sign_%28Zuschnitt%29.jpg/1280px-Hollywood_Sign_%28Zuschnitt%29.jpg',
  World: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Peace_and_Reconciliation%2C_Astana.jpg/1280px-Palace_of_Peace_and_Reconciliation%2C_Astana.jpg',
  General: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Peace_and_Reconciliation%2C_Astana.jpg/1280px-Palace_of_Peace_and_Reconciliation%2C_Astana.jpg'
};

const DEFAULT_HERO = CATEGORY_FALLBACKS.General;

export default function ArticleDetailPage() {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const articleId = queryParams.get('id');

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Translation State
  const [translated, setTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayContent, setDisplayContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!articleId) {
      setError('Article ID is missing');
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchArticleById(articleId);
        if (!data) {
          setError('Article not found.');
        } else {
          setArticle(data);
          setDisplayTitle(data.title);
          setDisplayContent(data.content || data.description);
        }
      } catch (err) {
        setError(err.message || 'Failed to load article details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [articleId]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTranslateToggle = async () => {
    if (!article) return;
    if (translated) {
      setDisplayTitle(article.title);
      setDisplayContent(article.content || article.description);
      setTranslated(false);
      return;
    }

    setTranslating(true);
    try {
      const [transTitle, transContent] = await Promise.all([
        translateText(article.title, 'en'),
        translateText(article.content || article.description, 'en')
      ]);
      setDisplayTitle(transTitle);
      setDisplayContent(transContent);
      setTranslated(true);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslating(false);
    }
  };

  const handleTextToSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${displayTitle}. ${displayContent}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateReadTime = (text) => {
    if (!text) return '2 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  const formattedDate = article
    ? new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  const categoryName = (article?.category && typeof article.category === 'string' && article.category.trim())
    ? article.category.trim()
    : 'World';
  const categoryClass = `category-${categoryName.toLowerCase()}`;

  return (
    <div className="article-page">
      <Header />

      <main className="main-content">
        <div className="article-detail-container" id="article-detail-container">
          {/* Top Back Navigation Bar */}
          <div className="article-top-nav">
            <Link to="/" className="back-link" id="back-to-news-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to All Articles</span>
            </Link>

            {article && (
              <button
                id="translate-article-btn"
                className={`translate-article-btn ${translated ? 'active' : ''} ${translating ? 'loading' : ''}`}
                onClick={handleTranslateToggle}
                disabled={translating}
                title={translated ? 'Show in native original language' : 'Translate article content to English'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 8 6 6"></path>
                  <path d="m4 14 6-6 2-3"></path>
                  <path d="M2 5h12"></path>
                  <path d="M7 2h1"></path>
                  <path d="m22 22-5-10-5 10"></path>
                  <path d="M14 18h6"></path>
                </svg>
                <span className="translate-btn-text">
                  {translating ? 'Translating...' : translated ? 'Show Original' : 'Translate to English'}
                </span>
              </button>
            )}
          </div>

          {loading && (
            <div className="skeleton-card" style={{ height: 600 }}>
              <div className="skeleton-body">
                <div className="skeleton skeleton-title" style={{ height: 40, width: '90%' }}></div>
                <div className="skeleton skeleton-text" style={{ height: 300 }}></div>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="state-container" style={{ display: 'block' }}>
              <h3 className="state-title">{error}</h3>
              <p className="state-desc">The requested article could not be loaded or may have been removed.</p>
              <Link to="/" className="primary-btn" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '1rem' }}>
                Return to News Feed
              </Link>
            </div>
          )}

          {!loading && article && (
            <article className="article-detail">
              {/* Article Header */}
              <header className="article-header">
                <span className={`category-badge ${categoryClass}`}>{categoryName}</span>
                <h1 className="article-title-main" id="article-title-el">{displayTitle}</h1>

                {/* Metadata Row */}
                <div className="article-meta-row">
                  <div className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>{article.author || 'Staff Reporter'}</span>
                  </div>

                  <div className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{formattedDate}</span>
                  </div>

                  <div className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span className="card-source">{article.source || 'News Network'}</span>
                  </div>
                </div>
              </header>

              {/* Hero Image */}
              <div className="hero-image-box">
                <img
                  src={article.image_url || article.image_fallback || (CATEGORY_FALLBACKS[article.category] || DEFAULT_HERO)}
                  alt={article.title}
                  onError={(e) => {
                    const fallback = article.image_fallback || CATEGORY_FALLBACKS[article.category] || DEFAULT_HERO;
                    if (e.target.src !== fallback) {
                      e.target.src = fallback;
                    } else if (e.target.src !== DEFAULT_HERO) {
                      e.target.src = DEFAULT_HERO;
                    }
                  }}
                />
              </div>

              {/* Body Content */}
              <div className="article-body-content" id="article-body-el">
                {article.description && displayContent && !displayContent.includes(article.description.trim()) && (
                  <p className="article-lead-paragraph">{article.description}</p>
                )}
                {displayContent ? (
                  displayContent.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))
                ) : (
                  <p>{article.description}</p>
                )}
              </div>

              {/* Source Link */}
              {article.source_url && (
                <div className="article-source-box">
                  <div className="source-info">
                    <span className="source-label">Original Publication Source</span>
                    <span className="source-name">{article.source || 'News Network'}</span>
                  </div>
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-external-btn"
                  >
                    Read Full Story on {article.source || 'Publisher'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>
              )}
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
