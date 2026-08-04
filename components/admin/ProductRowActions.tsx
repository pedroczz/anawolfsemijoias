"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction, duplicateProductAction } from "@/app/admin/(dashboard)/produtos/actions";

export default function ProductRowActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDuplicate() {
    setBusy(true);
    await duplicateProductAction(productId);
    setBusy(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm("Excluir este produto e suas imagens permanentemente?")) return;
    setBusy(true);
    await deleteProductAction(productId);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-xs">
      <button
        type="button"
        disabled={busy}
        onClick={handleDuplicate}
        className="text-vinho underline-offset-2 hover:underline disabled:opacity-50"
      >
        Duplicar
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={handleDelete}
        className="text-bordo underline-offset-2 hover:underline disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}
