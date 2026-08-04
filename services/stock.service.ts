import * as stockRepo from "@/repositories/stock.repository";
import type { MovementFilters, StockMovementWithProduct } from "@/repositories/stock.repository";
import * as productsRepo from "@/repositories/products.repository";
import type { Client } from "@/repositories/products.repository";

export type StockMovementType = "in" | "out" | "adjustment";

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string | null;
  createdAt: string;
  createdBy: string | null;
};

function mapMovement(row: StockMovementWithProduct): StockMovement {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product?.name ?? "Produto removido",
    productSku: row.product?.sku ?? "—",
    type: row.type,
    quantity: row.quantity,
    previousStock: row.previous_stock,
    newStock: row.new_stock,
    note: row.note,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

async function loadCurrentStock(client: Client, productId: string): Promise<number> {
  const current = await productsRepo.findById(client, productId);
  if (!current) throw new Error("Produto não encontrado.");
  return current.stock;
}

async function applyMovement(
  client: Client,
  productId: string,
  previousStock: number,
  newStock: number,
  type: StockMovementType,
  note: string | undefined,
  actorEmail: string | null
): Promise<number> {
  await productsRepo.update(client, productId, { stock: newStock });
  await stockRepo.insertMovement(client, {
    product_id: productId,
    type,
    quantity: newStock - previousStock,
    previous_stock: previousStock,
    new_stock: newStock,
    note: note?.trim() ? note.trim() : null,
    created_by: actorEmail,
  });
  return newStock;
}

/** Edição rápida: define o estoque para um valor absoluto (fica registrado como "adjustment"). */
export async function setStock(
  client: Client,
  productId: string,
  newStock: number,
  actorEmail: string | null,
  note?: string
): Promise<number> {
  if (!Number.isInteger(newStock) || newStock < 0) throw new Error("Estoque inválido.");
  const previousStock = await loadCurrentStock(client, productId);
  if (newStock === previousStock) return newStock;
  return applyMovement(client, productId, previousStock, newStock, "adjustment", note, actorEmail);
}

export async function addStock(
  client: Client,
  productId: string,
  quantity: number,
  actorEmail: string | null,
  note?: string
): Promise<number> {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Quantidade inválida.");
  const previousStock = await loadCurrentStock(client, productId);
  return applyMovement(client, productId, previousStock, previousStock + quantity, "in", note, actorEmail);
}

export async function removeStock(
  client: Client,
  productId: string,
  quantity: number,
  actorEmail: string | null,
  note?: string
): Promise<number> {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Quantidade inválida.");
  const previousStock = await loadCurrentStock(client, productId);
  if (quantity > previousStock) throw new Error("Quantidade maior que o estoque disponível.");
  return applyMovement(client, productId, previousStock, previousStock - quantity, "out", note, actorEmail);
}

export async function updateLowStockThreshold(client: Client, productId: string, threshold: number): Promise<void> {
  if (!Number.isInteger(threshold) || threshold < 0) throw new Error("Quantidade mínima inválida.");
  await productsRepo.update(client, productId, { low_stock_threshold: threshold });
}

export async function listMovements(
  client: Client,
  filters: MovementFilters
): Promise<{ data: StockMovement[]; count: number }> {
  const { data, count } = await stockRepo.findMovements(client, filters);
  return { data: data.map(mapMovement), count };
}
