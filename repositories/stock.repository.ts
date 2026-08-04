import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type Client = SupabaseClient<Database>;

export type StockMovementRow = Database["public"]["Tables"]["stock_movements"]["Row"];
export type StockMovementInsert = Database["public"]["Tables"]["stock_movements"]["Insert"];

export type StockMovementWithProduct = StockMovementRow & {
  product: { id: string; name: string; sku: string } | null;
};

export async function insertMovement(client: Client, input: StockMovementInsert): Promise<StockMovementRow> {
  const { data, error } = await client.from("stock_movements").insert(input).select().single();
  if (error) throw error;
  return data;
}

export type MovementFilters = {
  productId?: string;
  page?: number;
  pageSize?: number;
};

export async function findMovements(
  client: Client,
  filters: MovementFilters
): Promise<{ data: StockMovementWithProduct[]; count: number }> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client.from("stock_movements").select("*, product:products(id, name, sku)", { count: "exact" });

  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) throw error;

  return { data: (data ?? []) as unknown as StockMovementWithProduct[], count: count ?? 0 };
}
