import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type Client = SupabaseClient<Database>;

export type StoreSettingsRow = Database["public"]["Tables"]["store_settings"]["Row"];
export type StoreSettingsUpdate = Database["public"]["Tables"]["store_settings"]["Update"];

export async function get(client: Client): Promise<StoreSettingsRow | null> {
  const { data, error } = await client.from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function update(client: Client, input: StoreSettingsUpdate): Promise<StoreSettingsRow> {
  const { data, error } = await client
    .from("store_settings")
    .update(input)
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data;
}
