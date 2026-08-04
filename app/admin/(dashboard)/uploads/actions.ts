"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET } from "@/services/storage.service";

export type ActionResult = { error: string } | undefined;

export async function deleteMediaFileAction(path: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) {
    return { error: "Erro ao excluir arquivo." };
  }
  revalidatePath("/admin/uploads");
}
