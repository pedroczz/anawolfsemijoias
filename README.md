# Ana Wolf Semijoias e Pratas

Site da loja, com catálogo alimentado por uma planilha do Excel Online.

## Catálogo de produtos (Excel Online)

O site busca os produtos de uma planilha publicada na web em formato CSV. Qualquer
alteração feita na planilha aparece no site automaticamente (a cada carregamento de
página e a cada ~20 segundos para quem já está navegando).

### 1. Crie a planilha

No [Excel Online](https://www.office.com) (OneDrive), crie uma planilha com a
primeira linha exatamente com estas colunas (nessa ordem, mas a ordem das colunas
não importa de verdade — o que importa é o nome de cada cabeçalho):

| SKU | Nome | Categoria | Material | Cor | Tamanho | Descrição | Preço | Estoque | ImagemPrincipal | Imagem2 | Imagem3 | Imagem4 | Destaque | Novo | Ativo | Ordem |
|-----|------|-----------|----------|-----|---------|-----------|-------|---------|------------------|---------|---------|---------|----------|------|-------|-------|
| COL-001 | Colar Gota Dourada | colar | Folheado a ouro | Dourado | Único | Colar com pingente... | 89,90 | 3 | colar-gota.jpg | | | | true | false | true | 1 |

- **SKU**: identificador único do produto (não repita, não deixe em branco). É o que
  o carrinho usa para saber qual peça é qual — evite mudar depois de publicado.
- **Preço**: número maior que zero, com vírgula ou ponto decimal (ex: `89,90` ou
  `89.90`).
- **Estoque**: número inteiro, `0` ou maior. `0` = esgotado (some do botão de comprar,
  mas continua listado). Qualquer valor negativo ou não numérico é tratado como erro
  e o produto é ignorado.
- **ImagemPrincipal / Imagem2 / Imagem3 / Imagem4**: coloque **apenas o nome do
  arquivo** (ex: `colar-gota.jpg`), nunca um link. Pode preencher o nome antes mesmo
  de a foto existir no projeto — se o arquivo ainda não estiver em `public/produtos/`
  (veja o passo 4), o produto aparece normalmente com uma imagem de espaço reservado
  no lugar, e assume a foto real automaticamente assim que ela for adicionada ao
  repositório, sem precisar editar a planilha de novo.
- **Destaque / Novo / Ativo**: escreva `true`/`false` (ou `sim`/`não`). `Ativo=false`
  esconde o produto do site sem apagar a linha. Se deixar `Ativo` em branco, o produto
  aparece normalmente.
- **Ordem**: número usado para ordenar os produtos na vitrine (menor aparece primeiro).
- Uma linha por produto. Linhas com SKU repetido, nome vazio, categoria vazia, preço
  ou estoque inválido são ignoradas — o site nunca quebra, só não lista aquela linha.

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

### 4. Adicione as fotos dos produtos

As fotos **não** ficam na planilha nem em links — elas ficam versionadas junto com o
código, na pasta `public/produtos/`. Pra adicionar uma foto nova:

1. Salve o arquivo de imagem dentro de `public/produtos/` (ex: `colar-gota.jpg`).
2. Na planilha, escreva **só o nome do arquivo** na coluna `ImagemPrincipal` (ou
   `Imagem2`/`3`/`4`).
3. Commite e dê push — como é um arquivo do repositório, precisa de um novo deploy
   pra aparecer (diferente de preço/estoque/nome, que atualizam sozinhos).

### 5. Publicando alterações

- **Preço, estoque, nome, descrição, destaque, novo, ativo, ordem**: edite a planilha
  no Excel Online e salve — o site reflete a mudança sozinho (a cada carregamento de
  página e a cada ~20s para quem já está navegando). Não precisa de deploy.
- **Fotos novas**: precisam ser adicionadas ao repositório (`public/produtos/`) e
  publicadas com um commit + push, como qualquer mudança de código.

## Carrinho

Como as peças são únicas, o carrinho aceita no máximo 1 unidade por produto. Um
produto com `Estoque = 0` não pode ser adicionado, e se um item já no carrinho ficar
esgotado depois, ele aparece sinalizado e não entra no total.

## Desenvolvimento

```bash
npm install
npm run dev
```

```bash
npm run typecheck
npm run lint
npm run build
```
