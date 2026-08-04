"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { findAllActive } from "@/repositories/products.repository";
import { mapProduct, type Product } from "@/services/products.mapper";

type ProductsContextValue = {
  products: Product[];
  getProduct: (sku: string) => Product | undefined;
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
    const supabase = createClient();

    async function refresh() {
      try {
        const rows = await findAllActive(supabase);
        if (isMounted.current) setProducts(rows.map(mapProduct));
      } catch {
        // Mantém o catálogo atual se a atualização falhar (ex: rede instável).
      }
    }

    // Atualização em tempo real: qualquer mudança em produtos ou imagens
    // feita no painel admin reflete aqui sem precisar de novo deploy.
    const channel = supabase
      .channel("public-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_images" }, refresh)
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const value: ProductsContextValue = {
    products,
    getProduct: (sku: string) => products.find((product) => product.sku === sku),
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
