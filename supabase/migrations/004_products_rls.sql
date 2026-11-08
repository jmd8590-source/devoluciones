-- ═══════════════════════════════════════════════════════════════
-- GarantíasPro — Aislamiento estricto de datos por usuario (RLS)
--
-- Qué hace:
--   1. Garantiza que cada usuario SOLO puede ver, crear, editar y
--      borrar sus propios productos (tabla public.products).
--   2. Lo mismo para las fotos de tickets del bucket «tickets»
--      (cada usuario solo accede a la carpeta <su id>/...).
--
-- Es idempotente: se puede ejecutar varias veces sin romper nada.
-- Cómo aplicarlo: Supabase → SQL Editor → pegar → Run.
-- Antes de ejecutarlo, revisa la sección «0. Comprobación» para
-- ver las políticas que ya tienes.
-- ═══════════════════════════════════════════════════════════════

-- 0. Comprobación (solo lectura): políticas actuales de products
-- select policyname, cmd, roles, qual, with_check
--   from pg_policies where schemaname = 'public' and tablename = 'products';

-- 1. Columna de propietario obligatoria y rellenada por el servidor
alter table public.products
  alter column user_id set default auth.uid();

-- Si existieran filas huérfanas, revísalas antes de activar NOT NULL:
-- select count(*) from public.products where user_id is null;
alter table public.products
  alter column user_id set not null;

create index if not exists products_user_id_idx on public.products (user_id);

-- 2. RLS activado y forzado (también para el propietario de la tabla)
alter table public.products enable row level security;
alter table public.products force row level security;

-- 3. Políticas: solo usuarios autenticados y solo sus filas.
--    En Postgres las políticas se suman (OR): si quedara alguna antigua
--    más permisiva, anularía estas. Por eso se eliminan todas primero.
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'products' loop
    execute format('drop policy %I on public.products', p.policyname);
  end loop;
end $$;

drop policy if exists "products_select_own" on public.products;
create policy "products_select_own" on public.products
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "products_insert_own" on public.products;
create policy "products_insert_own" on public.products
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "products_update_own" on public.products;
create policy "products_update_own" on public.products
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "products_delete_own" on public.products;
create policy "products_delete_own" on public.products
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- El rol anónimo no necesita ningún acceso a esta tabla
revoke all on public.products from anon;

-- 4. Fotos de tickets: bucket privado, carpeta por usuario
update storage.buckets set public = false where id = 'tickets';

drop policy if exists "tickets_select_own" on storage.objects;
create policy "tickets_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'tickets' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "tickets_insert_own" on storage.objects;
create policy "tickets_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'tickets' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "tickets_update_own" on storage.objects;
create policy "tickets_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'tickets' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'tickets' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "tickets_delete_own" on storage.objects;
create policy "tickets_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'tickets' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 5. Verificación rápida (solo lectura): debe listar 4 políticas
-- select policyname, cmd from pg_policies
--  where schemaname = 'public' and tablename = 'products' order by 1;
