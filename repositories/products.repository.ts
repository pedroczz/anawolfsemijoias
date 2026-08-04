import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type Client = SupabaseClient<Database>;

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
export type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];

export type ProductWithRelations = ProductRow & {
  category: { id: string; name: string; slug: string } | null;
  product_images: Pick<ProductImageRow, "id" | "url" | "display_order">[];
};

const SELECT_WITH_RELATIONS =
  "*, category:categories(id, name, slug), product_images(id, url, display_order)";

export async function findAllActive(client: Client): Promise<ProductWithRelations[]> {
  const { data, error } = await client
    .from("products")
    .select(SELECT_WITH_RELATIONS)
    .eq("active", true)
    .order("display_order", { ascending: true })
    .order("display_order", { ascending: true, foreignTable: "product_images" });

  if (error) throw error;
  return (data ?? []) as unknown as ProductWithRelations[];
}

export type AdminProductFilters = {
  search?: string;
  categoryId?: string;
  status?: "all" | "active" | "inactive" | "out_of_stock";
  sortBy?: "display_order" | "name" | "price" | "stock" | "created_at" | "updated_at";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function findAllForAdmin(
  client: Client,
  filters: AdminProductFilters
): Promise<{ data: ProductWithRelations[]; count: number }> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client
    .from("products")
    .select(SELECT_WITH_RELATIONS, { count: "exact" });

  if (filters.search && filters.search.trim() !== "") {
    // Remove caracteres que teriam significado especial na sintaxe de filtro do PostgREST.
    const term = filters.search.trim().replace(/[,()%]/g, "");
    if (term !== "") {
      query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
    }
  }

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.status === "active") {
    query = query.eq("active", true);
  } else if (filters.status === "inactive") {
    query = query.eq("active", false);
  } else if (filters.status === "out_of_stock") {
    query = query.eq("stock", 0);
  }

  const sortBy = filters.sortBy ?? "display_order";
  const sortDir = filters.sortDir ?? "asc";
  query = query.order(sortBy, { ascending: sortDir === "asc" }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: (data ?? []) as unknown as ProductWithRelations[], count: count ?? 0 };
}

export async function findById(client: Client, id: string): Promise<ProductWithRelations | null> {
  const { data, error } = await client
    .from("products")
    .select(SELECT_WITH_RELATIONS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ProductWithRelations | null;
}

export async function findBySku(client: Client, sku: string): Promise<ProductRow | null> {
  const { data, error } = await client.from("products").select("*").eq("sku", sku).maybeSingle();
  if (error) throw error;
  return data;
}

export async function create(client: Client, input: ProductInsert): Promise<ProductRow> {
  const { data, error } = await client.from("products").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function update(client: Client, id: string, input: ProductUpdate): Promise<ProductRow> {
  const { data, error } = await client.from("products").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function remove(client: Client, id: string): Promise<void> {
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function addImages(
  client: Client,
  productId: string,
  images: { url: string; display_order: number }[]
): Promise<ProductImageRow[]> {
  if (images.length === 0) return [];
  const { data, error } = await client
    .from("product_images")
    .insert(images.map((image) => ({ ...image, product_id: productId })))
    .select();
  if (error) throw error;
  return data ?? [];
}

export async function deleteImage(client: Client, imageId: string): Promise<void> {
  const { error } = await client.from("product_images").delete().eq("id", imageId);
  if (error) throw error;
}

export async function replaceImageOrder(
  client: Client,
  images: { id: string; display_order: number }[]
): Promise<void> {
  for (const image of images) {
    const { error } = await client
      .from("product_images")
      .update({ display_order: image.display_order })
      .eq("id", image.id);
    if (error) throw error;
  }
}

export async function countAll(client: Client): Promise<{
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
  featured: number;
}> {
  const [total, active, inactive, outOfStock, featured] = await Promise.all([
    client.from("products").select("id", { count: "exact", head: true }),
    client.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    client.from("products").select("id", { count: "exact", head: true }).eq("active", false),
    client.from("products").select("id", { count: "exact", head: true }).eq("stock", 0),
    client.from("products").select("id", { count: "exact", head: true }).eq("featured", true),
  ]);

  return {
    total: total.count ?? 0,
    active: active.count ?? 0,
    inactive: inactive.count ?? 0,
    outOfStock: outOfStock.count ?? 0,
    featured: featured.count ?? 0,
  };
}
