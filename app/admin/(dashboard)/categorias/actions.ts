"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as categoriesService from "@/services/categories.service";

export type ActionResult = { error: string } | undefined;

export async function createCategoryAction(name: string, order: number): Promise<ActionResult> {
  const supabase = createClient();
  try {
    await categoriesService.createCategory(supabase, { name, order });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao criar categoria." };
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function updateCategoryAction(id: string, name: string, order: number): Promise<ActionResult> {
  const supabase = createClient();
  try {
    await categoriesService.updateCategory(supabase, id, { name, order });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao atualizar categoria." };
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  try {
    await categoriesService.deleteCategory(supabase, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao excluir categoria." };
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function reorderCategoriesAction(orderedIds: string[]): Promise<ActionResult> {
  const supabase = createClient();
  try {
    await categoriesService.reorderCategories(supabase, orderedIds);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao reordenar categorias." };
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
