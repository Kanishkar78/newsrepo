/**
 * UI Rendering and DOM Manipulation Module
 */
const NewsUI = (function() {
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

  function formatDate(isoString) {
    if (!isoString) return 'Recently';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getCategoryClass(category) {
    const cat = (category || '').toLowerCase();
    switch (cat) {
      case 'sports': return 'category-sports';
      case 'politics': return 'category-politics';
      case 'technology': return 'category-technology';
      case 'business': return 'category-business';
      case 'entertainment': return 'category-entertainment';
      case 'education': return 'category-education';
      default: return 'category-technology';
    }
  }

  function handleImageError(img) {
    if (img.dataset.fallback && img.src !== img.dataset.fallback) {
      const fb = img.dataset.fallback;
      img.dataset.fallback = ''; // Clear fallback to avoid looping
      img.src = fb;
    } else {
      img.onerror = null; // Prevent infinite loop
      img.src = FALLBACK_IMAGE;
    }
  }

  function renderSkeletons(container, count = 6) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const card = document.createElement('div');
      card.className = 'skeleton-card';
      card.innerHTML = `
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton skeleton-text-short"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text-short"></div>
        </div>
      `;
      container.appendChild(card);
    }
  }

  function renderCards(container, articles) {
    container.innerHTML = '';

    articles.forEach(article => {
      const card = document.createElement('article');
      card.className = 'news-card';
      
      const catClass = getCategoryClass(article.category);
      const imageUrl = article.image_url || article.image_fallback || FALLBACK_IMAGE;
      const fallbackUrl = article.image_fallback || FALLBACK_IMAGE;
      const timeAgo = formatDate(article.published_at);

      card.innerHTML = `
        <div class="card-image-wrapper">
          <span class="category-badge ${catClass}">${escapeHtml(article.category)}</span>
          <img 
            src="${escapeHtml(imageUrl)}" 
            data-fallback="${escapeHtml(fallbackUrl)}"
            alt="${escapeHtml(article.title)}" 
            class="card-image"
            loading="lazy"
            onerror="NewsUI.handleImageError(this)"
          />
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-source">${escapeHtml(article.source || 'News Wire')}</span>
            <span>${timeAgo}</span>
          </div>
          <h2 class="card-title" data-original="${escapeHtml(article.title)}">${escapeHtml(article.title)}</h2>
          <p class="card-description" data-original="${escapeHtml(article.description)}">${escapeHtml(article.description)}</p>
          <div class="card-footer">
            <div class="card-footer-left">
              <span class="card-author">By ${escapeHtml(article.author || 'Staff')}</span>
              <button class="translate-card-btn" title="Translate to English" data-id="${article.id}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m5 8 6 6"></path>
                  <path d="m4 14 6-6 2-3"></path>
                  <path d="M2 5h12"></path>
                  <path d="M7 2h1"></path>
                  <path d="m22 22-5-10-5 10"></path>
                  <path d="M14 18h6"></path>
                </svg>
                <span class="translate-label">Translate</span>
              </button>
            </div>
            <a href="/article.html?id=${article.id}" class="read-more-btn">
              Read Article
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function renderPagination(container, pagination, onPageChange) {
    container.innerHTML = '';
    const { page, totalPages } = pagination;

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '&#8592; Prev';
    prevBtn.disabled = page <= 1;
    prevBtn.addEventListener('click', () => onPageChange(page - 1));
    container.appendChild(prevBtn);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `page-btn ${i === page ? 'active' : ''}`;
      pageBtn.innerText = i;
      pageBtn.addEventListener('click', () => onPageChange(i));
      container.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = 'Next &#8594;';
    nextBtn.disabled = page >= totalPages;
    nextBtn.addEventListener('click', () => onPageChange(page + 1));
    container.appendChild(nextBtn);
  }

  function renderEmptyState(container, onReset) {
    container.innerHTML = `
      <div class="state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </div>
      <h3 class="state-title">No matching news articles found</h3>
      <p class="state-desc">Try searching for a different keyword or selecting another news category.</p>
      <button class="primary-btn" id="reset-filters-btn">Clear All Filters</button>
    `;
    container.style.display = 'block';
    
    document.getElementById('reset-filters-btn').addEventListener('click', onReset);
  }

  function renderErrorState(container, message, onRetry) {
    container.innerHTML = `
      <div class="state-icon error-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 class="state-title">Failed to load news</h3>
      <p class="state-desc">${escapeHtml(message || 'Unable to connect to news service.')}</p>
      <button class="primary-btn" id="retry-btn">Try Again</button>
    `;
    container.style.display = 'block';

    document.getElementById('retry-btn').addEventListener('click', onRetry);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    renderCards,
    renderPagination,
    renderSkeletons,
    renderEmptyState,
    renderErrorState,
    handleImageError,
    formatDate,
    getCategoryClass,
    escapeHtml
  };
})();
