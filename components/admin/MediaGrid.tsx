"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteMediaFileAction } from "@/app/admin/(dashboard)/uploads/actions";
import type { MediaFile } from "@/services/storage.service";

export default function MediaGrid({ files }: { files: MediaFile[] }) {
  const router = useRouter();
  const [busyPath, setBusyPath] = useState<string | null>(null);

  async function handleDelete(file: MediaFile) {
    if (!window.confirm(`Excluir "${file.name}"? Se estiver em uso por um produto ou nas configurações, deixará de aparecer.`)) {
      return;
    }
    setBusyPath(file.path);
    await deleteMediaFileAction(file.path);
    setBusyPath(null);
    router.refresh();
  }

  if (files.length === 0) {
    return <p className="text-sm text-vinho/60">Nenhum arquivo enviado ainda.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      {files.map((file) => (
        <div key={file.path} className="flex flex-col gap-2 rounded-lg border border-rosa/30 bg-white p-2">
          <div className="relative aspect-square overflow-hidden rounded-md bg-off-white">
            <Image src={file.url} alt={file.name} fill unoptimized className="object-cover" />
          </div>
          <p className="truncate text-xs text-vinho/70" title={file.name}>
            {file.name}
          </p>
          <button
            type="button"
            disabled={busyPath === file.path}
            onClick={() => handleDelete(file)}
            className="text-xs text-bordo underline-offset-2 hover:underline disabled:opacity-50"
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}
