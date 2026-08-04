-- Ana Wolf Semijoias e Pratas — schema inicial do painel administrativo
-- Rode este arquivo no SQL Editor do seu projeto Supabase (ou via `supabase db push`).

create extension if not exists pgcrypto;

-- ────────────────────────────────────────────────────────────
-- updated_at automático
-- ────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- categories
-- ────────────────────────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on categories
  for each row
  execute function set_updated_at();

-- ────────────────────────────────────────────────────────────
-- products
-- ────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid references categories(id) on delete set null,
  short_description text not null default '',
  description text not null default '',
  material text not null default '',
  color text not null default '',
  size text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  promo_price numeric(10, 2) check (promo_price is null or promo_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  weight numeric(10, 3),
  active boolean not null default true,
  featured boolean not null default false,
  is_new boolean not null default false,
  display_order integer not null default 0,
  main_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on products(category_id);
create index if not exists products_active_idx on products(active);
create index if not exists products_display_order_idx on products(display_order);

create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();

-- ────────────────────────────────────────────────────────────
-- product_images (galeria, além da imagem principal)
-- ────────────────────────────────────────────────────────────
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on product_images(product_id);

-- ────────────────────────────────────────────────────────────
-- store_settings (linha única)
-- ────────────────────────────────────────────────────────────
create table if not exists store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'Ana Wolf Semijoias e Pratas',
  whatsapp text not null default '',
  instagram text not null default '',
  facebook text not null default '',
  address text not null default '',
  whatsapp_message_template text not null default
    'Olá! Gostaria de fazer o seguinte pedido na {{loja}}:\n\n{{itens}}\n\nTotal: {{total}}',
  logo_url text,
  banner_url text,
  seo_title text not null default 'Ana Wolf Semijoias e Pratas',
  seo_description text not null default 'Semijoias com brilho de verdade, para o seu dia a dia.',
  updated_at timestamptz not null default now()
);

create trigger store_settings_set_updated_at
  before update on store_settings
  for each row
  execute function set_updated_at();

insert into store_settings (id)
values (1)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- Categorias iniciais
-- ────────────────────────────────────────────────────────────
insert into categories (name, slug, display_order) values
  ('Colar', 'colar', 1),
  ('Brinco', 'brinco', 2),
  ('Anel', 'anel', 3),
  ('Pulseira', 'pulseira', 4),
  ('Broche', 'broche', 5)
on conflict (slug) do nothing;

-- ────────────────────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────────────────────
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table store_settings enable row level security;

-- categories: leitura pública, escrita só autenticado
create policy "categories_public_select" on categories
  for select using (true);
create policy "categories_authenticated_insert" on categories
  for insert to authenticated with check (true);
create policy "categories_authenticated_update" on categories
  for update to authenticated using (true) with check (true);
create policy "categories_authenticated_delete" on categories
  for delete to authenticated using (true);

-- products: público só vê ativos; autenticado vê e edita tudo
create policy "products_public_select_active" on products
  for select using (active = true);
create policy "products_authenticated_select_all" on products
  for select to authenticated using (true);
create policy "products_authenticated_insert" on products
  for insert to authenticated with check (true);
create policy "products_authenticated_update" on products
  for update to authenticated using (true) with check (true);
create policy "products_authenticated_delete" on products
  for delete to authenticated using (true);

-- product_images: segue a visibilidade do produto pai
create policy "product_images_public_select" on product_images
  for select using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
        and products.active = true
    )
  );
create policy "product_images_authenticated_select_all" on product_images
  for select to authenticated using (true);
create policy "product_images_authenticated_insert" on product_images
  for insert to authenticated with check (true);
create policy "product_images_authenticated_update" on product_images
  for update to authenticated using (true) with check (true);
create policy "product_images_authenticated_delete" on product_images
  for delete to authenticated using (true);

-- store_settings: leitura pública, escrita só autenticado
create policy "store_settings_public_select" on store_settings
  for select using (true);
create policy "store_settings_authenticated_update" on store_settings
  for update to authenticated using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- Realtime: o site público escuta mudanças em products sem novo deploy
-- ────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'products'
  ) then
    alter publication supabase_realtime add table products;
  end if;
end $$;

-- ────────────────────────────────────────────────────────────
-- Storage: bucket público para imagens (produtos, logo, banner)
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media_authenticated_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "media_authenticated_update" on storage.objects
  for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');
create policy "media_authenticated_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
