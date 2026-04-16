import { useState, useCallback, useEffect } from 'react';

interface PaginationOptions {
  pageSize?: number;
  autoLoad?: boolean;
}

export function usePagination<T>(
  items: T[],
  options: PaginationOptions = {}
) {
  const { pageSize = 10, autoLoad = false } = options;
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedItems, setLoadedItems] = useState<T[]>([]);

  // Calculate pagination
  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = items.slice(startIndex, endIndex);

  // Update loaded items when current items change
  useEffect(() => {
    if (autoLoad) {
      setLoadedItems(items.slice(0, endIndex));
    } else {
      setLoadedItems(currentItems);
    }
  }, [currentItems, items, endIndex, autoLoad]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const loadMore = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(p => p + 1);
    }
  }, [currentPage, totalPages]);

  return {
    items: autoLoad ? loadedItems : currentItems,
    loadedItems,
    currentPage,
    totalPages,
    hasMore: currentPage < totalPages,
    goToPage,
    nextPage,
    prevPage,
    loadMore,
  };
}
