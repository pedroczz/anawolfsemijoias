"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as productsService from "@/services/products.service";

export type ActionResult = { error: string } | undefined;

export async function updateStockAction(id: string, stock: number): Promise<ActionResult> {
  const supabase = createClient();
  try {
    await productsService.updateStock(supabase, id, stock);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao atualizar estoque." };
  }
  revalidatePath("/admin/estoque");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  revalidatePath("/");
}
