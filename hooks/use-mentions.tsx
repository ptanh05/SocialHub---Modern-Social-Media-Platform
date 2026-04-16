'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface MentionUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
}

interface UseMentionsOptions {
  onMention?: (username: string) => void;
}

export function useMentions(options: UseMentionsOptions = {}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.users || data || []);
      setShowSuggestions(true);
      setSelectedIndex(0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback((text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Find the @ symbol and extract query
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex === -1) {
      setShowSuggestions(false);
      setQuery('');
      return;
    }
    const afterAt = text.slice(lastAtIndex + 1);
    // If there's a space after @, close suggestions
    if (afterAt.includes(' ') || afterAt.includes('\n')) {
      setShowSuggestions(false);
      setQuery('');
      return;
    }
    setQuery(afterAt);
    debounceRef.current = setTimeout(() => {
      searchUsers(afterAt);
    }, 200);
  }, [searchUsers]);

  const selectMention = useCallback((user: MentionUser | string) => {
    const username = typeof user === 'string' ? user : user.username;
    options.onMention?.(username);
    setShowSuggestions(false);
    setQuery('');
    setSuggestions([]);
  }, [options]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, _textareaValue: string) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      selectMention(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [showSuggestions, suggestions, selectedIndex, selectMention]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return {
    query,
    suggestions,
    showSuggestions,
    selectedIndex,
    loading,
    handleInputChange,
    selectMention,
    handleKeyDown,
    setShowSuggestions,
  };
}
