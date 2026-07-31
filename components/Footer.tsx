import Logo from "@/components/ui/Logo";
import PatternBackground from "@/components/ui/PatternBackground";

export default function Footer() {
  return (
    <footer className="mt-16">
      <PatternBackground height={40} opacity={0.16} />
      <div className="bg-vinho text-creme">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center">
          <Logo className="h-10 w-10 text-areia" />
          <p className="font-display text-lg">Ana Wolf Semijoias e Pratas</p>
          <p className="max-w-md text-sm text-creme/80">
            Semijoias com brilho de verdade, para o seu dia a dia.
          </p>
          <p className="text-xs text-creme/60">
            Ana Wolf Semijoias e Pratas. Todos os direitos reservados © {new Date().getFullYear()}.
          </p>
        </div>
      </div>
    </footer>
  );
}
