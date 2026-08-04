import * as settingsRepo from "@/repositories/settings.repository";
import type { Client, StoreSettingsRow } from "@/repositories/settings.repository";

export type StoreSettings = {
  storeName: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  address: string;
  whatsappMessageTemplate: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  /** Quando true, produtos com estoque = 0 somem do catálogo público (em vez de aparecer como "Esgotado"). */
  hideOutOfStock: boolean;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Ana Wolf Semijoias e Pratas",
  whatsapp: "",
  instagram: "",
  facebook: "",
  address: "",
  whatsappMessageTemplate:
    "Olá! Gostaria de fazer o seguinte pedido na {{loja}}:\n\n{{itens}}\n\nTotal: {{total}}",
  logoUrl: null,
  bannerUrl: null,
  seoTitle: "Ana Wolf Semijoias e Pratas",
  seoDescription: "Semijoias com brilho de verdade, para o seu dia a dia.",
  hideOutOfStock: false,
};

function mapSettings(row: StoreSettingsRow): StoreSettings {
  return {
    storeName: row.store_name,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    facebook: row.facebook,
    address: row.address,
    whatsappMessageTemplate: row.whatsapp_message_template,
    logoUrl: row.logo_url,
    bannerUrl: row.banner_url,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    hideOutOfStock: row.hide_out_of_stock,
  };
}

export async function getSettings(client: Client): Promise<StoreSettings> {
  const row = await settingsRepo.get(client);
  return row ? mapSettings(row) : DEFAULT_SETTINGS;
}

export async function updateSettings(client: Client, input: StoreSettings): Promise<StoreSettings> {
  const row = await settingsRepo.update(client, {
    store_name: input.storeName.trim() || DEFAULT_SETTINGS.storeName,
    whatsapp: input.whatsapp.trim(),
    instagram: input.instagram.trim(),
    facebook: input.facebook.trim(),
    address: input.address.trim(),
    whatsapp_message_template: input.whatsappMessageTemplate.trim() || DEFAULT_SETTINGS.whatsappMessageTemplate,
    logo_url: input.logoUrl,
    banner_url: input.bannerUrl,
    seo_title: input.seoTitle.trim() || DEFAULT_SETTINGS.seoTitle,
    seo_description: input.seoDescription.trim() || DEFAULT_SETTINGS.seoDescription,
    hide_out_of_stock: input.hideOutOfStock,
  });
  return mapSettings(row);
}

export function buildWhatsAppMessage(
  template: string,
  storeName: string,
  items: { name: string; price: number }[],
  total: number
): string {
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const itemLines = items.map((item) => `• ${item.name} — ${currency.format(item.price)}`).join("\n");

  return template
    .replaceAll("{{loja}}", storeName)
    .replaceAll("{{itens}}", itemLines)
    .replaceAll("{{total}}", currency.format(total));
}
