import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  value,
  onChange,
  onClear,
  placeholder = 'Tìm kiếm phim, thể loại, đạo diễn...',
  className = '',
  initialValue = '',
}) => {
  const isControlled = value !== undefined;
  const [internalQuery, setInternalQuery] = useState(initialValue);
  const currentQuery = isControlled ? value : internalQuery;

  // Debounce search effect (300ms) only when onSearch is provided
  useEffect(() => {
    if (!onSearch) return;
    const handler = setTimeout(() => {
      onSearch(currentQuery.trim());
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [currentQuery, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onChange) {
      onChange(val);
    }
    if (!isControlled) {
      setInternalQuery(val);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    if (onChange) {
      onChange('');
    }
    if (!isControlled) {
      setInternalQuery('');
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`relative flex items-center w-full max-w-md ${className}`}>
      <div className="absolute left-4 pointer-events-none text-gray-400 flex items-center">
        <Search className="w-5 h-5 text-gray-400" />
      </div>

      <input
        type="text"
        value={currentQuery}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-11 py-2.5 bg-gray-800 text-white placeholder-gray-400 rounded-full border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-all duration-200"
      />

      {currentQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3.5 p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors focus:outline-none"
          aria-label="Xóa tìm kiếm"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
