"use server";

import { createClient } from "@/lib/supabase/server";
import { importImageFromUrl } from "@/services/import/image-url";
import { importFromInstagram } from "@/services/import/instagram";
import { listCategories } from "@/services/categories.service";
import type { ProductDraft } from "@/services/import/types";

export type ImportImageResult = { url: string } | { error: string };
export type ImportInstagramResult = { draft: ProductDraft } | { error: string };

export async function importImageFromUrlAction(url: string, folder: string): Promise<ImportImageResult> {
  const supabase = createClient();
  try {
    const result = await importImageFromUrl(supabase, url, folder);
    return { url: result.url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao importar imagem." };
  }
}

export async function importFromInstagramAction(postUrl: string, folder: string): Promise<ImportInstagramResult> {
  const supabase = createClient();
  try {
    const categories = await listCategories(supabase);
    const draft = await importFromInstagram(supabase, postUrl, categories, folder);
    return { draft };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao importar publicação do Instagram." };
  }
}
