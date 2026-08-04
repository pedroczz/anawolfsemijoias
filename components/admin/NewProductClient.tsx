"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ImportToolbar from "@/components/admin/ImportToolbar";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/services/categories.service";
import type { ProductDraft } from "@/services/import/types";

export default function NewProductClient({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const folderRef = useRef(`products/${crypto.randomUUID()}`);
  const [draft, setDraft] = useState<ProductDraft | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <ImportToolbar
        categories={categories}
        folder={folderRef.current}
        autoOpen={searchParams.get("import") === "instagram"}
        onImported={(nextDraft) => {
          setDraft(nextDraft);
          setFormKey((key) => key + 1);
        }}
      />
      <ProductForm key={formKey} categories={categories} draft={draft} folder={folderRef.current} />
    </div>
  );
}
