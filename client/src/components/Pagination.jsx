import React from 'react';

export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePageClick = (p) => {
    if (p !== page && p >= 1 && p <= totalPages) {
      onPageChange(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Build smart sliding-window page numbers
  let pagesToShow = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
  } else {
    if (page <= 4) {
      pagesToShow = [1, 2, 3, 4, 5, 'dots', totalPages];
    } else if (page >= totalPages - 3) {
      pagesToShow = [1, 'dots', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pagesToShow = [1, 'dots-left', page - 1, page, page + 1, 'dots-right', totalPages];
    }
  }

  return (
    <div className="pagination" id="pagination-container">
      {/* Previous Button */}
      <button
        className="page-btn"
        disabled={page <= 1}
        onClick={() => handlePageClick(page - 1)}
        aria-label="Previous Page"
      >
        &#8592; Prev
      </button>

      {/* Page Numbers & Ellipsis */}
      {pagesToShow.map((item, index) => {
        if (typeof item === 'string' && item.startsWith('dots')) {
          return (
            <span key={`dots-${index}`} className="page-dots" aria-hidden="true">
              &hellip;
            </span>
          );
        }
        return (
          <button
            key={item}
            className={`page-btn ${item === page ? 'active' : ''}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => handlePageClick(item)}
          >
            {item}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        className="page-btn"
        disabled={page >= totalPages}
        onClick={() => handlePageClick(page + 1)}
        aria-label="Next Page"
      >
        Next &#8594;
      </button>
    </div>
  );
}
