"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  setStockAction,
  addStockAction,
  removeStockAction,
  updateLowStockThresholdAction,
} from "@/app/admin/(dashboard)/estoque/actions";

type Mode = "idle" | "add" | "remove";

export default function StockManagerRow({
  productId,
  initialStock,
  initialThreshold,
}: {
  productId: string;
  initialStock: number;
  initialThreshold: number;
}) {
  const router = useRouter();
  const [stock, setStockValue] = useState(String(initialStock));
  const [threshold, setThreshold] = useState(String(initialThreshold));
  const [mode, setMode] = useState<Mode>("idle");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stockDirty = Number(stock) !== initialStock;
  const thresholdDirty = Number(threshold) !== initialThreshold;

  async function handleSaveStock() {
    setBusy(true);
    setError(null);
    const result = await setStockAction(productId, Math.max(0, Math.trunc(Number(stock) || 0)));
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleSaveThreshold() {
    setBusy(true);
    setError(null);
    const result = await updateLowStockThresholdAction(productId, Math.max(0, Math.trunc(Number(threshold) || 0)));
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleConfirmMovement() {
    const value = Math.trunc(Number(quantity) || 0);
    if (value <= 0) {
      setError("Informe uma quantidade maior que zero.");
      return;
    }

    setBusy(true);
    setError(null);
    const action = mode === "add" ? addStockAction : removeStockAction;
    const result = await action(productId, value, note.trim() || undefined);
    setBusy(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    setMode("idle");
    setQuantity("");
    setNote("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(event) => setStockValue(event.target.value)}
          className="admin-input w-20"
        />
        <button
          type="button"
          disabled={!stockDirty || busy}
          onClick={handleSaveStock}
          className="rounded-full bg-vinho px-3 py-1.5 text-xs font-semibold text-creme transition hover:bg-bordo disabled:cursor-not-allowed disabled:opacity-40"
        >
          Salvar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setMode(mode === "add" ? "idle" : "add")}
          className="rounded-full border border-vinho/30 px-2.5 py-1.5 text-xs font-semibold text-vinho transition hover:bg-vinho hover:text-creme"
        >
          + Entrada
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setMode(mode === "remove" ? "idle" : "remove")}
          className="rounded-full border border-vinho/30 px-2.5 py-1.5 text-xs font-semibold text-vinho transition hover:bg-vinho hover:text-creme"
        >
          − Saída
        </button>
        <Link
          href={`/admin/estoque/movimentacoes?product=${productId}`}
          className="text-xs text-vinho/70 underline-offset-2 hover:underline"
        >
          Histórico
        </Link>
      </div>

      {mode !== "idle" && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-off-white p-2">
          <span className="text-xs font-medium text-vinho">{mode === "add" ? "Adicionar" : "Remover"}</span>
          <input
            type="number"
            min={1}
            placeholder="Quantidade"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="admin-input w-24"
          />
          <input
            type="text"
            placeholder="Motivo (opcional)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="admin-input flex-1"
          />
          <button
            type="button"
            disabled={busy}
            onClick={handleConfirmMovement}
            className="rounded-full bg-vinho px-3 py-1.5 text-xs font-semibold text-creme transition hover:bg-bordo disabled:opacity-50"
          >
            Confirmar
          </button>
          <button type="button" onClick={() => setMode("idle")} className="text-xs text-vinho/60 hover:underline">
            Cancelar
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-vinho/60">
        <span>Mínimo:</span>
        <input
          type="number"
          min={0}
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          className="admin-input w-16 py-1"
        />
        <button
          type="button"
          disabled={!thresholdDirty || busy}
          onClick={handleSaveThreshold}
          className="rounded-full border border-vinho/30 px-2 py-1 text-vinho transition hover:bg-vinho hover:text-creme disabled:opacity-30"
        >
          Salvar
        </button>
      </div>

      {error && <p className="text-xs text-bordo">{error}</p>}
    </div>
  );
}
