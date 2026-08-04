"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction, duplicateProductAction } from "@/app/admin/(dashboard)/produtos/actions";

export default function ProductDangerActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDuplicate() {
    setBusy(true);
    setError(null);
    const result = await duplicateProductAction(productId);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/produtos");
  }

  async function handleDelete() {
    if (!window.confirm("Excluir este produto e suas imagens permanentemente?")) return;
    setBusy(true);
    setError(null);
    const result = await deleteProductAction(productId);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/produtos");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={handleDuplicate}
          className="rounded-full border border-vinho/30 px-4 py-2 text-xs font-medium text-vinho transition hover:bg-vinho hover:text-creme disabled:opacity-60"
        >
          Duplicar produto
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="rounded-full border border-bordo/40 px-4 py-2 text-xs font-medium text-bordo transition hover:bg-bordo hover:text-creme disabled:opacity-60"
        >
          Excluir produto
        </button>
      </div>
      {error && <p className="text-sm text-bordo">{error}</p>}
    </div>
  );
}
