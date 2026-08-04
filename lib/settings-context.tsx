"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { get as getSettingsRow } from "@/repositories/settings.repository";
import { DEFAULT_SETTINGS, type StoreSettings } from "@/services/settings.service";

const SettingsContext = createContext<StoreSettings | null>(null);

export function SettingsProvider({
  initialSettings,
  children,
}: {
  initialSettings: StoreSettings;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const supabase = createClient();

    async function refresh() {
      try {
        const row = await getSettingsRow(supabase);
        if (!row || !isMounted.current) return;
        setSettings({
          storeName: row.store_name,
          whatsapp: row.whatsapp,
          instagram: row.instagram,
          facebook: row.facebook,
          address: row.address,
          whatsappMessageTemplate: row.whatsapp_message_template,
          logoUrl: row.logo_url,
          bannerUrl: row.banner_url,
          seoTitle: row.seo_title,
          seoDescription: row.seo_description,
        });
      } catch {
        // Mantém as configurações atuais se a atualização falhar.
      }
    }

    const channel = supabase
      .channel("public-store-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "store_settings" }, refresh)
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings(): StoreSettings {
  const context = useContext(SettingsContext);
  return context ?? DEFAULT_SETTINGS;
}
