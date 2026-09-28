import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

export default function LoginPage() {
  const { login, register, isAuthenticated, killSession } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('tab') === 'signup' ? 'signup' : 'login';
  const redirectTarget = queryParams.get('redirect') || '/';

  const [mode, setMode] = useState(initialMode);
  const [alert, setAlert] = useState(null); // { message, isSuccess }
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [nameError, setNameError] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmMatch, setConfirmMatch] = useState(null); // true | false | null

  // Password rules validation
  const rules = {
    length: signupPassword.length >= 8,
    upper: /[A-Z]/.test(signupPassword),
    lower: /[a-z]/.test(signupPassword),
    number: /[0-9]/.test(signupPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(signupPassword)
  };

  const getStrength = () => {
    if (!signupPassword) return { score: 0, label: 'empty', meetsAll: false };
    let score = 0;
    if (rules.length) score++;
    if (rules.upper) score++;
    if (rules.lower) score++;
    if (rules.number) score++;
    if (rules.special) score++;

    const meetsAll = score === 5;
    if (score <= 2 || !rules.length) return { score: 1, label: 'weak', meetsAll };
    if (score === 3) return { score: 2, label: 'fair', meetsAll };
    if (score === 4) return { score: 3, label: 'good', meetsAll };
    return { score: 4, label: signupPassword.length >= 12 ? 'Very Strong' : 'Strong', meetsAll };
  };

  const strength = getStrength();

  // --------------------------------------------------------------------------
  // Invariant: Kill session if user enters or backs into Login with an active token
  // --------------------------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem('pulsenews_token');
    const reason = queryParams.get('reason');
    const wasKilled = sessionStorage.getItem('pulsenews_session_killed');

    if (token) {
      killSession('session_killed');
      setAlert({ message: 'Your session was terminated. Please sign in again to access the dashboard.', isSuccess: false });
    } else if (reason === 'session_killed' || wasKilled) {
      sessionStorage.removeItem('pulsenews_session_killed');
      setAlert({ message: 'Your session was terminated. Please sign in again to access the dashboard.', isSuccess: false });
    }
  }, []);

  // Handle Real-time Name Validation
  const handleNameChange = (e) => {
    const val = e.target.value;
    setSignupName(val);
    if (!val) {
      setNameError('');
      return;
    }
    if (/[0-9]/.test(val)) {
      setNameError('⚠️ Numbers are not allowed in name. Please use letters only.');
    } else if (!/^[A-Za-z\s'\-\.]+$/.test(val)) {
      setNameError('⚠️ Name can only contain alphabetic letters and spaces.');
    } else {
      setNameError('');
    }
  };

  // Handle Confirm Password Match
  const handleConfirmChange = (e) => {
    const val = e.target.value;
    setSignupConfirm(val);
    if (!val) {
      setConfirmMatch(null);
    } else {
      setConfirmMatch(val === signupPassword);
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!loginEmail.trim() || !loginPassword) {
      setAlert({ message: 'Please enter both your email and password.', isSuccess: false });
      return;
    }

    setLoading(true);
    try {
      await login({ email: loginEmail.trim(), password: loginPassword });
      setAlert({ message: 'Signed in successfully! Redirecting...', isSuccess: true });
      setTimeout(() => {
        const dest = (!redirectTarget || redirectTarget.startsWith('/login')) ? '/' : redirectTarget;
        navigate(dest, { replace: true });
      }, 300);
    } catch (err) {
      setAlert({ message: err.message || 'Invalid email or password.', isSuccess: false });
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const name = signupName.trim();
    const email = signupEmail.trim();

    if (!name || name.length < 2) {
      setAlert({ message: 'Please enter your full name (at least 2 characters).', isSuccess: false });
      return;
    }
    if (/[0-9]/.test(name) || !/^[A-Za-z\s'\-\.]+$/.test(name)) {
      setAlert({ message: 'Name cannot contain numbers or invalid symbols.', isSuccess: false });
      return;
    }
    if (!email || !email.includes('@')) {
      setAlert({ message: 'Please enter a valid email address.', isSuccess: false });
      return;
    }
    if (!strength.meetsAll) {
      setAlert({ message: 'Password must satisfy all 5 security requirements.', isSuccess: false });
      return;
    }
    if (signupPassword !== signupConfirm) {
      setAlert({ message: 'Passwords do not match. Please re-enter.', isSuccess: false });
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password: signupPassword });
      setAlert({ message: 'Account created! Welcome to PulseNews...', isSuccess: true });
      setTimeout(() => {
        const dest = (!redirectTarget || redirectTarget.startsWith('/login')) ? '/' : redirectTarget;
        navigate(dest, { replace: true });
      }, 300);
    } catch (err) {
      setAlert({ message: err.message || 'Registration failed.', isSuccess: false });
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Minimal Header */}
      <header className="header auth-header">
        <div className="header-container auth-header-container">
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

          {/* Theme Switcher */}
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

      {/* Main Authentication Card */}
      <main className="auth-main">
        <div className="auth-card-container">
          {/* Ambient Glow Orbs */}
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>

          <div className="auth-card">
            {/* Card Header */}
            <div className="auth-card-header">
              <div className="auth-badge">
                <span className="auth-badge-dot"></span>
                <span>SECURE ACCESS</span>
              </div>
              <h1 className="auth-title" id="auth-title">
                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h1>
              <p className="auth-subtitle" id="auth-subtitle">
                {mode === 'login'
                  ? 'Sign in to explore daily live news, regional editions, and instant translations.'
                  : 'Join PulseNews to read global stories in your native language.'}
              </p>
            </div>

            {/* Tab Pill Switcher */}
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                id="tab-login"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => { setMode('login'); setAlert(null); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                id="tab-signup"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => { setMode('signup'); setAlert(null); }}
              >
                Create Account
              </button>
            </div>

            {/* Alert Notification Box */}
            {alert && (
              <div
                id="auth-alert"
                className={`auth-alert ${alert.isSuccess ? 'success' : ''}`}
                style={{ display: 'flex' }}
                role="alert"
              >
                <svg className="alert-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span id="auth-alert-text">{alert.message}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'login' ? (
              <form id="login-form" className="auth-form active" onSubmit={handleSignInSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <input
                      type="email"
                      id="login-email"
                      className="form-input"
                      placeholder="name@example.com"
                      required
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="login-password">Password</label>
                  </div>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      id="login-password"
                      className="form-input"
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      title="Show/Hide Password"
                      aria-label="Toggle password visibility"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>

                <button type="submit" id="login-submit-btn" className="auth-submit-btn" disabled={loading}>
                  <span className="btn-text" style={{ opacity: loading ? 0 : 1 }}>Sign In to PulseNews</span>
                  {loading && <div className="btn-spinner" style={{ display: 'block' }}></div>}
                </button>
              </form>
            ) : (
              /* CREATE ACCOUNT (SIGN UP) FORM */
              <form id="signup-form" className="auth-form" onSubmit={handleSignUpSubmit} noValidate>
                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="signup-name">Full Name</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <input
                      type="text"
                      id="signup-name"
                      className={`form-input ${nameError ? 'input-invalid' : ''}`}
                      placeholder="e.g. Manikandan"
                      required
                      autoComplete="name"
                      value={signupName}
                      onChange={handleNameChange}
                    />
                  </div>
                  {nameError && (
                    <div id="signup-name-hint" className="input-hint error" style={{ display: 'block' }}>{nameError}</div>
                  )}
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label htmlFor="signup-email">Email Address</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <input
                      type="email"
                      id="signup-email"
                      className="form-input"
                      placeholder="name@example.com"
                      required
                      autoComplete="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password with Strength Meter */}
                <div className="form-group">
                  <label htmlFor="signup-password">Password</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      id="signup-password"
                      className="form-input"
                      placeholder="At least 8 characters with rules"
                      required
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value);
                        if (signupConfirm) setConfirmMatch(e.target.value === signupConfirm);
                      }}
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      title="Show/Hide Password"
                      aria-label="Toggle password visibility"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>

                  {/* Interactive Password Strength & Security Rules Widget */}
                  <div className="password-strength-widget" id="password-strength-widget">
                    <div className="strength-header">
                      <span className="strength-title">Password Strength:</span>
                      <span className={`strength-badge ${strength.score === 0 ? 'empty' : strength.label.toLowerCase().replace(' ', '-')}`} id="strength-badge">
                        {signupPassword ? strength.label : 'Enter password'}
                      </span>
                    </div>
                    <div className="strength-meter-bar" aria-hidden="true">
                      <div className={`strength-segment ${strength.score >= 1 ? 'active ' + strength.label.toLowerCase().replace(' ', '-') : ''}`} id="seg-1"></div>
                      <div className={`strength-segment ${strength.score >= 2 ? 'active ' + strength.label.toLowerCase().replace(' ', '-') : ''}`} id="seg-2"></div>
                      <div className={`strength-segment ${strength.score >= 3 ? 'active ' + strength.label.toLowerCase().replace(' ', '-') : ''}`} id="seg-3"></div>
                      <div className={`strength-segment ${strength.score >= 4 ? 'active ' + strength.label.toLowerCase().replace(' ', '-') : ''}`} id="seg-4"></div>
                    </div>
                    <div className="password-rules-list">
                      <div className={`rule-item ${rules.length ? 'valid' : ''}`} id="rule-length">
                        <span className="rule-icon">{rules.length ? '✓' : '○'}</span>
                        <span>8+ characters</span>
                      </div>
                      <div className={`rule-item ${rules.upper ? 'valid' : ''}`} id="rule-upper">
                        <span className="rule-icon">{rules.upper ? '✓' : '○'}</span>
                        <span>Uppercase (A-Z)</span>
                      </div>
                      <div className={`rule-item ${rules.lower ? 'valid' : ''}`} id="rule-lower">
                        <span className="rule-icon">{rules.lower ? '✓' : '○'}</span>
                        <span>Lowercase (a-z)</span>
                      </div>
                      <div className={`rule-item ${rules.number ? 'valid' : ''}`} id="rule-number">
                        <span className="rule-icon">{rules.number ? '✓' : '○'}</span>
                        <span>Number (0-9)</span>
                      </div>
                      <div className={`rule-item ${rules.special ? 'valid' : ''}`} id="rule-special">
                        <span className="rule-icon">{rules.special ? '✓' : '○'}</span>
                        <span>Symbol (!@#$...)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label htmlFor="signup-confirm-password">Confirm Password</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="signup-confirm-password"
                      className={`form-input ${confirmMatch === false ? 'input-invalid' : ''}`}
                      placeholder="Re-enter your password"
                      required
                      autoComplete="new-password"
                      value={signupConfirm}
                      onChange={handleConfirmChange}
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title="Show/Hide Password"
                      aria-label="Toggle confirm password visibility"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                  {confirmMatch === false && (
                    <div id="signup-confirm-hint" className="input-hint error" style={{ display: 'block' }}>⚠️ Passwords do not match</div>
                  )}
                  {confirmMatch === true && (
                    <div id="signup-confirm-hint" className="input-hint success" style={{ display: 'block' }}>✓ Passwords match</div>
                  )}
                </div>

                <button type="submit" id="signup-submit-btn" className="auth-submit-btn" disabled={loading}>
                  <span className="btn-text" style={{ opacity: loading ? 0 : 1 }}>Create Free Account</span>
                  {loading && <div className="btn-spinner" style={{ display: 'block' }}></div>}
                </button>
              </form>
            )}

            {/* Toggle Mode Footer */}
            <div className="auth-card-footer">
              <p id="switch-mode-text">
                {mode === 'login' ? (
                  <>
                    Don't have an account yet?{' '}
                    <a
                      href="#signup"
                      id="switch-to-signup"
                      onClick={(e) => { e.preventDefault(); setMode('signup'); setAlert(null); }}
                    >
                      Sign up free
                    </a>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <a
                      href="#login"
                      id="switch-to-login"
                      onClick={(e) => { e.preventDefault(); setMode('login'); setAlert(null); }}
                    >
                      Sign in
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
