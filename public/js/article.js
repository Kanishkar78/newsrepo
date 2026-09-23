/**
 * Article Detail Controller
 * Supports full-article native viewing & instant English translation.
 */
document.addEventListener('DOMContentLoaded', () => {
  const contentWrapper = document.getElementById('article-content-wrapper');
  const translateBtn = document.getElementById('translate-article-btn');
  
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  if (!articleId) {
    renderNotFound('No article ID specified in the URL.');
    return;
  }

  // Defensive helpers in case NewsUI is loading or undefined
  const escapeHtml = (text) => {
    if (window.NewsUI && typeof window.NewsUI.escapeHtml === 'function') {
      return window.NewsUI.escapeHtml(text);
    }
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const getCategoryClass = (category) => {
    if (window.NewsUI && typeof window.NewsUI.getCategoryClass === 'function') {
      return window.NewsUI.getCategoryClass(category);
    }
    return `category-${(category || 'technology').toLowerCase()}`;
  };

  let currentArticle = null;
  let translatedData = null;

  loadArticleDetail(articleId);

  async function loadArticleDetail(id) {
    try {
      const article = await NewsAPI.getArticleById(id);

      if (!article) {
        renderNotFound('The article you are looking for does not exist or has been removed.');
        return;
      }

      currentArticle = article;
      translatedData = null;

      // Update Document Title
      document.title = `${article.title} — PulseNews`;

      // Enable translation button
      if (translateBtn) {
        translateBtn.style.display = 'inline-flex';
        translateBtn.classList.remove('active', 'loading');
        const textSpan = translateBtn.querySelector('.translate-btn-text');
        if (textSpan) textSpan.innerText = 'Translate to English';
      }

      renderArticleContent(article.title, article.description, article.content);

    } catch (err) {
      console.error('Error fetching article detail:', err);
      renderError('Failed to load article. Please check your internet connection or server status.');
    }
  }

  function renderArticleContent(title, description, content) {
    if (!currentArticle) return;
    const catClass = getCategoryClass(currentArticle.category);
    const timeFormatted = new Date(currentArticle.published_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const hasRegionalChars = /[\u0B80-\u0BFF\u0D00-\u0D7F\u0900-\u097F\u0C00-\u0C7F]/.test(title);
    const descHasEnglish = description && (description.match(/[a-zA-Z]{4,}/g) || []).length > 3;
    const isPlaceholderDesc = description && (
      description.includes('Live report:') ||
      description.includes('Real-time updates') ||
      description.includes('This story is curated directly') ||
      content.startsWith(description.trim()) ||
      content.includes(description.trim())
    );
    const shouldShowLeadDesc = description && !isPlaceholderDesc && !(hasRegionalChars && descHasEnglish) && (!content || content.split('\n\n').length < 2);

    contentWrapper.innerHTML = `
      <article class="article-detail">
        <header class="article-header">
          <span class="category-badge ${catClass}">${escapeHtml(currentArticle.category)}</span>
          <h1 class="article-title-main" id="article-title-el">${escapeHtml(title)}</h1>
          
          <div class="article-meta-row">
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>${escapeHtml(currentArticle.author || 'Staff Reporter')}</span>
            </div>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>${timeFormatted}</span>
            </div>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span class="card-source">${escapeHtml(currentArticle.source || 'News Network')}</span>
            </div>
          </div>
        </header>

        <div class="hero-image-box">
          <img 
            src="${escapeHtml(currentArticle.image_url || currentArticle.image_fallback || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80')}" 
            data-fallback="${escapeHtml(currentArticle.image_fallback || '')}"
            alt="${escapeHtml(title)}" 
            onerror="NewsUI ? NewsUI.handleImageError(this) : (this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80')"
          />
        </div>

        <div class="article-body-content" id="article-body-el">
          ${shouldShowLeadDesc ? `<p class="article-lead-paragraph">${escapeHtml(description)}</p>` : ''}
          ${formatParagraphs(content)}
        </div>

        ${currentArticle.source_url ? `
          <div class="article-source-box">
            <div class="source-info">
              <span class="source-label">Original Publication Source</span>
              <span class="source-name">${escapeHtml(currentArticle.source || 'News Network')}</span>
            </div>
            <a href="${escapeHtml(currentArticle.source_url)}" target="_blank" rel="noopener noreferrer" class="source-external-btn">
              Read Full Story on ${escapeHtml(currentArticle.source || 'Publisher')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        ` : ''}
      </article>
    `;
  }

  // Translation button click handler
  if (translateBtn) {
    translateBtn.addEventListener('click', async () => {
      if (!currentArticle) return;
      const textSpan = translateBtn.querySelector('.translate-btn-text');

      // Toggle back to original language
      if (translateBtn.classList.contains('active')) {
        renderArticleContent(currentArticle.title, currentArticle.description, currentArticle.content);
        translateBtn.classList.remove('active');
        if (textSpan) textSpan.innerText = 'Translate to English';
        return;
      }

      // If already fetched translation, use cached version
      if (translatedData) {
        renderArticleContent(translatedData.title, translatedData.description, translatedData.content);
        translateBtn.classList.add('active');
        if (textSpan) textSpan.innerText = 'Show Original';
        return;
      }

      // Fetch translation
      translateBtn.classList.add('loading');
      if (textSpan) textSpan.innerText = 'Translating article...';

      try {
        const [transTitle, transDesc, transContent] = await Promise.all([
          NewsAPI.translate(currentArticle.title, 'en'),
          NewsAPI.translate(currentArticle.description, 'en'),
          NewsAPI.translate(currentArticle.content, 'en')
        ]);

        translatedData = {
          title: transTitle,
          description: transDesc,
          content: transContent
        };

        renderArticleContent(transTitle, transDesc, transContent);
        translateBtn.classList.remove('loading');
        translateBtn.classList.add('active');
        if (textSpan) textSpan.innerText = 'Show Original';
      } catch (err) {
        console.error('Translation error:', err);
        translateBtn.classList.remove('loading');
        if (textSpan) textSpan.innerText = 'Translation Failed';
        setTimeout(() => {
          if (textSpan) textSpan.innerText = 'Translate to English';
        }, 2000);
      }
    });
  }

  function formatParagraphs(text) {
    if (!text) return '';
    return text
      .split('\n\n')
      .map(p => `<p>${escapeHtml(p.trim())}</p>`)
      .join('');
  }

  function renderNotFound(message) {
    if (translateBtn) translateBtn.style.display = 'none';
    contentWrapper.innerHTML = `
      <div class="state-container">
        <div class="state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="state-title">Article Not Found</h3>
        <p class="state-desc">${escapeHtml(message)}</p>
        <a href="/" class="primary-btn">&#8592; Back to Home</a>
      </div>
    `;
  }

  function renderError(message) {
    if (translateBtn) translateBtn.style.display = 'none';
    contentWrapper.innerHTML = `
      <div class="state-container">
        <div class="state-icon error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 class="state-title">Error Loading Article</h3>
        <p class="state-desc">${escapeHtml(message)}</p>
        <a href="/" class="primary-btn">&#8592; Return to Home</a>
      </div>
    `;
  }
});
