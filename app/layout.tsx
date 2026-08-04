import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { ProductsProvider } from "@/lib/products-context";
import { SettingsProvider } from "@/lib/settings-context";
import { getProducts } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/services/settings.service";

// Garante busca fresca do catálogo e das configurações a cada request.
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

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  const settings = await getSettings(supabase);
  const ogImage = settings.bannerUrl ?? "/og.png";

  return {
    metadataBase: new URL(siteUrl),
    title: settings.seoTitle,
    description: settings.seoDescription,
    icons: {
      icon: "/icon.svg",
    },
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      url: siteUrl,
      siteName: settings.storeName,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [ogImage],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [initialProducts, initialSettings] = await Promise.all([getProducts(), getSettings(supabase)]);

  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans">
        <SettingsProvider initialSettings={initialSettings}>
          <ProductsProvider initialProducts={initialProducts} hideOutOfStock={initialSettings.hideOutOfStock}>
            <CartProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </CartProvider>
          </ProductsProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
