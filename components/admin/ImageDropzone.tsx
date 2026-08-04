"use client";

import { useRef, useState } from "react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, extractPathFromUrl } from "@/services/storage.service";
import { validateUploadFile, buildUploadPath, uploadFileWithProgress } from "@/services/import/upload";
import { importImageFromUrlAction } from "@/app/admin/(dashboard)/produtos/import-actions";

// `id` estável: identificar itens por referência de objeto quebra assim que o
// progresso do upload cria um objeto novo, e o item nunca é substituído pela URL final.
type ImageItem = { id: string; url: string; uploading?: boolean; progress?: number };

export default function ImageDropzone({
  initialImages,
  folder,
  onChange,
}: {
  initialImages: string[];
  folder: string;
  onChange: (urls: string[]) => void;
}) {
  const [items, setItems] = useState<ImageItem[]>(
    initialImages.map((url) => ({ id: crypto.randomUUID(), url }))
  );
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [importingUrl, setImportingUrl] = useState(false);
  const dragIndex = useRef<number | null>(null);

  function emitChange(next: ImageItem[]) {
    onChange(next.filter((item) => !item.uploading).map((item) => item.url));
  }

  async function uploadFiles(files: FileList | File[]) {
    setError(null);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const validationError = validateUploadFile(file);
      if (validationError) {
        setError(`"${file.name}": ${validationError}`);
        continue;
      }

      const uploadId = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setItems((prev) => [...prev, { id: uploadId, url: previewUrl, uploading: true, progress: 0 }]);

      const path = buildUploadPath(folder, file);

      try {
        await uploadFileWithProgress(supabase, path, file, (percent) => {
          setItems((prev) => prev.map((item) => (item.id === uploadId ? { ...item, progress: percent } : item)));
        });
      } catch {
        setError(`Falha ao enviar "${file.name}".`);
        URL.revokeObjectURL(previewUrl);
        setItems((prev) => {
          const next = prev.filter((item) => item.id !== uploadId);
          emitChange(next);
          return next;
        });
        continue;
      }

      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      URL.revokeObjectURL(previewUrl);
      setItems((prev) => {
        const next = prev.map((item) => (item.id === uploadId ? { id: item.id, url: data.publicUrl } : item));
        emitChange(next);
        return next;
      });
    }
  }

  async function handleImportFromUrl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageUrl.trim()) return;

    setError(null);
    setImportingUrl(true);
    const result = await importImageFromUrlAction(imageUrl.trim(), folder);
    setImportingUrl(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setImageUrl("");
    setItems((prev) => {
      const next = [...prev, { id: crypto.randomUUID(), url: result.url }];
      emitChange(next);
      return next;
    });
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

  function handleSetMain(index: number) {
    if (index === 0) return;

    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.unshift(moved);
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

      <form onSubmit={handleImportFromUrl} className="flex gap-2">
        <input
          type="url"
          placeholder="Ou cole o link de uma imagem..."
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className="admin-input flex-1"
        />
        <button
          type="submit"
          disabled={importingUrl || !imageUrl.trim()}
          className="shrink-0 rounded-full border border-vinho/30 px-4 py-2 text-xs font-medium text-vinho transition hover:bg-vinho hover:text-creme disabled:cursor-not-allowed disabled:opacity-50"
        >
          {importingUrl ? "Baixando..." : "Adicionar"}
        </button>
      </form>

      {error && <p className="text-sm text-bordo">{error}</p>}

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable={!item.uploading}
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, index)}
              className="relative aspect-square overflow-hidden rounded-lg border border-rosa/40 bg-white"
            >
              <ImageWithFallback src={item.url} alt="" fill unoptimized className="object-cover" />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-vinho px-1.5 py-0.5 text-[10px] font-semibold text-creme">
                  Principal
                </span>
              )}
              {item.uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/85 px-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-rosa/30">
                    <div
                      className="h-full rounded-full bg-vinho transition-all"
                      style={{ width: `${item.progress ?? 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-vinho">{item.progress ?? 0}%</span>
                </div>
              )}
              {!item.uploading && index !== 0 && (
                <div className="absolute inset-x-0 bottom-0 bg-vinho/70 px-1.5 py-1">
                  <button
                    type="button"
                    onClick={() => handleSetMain(index)}
                    className="text-[10px] font-medium text-creme underline-offset-2 hover:underline"
                  >
                    Tornar principal
                  </button>
                </div>
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
