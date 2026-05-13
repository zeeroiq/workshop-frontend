import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/**
 * Global Search Component
 * Search by WO number, customer name, vehicle registration, or job type
 *
 * @component
 * @param {array} jobs - List of jobs to search through
 * @param {function} onSearch - Callback with search query
 * @param {function} onSelectResult - Callback when result selected
 * @param {string} className - Additional CSS classes
 * @returns {React.ReactElement}
 */
export const GlobalSearch = ({
  jobs = [],
  onSearch = null,
  onSelectResult = null,
  className = '',
  placeholder = 'Search WO, customer, registration...',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Search through jobs
    const filtered = jobs.filter((job) => {
      const query = searchQuery.toLowerCase();
      return (
        job.id?.toLowerCase().includes(query) ||
        job.title?.toLowerCase().includes(query) ||
        job.customer?.name?.toLowerCase().includes(query) ||
        job.vehicle?.registration?.toLowerCase().includes(query) ||
        job.vehicle?.make?.toLowerCase().includes(query) ||
        job.vehicle?.model?.toLowerCase().includes(query) ||
        job.jobType?.toLowerCase().includes(query)
      );
    });

    setResults(filtered);
    setIsOpen(true);

    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSelectResult = (job) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);

    if (onSelectResult) {
      onSelectResult(job);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative w-full max-w-md', className)} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {results.slice(0, 10).map((job) => (
            <button
              key={job.id}
              onClick={() => handleSelectResult(job)}
              className={cn(
                'w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700',
                'border-b border-gray-100 dark:border-gray-700 last:border-b-0',
                'transition-colors'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {job.id}: {job.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {job.customer?.name}
                  </p>
                  {job.vehicle && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                      {job.vehicle.make} {job.vehicle.model} • {job.vehicle.registration}
                    </p>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {job.date}
                </span>
              </div>
            </button>
          ))}
          {results.length > 10 && (
            <div className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 text-center">
              +{results.length - 10} more results
            </div>
          )}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-sm text-gray-600 dark:text-gray-400">
          No jobs found
        </div>
      )}
    </div>
  );
};

/**
 * Inline Global Search (with direct styling)
 */
export const GlobalSearchInline = ({
  jobs = [],
  onSelectResult = null,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const filtered = jobs.filter((job) => {
      const q = searchQuery.toLowerCase();
      return (
        job.id?.toLowerCase().includes(q) ||
        job.customer?.name?.toLowerCase().includes(q) ||
        job.vehicle?.registration?.toLowerCase().includes(q)
      );
    });

    setResults(filtered);
    setIsOpen(true);
  };

  const handleSelectResult = (job) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (onSelectResult) onSelectResult(job);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '20rem',
      }}
    >
      <input
        type="text"
        placeholder="Search WO, customer, registration..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => query && setIsOpen(true)}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          paddingLeft: '2rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
        }}
      />

      {isOpen && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.5rem',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
            maxHeight: '384px',
            overflowY: 'auto',
            zIndex: 50,
          }}
        >
          {results.slice(0, 10).map((job) => (
            <button
              key={job.id}
              onClick={() => handleSelectResult(job)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem',
                paddingRight: '0.5rem',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                {job.id}: {job.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                {job.customer?.name}
              </div>
              {job.vehicle && (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {job.vehicle.make} {job.vehicle.model} • {job.vehicle.registration}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
