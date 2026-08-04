"use client";

import Logo from "@/components/ui/Logo";
import PatternBackground from "@/components/ui/PatternBackground";
import { useSettings } from "@/lib/settings-context";

export default function Footer() {
  const settings = useSettings();

  return (
    <footer className="mt-16">
      <PatternBackground height={40} opacity={0.16} />
      <div className="bg-vinho text-creme">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center">
          <Logo className="h-10 w-10 text-areia" />
          <p className="font-display text-lg">{settings.storeName}</p>
          <p className="max-w-md text-sm text-creme/80">
            Semijoias com brilho de verdade, para o seu dia a dia.
          </p>
          {settings.address && <p className="text-xs text-creme/70">{settings.address}</p>}
          <div className="flex gap-4 text-xs text-creme/80">
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:underline"
              >
                Instagram
              </a>
            )}
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:underline"
              >
                Facebook
              </a>
            )}
          </div>
          <p className="text-xs text-creme/60">
            {settings.storeName}. Todos os direitos reservados © {new Date().getFullYear()}.
          </p>
        </div>
      </div>
    </footer>
  );
}
