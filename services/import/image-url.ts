import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { MEDIA_BUCKET, sanitizeFileName } from "@/services/storage.service";

type Client = SupabaseClient<Database>;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^169\.254\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
];

function isBlockedHost(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, "");
  return BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(normalized));
}

export type ImageUrlImportResult = { url: string };

/** Baixa uma imagem pública a partir de uma URL e salva no Storage do Supabase. */
export async function importImageFromUrl(
  client: Client,
  sourceUrl: string,
  folder: string
): Promise<ImageUrlImportResult> {
  let parsed: URL;
  try {
    parsed = new URL(sourceUrl.trim());
  } catch {
    throw new Error("URL de imagem inválida.");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("URL de imagem inválida.");
  }
  if (isBlockedHost(parsed.hostname)) {
    throw new Error("Esse endereço não é permitido.");
  }

  const response = await fetch(parsed.toString(), {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AnaWolfImportBot/1.0)" },
  });
  if (!response.ok) {
    throw new Error(`Não foi possível baixar a imagem (HTTP ${response.status}).`);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new Error("O link não aponta para uma imagem suportada (JPEG, PNG, WEBP, GIF ou AVIF).");
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error("A imagem baixada está vazia.");
  }
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("A imagem excede o tamanho máximo de 8MB.");
  }

  const extension = contentType.split("/")[1] ?? "jpg";
  const baseName = sanitizeFileName(parsed.pathname.split("/").pop() || `imagem.${extension}`);
  const fileName = baseName.includes(".") ? baseName : `${baseName}.${extension}`;
  const path = `${folder}/${randomUUID()}-${fileName}`;

  const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error("Falha ao salvar a imagem no Storage.");

  const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
