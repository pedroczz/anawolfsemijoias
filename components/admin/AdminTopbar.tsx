import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { logoutAction } from "@/app/admin/actions";

export default function AdminTopbar({ userEmail }: { userEmail: string | null }) {
  return (
    <header className="flex items-center justify-between border-b border-rosa/30 bg-white px-4 py-3">
      <Link href="/admin" className="flex items-center gap-2">
        <Logo className="h-8 w-8 text-vinho" />
        <span className="font-display text-sm text-vinho sm:text-base">Painel administrativo</span>
      </Link>
      <div className="flex items-center gap-4">
        {userEmail && <span className="hidden text-xs text-vinho/60 sm:inline">{userEmail}</span>}
        <Link href="/" className="text-xs text-vinho/70 underline-offset-2 hover:underline">
          Ver site
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-vinho/30 px-3 py-1.5 text-xs font-medium text-vinho transition hover:bg-vinho hover:text-creme"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
