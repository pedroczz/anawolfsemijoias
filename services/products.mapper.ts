import type { ProductWithRelations } from "@/repositories/products.repository";

export type Product = {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  category: string;
  categoryName: string;
  shortDescription: string;
  description: string;
  material: string;
  color: string;
  size: string;
  price: number;
  promoPrice: number | null;
  stock: number;
  weight: number | null;
  active: boolean;
  featured: boolean;
  isNew: boolean;
  order: number;
  images: string[];
  available: boolean;
  lowStockThreshold: number;
  lowStock: boolean;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
};

/** Converte uma linha do banco (com relações) no tipo `Product` usado pelo app. Sem dependências Node-only — seguro para bundles de cliente. */
export function mapProduct(row: ProductWithRelations): Product {
  const gallery = [...row.product_images]
    .sort((a, b) => a.display_order - b.display_order)
    .map((image) => image.url);
  const images = row.main_image ? [row.main_image, ...gallery] : gallery;

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    categoryId: row.category_id,
    category: row.category?.slug ?? "",
    categoryName: row.category?.name ?? "",
    shortDescription: row.short_description,
    description: row.description,
    material: row.material,
    color: row.color,
    size: row.size,
    price: Number(row.price),
    promoPrice: row.promo_price !== null ? Number(row.promo_price) : null,
    stock: row.stock,
    weight: row.weight !== null ? Number(row.weight) : null,
    active: row.active,
    featured: row.featured,
    isNew: row.is_new,
    order: row.display_order,
    images,
    available: row.stock > 0,
    lowStockThreshold: row.low_stock_threshold,
    lowStock: row.stock > 0 && row.stock <= row.low_stock_threshold,
    salesCount: row.sales_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
