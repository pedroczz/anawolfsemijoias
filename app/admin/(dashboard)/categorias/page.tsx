import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/services/categories.service";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  const categories = await listCategories(supabase);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-vinho">Categorias</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
