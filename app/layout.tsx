import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { ProductsProvider } from "@/lib/products-context";
import { getProducts } from "@/lib/products";

// Garante busca fresca do catálogo a cada request, independente de inferência
// automática do Next a partir do fetch (que não roda quando o fallback é usado).
export const dynamic = "force-dynamic";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = "https://anawolfsemijoias.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ana Wolf Semijoias e Pratas",
  description: "Semijoias com brilho de verdade, para o seu dia a dia.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Ana Wolf Semijoias e Pratas",
    description: "Semijoias com brilho de verdade, para o seu dia a dia.",
    url: siteUrl,
    siteName: "Ana Wolf Semijoias e Pratas",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ana Wolf Semijoias e Pratas",
    description: "Semijoias com brilho de verdade, para o seu dia a dia.",
    images: ["/og.png"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialProducts = await getProducts();

  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans">
        <ProductsProvider initialProducts={initialProducts}>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
