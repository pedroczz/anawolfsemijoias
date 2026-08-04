import type { ImporterDefinition } from "@/services/import/types";

/**
 * Catálogo dos importadores disponíveis. Para adicionar um novo (CSV, Excel,
 * Mercado Livre, Shopee, WhatsApp Business...), crie um módulo em services/import/
 * seguindo o mesmo formato de retorno (`ProductDraft`) e registre-o aqui — não é
 * necessário alterar o restante da estrutura.
 */
export const PRODUCT_IMPORTERS: ImporterDefinition[] = [
  {
    id: "instagram",
    label: "Importar do Instagram",
    description: "Preenche o cadastro a partir do link de uma publicação do Instagram.",
    implemented: true,
  },
  {
    id: "image-url",
    label: "Link de imagem",
    description: "Baixa uma imagem a partir de uma URL pública e usa no produto.",
    implemented: true,
  },
  {
    id: "upload",
    label: "Upload de fotos",
    description: "Envia fotos do computador, com arrastar-e-soltar, múltiplas imagens e reordenação.",
    implemented: true,
  },
];

export function getImporter(id: ImporterDefinition["id"]): ImporterDefinition | undefined {
  return PRODUCT_IMPORTERS.find((importer) => importer.id === id);
}
