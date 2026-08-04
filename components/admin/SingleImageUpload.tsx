"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, extractPathFromUrl, sanitizeFileName } from "@/services/storage.service";

export default function SingleImageUpload({
  label,
  value,
  folder,
  onChange,
}: {
  label: string;
  value: string | null;
  folder: string;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const supabase = createClient();

    const path = `${folder}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      setError("Falha ao enviar a imagem.");
      setUploading(false);
      return;
    }

    const previousPath = value ? extractPathFromUrl(value) : null;
    if (previousPath) await supabase.storage.from(MEDIA_BUCKET).remove([previousPath]);

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  async function handleRemove() {
    if (!value) return;
    const supabase = createClient();
    const path = extractPathFromUrl(value);
    if (path) await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-vinho">{label}</p>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-rosa/40 bg-off-white">
          {value && <Image src={value} alt={label} fill unoptimized className="object-cover" />}
        </div>
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
          {value && (
            <button type="button" onClick={handleRemove} className="w-fit text-xs text-bordo underline-offset-2 hover:underline">
              Remover
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-bordo">{error}</p>}
    </div>
  );
}
