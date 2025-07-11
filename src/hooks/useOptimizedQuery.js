
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useOptimizedQuery = (queryKey, queryFn, options = {}) => {
  const memoizedOptions = useMemo(() => ({
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options
  }), [options]);

  return useQuery({
    queryKey,
    queryFn,
    ...memoizedOptions
  });
};

export default useOptimizedQuery;
