"use client";

import { useState } from "react";
import Image from "next/image";
import { importFromInstagramAction } from "@/app/admin/(dashboard)/produtos/import-actions";
import type { ProductDraft } from "@/services/import/types";
import type { Category } from "@/services/categories.service";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function InstagramImportModal({
  categories,
  folder,
  onApply,
  onClose,
}: {
  categories: Category[];
  folder: string;
  onApply: (draft: ProductDraft) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft | null>(null);

  async function handleFetch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setDraft(null);

    const result = await importFromInstagramAction(url, folder);
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setDraft(result.draft);
  }

  const categoryName = categories.find((category) => category.id === draft?.categoryId)?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-vinho/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-vinho">Importar do Instagram</h2>
          <button type="button" onClick={onClose} className="text-vinho/50 hover:text-vinho" aria-label="Fechar">
            ×
          </button>
        </div>

        {!draft && (
          <form onSubmit={handleFetch} className="flex flex-col gap-3">
            <label htmlFor="instagram-url" className="text-sm font-medium text-vinho">
              Link da publicação
            </label>
            <input
              id="instagram-url"
              required
              placeholder="https://www.instagram.com/p/..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="admin-input"
            />
            {error && <p className="text-sm text-bordo">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-vinho px-4 py-2 text-sm font-semibold text-creme transition hover:bg-bordo disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Buscando..." : "Buscar dados"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-vinho/30 px-4 py-2 text-sm font-medium text-vinho transition hover:bg-vinho hover:text-creme"
              >
                Preencher manualmente
              </button>
            </div>
          </form>
        )}

        {draft && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-vinho/70">
              Pré-visualização — revise e ajuste antes de aplicar ao formulário. Nada é salvo agora.
            </p>

            {draft.images[0] && (
              <div className="relative aspect-square w-32 overflow-hidden rounded-lg border border-rosa/40">
                <Image src={draft.images[0]} alt="" fill unoptimized className="object-cover" />
              </div>
            )}

            <dl className="flex flex-col gap-2 text-sm">
              <Row label="Nome sugerido" value={draft.name || "—"} />
              <Row label="Preço sugerido" value={draft.price !== null ? currency.format(draft.price) : "—"} />
              <Row label="Categoria sugerida" value={categoryName ?? "—"} />
              <Row label="Descrição sugerida" value={draft.description || "—"} />
            </dl>

            {draft.warnings.length > 0 && (
              <ul className="flex flex-col gap-1 rounded-lg bg-areia/30 p-3 text-xs text-vinho/80">
                {draft.warnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onApply(draft)}
                className="rounded-full bg-vinho px-4 py-2 text-sm font-semibold text-creme transition hover:bg-bordo"
              >
                Usar estes dados
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-full border border-vinho/30 px-4 py-2 text-sm font-medium text-vinho transition hover:bg-vinho hover:text-creme"
              >
                Tentar outro link
              </button>
              <button type="button" onClick={onClose} className="text-sm text-vinho/60 underline-offset-2 hover:underline">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-vinho/50">{label}</dt>
      <dd className="text-vinho">{value}</dd>
    </div>
  );
}
