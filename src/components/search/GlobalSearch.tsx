import React, { useState, useEffect, useRef } from 'react';
import { SearchService } from '../../services/searchService';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Badge } from '../shared/Badge';

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
}

interface GlobalSearchProps {
  onResultClick?: (result: any) => void;
  placeholder?: string;
  className?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultClick,
  placeholder = "Search customers, loans, users...",
  className = ""
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [searchResults, searchSuggestions] = await Promise.all([
          SearchService.globalSearch(query, user?.branch_id),
          SearchService.getSearchSuggestions(query, user?.branch_id)
        ]);

        const formattedResults: SearchResult[] = [];

        // Format customers
        searchResults.customers?.forEach(customer => {
          formattedResults.push({
            type: 'customer',
            id: customer.id,
            title: customer.full_name,
            subtitle: `${customer.phone} • ${customer.occupation}`,
            badge: 'Customer',
            onClick: () => handleResultClick(customer, 'customer')
          });
        });

        // Format loans
        searchResults.loans?.forEach(loan => {
          formattedResults.push({
            type: 'loan',
            id: loan.id,
            title: `₦${loan.amount?.toLocaleString()} Loan`,
            subtitle: `${loan.customer?.full_name} • ${loan.status}`,
            badge: 'Loan',
            onClick: () => handleResultClick(loan, 'loan')
          });
        });

        // Format users
        searchResults.users?.forEach(user => {
          formattedResults.push({
            type: 'user',
            id: user.id,
            title: user.full_name,
            subtitle: `${user.phone} • ${user.role}`,
            badge: 'User',
            onClick: () => handleResultClick(user, 'user')
          });
        });

        // Format payments
        searchResults.payments?.forEach(payment => {
          formattedResults.push({
            type: 'payment',
            id: payment.id,
            title: `Week ${payment.week_number} Payment`,
            subtitle: `${payment.customer?.full_name} • ₦${payment.amount_due?.toLocaleString()}`,
            badge: 'Payment',
            onClick: () => handleResultClick(payment, 'payment')
          });
        });

        setResults(formattedResults);
        setSuggestions(searchSuggestions);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, user?.branch_id]);

  const handleResultClick = (result: any, type: string) => {
    setIsOpen(false);
    setQuery('');
    if (onResultClick) {
      onResultClick({ ...result, type });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = results.length + suggestions.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else {
            const resultIndex = selectedIndex - suggestions.length;
            results[resultIndex]?.onClick();
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer': return '👤';
      case 'loan': return '💰';
      case 'user': return '👨‍💼';
      case 'payment': return '💳';
      default: return '📄';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'blue';
      case 'loan': return 'green';
      case 'user': return 'purple';
      case 'payment': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && (suggestions.length > 0 || results.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${
                    selectedIndex === index ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2">
                Results ({results.length})
              </div>
              {results.map((result, index) => {
                const adjustedIndex = index + suggestions.length;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={result.onClick}
                    className={`w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 ${
                      selectedIndex === adjustedIndex ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getTypeIcon(result.type)}</span>
                        <div>
                          <div className="font-medium text-gray-900">{result.title}</div>
                          <div className="text-sm text-gray-500">{result.subtitle}</div>
                        </div>
                      </div>
                      <Badge 
                        variant={getTypeBadgeColor(result.type) as any}
                        size="sm"
                      >
                        {result.badge}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No results */}
          {!isLoading && suggestions.length === 0 && results.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="text-sm">No results found for "{query}"</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};