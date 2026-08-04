"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useCart } from "@/lib/cart-context";
import { useSettings } from "@/lib/settings-context";

export default function Header() {
  const { count } = useCart();
  const settings = useSettings();

  return (
    <header className="sticky top-0 z-40 bg-vinho text-creme shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          {settings.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt={settings.storeName}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <Logo className="h-9 w-9 shrink-0 text-areia" />
          )}
          <span className="truncate font-display text-sm tracking-wide sm:text-lg">{settings.storeName}</span>
        </Link>
        <Link
          href="/carrinho"
          className="relative shrink-0 rounded-full border border-areia/60 px-4 py-2 text-sm font-medium text-creme transition hover:bg-areia hover:text-vinho"
        >
          Carrinho
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-areia text-xs font-bold text-vinho">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
