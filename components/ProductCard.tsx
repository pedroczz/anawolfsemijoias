"use client";

import Image from "next/image";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-rosa/40 bg-off-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-square w-full bg-off-white">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base text-vinho">{product.name}</h3>
        <p className="flex-1 text-sm text-vinho/70">{product.description}</p>
        <p className="font-semibold text-bordo">{currency.format(product.price)}</p>
        <button
          type="button"
          onClick={() => addItem(product.id)}
          className="mt-2 rounded-full bg-vinho px-4 py-2 text-sm font-medium text-creme transition hover:bg-bordo"
        >
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}
