import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export const MEDIA_BUCKET = "media";

export function getPublicUrl(client: Client, path: string): string {
  return client.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadFile(
  client: Client,
  path: string,
  file: File
): Promise<{ path: string; url: string }> {
  const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return { path, url: getPublicUrl(client, path) };
}

export async function copyFile(client: Client, fromPath: string, toPath: string): Promise<string> {
  const { error } = await client.storage.from(MEDIA_BUCKET).copy(fromPath, toPath);
  if (error) throw error;
  return getPublicUrl(client, toPath);
}

export function extractPathFromUrl(url: string): string | null {
  const marker = `/object/public/${MEDIA_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

export async function deleteByUrls(client: Client, urls: string[]): Promise<void> {
  const paths = urls.map(extractPathFromUrl).filter((path): path is string => path !== null);
  if (paths.length === 0) return;
  const { error } = await client.storage.from(MEDIA_BUCKET).remove(paths);
  if (error) throw error;
}

const COMBINING_DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");

export function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS_RE, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
}

export async function listFiles(client: Client, prefix: string) {
  const { data, error } = await client.storage.from(MEDIA_BUCKET).list(prefix, {
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;
  return data ?? [];
}

export type MediaFile = { path: string; url: string; name: string };

/**
 * Lista arquivos sob products/*\/ e settings/*\/ (estrutura usada pelos uploads do painel).
 * `list()` do Storage não é recursivo, então percorremos manualmente os dois níveis de pasta.
 */
export async function listAllFiles(client: Client): Promise<MediaFile[]> {
  const topLevelFolders = ["products", "settings"];
  const files: MediaFile[] = [];

  for (const top of topLevelFolders) {
    const entries = await listFiles(client, top);
    // Entradas sem `id` são subpastas (o client-js do Storage não lista recursivamente).
    const subfolderNames = entries.filter((entry) => entry.id === null).map((entry) => entry.name);

    for (const folderName of subfolderNames) {
      const inner = await listFiles(client, `${top}/${folderName}`);
      for (const file of inner) {
        if (file.id === null) continue;
        const path = `${top}/${folderName}/${file.name}`;
        files.push({ path, url: getPublicUrl(client, path), name: file.name });
      }
    }
  }

  return files;
}
