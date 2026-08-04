import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminGetProduct } from "@/services/products.service";
import { listCategories } from "@/services/categories.service";
import ProductForm from "@/components/admin/ProductForm";
import ProductDangerActions from "@/components/admin/ProductDangerActions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [product, categories] = await Promise.all([
    adminGetProduct(supabase, params.id),
    listCategories(supabase),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-vinho">Editar produto</h1>
        <ProductDangerActions productId={product.id} />
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
