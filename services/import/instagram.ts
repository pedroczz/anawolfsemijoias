import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { Category } from "@/services/categories.service";
import { importImageFromUrl } from "@/services/import/image-url";
import type { ProductDraft } from "@/services/import/types";

type Client = SupabaseClient<Database>;

const INSTAGRAM_URL_RE = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels)\/[A-Za-z0-9_-]+\/?/i;

function extractMeta(html: string, property: string): string | null {
  const forward = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i");
  const forwardMatch = html.match(forward);
  if (forwardMatch) return decodeHtmlEntities(forwardMatch[1]);

  // A ordem dos atributos pode variar (content antes de property).
  const reversed = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, "i");
  const reversedMatch = html.match(reversed);
  return reversedMatch ? decodeHtmlEntities(reversedMatch[1]) : null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractPrice(text: string): number | null {
  const match = text.match(/R\$\s*([\d.,]+)/i);
  if (!match) return null;

  const cleaned = match[1].trim();
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

function guessCategory(text: string, categories: Category[]): string | null {
  const lower = text.toLowerCase();
  const match = categories.find((category) => lower.includes(category.name.toLowerCase()));
  return match?.id ?? null;
}

function suggestName(caption: string): string {
  const firstLine = caption
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line !== "");
  if (!firstLine) return "";
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
}

/**
 * Importação best-effort a partir de uma publicação pública do Instagram: lê as
 * meta tags Open Graph da página (imagem e legenda) e tenta extrair preço/categoria
 * da legenda. Nunca lança erro por dado ausente — cada falha vira um item em
 * `warnings` para o usuário revisar e completar manualmente.
 */
export async function importFromInstagram(
  client: Client,
  postUrl: string,
  categories: Category[],
  folder: string
): Promise<ProductDraft> {
  const trimmedUrl = postUrl.trim();
  if (!INSTAGRAM_URL_RE.test(trimmedUrl)) {
    throw new Error("Informe um link válido de publicação do Instagram (instagram.com/p/... ou /reel/...).");
  }

  const warnings: string[] = [];
  const draft: ProductDraft = {
    name: "",
    shortDescription: "",
    description: "",
    price: null,
    categoryId: null,
    images: [],
    sourceUrl: trimmedUrl,
    warnings,
  };

  let html: string | null = null;
  try {
    const response = await fetch(trimmedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (response.ok) {
      html = await response.text();
    } else {
      warnings.push(`Não foi possível acessar a publicação (HTTP ${response.status}) — preencha os dados manualmente.`);
    }
  } catch {
    warnings.push("Não foi possível acessar a publicação do Instagram — preencha os dados manualmente.");
  }

  if (!html) return draft;

  const caption = extractMeta(html, "og:description") ?? "";
  const ogImage = extractMeta(html, "og:image");

  if (caption) {
    draft.description = caption;
    draft.shortDescription = caption.length > 160 ? `${caption.slice(0, 157)}...` : caption;
    draft.name = suggestName(caption);
    draft.price = extractPrice(caption);
    draft.categoryId = guessCategory(caption, categories);

    if (draft.price === null) warnings.push("Não encontramos um preço na legenda — informe manualmente.");
    if (!draft.categoryId) warnings.push("Não identificamos a categoria automaticamente — selecione manualmente.");
  } else {
    warnings.push("Não encontramos legenda na publicação — preencha nome, descrição e preço manualmente.");
  }

  if (ogImage) {
    try {
      const imported = await importImageFromUrl(client, ogImage, folder);
      draft.images = [imported.url];
    } catch {
      warnings.push("Não foi possível baixar a imagem da publicação — adicione uma imagem manualmente.");
    }
  } else {
    warnings.push("Não encontramos imagem na publicação — adicione uma imagem manualmente.");
  }

  return draft;
}
