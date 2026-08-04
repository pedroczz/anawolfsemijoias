"use client";

import Image from "next/image";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { effectivePrice } from "@/lib/whatsapp";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, has } = useCart();
  const inCart = has(product.sku);
  const mainImage = product.images[0] ?? "/produtos/placeholder.svg";
  const price = effectivePrice(product);
  const onSale = product.promoPrice !== null && product.promoPrice < product.price;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-rosa/40 bg-off-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-square w-full bg-off-white">
        <Image src={mainImage} alt={product.name} fill className="object-cover" />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {!product.available && (
            <span className="rounded-full bg-vinho px-3 py-1 text-xs font-semibold text-creme">Esgotado</span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-areia px-3 py-1 text-xs font-semibold text-vinho">Novo</span>
          )}
          {product.featured && (
            <span className="rounded-full bg-terracota px-3 py-1 text-xs font-semibold text-creme">Destaque</span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base text-vinho">{product.name}</h3>
        <p className="flex-1 text-sm text-vinho/70">{product.shortDescription}</p>
        <p className="font-semibold text-bordo">
          {onSale && <span className="mr-2 text-xs font-normal text-vinho/50 line-through">{currency.format(product.price)}</span>}
          {currency.format(price)}
        </p>
        <button
          type="button"
          disabled={!product.available || inCart}
          onClick={() => addItem(product.sku)}
          className="mt-2 rounded-full bg-vinho px-4 py-2 text-sm font-medium text-creme transition hover:bg-bordo disabled:cursor-not-allowed disabled:bg-vinho/30 disabled:text-creme/70 disabled:hover:bg-vinho/30"
        >
          {!product.available ? "Esgotado" : inCart ? "Já no carrinho" : "Adicionar ao carrinho"}
        </button>
      </div>
    </div>
  );
}
