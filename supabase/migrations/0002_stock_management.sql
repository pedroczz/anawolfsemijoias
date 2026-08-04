-- Ana Wolf Semijoias e Pratas — gerenciamento de estoque
-- Rode este arquivo no SQL Editor do seu projeto Supabase, após o 0001_init.sql.

alter table products add column if not exists low_stock_threshold integer not null default 5;
alter table products add column if not exists sales_count integer not null default 0;

alter table store_settings add column if not exists hide_out_of_stock boolean not null default false;

-- ────────────────────────────────────────────────────────────
-- stock_movements — histórico de entradas/saídas/ajustes de estoque
-- ────────────────────────────────────────────────────────────
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('in', 'out', 'adjustment')),
  quantity integer not null,
  previous_stock integer not null,
  new_stock integer not null,
  note text,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_id_idx on stock_movements(product_id);
create index if not exists stock_movements_created_at_idx on stock_movements(created_at desc);

alter table stock_movements enable row level security;

drop policy if exists "stock_movements_authenticated_select" on stock_movements;
create policy "stock_movements_authenticated_select" on stock_movements
  for select to authenticated using (true);

drop policy if exists "stock_movements_authenticated_insert" on stock_movements;
create policy "stock_movements_authenticated_insert" on stock_movements
  for insert to authenticated with check (true);
