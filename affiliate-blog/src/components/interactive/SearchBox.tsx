import { useState, useRef, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';

interface SearchItem {
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
}

interface Props {
  items: SearchItem[];
}

export default function SearchBox({ items }: Props) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fuse = useRef(
    new Fuse(items, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'category', weight: 0.5 },
        { name: 'tags', weight: 0.5 },
      ],
      threshold: 0.4,
      includeScore: true,
    }),
  );

  const results = query.length >= 2 ? fuse.current.search(query).slice(0, 8) : [];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
        window.location.href = `/blog/${results[activeIdx].item.slug}`;
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    [results, activeIdx],
  );

  useEffect(() => {
    setActiveIdx(-1);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="記事を検索..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          aria-label="記事を検索"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
          {results.map((r, idx) => (
            <a
              key={r.item.slug}
              href={`/blog/${r.item.slug}`}
              className={`block px-4 py-3 text-sm transition-colors ${
                idx === activeIdx
                  ? 'bg-amber-50 dark:bg-amber-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{r.item.title}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{r.item.description}</p>
            </a>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 z-50">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">記事が見つかりませんでした</p>
        </div>
      )}
    </div>
  );
}
