import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/services/categories.service";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = createClient();
  const categories = await listCategories(supabase);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-vinho">Novo produto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
