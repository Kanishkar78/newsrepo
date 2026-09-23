/**
 * Main Home Page Controller
 * Supports regional language editions, live feeds, and instant English translation.
 */
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const newsGrid = document.getElementById('news-grid');
  const stateContainer = document.getElementById('state-container');
  const paginationContainer = document.getElementById('pagination-container');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  const editionSelect = document.getElementById('edition-select');
  const categoryNav = document.getElementById('category-nav');
  const sectionTitle = document.getElementById('section-title');
  const resultCount = document.getElementById('result-count');
  const dateFilterInput = document.getElementById('date-filter-input');
  const clearDateBtn = document.getElementById('clear-date-btn');

  // Application State
  const savedEdition = localStorage.getItem('pulsenews_edition') || 'en-us';
  if (editionSelect) {
    editionSelect.value = savedEdition;
  }

  let state = {
    category: 'all',
    search: '',
    edition: savedEdition,
    date: '',
    page: 1,
    limit: 6
  };

  let searchTimeout = null;

  // Initial Load
  init();

  function init() {
    setupEventListeners();
    loadNews();
  }

  function setupEventListeners() {
    // Regional Edition Selector
    if (editionSelect) {
      editionSelect.addEventListener('change', (e) => {
        state.edition = e.target.value;
        localStorage.setItem('pulsenews_edition', state.edition);
        state.page = 1;
        loadNews();
      });
    }

    // Refresh Feeds Button
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        loadNews(true);
      });
    }

    // Category Filter Buttons
    categoryNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;

      const category = btn.dataset.category;
      if (category === state.category) return;

      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      state.category = category;
      state.page = 1;
      loadNews();
    });

    // Search Input with Debounce (300ms)
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      clearSearchBtn.style.display = query.trim() ? 'flex' : 'none';

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.search = query;
        state.page = 1;
        loadNews();
      }, 300);
    });

    // Clear Search Input Button
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      state.search = '';
      state.page = 1;
      loadNews();
    });

    // Date Filter Input Handler
    if (dateFilterInput) {
      // Restrict max selectable date to today
      const today = new Date().toISOString().split('T')[0];
      dateFilterInput.max = today;

      dateFilterInput.addEventListener('change', (e) => {
        state.date = e.target.value;
        if (clearDateBtn) {
          clearDateBtn.style.display = state.date ? 'inline-flex' : 'none';
        }
        state.page = 1;
        loadNews();
      });
    }

    // Clear Date Filter Button
    if (clearDateBtn) {
      clearDateBtn.addEventListener('click', () => {
        if (dateFilterInput) dateFilterInput.value = '';
        clearDateBtn.style.display = 'none';
        state.date = '';
        state.page = 1;
        loadNews();
      });
    }

    // 1-Click Card Translation to English Handler
    newsGrid.addEventListener('click', async (e) => {
      const btn = e.target.closest('.translate-card-btn');
      if (!btn) return;

      const card = btn.closest('.news-card');
      if (!card) return;

      const titleEl = card.querySelector('.card-title');
      const descEl = card.querySelector('.card-description');
      const labelEl = btn.querySelector('.translate-label');

      if (!titleEl || !descEl) return;

      // Toggle back to Original text
      if (btn.classList.contains('active')) {
        titleEl.innerText = titleEl.dataset.original;
        descEl.innerText = descEl.dataset.original;
        btn.classList.remove('active');
        if (labelEl) labelEl.innerText = 'Translate';
        btn.title = 'Translate to English';
        return;
      }

      // Perform translation
      btn.classList.add('loading');
      if (labelEl) labelEl.innerText = 'Translating...';

      try {
        const origTitle = titleEl.dataset.original || titleEl.innerText;
        const origDesc = descEl.dataset.original || descEl.innerText;

        const [transTitle, transDesc] = await Promise.all([
          NewsAPI.translate(origTitle, 'en'),
          NewsAPI.translate(origDesc, 'en')
        ]);

        titleEl.innerText = transTitle;
        descEl.innerText = transDesc;
        btn.classList.remove('loading');
        btn.classList.add('active');
        if (labelEl) labelEl.innerText = 'Original';
        btn.title = 'Show in native original language';
      } catch (err) {
        console.error('Translation error:', err);
        btn.classList.remove('loading');
        if (labelEl) labelEl.innerText = 'Translate';
      }
    });
  }

  async function loadNews(forceRefresh = false) {
    stateContainer.style.display = 'none';
    newsGrid.style.display = 'grid';
    paginationContainer.innerHTML = '';

    const refreshIcon = refreshBtn ? refreshBtn.querySelector('.refresh-icon') : null;
    if (refreshIcon && forceRefresh) {
      refreshIcon.classList.add('spinning');
      if (refreshBtn) refreshBtn.disabled = true;
    }

    const selectedOption = editionSelect ? editionSelect.options[editionSelect.selectedIndex] : null;
    const editionText = selectedOption ? selectedOption.text.split('(')[0].trim() : 'Live';
    
    // Format date for title display
    const formattedDate = state.date 
      ? new Date(state.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';

    // Title update
    if (state.search.trim() && state.date) {
      sectionTitle.innerText = `Search: "${state.search.trim()}" (${formattedDate})`;
    } else if (state.search.trim()) {
      sectionTitle.innerText = `Search: "${state.search.trim()}"`;
    } else if (state.date && state.category.toLowerCase() !== 'all') {
      sectionTitle.innerText = `${state.category} — ${formattedDate}`;
    } else if (state.date) {
      sectionTitle.innerText = `Headlines — ${formattedDate}`;
    } else if (state.category.toLowerCase() !== 'all') {
      sectionTitle.innerText = `${state.category} — ${editionText}`;
    } else {
      sectionTitle.innerText = `${editionText} Top Headlines`;
    }

    resultCount.innerText = forceRefresh ? 'Refreshing feeds...' : 'Loading live news...';
    NewsUI.renderSkeletons(newsGrid, state.limit);

    try {
      const response = await NewsAPI.getNews({ ...state, refresh: forceRefresh });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch news');
      }

      const { data, pagination, is_live } = response;

      resultCount.innerText = `${pagination.total} ${is_live ? 'Live Stories' : 'Articles'}`;

      if (data.length === 0) {
        newsGrid.style.display = 'none';
        NewsUI.renderEmptyState(stateContainer, resetAllFilters);
        return;
      }

      NewsUI.renderCards(newsGrid, data);
      NewsUI.renderPagination(paginationContainer, pagination, (newPage) => {
        state.page = newPage;
        loadNews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

    } catch (err) {
      console.error('Error loading news:', err);
      newsGrid.style.display = 'none';
      resultCount.innerText = 'Feed Error';
      NewsUI.renderErrorState(stateContainer, err.message, () => loadNews(true));
    } finally {
      if (refreshIcon) {
        refreshIcon.classList.remove('spinning');
        if (refreshBtn) refreshBtn.disabled = false;
      }
    }
  }

  function resetAllFilters() {
    state.category = 'all';
    state.search = '';
    state.date = '';
    state.page = 1;

    searchInput.value = '';
    clearSearchBtn.style.display = 'none';

    if (dateFilterInput) dateFilterInput.value = '';
    if (clearDateBtn) clearDateBtn.style.display = 'none';

    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === 'all');
    });

    loadNews();
  }
});
