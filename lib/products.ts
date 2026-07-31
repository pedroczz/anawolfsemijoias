import Papa from "papaparse";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  description: string;
  image: string;
};

/**
 * Usado apenas até PRODUCTS_SHEET_CSV_URL ser configurada (ou se a busca falhar),
 * para o site nunca ficar com o catálogo vazio.
 */
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Colar Gota Dourada",
    category: "colar",
    price: 89.9,
    available: true,
    description: "Colar folheado a ouro com pingente em gota, corrente fina.",
    image: "/products/placeholder.svg",
  },
  {
    id: "2",
    name: "Brinco Argola Vinho",
    category: "brinco",
    price: 54.9,
    available: true,
    description: "Argola média com banho dourado e detalhe esmaltado.",
    image: "/products/placeholder.svg",
  },
  {
    id: "3",
    name: "Anel Solitário Areia",
    category: "anel",
    price: 69.9,
    available: false,
    description: "Anel solitário com zircônia e acabamento fosco dourado.",
    image: "/products/placeholder.svg",
  },
];

// Mapeia variações de cabeçalho (com/sem acento, maiúsculas) para a chave canônica.
const HEADER_ALIASES: Record<string, string> = {
  "codigo": "codigo",
  "código": "codigo",
  "sku": "codigo",
  "nome": "nome",
  "categoria": "categoria",
  "preco": "preco",
  "preço": "preco",
  "disponibilidade": "disponibilidade",
  "status": "disponibilidade",
  "descricao": "descricao",
  "descrição": "descricao",
  "foto": "foto",
  "imagem": "foto",
};

const REQUIRED_COLUMNS = ["codigo", "nome", "categoria", "preco", "disponibilidade"];

function normalizeHeader(header: string): string {
  const key = header.trim().toLowerCase();
  return HEADER_ALIASES[key] ?? key;
}

function parsePrice(raw: string): number {
  const cleaned = (raw ?? "").trim().replace(/[^\d,.-]/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized = cleaned;
  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    normalized = cleaned.replace(/,/g, "");
  }

  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

function parseAvailability(raw: string): boolean {
  return !(raw ?? "").trim().toLowerCase().startsWith("esgot");
}

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

  return rows
    .filter((row) => (row["codigo"] ?? "").trim() !== "" && (row["nome"] ?? "").trim() !== "")
    .map((row) => ({
      id: row["codigo"].trim(),
      name: row["nome"].trim(),
      category: (row["categoria"] ?? "").trim().toLowerCase(),
      price: parsePrice(row["preco"]),
      available: parseAvailability(row["disponibilidade"]),
      description: (row["descricao"] ?? "").trim(),
      image: (row["foto"] ?? "").trim() || "/products/placeholder.svg",
    }));
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
    const csvText = await response.text();
    const products = parseProductsCsv(csvText);
    return products.length > 0 ? products : FALLBACK_PRODUCTS;
  } catch (error) {
    console.error("Erro ao carregar produtos da planilha:", error);
    return FALLBACK_PRODUCTS;
  }
}
