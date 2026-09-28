import React from 'react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-container" style={{ display: 'block' }}>
      <div className="state-icon error-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 className="state-title">Unable to load news feed</h3>
      <p className="state-desc">{message || 'Something went wrong while communicating with the news service.'}</p>
      {onRetry && (
        <button className="primary-btn" id="retry-fetch-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
