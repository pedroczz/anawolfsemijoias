"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageDropzone from "@/components/admin/ImageDropzone";
import { saveProductAction } from "@/app/admin/(dashboard)/produtos/actions";
import type { Product } from "@/services/products.mapper";
import type { Category } from "@/services/categories.service";
import type { ProductDraft } from "@/services/import/types";

function toInputValue(value: number | null): string {
  return value === null ? "" : String(value);
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export default function ProductForm({
  categories,
  product,
  draft,
  folder: folderProp,
}: {
  categories: Category[];
  product?: Product;
  /** Pré-preenchimento de um importador (ex: Instagram) — só faz sentido ao criar. Sempre editável. */
  draft?: ProductDraft;
  /** Pasta do Storage já usada pelo importador, para reaproveitar (evita órfãos em pastas diferentes). */
  folder?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sku, setSku] = useState(product?.sku ?? "");
  const [name, setName] = useState(product?.name ?? draft?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? draft?.categoryId ?? categories[0]?.id ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? draft?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? draft?.description ?? "");
  const [material, setMaterial] = useState(product?.material ?? "");
  const [color, setColor] = useState(product?.color ?? "");
  const [size, setSize] = useState(product?.size ?? "");
  const [price, setPrice] = useState(toInputValue(product?.price ?? draft?.price ?? null));
  const [promoPrice, setPromoPrice] = useState(toInputValue(product?.promoPrice ?? null));
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [lowStockThreshold, setLowStockThreshold] = useState(String(product?.lowStockThreshold ?? 5));
  const [weight, setWeight] = useState(toInputValue(product?.weight ?? null));
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [order, setOrder] = useState(String(product?.order ?? 0));
  const [images, setImages] = useState<string[]>(product?.images ?? draft?.images ?? []);

  const folderRef = useRef(folderProp ?? `products/${product?.id ?? crypto.randomUUID()}`);
  const folder = folderRef.current;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const result = await saveProductAction(product?.id ?? null, {
      sku,
      name,
      categoryId: categoryId || null,
      shortDescription,
      description,
      material,
      color,
      size,
      price: Number(price.replace(",", ".")) || 0,
      promoPrice: parseOptionalNumber(promoPrice),
      stock: Math.max(0, Math.trunc(Number(stock) || 0)),
      lowStockThreshold: Math.max(0, Math.trunc(Number(lowStockThreshold) || 0)),
      weight: parseOptionalNumber(weight),
      active,
      featured,
      isNew,
      order: Math.trunc(Number(order) || 0),
      images,
    });

    if (result?.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {draft && draft.warnings.length > 0 && (
        <div className="rounded-lg bg-areia/30 p-3 text-xs text-vinho/80">
          <p className="mb-1 font-medium">Importado do Instagram — confira antes de salvar:</p>
          <ul className="flex flex-col gap-0.5">
            {draft.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="SKU" htmlFor="sku">
          <input
            id="sku"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Nome" htmlFor="name">
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Categoria" htmlFor="category">
          <select
            id="category"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="admin-input"
          >
            <option value="" disabled>
              Selecione...
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ordem de exibição" htmlFor="order">
          <input
            id="order"
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="admin-input"
          />
        </Field>
      </section>

      <section className="grid grid-cols-1 gap-4">
        <Field label="Descrição curta" htmlFor="shortDescription">
          <input
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="admin-input"
            maxLength={160}
          />
        </Field>
        <Field label="Descrição completa" htmlFor="description">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="admin-input min-h-28"
          />
        </Field>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Material" htmlFor="material">
          <input id="material" value={material} onChange={(e) => setMaterial(e.target.value)} className="admin-input" />
        </Field>
        <Field label="Cor" htmlFor="color">
          <input id="color" value={color} onChange={(e) => setColor(e.target.value)} className="admin-input" />
        </Field>
        <Field label="Tamanho" htmlFor="size">
          <input id="size" value={size} onChange={(e) => setSize(e.target.value)} className="admin-input" />
        </Field>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <Field label="Preço (R$)" htmlFor="price">
          <input
            id="price"
            required
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Preço promocional (R$)" htmlFor="promoPrice">
          <input
            id="promoPrice"
            inputMode="decimal"
            value={promoPrice}
            onChange={(e) => setPromoPrice(e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Estoque" htmlFor="stock">
          <input
            id="stock"
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Peso (g)" htmlFor="weight">
          <input
            id="weight"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Estoque mínimo" htmlFor="lowStockThreshold">
          <input
            id="lowStockThreshold"
            type="number"
            min={0}
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            className="admin-input"
          />
        </Field>
      </section>

      <section className="flex flex-wrap gap-6">
        <Checkbox label="Ativo" checked={active} onChange={setActive} />
        <Checkbox label="Destaque" checked={featured} onChange={setFeatured} />
        <Checkbox label="Novo" checked={isNew} onChange={setIsNew} />
      </section>

      <section>
        <p className="mb-2 text-sm font-medium text-vinho">Imagens</p>
        <ImageDropzone initialImages={images} folder={folder} onChange={setImages} />
      </section>

      {error && <p className="text-sm text-bordo">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-vinho px-6 py-2.5 text-sm font-semibold text-creme transition hover:bg-bordo disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar produto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/produtos")}
          className="rounded-full border border-vinho/30 px-6 py-2.5 text-sm font-medium text-vinho transition hover:bg-vinho hover:text-creme"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-vinho">
        {label}
      </label>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-vinho">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}
