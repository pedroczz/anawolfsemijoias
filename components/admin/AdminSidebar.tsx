"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/estoque", label: "Estoque" },
  { href: "/admin/uploads", label: "Uploads" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 flex-col gap-1 border-r border-rosa/30 bg-white p-4 sm:w-56">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive ? "bg-vinho text-creme" : "text-vinho hover:bg-rosa/20"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
