'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const WISHLIST_STORAGE_KEY = 'nkBonzWishlistIds_v1';
const WISHLIST_EVENT = 'nkWishlistChanged';

interface WishlistContextValue {
  wishlistIds: string[];
  count: number;
  isLiked: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed)) {
          setWishlistIds(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }

    const handleExternalSync = (e: Event) => {
      const custom = e as CustomEvent<{ ids?: string[] }>;
      if (Array.isArray(custom.detail?.ids)) {
        setWishlistIds(custom.detail.ids);
      }
    };

    window.addEventListener(WISHLIST_EVENT, handleExternalSync);
    return () => window.removeEventListener(WISHLIST_EVENT, handleExternalSync);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const next = exists
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      try {
        window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore write errors
      }

      window.dispatchEvent(
        new CustomEvent(WISHLIST_EVENT, { detail: { ids: next, productId } }),
      );
      return next;
    });
  }, []);

  const isLiked = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlistIds,
      count: wishlistIds.length,
      isLiked,
      toggleWishlist,
    }),
    [wishlistIds, isLiked, toggleWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
}

