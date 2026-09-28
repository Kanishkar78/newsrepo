import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { translateText } from '../services/api';

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

const DEFAULT_IMAGE = CATEGORY_FALLBACKS.General;

export default function NewsCard({ article }) {
  const [translated, setTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [displayTitle, setDisplayTitle] = useState(article.title);
  const [displayDesc, setDisplayDesc] = useState(article.description);

  const getFallback = () => {
    return article.image_fallback || CATEGORY_FALLBACKS[article.category] || DEFAULT_IMAGE;
  };

  const [imgSrc, setImgSrc] = useState(article.image_url || getFallback());

  // Synchronize state when article changes or when real image resolves
  useEffect(() => {
    setImgSrc(article.image_url || getFallback());
    setDisplayTitle(article.title);
    setDisplayDesc(article.description);
    setTranslated(false);
  }, [article.id, article.image_url, article.image_fallback, article.title, article.category]);

  const handleImageError = () => {
    const fallback = getFallback();
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else if (imgSrc !== DEFAULT_IMAGE) {
      setImgSrc(DEFAULT_IMAGE);
    }
  };

  const formattedDate = new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleTranslateToggle = async () => {
    if (translated) {
      setDisplayTitle(article.title);
      setDisplayDesc(article.description);
      setTranslated(false);
      return;
    }

    setTranslating(true);
    try {
      const [transTitle, transDesc] = await Promise.all([
        translateText(article.title, 'en'),
        translateText(article.description, 'en')
      ]);
      setDisplayTitle(transTitle);
      setDisplayDesc(transDesc);
      setTranslated(true);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslating(false);
    }
  };

  const categoryName = (article.category && typeof article.category === 'string' && article.category.trim())
    ? article.category.trim()
    : 'World';
  const categoryClass = `category-${categoryName.toLowerCase()}`;

  return (
    <article className="news-card">
      <div className="card-image-wrapper">
        <span className={`category-badge ${categoryClass}`}>{categoryName}</span>
        <img
          src={imgSrc}
          alt={article.title}
          className="card-image"
          loading="lazy"
          onError={handleImageError}
        />
      </div>

      <div className="card-body">
        <div className="card-meta">
          <span className="card-source">{article.source || 'PulseNews Wire'}</span>
          <span>{formattedDate}</span>
        </div>

        <h3 className="card-title" title={displayTitle} data-original={article.title}>
          {displayTitle}
        </h3>

        <p className="card-description" data-original={article.description}>
          {displayDesc}
        </p>

        <div className="card-footer">
          <div className="card-footer-left">
            <span className="card-author">By {article.author || 'Staff'}</span>
            <button
              className={`translate-card-btn ${translated ? 'active' : ''} ${translating ? 'loading' : ''}`}
              onClick={handleTranslateToggle}
              disabled={translating}
              title={translated ? 'Show in native original language' : 'Translate to English'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 8 6 6"></path>
                <path d="m4 14 6-6 2-3"></path>
                <path d="M2 5h12"></path>
                <path d="M7 2h1"></path>
                <path d="m22 22-5-10-5 10"></path>
                <path d="M14 18h6"></path>
              </svg>
              <span className="translate-label">
                {translating ? 'Translating...' : translated ? 'Original' : 'Translate'}
              </span>
            </button>
          </div>

          <Link to={`/article?id=${article.id}`} className="read-more-btn" aria-label={`Read full story: ${article.title}`}>
            <span>Read Article</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
