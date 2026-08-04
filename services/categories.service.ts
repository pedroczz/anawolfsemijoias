import * as categoriesRepo from "@/repositories/categories.repository";
import type { CategoryRow, Client } from "@/repositories/categories.repository";

export type Category = {
  id: string;
  name: string;
  slug: string;
  order: number;
};

export type CategoryFormInput = {
  name: string;
  order: number;
};

const DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function mapCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, slug: row.slug, order: row.display_order };
}

export async function listCategories(client: Client): Promise<Category[]> {
  const rows = await categoriesRepo.findAll(client);
  return rows.map(mapCategory);
}

export async function createCategory(client: Client, input: CategoryFormInput): Promise<Category> {
  const name = input.name.trim();
  if (!name) throw new Error("Nome da categoria é obrigatório.");
  const slug = slugify(name);
  if (!slug) throw new Error("Não foi possível gerar um identificador para essa categoria.");

  const row = await categoriesRepo.create(client, { name, slug, display_order: input.order });
  return mapCategory(row);
}

export async function updateCategory(
  client: Client,
  id: string,
  input: CategoryFormInput
): Promise<Category> {
  const name = input.name.trim();
  if (!name) throw new Error("Nome da categoria é obrigatório.");
  const slug = slugify(name);
  if (!slug) throw new Error("Não foi possível gerar um identificador para essa categoria.");

  const row = await categoriesRepo.update(client, id, { name, slug, display_order: input.order });
  return mapCategory(row);
}

export async function deleteCategory(client: Client, id: string): Promise<void> {
  await categoriesRepo.remove(client, id);
}

export async function reorderCategories(client: Client, orderedIds: string[]): Promise<void> {
  for (let index = 0; index < orderedIds.length; index += 1) {
    await categoriesRepo.update(client, orderedIds[index], { display_order: index });
  }
}
