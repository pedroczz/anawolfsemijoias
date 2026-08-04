import { createClient } from "@/lib/supabase/server";
import { getPublicProducts } from "@/services/products.service";
import { getSettings } from "@/services/settings.service";

export type { Product } from "@/services/products.mapper";

/**
 * Busca o catálogo de produtos ativos diretamente do Supabase.
 * Server-only: usado em Server Components e Route Handlers.
 */
export async function getProducts() {
  const supabase = createClient();
  const settings = await getSettings(supabase);
  return getPublicProducts(supabase, { hideOutOfStock: settings.hideOutOfStock });
}
