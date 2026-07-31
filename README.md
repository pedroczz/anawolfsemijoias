# Ana Wolf Semijoias e Pratas

Site da loja, com catálogo alimentado por uma planilha do Excel Online.

## Catálogo de produtos (Excel Online)

O site busca os produtos de uma planilha publicada na web em formato CSV. Qualquer
alteração feita na planilha aparece no site automaticamente (a cada carregamento de
página e a cada ~20 segundos para quem já está navegando).

### 1. Crie a planilha

No [Excel Online](https://www.office.com) (OneDrive), crie uma planilha com a
primeira linha exatamente com estas colunas:

| Código | Nome | Categoria | Preço | Disponibilidade | Descrição | Foto |
|--------|------|-----------|-------|------------------|-----------|------|
| 1 | Colar Gota Dourada | colar | 89,90 | Disponível | Colar folheado a ouro... | https://... |

- **Código**: identificador único do produto (não repita, não deixe em branco). É o
  que o carrinho usa para saber qual peça é qual — evite mudar depois de publicado.
- **Preço**: número, com vírgula ou ponto decimal (ex: `89,90` ou `89.90`).
- **Disponibilidade**: escreva `Disponível` ou `Esgotado`. Qualquer outro texto conta
  como disponível.
- **Foto**: link direto para uma imagem (precisa abrir a imagem sozinha no navegador).
  Se deixar em branco, aparece uma imagem de espaço reservado.
- Uma linha por produto.

### 2. Publique a planilha na web (CSV)

1. No Excel Online: **Arquivo → Compartilhar → Publicar na Web**.
2. Escolha a planilha (aba) com os produtos.
3. No tipo de arquivo, selecione **CSV**.
4. Clique em **Publicar** e copie o link gerado.

Esse link se mantém o mesmo e sempre reflete a versão mais recente da planilha —
não precisa gerar um novo link a cada alteração.

### 3. Configure o link no site

- **Local (desenvolvimento)**: copie `.env.local.example` para `.env.local` e cole o
  link em `PRODUCTS_SHEET_CSV_URL`.
- **Produção (Vercel)**: em Project Settings → Environment Variables, adicione
  `PRODUCTS_SHEET_CSV_URL` com o mesmo link.

Sem essa variável configurada, o site usa um catálogo de exemplo (fallback) para
nunca ficar com a vitrine vazia.

## Carrinho

Como as peças são únicas, o carrinho aceita no máximo 1 unidade por produto. Um
produto marcado como `Esgotado` na planilha não pode ser adicionado, e se um item
já no carrinho ficar esgotado depois, ele aparece sinalizado e não entra no total.

## Desenvolvimento

```bash
npm install
npm run dev
```

```bash
npm run typecheck
npm run build
```
