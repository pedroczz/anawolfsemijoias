import Logo from "@/components/ui/Logo";
import PatternBackground from "@/components/ui/PatternBackground";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function HomePage() {
  return (
    <>
      <section className="bg-vinho-gradient px-4 py-16 text-center text-creme">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          <Logo className="h-16 w-16 text-areia" />
          <h1 className="font-display text-3xl sm:text-4xl">Ana Wolf Semijoias</h1>
          <p className="max-w-xl text-creme/85">
            Semijoias com brilho de verdade, para o seu dia a dia. Peças folheadas, atemporais e
            feitas para durar.
          </p>
          <a
            href="#produtos"
            className="mt-2 rounded-full bg-areia px-6 py-3 text-sm font-semibold text-vinho transition hover:bg-creme"
          >
            Ver coleção
          </a>
        </div>
      </section>

      <PatternBackground height={48} opacity={0.14} />

      <section id="produtos" className="bg-off-white px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl text-vinho">Coleção em destaque</h2>
            <p className="mt-2 text-sm text-vinho/70">
              Protótipo do site — catálogo reduzido para demonstração. As peças reais serão
              cadastradas em breve.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
