'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { DropdownOption, fetchDropdownOptions, ApiConfig } from '@/lib/dropdown-api';

interface CacheEntry {
  options: DropdownOption[];
  timestamp: number;
  isLoading: boolean;
  error?: string;
}

interface DropdownCacheContextType {
  getOptions: (fieldId: string, config: ApiConfig) => Promise<DropdownOption[]>;
  isLoading: (fieldId: string) => boolean;
  hasError: (fieldId: string) => boolean;
  clearCache: (fieldId?: string) => void;
}

const DropdownCacheContext = createContext<DropdownCacheContextType | null>(null);

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

export function DropdownCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<Record<string, CacheEntry>>({});

  const generateCacheKey = (fieldId: string, config: ApiConfig): string => {
    return `${fieldId}_${btoa(JSON.stringify({
      endpoint: config.apiEndpoint,
      method: config.apiMethod,
      payload: config.apiPayload,
      // Don't include token in cache key for security
    }))}`;
  };

  const isExpired = (timestamp: number): boolean => {
    return Date.now() - timestamp > CACHE_TTL;
  };

  const getOptions = useCallback(async (fieldId: string, config: ApiConfig): Promise<DropdownOption[]> => {
    const cacheKey = generateCacheKey(fieldId, config);
    const cached = cache[cacheKey];

    // Return cached data if valid and not expired
    if (cached && !cached.isLoading && !cached.error && !isExpired(cached.timestamp)) {
      return cached.options;
    }

    // Avoid multiple simultaneous requests
    if (cached?.isLoading) {
      // Wait for the ongoing request
      return new Promise((resolve) => {
        const checkCache = () => {
          const updatedCache = cache[cacheKey];
          if (updatedCache && !updatedCache.isLoading) {
            if (updatedCache.error) {
              resolve([]);
            } else {
              resolve(updatedCache.options);
            }
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    // Set loading state
    setCache(prev => ({
      ...prev,
      [cacheKey]: {
        options: [],
        timestamp: Date.now(),
        isLoading: true,
      }
    }));

    try {
      const options = await fetchDropdownOptions(config);
      
      // Update cache with successful result
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          options,
          timestamp: Date.now(),
          isLoading: false,
        }
      }));

      return options;
    } catch (error) {
      // Update cache with error state
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          options: [],
          timestamp: Date.now(),
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }));

      return [];
    }
  }, [cache]);

  const isLoading = useCallback((fieldId: string): boolean => {
    const entries = Object.entries(cache).filter(([key]) => key.startsWith(`${fieldId}_`));
    return entries.some(([, entry]) => entry.isLoading);
  }, [cache]);

  const hasError = useCallback((fieldId: string): boolean => {
    const entries = Object.entries(cache).filter(([key]) => key.startsWith(`${fieldId}_`));
    return entries.some(([, entry]) => !!entry.error);
  }, [cache]);

  const clearCache = useCallback((fieldId?: string) => {
    if (fieldId) {
      // Clear cache for specific field
      setCache(prev => {
        const newCache = { ...prev };
        Object.keys(newCache).forEach(key => {
          if (key.startsWith(`${fieldId}_`)) {
            delete newCache[key];
          }
        });
        return newCache;
      });
    } else {
      // Clear all cache
      setCache({});
    }
  }, []);

  const value: DropdownCacheContextType = {
    getOptions,
    isLoading,
    hasError,
    clearCache,
  };

  return (
    <DropdownCacheContext.Provider value={value}>
      {children}
    </DropdownCacheContext.Provider>
  );
}

export function useDropdownCache(): DropdownCacheContextType {
  const context = useContext(DropdownCacheContext);
  if (!context) {
    throw new Error('useDropdownCache must be used within a DropdownCacheProvider');
  }
  return context;
}