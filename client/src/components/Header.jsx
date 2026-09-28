import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header({ search = '', onSearchChange, edition = 'en-us', onEditionChange }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState(search);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Handle Search Input with 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, search]);

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchChange) onSearchChange('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" id="brand-logo-link">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
              <path d="M18 14h-8"></path>
              <path d="M15 18h-5"></path>
              <path d="M10 6h8v4h-8z"></path>
            </svg>
          </div>
          <span>Pulse<span>News</span></span>
        </Link>

        {/* Region & Native Language Edition Selector */}
        {onEditionChange && (
          <div className="edition-selector-wrapper">
            <div className="edition-icon" title="Choose Regional Edition & Native Language">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <select
              id="edition-select"
              className="edition-select"
              value={edition}
              onChange={(e) => onEditionChange(e.target.value)}
              aria-label="Select Region and Native Language Edition"
            >
              <option value="en-us">🇺🇸 Global (English)</option>
              <option value="ta-in">🇮🇳 Tamil Nadu (தமிழ்)</option>
              <option value="ml-in">🇮🇳 Kerala (മലയാളം)</option>
              <option value="en-gb">🇬🇧 UK (English)</option>
              <option value="de-de">🇩🇪 Germany (Deutsch)</option>
              <option value="hi-in">🇮🇳 India (हिन्दी)</option>
              <option value="te-in">🇮🇳 Telugu (తెలుగు)</option>
              <option value="fr-fr">🇫🇷 France (Français)</option>
              <option value="es-es">🇪🇸 Spain (Español)</option>
              <option value="ja-jp">🇯🇵 Japan (日本語)</option>
              <option value="ar-ae">🇦🇪 Arabic (العربية)</option>
              <option value="it-it">🇮🇹 Italy (Italiano)</option>
              <option value="ru-ru">🇷🇺 Russia (Русский)</option>
              <option value="zh-cn">🇨🇳 China (中文)</option>
            </select>
          </div>
        )}

        {/* Search Bar */}
        {onSearchChange && (
          <div className="search-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              id="search-input"
              className="search-input"
              placeholder="Search by title, topic, or keyword..."
              autoComplete="off"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button id="clear-search-btn" className="clear-search-btn" aria-label="Clear search" onClick={handleClearSearch}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* User Profile / Auth Pill */}
        <div id="header-user-container" className="header-user-container">
          {isAuthenticated && user ? (
            <div className="user-profile-pill">
              <div className="user-avatar">{getInitials(user.name)}</div>
              <span className="user-name" title={user.name}>{user.name}</span>
              <button
                id="logout-btn"
                className="logout-icon-btn"
                title="Sign Out"
                onClick={handleLogout}
                aria-label="Sign Out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            <Link to="/login" className="header-auth-btn" id="header-login-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Theme Switcher (Light / Dark Mode) */}
        <button
          id="theme-toggle-btn"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'dark' ? (
            <svg className="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg className="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
