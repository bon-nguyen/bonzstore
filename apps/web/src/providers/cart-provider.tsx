'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StorefrontProduct, StorefrontSku } from '../lib/storefront-data';

export const FREESHIP_THRESHOLD = 500_000;

export interface CartItem {
  key: string;
  productId: string;
  skuId: string;
  skuCode: string;
  skuLabel: string;
  name: string;
  series: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  isPreOrder?: boolean;
}

interface RemovedUndoState {
  item: CartItem;
  expiresAt: number;
  secondsLeft: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  freeshipProgress: number;
  amountToFreeship: number;
  undoState: RemovedUndoState | null;
  lastAddedToast: string | null;
  quickViewProduct: StorefrontProduct | null;
  openCart: () => void;
  closeCart: () => void;
  setQuickViewProduct: (product: StorefrontProduct | null) => void;
  addItem: (
    product: StorefrontProduct,
    sku?: StorefrontSku,
    quantity?: number,
  ) => void;
  updateQuantityDebounced: (key: string, nextQty: number) => void;
  removeItemWithUndo: (key: string) => void;
  restoreUndoItem: () => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = 'nkBonzCartItems_v1';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [undoState, setUndoState] = useState<RemovedUndoState | null>(null);
  const [lastAddedToast, setLastAddedToast] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] =
    useState<StorefrontProduct | null>(null);

  const debounceTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore read errors
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore write errors
    }
  }, [items]);

  // 5-second Undo countdown timer
  useEffect(() => {
    if (!undoState) return;
    const interval = window.setInterval(() => {
      const remainingMs = undoState.expiresAt - Date.now();
      if (remainingMs <= 0) {
        setUndoState(null);
      } else {
        setUndoState((prev) =>
          prev
            ? { ...prev, secondsLeft: Math.max(1, Math.ceil(remainingMs / 1000)) }
            : null,
        );
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [undoState]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    (product: StorefrontProduct, sku?: StorefrontSku, quantity = 1) => {
      const chosenSku = sku || product.skus[0] || {
        id: `${product.id}-default`,
        skuCode: product.code,
        label: 'Bản Tiêu Chuẩn',
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
      };
      const key = `${product.id}::${chosenSku.id}`;

      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.key === key);
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: Math.min(99, updated[existingIdx].quantity + quantity),
          };
          return updated;
        }
        return [
          ...prev,
          {
            key,
            productId: product.id,
            skuId: chosenSku.id,
            skuCode: chosenSku.skuCode,
            skuLabel: chosenSku.label,
            name: product.name,
            series: product.series,
            image: product.images[0],
            price: chosenSku.price,
            originalPrice: chosenSku.originalPrice,
            quantity,
            isPreOrder: product.isPreOrder,
          },
        ];
      });

      setLastAddedToast(`Đã thêm "${product.name}" vào khoang hành lý!`);
      window.setTimeout(() => {
        setLastAddedToast((current) =>
          current?.includes(product.name) ? null : current,
        );
      }, 2800);
    },
    [],
  );

  const removeItemWithUndo = useCallback((key: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.key === key);
      if (target) {
        setUndoState({
          item: target,
          expiresAt: Date.now() + 5000,
          secondsLeft: 5,
        });
      }
      return prev.filter((i) => i.key !== key);
    });
  }, []);

  const restoreUndoItem = useCallback(() => {
    if (!undoState) return;
    const restored = undoState.item;
    setItems((prev) => {
      const exists = prev.some((i) => i.key === restored.key);
      if (exists) {
        return prev.map((i) =>
          i.key === restored.key
            ? { ...i, quantity: i.quantity + restored.quantity }
            : i,
        );
      }
      return [restored, ...prev];
    });
    setUndoState(null);
  }, [undoState]);

  const updateQuantityDebounced = useCallback(
    (key: string, nextQty: number) => {
      if (debounceTimers.current[key]) {
        window.clearTimeout(debounceTimers.current[key]);
      }

      if (nextQty <= 0) {
        removeItemWithUndo(key);
        return;
      }

      // Immediate optimistic UI update + debounced persistence sync
      setItems((prev) =>
        prev.map((item) =>
          item.key === key
            ? { ...item, quantity: Math.min(99, Math.max(1, nextQty)) }
            : item,
        ),
      );

      debounceTimers.current[key] = window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('nkCartQuantitySynced', { detail: { key, nextQty } }),
        );
      }, 180);
    },
    [removeItemWithUndo],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setUndoState(null);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const freeshipProgress = useMemo(
    () => Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100)),
    [subtotal],
  );

  const amountToFreeship = useMemo(
    () => Math.max(0, FREESHIP_THRESHOLD - subtotal),
    [subtotal],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      totalItems,
      subtotal,
      freeshipProgress,
      amountToFreeship,
      undoState,
      lastAddedToast,
      quickViewProduct,
      openCart,
      closeCart,
      setQuickViewProduct,
      addItem,
      updateQuantityDebounced,
      removeItemWithUndo,
      restoreUndoItem,
      clearCart,
    }),
    [
      items,
      isOpen,
      totalItems,
      subtotal,
      freeshipProgress,
      amountToFreeship,
      undoState,
      lastAddedToast,
      quickViewProduct,
      openCart,
      closeCart,
      addItem,
      updateQuantityDebounced,
      removeItemWithUndo,
      restoreUndoItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}

