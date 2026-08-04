import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/services/settings.service";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const settings = await getSettings(supabase);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-vinho">Configurações</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
