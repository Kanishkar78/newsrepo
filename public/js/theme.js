/**
 * Theme Controller Module
 * Supports light mode, dark mode, persistence in localStorage, and OS preference detection.
 */
(function() {
  const THEME_KEY = 'pulsenews_theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0a0e17');
    }
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
      btn.setAttribute('title', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    }
  }

  // Initial immediate application
  const currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  // Setup button listener when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const active = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = active === 'light' ? 'dark' : 'light';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
      });
    }

    // Listen to system changes if user hasn't explicitly set a preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? 'light' : 'dark');
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // Disable Mousepad / Trackpad Horizontal Swipe Navigation (Back/Forward)
  // --------------------------------------------------------------------------
  window.addEventListener('wheel', function(e) {
    // If predominantly horizontal trackpad swipe
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) {
      // Allow horizontal scroll ONLY inside elements that actually scroll horizontally
      var el = e.target;
      var canScroll = false;
      while (el && el !== document.body && el !== document.documentElement) {
        var style = window.getComputedStyle(el);
        var overflowX = style.overflowX;
        if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth) {
          canScroll = true;
          break;
        }
        el = el.parentElement;
      }
      if (!canScroll) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  // Disable horizontal edge swipe gestures on touchpads/touchscreens
  var touchStartX = 0;
  var touchStartY = 0;
  window.addEventListener('touchstart', function(e) {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', function(e) {
    if (!e.touches || e.touches.length === 0) return;
    var deltaX = e.touches[0].clientX - touchStartX;
    var deltaY = e.touches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 12) {
      var el = e.target;
      var canScroll = false;
      while (el && el !== document.body && el !== document.documentElement) {
        var style = window.getComputedStyle(el);
        if ((style.overflowX === 'auto' || style.overflowX === 'scroll') && el.scrollWidth > el.clientWidth) {
          canScroll = true;
          break;
        }
        el = el.parentElement;
      }
      if (!canScroll) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  window.PulseTheme = {
    getTheme: () => document.documentElement.getAttribute('data-theme') || 'dark',
    setTheme: (t) => {
      localStorage.setItem(THEME_KEY, t);
      applyTheme(t);
    }
  };
})();
