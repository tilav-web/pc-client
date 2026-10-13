'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  if (total === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to show around current page
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.06] text-xs text-zinc-400 select-none">
      {/* Total count details */}
      <div className="flex items-center gap-2">
        <span>
          Jami <strong className="text-zinc-200 font-mono">{total}</strong> tadan{' '}
          <strong className="text-zinc-200 font-mono">
            {startItem}-{endItem}
          </strong>{' '}
          ko‘rsatilmoqda
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-zinc-500">Qatordan:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Har bir sahifadagi qatorlar soni"
              className="bg-zinc-900 border border-white/[0.08] rounded-md px-2 py-0.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors text-zinc-300"
          title="Birinchi sahifa"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous page */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors text-zinc-300"
          title="Oldingi sahifa"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Number buttons */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1 text-zinc-600">
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === page;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-7 h-7 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 border border-indigo-500/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors text-zinc-300"
          title="Keyingi sahifa"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors text-zinc-300"
          title="Oxirgi sahifa"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
