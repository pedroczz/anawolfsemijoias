"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, extractPathFromUrl, sanitizeFileName } from "@/services/storage.service";

type ImageItem = { url: string; uploading?: boolean };

export default function ImageDropzone({
  initialImages,
  folder,
  onChange,
}: {
  initialImages: string[];
  folder: string;
  onChange: (urls: string[]) => void;
}) {
  const [items, setItems] = useState<ImageItem[]>(initialImages.map((url) => ({ url })));
  const [error, setError] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  function emitChange(next: ImageItem[]) {
    onChange(next.filter((item) => !item.uploading).map((item) => item.url));
  }

  async function uploadFiles(files: FileList | File[]) {
    setError(null);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const placeholder: ImageItem = { url: URL.createObjectURL(file), uploading: true };
      setItems((prev) => [...prev, placeholder]);

      const path = `${folder}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) {
        setError(`Falha ao enviar "${file.name}".`);
        setItems((prev) => {
          const next = prev.filter((item) => item !== placeholder);
          emitChange(next);
          return next;
        });
        continue;
      }

      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      setItems((prev) => {
        const next = prev.map((item) => (item === placeholder ? { url: data.publicUrl } : item));
        emitChange(next);
        return next;
      });
    }
  }

  async function handleRemove(index: number) {
    const target = items[index];

    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      emitChange(next);
      return next;
    });

    if (!target.uploading) {
      const supabase = createClient();
      const path = extractPathFromUrl(target.url);
      if (path) await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    }
  }

  function handleDrop(event: React.DragEvent, index: number) {
    event.preventDefault();
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === index) return;

    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      emitChange(next);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-rosa/50 bg-off-white p-6 text-center text-sm text-vinho/70 transition hover:border-vinho"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (event.dataTransfer.files.length > 0) uploadFiles(event.dataTransfer.files);
        }}
      >
        <span>Arraste imagens aqui ou clique para selecionar</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) uploadFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {error && <p className="text-sm text-bordo">{error}</p>}

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.url + index}
              draggable={!item.uploading}
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, index)}
              className="relative aspect-square overflow-hidden rounded-lg border border-rosa/40 bg-white"
            >
              <Image src={item.url} alt="" fill unoptimized className="object-cover" />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-vinho px-1.5 py-0.5 text-[10px] font-semibold text-creme">
                  Principal
                </span>
              )}
              {item.uploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs text-vinho">
                  Enviando...
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-bordo text-xs text-creme"
                aria-label="Remover imagem"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-vinho/50">
        Arraste para reordenar. A primeira imagem é usada como principal no catálogo.
      </p>
    </div>
  );
}
