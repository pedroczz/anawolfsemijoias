"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStockAction } from "@/app/admin/(dashboard)/estoque/actions";

export default function StockRow({ productId, initialStock }: { productId: string; initialStock: number }) {
  const router = useRouter();
  const [stock, setStock] = useState(String(initialStock));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = Number(stock) !== initialStock;

  async function handleSave() {
    const value = Math.max(0, Math.trunc(Number(stock) || 0));
    setSaving(true);
    setError(null);
    const result = await updateStockAction(productId, value);
    setSaving(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={stock}
        onChange={(event) => setStock(event.target.value)}
        className="admin-input w-20"
      />
      <button
        type="button"
        disabled={!dirty || saving}
        onClick={handleSave}
        className="rounded-full bg-vinho px-3 py-1.5 text-xs font-semibold text-creme transition hover:bg-bordo disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
      {error && <span className="text-xs text-bordo">{error}</span>}
    </div>
  );
}
