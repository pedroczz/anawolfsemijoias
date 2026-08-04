"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as settingsService from "@/services/settings.service";
import type { StoreSettings } from "@/services/settings.service";

export type ActionResult = { error: string } | undefined;

export async function updateSettingsAction(input: StoreSettings): Promise<ActionResult> {
  const supabase = createClient();
  try {
    await settingsService.updateSettings(supabase, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao salvar configurações." };
  }
  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
}
