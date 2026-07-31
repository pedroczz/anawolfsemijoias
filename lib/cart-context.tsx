"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ana-wolf-cart";

type CartContextValue = {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  has: (productId: string) => boolean;
  count: number;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // Peças únicas: no máximo 1 unidade por produto no carrinho.
  const addItem = useCallback((productId: string) => {
    setItems((current) => (current.includes(productId) ? current : [...current, productId]));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((id) => id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const has = useCallback((productId: string) => items.includes(productId), [items]);

  const count = useMemo(() => items.length, [items]);

  const value: CartContextValue = { items, addItem, removeItem, clearCart, has, count };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
}
