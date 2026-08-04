import { createClient } from "@/lib/supabase/server";
import { getPublicProducts } from "@/services/products.service";

export type { Product } from "@/services/products.mapper";

/**
 * Busca o catálogo de produtos ativos diretamente do Supabase.
 * Server-only: usado em Server Components e Route Handlers.
 */
export async function getProducts() {
  const supabase = createClient();
  return getPublicProducts(supabase);
}
