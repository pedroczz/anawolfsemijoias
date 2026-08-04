"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadImage from "@/components/admin/UploadImage";
import { updateSettingsAction } from "@/app/admin/(dashboard)/configuracoes/actions";
import type { StoreSettings } from "@/services/settings.service";

export default function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<StoreSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function set<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updateSettingsAction(form);
    setSaving(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome da loja" htmlFor="storeName">
          <input
            id="storeName"
            value={form.storeName}
            onChange={(e) => set("storeName", e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="WhatsApp (com DDI e DDD)" htmlFor="whatsapp">
          <input
            id="whatsapp"
            placeholder="5596991871516"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Instagram (URL)" htmlFor="instagram">
          <input
            id="instagram"
            value={form.instagram}
            onChange={(e) => set("instagram", e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label="Facebook (URL)" htmlFor="facebook">
          <input
            id="facebook"
            value={form.facebook}
            onChange={(e) => set("facebook", e.target.value)}
            className="admin-input"
          />
        </Field>
      </section>

      <Field label="Endereço" htmlFor="address">
        <input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} className="admin-input" />
      </Field>

      <Field label="Mensagem padrão do WhatsApp" htmlFor="whatsappMessageTemplate">
        <textarea
          id="whatsappMessageTemplate"
          value={form.whatsappMessageTemplate}
          onChange={(e) => set("whatsappMessageTemplate", e.target.value)}
          className="admin-input min-h-28"
        />
        <p className="text-xs text-vinho/50">
          Use {"{{loja}}"}, {"{{itens}}"} e {"{{total}}"} — são substituídos automaticamente ao finalizar o pedido.
        </p>
      </Field>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <UploadImage
          label="Logo"
          value={form.logoUrl}
          folder="settings/logo"
          onChange={(url) => set("logoUrl", url)}
        />
        <UploadImage
          label="Banner"
          value={form.bannerUrl}
          folder="settings/banner"
          onChange={(url) => set("bannerUrl", url)}
        />
      </section>

      <section className="grid grid-cols-1 gap-4">
        <Field label="Título SEO" htmlFor="seoTitle">
          <input id="seoTitle" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="admin-input" />
        </Field>
        <Field label="Descrição SEO" htmlFor="seoDescription">
          <textarea
            id="seoDescription"
            value={form.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
            className="admin-input min-h-20"
          />
        </Field>
      </section>

      {error && <p className="text-sm text-bordo">{error}</p>}
      {success && <p className="text-sm text-vinho">Configurações salvas.</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded-full bg-vinho px-6 py-2.5 text-sm font-semibold text-creme transition hover:bg-bordo disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Salvando..." : "Salvar configurações"}
      </button>
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
