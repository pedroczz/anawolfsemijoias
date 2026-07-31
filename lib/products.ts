import { existsSync } from "fs";
import path from "path";
import Papa from "papaparse";

export type Product = {
  sku: string;
  name: string;
  category: string;
  material: string;
  color: string;
  size: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  isNew: boolean;
  order: number;
  /** Derivado de stock > 0 — é o que os componentes existentes checam. */
  available: boolean;
};

/**
 * Usado apenas até PRODUCTS_SHEET_CSV_URL ser configurada (ou se a busca falhar),
 * para o site nunca ficar com o catálogo vazio.
 */
const FALLBACK_PRODUCTS: Product[] = [
  {
    sku: "1",
    name: "Colar Gota Dourada",
    category: "colar",
    material: "folheado a ouro",
    color: "dourado",
    size: "único",
    description: "Colar folheado a ouro com pingente em gota, corrente fina.",
    price: 89.9,
    stock: 3,
    images: ["placeholder.svg"],
    featured: true,
    isNew: false,
    order: 1,
    available: true,
  },
  {
    sku: "2",
    name: "Brinco Argola Vinho",
    category: "brinco",
    material: "folheado a ouro",
    color: "dourado",
    size: "médio",
    description: "Argola média com banho dourado e detalhe esmaltado.",
    price: 54.9,
    stock: 0,
    images: ["placeholder.svg"],
    featured: false,
    isNew: false,
    order: 2,
    available: false,
  },
  {
    sku: "3",
    name: "Anel Solitário Areia",
    category: "anel",
    material: "folheado a ouro",
    color: "dourado",
    size: "16",
    description: "Anel solitário com zircônia e acabamento fosco dourado.",
    price: 69.9,
    stock: 5,
    images: ["placeholder.svg"],
    featured: false,
    isNew: true,
    order: 3,
    available: true,
  },
];

const PRODUCT_IMAGES_DIR = path.join(process.cwd(), "public", "produtos");

// Mapeia variações de cabeçalho (com/sem acento, maiúsculas) para a chave canônica.
const HEADER_ALIASES: Record<string, string> = {
  sku: "sku",
  codigo: "sku",
  código: "sku",
  nome: "nome",
  categoria: "categoria",
  material: "material",
  cor: "cor",
  tamanho: "tamanho",
  descricao: "descricao",
  descrição: "descricao",
  preco: "preco",
  preço: "preco",
  estoque: "estoque",
  imagemprincipal: "imagemprincipal",
  imagem1: "imagemprincipal",
  imagem2: "imagem2",
  imagem3: "imagem3",
  imagem4: "imagem4",
  destaque: "destaque",
  novo: "novo",
  ativo: "ativo",
  ordem: "ordem",
};

const REQUIRED_COLUMNS = ["sku", "nome", "categoria", "preco", "estoque"];

function normalizeHeader(header: string): string {
  const key = header.trim().toLowerCase();
  return HEADER_ALIASES[key] ?? key;
}

function parsePrice(raw: string): number | null {
  const cleaned = (raw ?? "").trim().replace(/[^\d,.-]/g, "");
  if (cleaned === "") return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized = cleaned;
  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    normalized = cleaned.replace(/,/g, "");
  }

  const value = parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseStock(raw: string): number | null {
  const cleaned = (raw ?? "").trim().replace(",", ".");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && Number.isInteger(value) && value >= 0 ? value : null;
}

function parseBooleanFlag(raw: string, defaultValue: boolean): boolean {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "") return defaultValue;
  if (["true", "verdadeiro", "sim", "1", "yes"].includes(value)) return true;
  if (["false", "falso", "nao", "não", "0", "no"].includes(value)) return false;
  return defaultValue;
}

function parseOrder(raw: string): number {
  const value = parseInt((raw ?? "").trim(), 10);
  return Number.isFinite(value) ? value : 9999;
}

function imageExists(filename: string): boolean {
  return existsSync(path.join(PRODUCT_IMAGES_DIR, filename));
}

/** Recebe o CSV publicado pelo Excel Online e devolve produtos válidos, descartando e logando o resto. */
export function parseProductsCsv(csvText: string): Product[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  const rows = parsed.data;
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    throw new Error(`Colunas obrigatórias ausentes na planilha: ${missing.join(", ")}`);
  }

  const seenSkus = new Set<string>();
  const products: Product[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 pelo cabeçalho, +1 por índice base 1
    const sku = (row["sku"] ?? "").trim();
    const name = (row["nome"] ?? "").trim();
    const category = (row["categoria"] ?? "").trim();

    if (sku === "") return; // linha em branco / sem produto
    if (seenSkus.has(sku)) {
      console.warn(`Planilha: SKU duplicado "${sku}" na linha ${rowNumber} — ignorado.`);
      return;
    }
    if (name === "") {
      console.warn(`Planilha: nome vazio para o SKU "${sku}" (linha ${rowNumber}) — ignorado.`);
      return;
    }
    if (category === "") {
      console.warn(`Planilha: categoria vazia para o SKU "${sku}" (linha ${rowNumber}) — ignorado.`);
      return;
    }

    const price = parsePrice(row["preco"]);
    if (price === null) {
      console.warn(`Planilha: preço inválido para o SKU "${sku}" (linha ${rowNumber}) — ignorado.`);
      return;
    }

    const stock = parseStock(row["estoque"]);
    if (stock === null) {
      console.warn(`Planilha: estoque inválido para o SKU "${sku}" (linha ${rowNumber}) — ignorado.`);
      return;
    }

    const mainImage = (row["imagemprincipal"] ?? "").trim();
    if (mainImage !== "" && !imageExists(mainImage)) {
      console.warn(
        `Planilha: imagem principal "${mainImage}" do SKU "${sku}" (linha ${rowNumber}) não existe em public/produtos — ignorado.`
      );
      return;
    }

    const extraImages = [row["imagem2"], row["imagem3"], row["imagem4"]]
      .map((value) => (value ?? "").trim())
      .filter((value) => {
        if (value === "") return false;
        if (!imageExists(value)) {
          console.warn(`Planilha: imagem "${value}" do SKU "${sku}" (linha ${rowNumber}) não existe — ignorada.`);
          return false;
        }
        return true;
      });

    const images = [mainImage, ...extraImages].filter((value) => value !== "");

    const active = parseBooleanFlag(row["ativo"], true);
    if (!active) return; // Ativo=false: existe na planilha, mas não entra no catálogo público.

    seenSkus.add(sku);
    products.push({
      sku,
      name,
      category: category.toLowerCase(),
      material: (row["material"] ?? "").trim(),
      color: (row["cor"] ?? "").trim(),
      size: (row["tamanho"] ?? "").trim(),
      description: (row["descricao"] ?? "").trim(),
      price,
      stock,
      images: images.length > 0 ? images : ["placeholder.svg"],
      featured: parseBooleanFlag(row["destaque"], false),
      isNew: parseBooleanFlag(row["novo"], false),
      order: parseOrder(row["ordem"]),
      available: stock > 0,
    });
  });

  return products.sort((a, b) => a.order - b.order);
}

/**
 * O Excel (principalmente em pt-BR) frequentemente publica CSV em Windows-1252,
 * não UTF-8 — o que corrompe acentos ("Descrição" -> "Descri��o"). Tenta UTF-8
 * primeiro (estrito) e cai para Windows-1252 se os bytes não forem UTF-8 válido.
 */
function decodeCsvBuffer(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

/**
 * Busca o catálogo publicado do Excel Online. Server-only: usa a env var
 * PRODUCTS_SHEET_CSV_URL (link "Publicar na Web" em formato CSV) e nunca
 * usa cache, para refletir alterações da planilha imediatamente.
 */
export async function getProducts(): Promise<Product[]> {
  const csvUrl = process.env.PRODUCTS_SHEET_CSV_URL;
  if (!csvUrl) {
    console.warn("PRODUCTS_SHEET_CSV_URL não configurada — usando catálogo de exemplo.");
    return FALLBACK_PRODUCTS;
  }

  try {
    const response = await fetch(csvUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Falha ao buscar planilha: HTTP ${response.status}`);
    }
    const csvText = decodeCsvBuffer(await response.arrayBuffer());
    const products = parseProductsCsv(csvText);
    return products.length > 0 ? products : FALLBACK_PRODUCTS;
  } catch (error) {
    console.error("Erro ao carregar produtos da planilha:", error);
    return FALLBACK_PRODUCTS;
  }
}
