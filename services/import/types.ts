/**
 * Contrato comum para importadores de produto. Cada importador (Instagram, link de
 * imagem, upload, e futuramente CSV/Excel/Mercado Livre/Shopee/WhatsApp Business)
 * produz um rascunho parcial — nunca grava nada sozinho, sempre passa por revisão
 * manual antes de salvar.
 */
export type ProductDraft = {
  name: string;
  shortDescription: string;
  description: string;
  price: number | null;
  categoryId: string | null;
  images: string[];
  sourceUrl: string;
  /** Campos que não puderam ser preenchidos automaticamente — nunca bloqueia o cadastro. */
  warnings: string[];
};

export type ImporterId = "instagram" | "image-url" | "upload";

export type ImporterDefinition = {
  id: ImporterId;
  label: string;
  description: string;
  implemented: boolean;
};
