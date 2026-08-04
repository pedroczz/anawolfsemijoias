"use client";

import { useState } from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, extractPathFromUrl } from "@/services/storage.service";
import { validateUploadFile, buildUploadPath, uploadFileWithProgress } from "@/services/import/upload";

/**
 * Componente reutilizável de upload de uma única imagem: drag-and-drop, clique
 * para selecionar, preview com fallback, barra de progresso real e exclusão.
 * Ao enviar uma nova imagem no lugar de uma existente, a antiga é removida do
 * Storage automaticamente. Usado para logo/banner da loja e como base do
 * gerenciamento de imagem principal/galeria de produtos.
 */
export default function UploadImage({
  label,
  value,
  folder,
  onChange,
  helpText,
}: {
  label?: string;
  value: string | null;
  folder: string;
  onChange: (url: string | null) => void;
  helpText?: string;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    const validationError = validateUploadFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setProgress(0);
    const supabase = createClient();
    const path = buildUploadPath(folder, file);

    try {
      await uploadFileWithProgress(supabase, path, file, setProgress);
    } catch {
      setError("Falha ao enviar a imagem.");
      setProgress(null);
      return;
    }

    const previousPath = value ? extractPathFromUrl(value) : null;
    if (previousPath) await supabase.storage.from(MEDIA_BUCKET).remove([previousPath]);

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setProgress(null);
  }

  async function handleRemove() {
    if (!value) return;
    const supabase = createClient();
    const path = extractPathFromUrl(value);
    if (path) await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    onChange(null);
  }

  const uploading = progress !== null;

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-sm font-medium text-vinho">{label}</p>}
      <div className="flex items-center gap-4">
        <label
          className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-rosa/50 bg-off-white transition hover:border-vinho"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
        >
          {value && <ImageWithFallback src={value} alt={label ?? ""} fill unoptimized className="object-cover" />}
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/85 px-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-rosa/30">
                <div className="h-full rounded-full bg-vinho transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-vinho">{progress}%</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
              event.target.value = "";
            }}
          />
        </label>
        <div className="flex flex-col gap-2">
          <label className="w-fit cursor-pointer rounded-full border border-vinho/30 px-3 py-1.5 text-xs font-medium text-vinho transition hover:bg-vinho hover:text-creme">
            {uploading ? "Enviando..." : value ? "Substituir" : "Enviar imagem"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
                event.target.value = "";
              }}
            />
          </label>
          {value && !uploading && (
            <button type="button" onClick={handleRemove} className="w-fit text-xs text-bordo underline-offset-2 hover:underline">
              Remover
            </button>
          )}
          {helpText && <p className="text-xs text-vinho/50">{helpText}</p>}
        </div>
      </div>
      {error && <p className="text-xs text-bordo">{error}</p>}
    </div>
  );
}
