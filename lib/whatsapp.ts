import type { CartItem } from "@/lib/cart-context";
import { products } from "@/lib/products";

const STORE_WHATSAPP = "5596991871516";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function buildOrderMessage(items: CartItem[]): string {
  const lines = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return `${item.quantity}x ${product.name} — ${currency.format(product.price * item.quantity)}`;
    })
    .filter((line): line is string => line !== null);

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  const message = [
    "Olá! Gostaria de fazer o seguinte pedido na Ana Wolf Semijoias:",
    "",
    ...lines,
    "",
    `Total: ${currency.format(total)}`,
  ].join("\n");

  return message;
}

export function buildOrderWhatsAppUrl(items: CartItem[]): string {
  const message = buildOrderMessage(items);
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
