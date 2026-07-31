import type { Product } from "@/lib/products";

const STORE_WHATSAPP = "5596991871516";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function buildOrderMessage(products: Product[]): string {
  const lines = products.map((product) => `• ${product.name} — ${currency.format(product.price)}`);
  const total = products.reduce((sum, product) => sum + product.price, 0);

  const message = [
    "Olá! Gostaria de fazer o seguinte pedido na Ana Wolf Semijoias e Pratas:",
    "",
    ...lines,
    "",
    `Total: ${currency.format(total)}`,
  ].join("\n");

  return message;
}

export function buildOrderWhatsAppUrl(products: Product[]): string {
  const message = buildOrderMessage(products);
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
