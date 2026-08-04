"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import * as productsService from "@/services/products.service";
import type { ProductFormInput } from "@/services/products.service";

export type ActionResult = { error: string } | undefined;

export async function saveProductAction(id: string | null, input: ProductFormInput): Promise<ActionResult> {
  const supabase = createClient();

  try {
    if (id) {
      await productsService.updateProduct(supabase, id, input);
    } else {
      await productsService.createProduct(supabase, input);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao salvar produto." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin/produtos");
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const supabase = createClient();

  try {
    await productsService.deleteProduct(supabase, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao excluir produto." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function duplicateProductAction(id: string): Promise<ActionResult> {
  const supabase = createClient();

  try {
    await productsService.duplicateProduct(supabase, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao duplicar produto." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
}
