
import { useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';

export const useOptimizedSettings = (category = 'all') => {
  return useOptimizedQuery({
    queryKey: ['settings', category],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/settings?category=${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - settings don't change frequently
    enabled: true,
  });
};

export const useOptimizedUserPreferences = (userId) => {
  return useOptimizedQuery({
    queryKey: ['settings', 'user-preferences', userId],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/settings/user-preferences/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOptimizedSystemHealth = () => {
  return useOptimizedQuery({
    queryKey: ['settings', 'system-health'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/settings/system-health', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : data;
    },
    staleTime: 30 * 1000, // 30 seconds - health check needs frequent updates
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
};
