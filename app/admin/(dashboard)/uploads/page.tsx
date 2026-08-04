import { createClient } from "@/lib/supabase/server";
import { listAllFiles } from "@/services/storage.service";
import MediaGrid from "@/components/admin/MediaGrid";

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage() {
  const supabase = createClient();
  const files = await listAllFiles(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-vinho">Uploads</h1>
        <p className="mt-1 text-sm text-vinho/60">
          Todas as imagens enviadas pelo painel (produtos, logo e banner). O envio é feito diretamente nas telas de
          Produtos e Configurações.
        </p>
      </div>
      <MediaGrid files={files} />
    </div>
  );
}
