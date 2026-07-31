"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";

const POLL_INTERVAL_MS = 20_000;

type ProductsContextValue = {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({
  initialProducts,
  children,
}: {
  initialProducts: Product[];
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    async function refresh() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) return;
        const data: Product[] = await response.json();
        if (isMounted.current) setProducts(data);
      } catch {
        // Mantém o catálogo atual se a atualização falhar (ex: rede instável).
      }
    }

    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  const value: ProductsContextValue = {
    products,
    getProduct: (id: string) => products.find((product) => product.id === id),
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts deve ser usado dentro de ProductsProvider");
  }
  return context;
}
