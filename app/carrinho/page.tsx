"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { buildOrderWhatsAppUrl } from "@/lib/whatsapp";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function CartPage() {
  const { items, lines, total, updateQuantity, removeItem } = useCart();

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl text-vinho">Seu carrinho está vazio</h1>
        <p className="mt-3 text-vinho/70">Adicione algumas peças da nossa coleção.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-vinho px-6 py-3 text-sm font-semibold text-creme hover:bg-bordo"
        >
          Ver coleção
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-2xl text-vinho">Seu carrinho</h1>
      <ul className="mt-6 flex flex-col gap-4">
        {lines.map(({ product, quantity, subtotal }) => (
          <li
            key={product.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-rosa/40 bg-off-white p-4"
          >
            <div>
              <p className="font-medium text-vinho">{product.name}</p>
              <p className="text-sm text-vinho/70">{currency.format(product.price)} cada</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => updateQuantity(product.id, Number(event.target.value))}
                className="w-16 rounded border border-rosa/50 px-2 py-1 text-center text-vinho"
                aria-label={`Quantidade de ${product.name}`}
              />
              <p className="w-24 text-right font-semibold text-bordo">{currency.format(subtotal)}</p>
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                className="text-sm text-terracota underline-offset-2 hover:underline"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between border-t border-rosa/40 pt-4">
        <p className="font-display text-xl text-vinho">Total</p>
        <p className="font-display text-xl text-bordo">{currency.format(total)}</p>
      </div>

      <a
        href={buildOrderWhatsAppUrl(items)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block rounded-full bg-vinho px-6 py-3 text-center text-sm font-semibold text-creme transition hover:bg-bordo"
      >
        Finalizar pedido pelo WhatsApp
      </a>
    </section>
  );
}
