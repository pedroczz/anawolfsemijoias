import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET, sanitizeFileName } from "@/services/storage.service";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** Sem dependências Node-only — usado direto no ImageDropzone (client component). */
export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    return "Formato não suportado. Envie imagens JPEG, PNG, WEBP, GIF ou AVIF.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Arquivo maior que 10MB.";
  }
  return null;
}

export function buildUploadPath(folder: string, file: File): string {
  return `${folder}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
}

/**
 * Upload direto do navegador para o Storage do Supabase via XHR (em vez do SDK)
 * para expor progresso real através de `xhr.upload.onprogress` — o supabase-js
 * não expõe progresso de upload.
 */
export function uploadFileWithProgress(
  supabase: SupabaseClient,
  path: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    supabase.auth.getSession().then(({ data }) => {
      const accessToken = data.session?.access_token;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!accessToken || !supabaseUrl || !anonKey) {
        reject(new Error("Sessão expirada. Faça login novamente."));
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${path}`, true);
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.setRequestHeader("apikey", anonKey);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.setRequestHeader("x-upsert", "false");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error("Falha ao enviar a imagem."));
      };
      xhr.onerror = () => reject(new Error("Falha ao enviar a imagem."));
      xhr.send(file);
    }, reject);
  });
}
