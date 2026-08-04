import { randomUUID } from "crypto";
import * as productsRepo from "@/repositories/products.repository";
import type { AdminProductFilters, Client } from "@/repositories/products.repository";
import * as storageService from "@/services/storage.service";
import { mapProduct, type Product } from "@/services/products.mapper";

export type { Product } from "@/services/products.mapper";

export type ProductFormInput = {
  sku: string;
  name: string;
  categoryId: string | null;
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
  /** Estoque igual ou abaixo disso dispara o alerta de "estoque baixo". */
  lowStockThreshold: number;
  /** URLs já hospedadas no Storage, em ordem de exibição — a primeira é a imagem principal. */
  images: string[];
};

export type TopSellingProduct = {
  id: string;
  name: string;
  sku: string;
  salesCount: number;
  mainImage: string | null;
};

export function validateProductInput(input: ProductFormInput): string[] {
  const errors: string[] = [];
  if (!input.sku.trim()) errors.push("SKU é obrigatório.");
  if (!input.name.trim()) errors.push("Nome é obrigatório.");
  if (!input.categoryId) errors.push("Categoria é obrigatória.");
  if (!Number.isFinite(input.price) || input.price < 0) errors.push("Preço inválido.");
  if (input.promoPrice !== null && (!Number.isFinite(input.promoPrice) || input.promoPrice < 0)) {
    errors.push("Preço promocional inválido.");
  }
  if (!Number.isInteger(input.stock) || input.stock < 0) errors.push("Estoque inválido.");
  if (input.weight !== null && (!Number.isFinite(input.weight) || input.weight < 0)) {
    errors.push("Peso inválido.");
  }
  if (!Number.isInteger(input.lowStockThreshold) || input.lowStockThreshold < 0) {
    errors.push("Quantidade mínima inválida.");
  }
  return errors;
}

function toRowInput(input: ProductFormInput) {
  return {
    sku: input.sku.trim(),
    name: input.name.trim(),
    category_id: input.categoryId,
    short_description: input.shortDescription.trim(),
    description: input.description.trim(),
    material: input.material.trim(),
    color: input.color.trim(),
    size: input.size.trim(),
    price: input.price,
    promo_price: input.promoPrice,
    stock: input.stock,
    weight: input.weight,
    active: input.active,
    featured: input.featured,
    is_new: input.isNew,
    display_order: input.order,
    low_stock_threshold: input.lowStockThreshold,
  };
}

export async function getPublicProducts(
  client: Client,
  filters: { hideOutOfStock?: boolean } = {}
): Promise<Product[]> {
  const rows = await productsRepo.findAllActive(client, filters);
  return rows.map(mapProduct);
}

export async function adminListProducts(
  client: Client,
  filters: AdminProductFilters
): Promise<{ data: Product[]; count: number }> {
  const { data, count } = await productsRepo.findAllForAdmin(client, filters);
  return { data: data.map(mapProduct), count };
}

export async function adminGetProduct(client: Client, id: string): Promise<Product | null> {
  const row = await productsRepo.findById(client, id);
  return row ? mapProduct(row) : null;
}

export async function adminGetDashboardCounts(client: Client) {
  return productsRepo.countAll(client);
}

export async function createProduct(client: Client, input: ProductFormInput): Promise<string> {
  const errors = validateProductInput(input);
  if (errors.length > 0) throw new Error(errors.join(" "));

  const existing = await productsRepo.findBySku(client, input.sku.trim());
  if (existing) throw new Error(`SKU "${input.sku.trim()}" já está em uso.`);

  const [mainUrl, ...galleryUrls] = input.images;
  const row = await productsRepo.create(client, {
    ...toRowInput(input),
    main_image: mainUrl ?? null,
  });

  if (galleryUrls.length > 0) {
    await productsRepo.addImages(
      client,
      row.id,
      galleryUrls.map((url, index) => ({ url, display_order: index }))
    );
  }

  return row.id;
}

export async function updateProduct(client: Client, id: string, input: ProductFormInput): Promise<void> {
  const errors = validateProductInput(input);
  if (errors.length > 0) throw new Error(errors.join(" "));

  const current = await productsRepo.findById(client, id);
  if (!current) throw new Error("Produto não encontrado.");

  const skuOwner = await productsRepo.findBySku(client, input.sku.trim());
  if (skuOwner && skuOwner.id !== id) throw new Error(`SKU "${input.sku.trim()}" já está em uso.`);

  const previousUrls = [current.main_image, ...current.product_images.map((image) => image.url)].filter(
    (url): url is string => Boolean(url)
  );
  const [mainUrl, ...galleryUrls] = input.images;
  const removedUrls = previousUrls.filter((url) => !input.images.includes(url));

  await productsRepo.update(client, id, {
    ...toRowInput(input),
    main_image: mainUrl ?? null,
  });

  for (const image of current.product_images) {
    await productsRepo.deleteImage(client, image.id);
  }
  if (galleryUrls.length > 0) {
    await productsRepo.addImages(
      client,
      id,
      galleryUrls.map((url, index) => ({ url, display_order: index }))
    );
  }

  if (removedUrls.length > 0) {
    await storageService.deleteByUrls(client, removedUrls);
  }
}

export async function getTopSellingProducts(client: Client, limit = 5): Promise<TopSellingProduct[]> {
  const rows = await productsRepo.findTopSelling(client, limit);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sku: row.sku,
    salesCount: row.sales_count,
    mainImage: row.main_image,
  }));
}

export async function deleteProduct(client: Client, id: string): Promise<void> {
  const current = await productsRepo.findById(client, id);
  if (!current) return;

  const urls = [current.main_image, ...current.product_images.map((image) => image.url)].filter(
    (url): url is string => Boolean(url)
  );

  await productsRepo.remove(client, id);

  if (urls.length > 0) {
    await storageService.deleteByUrls(client, urls);
  }
}

async function generateUniqueSku(client: Client, baseSku: string): Promise<string> {
  let attempt = 1;
  let candidate = `${baseSku}-copia`;
  while (await productsRepo.findBySku(client, candidate)) {
    attempt += 1;
    candidate = `${baseSku}-copia-${attempt}`;
  }
  return candidate;
}

async function duplicateImageUrl(client: Client, url: string): Promise<string> {
  const path = storageService.extractPathFromUrl(url);
  if (!path) return url;

  const segments = path.split("/");
  const fileName = segments.pop();
  const newPath = [...segments, `${randomUUID()}-${fileName}`].join("/");
  return storageService.copyFile(client, path, newPath);
}

export async function duplicateProduct(client: Client, id: string): Promise<string> {
  const current = await productsRepo.findById(client, id);
  if (!current) throw new Error("Produto não encontrado.");

  const newSku = await generateUniqueSku(client, current.sku);
  const newMainImage = current.main_image ? await duplicateImageUrl(client, current.main_image) : null;
  const newGallery = await Promise.all(
    current.product_images
      .sort((a, b) => a.display_order - b.display_order)
      .map(async (image) => ({
        url: await duplicateImageUrl(client, image.url),
        display_order: image.display_order,
      }))
  );

  const row = await productsRepo.create(client, {
    sku: newSku,
    name: `${current.name} (cópia)`,
    category_id: current.category_id,
    short_description: current.short_description,
    description: current.description,
    material: current.material,
    color: current.color,
    size: current.size,
    price: Number(current.price),
    promo_price: current.promo_price !== null ? Number(current.promo_price) : null,
    stock: current.stock,
    weight: current.weight !== null ? Number(current.weight) : null,
    active: false,
    featured: false,
    is_new: current.is_new,
    display_order: current.display_order,
    main_image: newMainImage,
    low_stock_threshold: current.low_stock_threshold,
  });

  if (newGallery.length > 0) {
    await productsRepo.addImages(client, row.id, newGallery);
  }

  return row.id;
}
