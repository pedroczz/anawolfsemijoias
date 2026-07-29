export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "colar" | "brinco" | "anel" | "pulseira";
  price: number;
  description: string;
  image: string;
};

/**
 * Protótipo: catálogo reduzido propositalmente (~20% do volume final).
 * Os produtos reais serão cadastrados pela cliente quando o site sair do ar de teste.
 */
export const products: Product[] = [
  {
    id: "1",
    slug: "colar-gota-dourado",
    name: "Colar Gota Dourada",
    category: "colar",
    price: 89.9,
    description: "Colar folheado a ouro com pingente em gota, corrente fina.",
    image: "/products/placeholder.svg",
  },
  {
    id: "2",
    slug: "brinco-argola-vinho",
    name: "Brinco Argola Vinho",
    category: "brinco",
    price: 54.9,
    description: "Argola média com banho dourado e detalhe esmaltado.",
    image: "/products/placeholder.svg",
  },
  {
    id: "3",
    slug: "anel-solitario-areia",
    name: "Anel Solitário Areia",
    category: "anel",
    price: 69.9,
    description: "Anel solitário com zircônia e acabamento fosco dourado.",
    image: "/products/placeholder.svg",
  },
  {
    id: "4",
    slug: "pulseira-riviera-rose",
    name: "Pulseira Riviera Rosé",
    category: "pulseira",
    price: 74.9,
    description: "Pulseira riviera folheada em ouro rosé com zircônias.",
    image: "/products/placeholder.svg",
  },
  {
    id: "5",
    slug: "colar-choker-terracota",
    name: "Colar Choker Terracota",
    category: "colar",
    price: 94.9,
    description: "Choker ajustável com pingente vazado, banho dourado.",
    image: "/products/placeholder.svg",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
