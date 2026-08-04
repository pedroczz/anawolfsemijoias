"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as stockService from "@/services/stock.service";

export type ActionResult = { error: string } | undefined;

function revalidateStockPaths() {
  revalidatePath("/admin/estoque");
  revalidatePath("/admin/estoque/movimentacoes");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  revalidatePath("/");
}

async function getActorEmail(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

/** Edição rápida do estoque (define um valor absoluto). */
export async function setStockAction(productId: string, stock: number, note?: string): Promise<ActionResult> {
  const supabase = createClient();
  try {
    await stockService.setStock(supabase, productId, stock, await getActorEmail(supabase), note);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao atualizar estoque." };
  }
  revalidateStockPaths();
}

export async function addStockAction(productId: string, quantity: number, note?: string): Promise<ActionResult> {
  const supabase = createClient();
  try {
    await stockService.addStock(supabase, productId, quantity, await getActorEmail(supabase), note);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao adicionar estoque." };
  }
  revalidateStockPaths();
}

export async function removeStockAction(productId: string, quantity: number, note?: string): Promise<ActionResult> {
  const supabase = createClient();
  try {
    await stockService.removeStock(supabase, productId, quantity, await getActorEmail(supabase), note);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao remover estoque." };
  }
  revalidateStockPaths();
}

export async function updateLowStockThresholdAction(productId: string, threshold: number): Promise<ActionResult> {
  const supabase = createClient();
  try {
    await stockService.updateLowStockThreshold(supabase, productId, threshold);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao atualizar quantidade mínima." };
  }
  revalidateStockPaths();
}
