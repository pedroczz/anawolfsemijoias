"use client";

import Logo from "@/components/ui/Logo";
import PatternBackground from "@/components/ui/PatternBackground";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/products-context";
import { useSettings } from "@/lib/settings-context";

export default function HomePage() {
  const { products } = useProducts();
  const settings = useSettings();

  return (
    <>
      <section className="bg-vinho-gradient px-4 py-16 text-center text-creme">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          <Logo className="h-16 w-16 text-areia" />
          <h1 className="font-display text-3xl sm:text-4xl">{settings.storeName}</h1>
          <p className="max-w-xl text-creme/85">{settings.seoDescription}</p>
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
              Peças únicas — disponibilidade e preços atualizados em tempo real.
            </p>
          </div>
          {products.length === 0 ? (
            <p className="text-center text-vinho/60">Nenhum produto cadastrado no momento.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.sku} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
