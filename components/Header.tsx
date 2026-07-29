"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-vinho text-creme shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-9 w-9 text-areia" />
          <span className="font-display text-lg tracking-wide">Ana Wolf Semijoias</span>
        </Link>
        <Link
          href="/carrinho"
          className="relative rounded-full border border-areia/60 px-4 py-2 text-sm font-medium text-creme transition hover:bg-areia hover:text-vinho"
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
