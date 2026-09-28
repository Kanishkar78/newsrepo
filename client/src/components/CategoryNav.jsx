import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All News' },
  { id: 'World', label: 'World' },
  { id: 'Sports', label: 'Sports' },
  { id: 'Politics', label: 'Politics' },
  { id: 'Technology', label: 'Technology' },
  { id: 'Business', label: 'Business' },
  { id: 'Entertainment', label: 'Entertainment' },
  { id: 'Education', label: 'Education' }
];

export default function CategoryNav({ activeCategory = 'all', onSelectCategory }) {
  return (
    <nav className="category-nav-wrapper">
      <div className="category-nav" id="category-nav">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
            data-category={cat.id}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
