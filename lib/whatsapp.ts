import type { Product } from "@/lib/products";
import { buildWhatsAppMessage, type StoreSettings } from "@/services/settings.service";

export function effectivePrice(product: Product): number {
  return product.promoPrice ?? product.price;
}

export function buildOrderWhatsAppUrl(products: Product[], settings: StoreSettings): string {
  const items = products.map((product) => ({ name: product.name, price: effectivePrice(product) }));
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const message = buildWhatsAppMessage(settings.whatsappMessageTemplate, settings.storeName, items, total);
  const digits = settings.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
