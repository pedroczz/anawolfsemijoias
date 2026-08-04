# Ana Wolf Semijoias e Pratas

Site da loja com painel administrativo. Produtos, categorias, estoque e configurações da loja
ficam no [Supabase](https://supabase.com) (Postgres + Auth + Storage) — o site público consulta o
banco diretamente e reflete qualquer alteração feita no painel automaticamente, sem precisar de
novo deploy.

## Arquitetura

- **Next.js (App Router)** — site público + painel admin, no mesmo projeto.
- **Supabase Postgres** — armazena produtos, categorias e configurações da loja.
- **Supabase Storage** — armazena as imagens (produtos, logo, banner).
- **Supabase Auth** — login do painel administrativo.
- **Supabase Realtime** — o site público assina mudanças na tabela `products` e atualiza a
  vitrine automaticamente quando algo muda no painel.

```
lib/supabase/      → clientes Supabase (browser, server, middleware)
repositories/       → acesso direto às tabelas (queries)
services/            → regras de negócio, validação e mapeamento para os tipos usados no app
app/admin/           → painel administrativo (protegido por middleware)
app/(site público)   → catálogo, carrinho
```

## 1. Crie o projeto no Supabase

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.

## 2. Rode a migração do banco

1. Abra o **SQL Editor** do seu projeto Supabase.
2. Cole o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e
   execute.

Isso cria:

- as tabelas `categories`, `products`, `product_images` e `store_settings`;
- as políticas de RLS (leitura pública dos produtos ativos, escrita restrita a usuários
  autenticados);
- o bucket público `media` no Storage, com política de leitura pública e escrita restrita a
  usuários autenticados;
- a tabela `products` habilitada no Realtime;
- categorias iniciais: Colar, Brinco, Anel, Pulseira e Broche.

## 3. Crie o usuário administrador

O painel não tem cadastro público — você cria o(s) usuário(s) admin direto no Supabase:

1. **Authentication → Users → Add user**.
2. Preencha e-mail e senha, e marque **Auto Confirm User**.

Esse e-mail/senha é o que você vai usar para entrar em `/admin/login`.

## 4. Configure as variáveis de ambiente

- **Local**: copie `.env.local.example` para `.env.local` e preencha com a URL e a anon key do
  passo 1.
- **Produção (Vercel)**: em Project Settings → Environment Variables, adicione
  `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 5. Rode o projeto

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` para o site e `http://localhost:3000/admin/login` para o painel.

```bash
npm run typecheck
npm run lint
npm run build
```

## Painel administrativo (`/admin`)

Protegido por middleware: qualquer rota em `/admin` (exceto `/admin/login`) redireciona para o
login se não houver sessão autenticada.

- **Dashboard** — métricas gerais (produtos ativos, inativos, esgotados, em destaque).
- **Produtos** — cadastro completo (SKU, nome, categoria, descrições, material, cor, tamanho,
  preço e preço promocional, estoque, peso, ativo/destaque/novo, ordem de exibição, imagens),
  busca, filtros, ordenação, paginação, duplicar e excluir.
  - As imagens são enviadas direto para o Storage ao soltar/selecionar o arquivo (com
    pré-visualização) e podem ser reordenadas por arrastar-e-soltar — a primeira imagem da lista é
    sempre a imagem principal exibida no catálogo.
  - Excluir um produto remove também suas imagens do Storage.
- **Categorias** — criar, editar, excluir e reordenar.
- **Estoque** — ajuste rápido da quantidade de cada produto. `Estoque = 0` aparece como
  "Esgotado" no site; o produto continua listado, só não pode ser adicionado ao carrinho.
  `Ativo = false` remove o produto do catálogo público (mas ele continua no painel).
- **Configurações** — nome da loja, WhatsApp, Instagram, Facebook, endereço, mensagem padrão do
  WhatsApp (aceita os placeholders `{{loja}}`, `{{itens}}` e `{{total}}`), logo, banner e SEO
  (título/descrição usados no `<head>` e no compartilhamento em redes sociais).
- **Uploads** — navega e permite excluir qualquer imagem já enviada ao Storage.

## Site público

Busca os produtos ativos e as configurações da loja diretamente do Supabase a cada carregamento
de página, e assina mudanças em tempo real (Supabase Realtime) enquanto o visitante navega — uma
alteração feita no painel aparece no site sem precisar de novo deploy ou rebuild.

## Carrinho

Como as peças são únicas, o carrinho aceita no máximo 1 unidade por produto (guardado no
navegador do cliente). Um produto com `Estoque = 0` não pode ser adicionado, e se um item já no
carrinho ficar esgotado depois, ele aparece sinalizado e não entra no total. O pedido é finalizado
via link do WhatsApp, usando o número e a mensagem padrão configurados no painel.
