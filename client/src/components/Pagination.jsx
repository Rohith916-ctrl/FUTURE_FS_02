import React from "react";

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const pages = [];
  if (totalPages <= 7) {
    pages.push(...range(1, totalPages));
  } else {
    pages.push(1);
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) {
      pages.push("...");
    }

    pages.push(...range(start, end));

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return (
    <div className="pagination glass-card">
      <button type="button" className="btn btn-ghost" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Prev
      </button>
      <div className="pagination-pages">
        {pages.map((entry, index) =>
          entry === "..." ? (
            <span className="pagination-ellipsis" key={`ellipsis-${index}`}>
              ...
            </span>
          ) : (
            <button
              type="button"
              key={entry}
              className={`page-pill ${page === entry ? "active" : ""}`}
              onClick={() => onPageChange(entry)}
            >
              {entry}
            </button>
          )
        )}
      </div>
      <button type="button" className="btn btn-ghost" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </div>
  );
}