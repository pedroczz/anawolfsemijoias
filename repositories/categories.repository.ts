import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type Client = SupabaseClient<Database>;

export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export async function findAll(client: Client): Promise<CategoryRow[]> {
  const { data, error } = await client.from("categories").select("*").order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function findById(client: Client, id: string): Promise<CategoryRow | null> {
  const { data, error } = await client.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function create(client: Client, input: CategoryInsert): Promise<CategoryRow> {
  const { data, error } = await client.from("categories").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function update(client: Client, id: string, input: CategoryUpdate): Promise<CategoryRow> {
  const { data, error } = await client.from("categories").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function remove(client: Client, id: string): Promise<void> {
  const { error } = await client.from("categories").delete().eq("id", id);
  if (error) throw error;
}
