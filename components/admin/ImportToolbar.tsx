"use client";

import { useState } from "react";
import InstagramImportModal from "@/components/admin/InstagramImportModal";
import { getImporter } from "@/services/import/registry";
import type { ProductDraft } from "@/services/import/types";
import type { Category } from "@/services/categories.service";

const instagramImporter = getImporter("instagram");

export default function ImportToolbar({
  categories,
  folder,
  autoOpen,
  onImported,
}: {
  categories: Category[];
  folder: string;
  autoOpen?: boolean;
  onImported: (draft: ProductDraft) => void;
}) {
  const [open, setOpen] = useState(Boolean(autoOpen));

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-rosa/30 bg-white p-4">
      <p className="text-sm text-vinho/70">Preencha manualmente abaixo ou importe os dados de outra fonte:</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-vinho/30 px-4 py-2 text-sm font-medium text-vinho transition hover:bg-vinho hover:text-creme"
      >
        {instagramImporter?.label ?? "Importar do Instagram"}
      </button>

      {open && (
        <InstagramImportModal
          categories={categories}
          folder={folder}
          onApply={(draft) => {
            onImported(draft);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
