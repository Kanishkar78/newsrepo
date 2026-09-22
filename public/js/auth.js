/**
 * PulseNews Client Authentication Controller
 * Manages user session, persistent token, login/signup API calls, and UI state.
 */
const PulseAuth = (function() {
  const TOKEN_KEY = 'pulsenews_token';
  const USER_KEY = 'pulsenews_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (_) {
      return null;
    }
  }

  function saveSession(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function isAuthenticated() {
    return Boolean(getToken());
  }

  async function register({ name, email, password }) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Registration failed. Please check your details.');
    }

    saveSession(data.token, data.user);
    return data;
  }

  async function login({ email, password }) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Invalid email or password.');
    }

    saveSession(data.token, data.user);
    return data;
  }

  async function logout() {
    const token = getToken();
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (_) {}

    clearSession();
    window.location.href = '/login';
  }

  async function verifyCurrentSession() {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return data.user;
        }
      } else if (response.status === 401) {
        clearSession();
        return null;
      }
    } catch (_) {}
    return getUser();
  }

  function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function renderHeaderUser() {
    const container = document.getElementById('header-user-container');
    if (!container) return;

    const user = getUser();
    if (!user || !isAuthenticated()) {
      container.innerHTML = `
        <a href="/login" class="header-auth-btn" id="header-login-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>Sign In</span>
        </a>
      `;
      return;
    }

    const initials = getInitials(user.name);
    const firstName = user.name.split(' ')[0] || user.name;

    container.innerHTML = `
      <div class="user-profile-pill" title="Signed in as ${user.email}">
        <div class="user-avatar">${initials}</div>
        <span class="user-name">${firstName}</span>
        <button id="header-logout-btn" class="logout-icon-btn" title="Sign Out" aria-label="Sign Out">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    `;

    const logoutBtn = document.getElementById('header-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
  }

  // Initialize header rendering on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    renderHeaderUser();
    if (isAuthenticated()) {
      verifyCurrentSession().then(() => renderHeaderUser());
    }
  });

  return {
    getToken,
    getUser,
    isAuthenticated,
    register,
    login,
    logout,
    renderHeaderUser,
    verifyCurrentSession
  };
})();

window.PulseAuth = PulseAuth;
