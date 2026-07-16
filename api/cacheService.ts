export type CacheEntry<T> = {
    data: T;
    expiry: number;
};

const cache = new Map<string, CacheEntry<any>>();

// Default TTL: 2 minutes (120,000 ms)
const DEFAULT_TTL = 2 * 60 * 1000;

/**
 * Retrieves data from the cache if it exists and is not expired.
 * Otherwise, it executes the fetcher function, caches the result, and returns it.
 */
export const getCached = async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = DEFAULT_TTL
): Promise<T> => {
    const cached = cache.get(key);
    
    if (cached && cached.expiry > Date.now()) {
        return cached.data as T;
    }

    const data = await fetcher();
    cache.set(key, { data, expiry: Date.now() + ttlMs });
    
    return data;
};

/**
 * Clears the entire cache, or a specific key prefix if provided.
 */
export const clearCache = (prefix?: string) => {
    if (!prefix) {
        cache.clear();
    } else {
        for (const key of cache.keys()) {
            if (key.startsWith(prefix)) {
                cache.delete(key);
            }
        }
    }
};

/**
 * Manually update the cache for a specific key
 */
export const setCache = <T>(key: string, data: T, ttlMs: number = DEFAULT_TTL) => {
    cache.set(key, { data, expiry: Date.now() + ttlMs });
};
