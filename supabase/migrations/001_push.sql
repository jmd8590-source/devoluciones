-- Avisos push de plazos: suscripciones de dispositivos y registro de envíos.
-- Ejecutar una sola vez en Supabase → SQL Editor.

create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Cada usuario solo ve, crea y borra sus propios dispositivos
drop policy if exists "push_subscriptions_own" on public.push_subscriptions;
create policy "push_subscriptions_own" on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Registro para no repetir el mismo aviso (lo usa solo el servidor)
create table if not exists public.push_log (
  product_id  uuid not null references public.products(id) on delete cascade,
  kind        text not null check (kind in ('return', 'warranty')),
  days_left   int  not null,
  sent_at     timestamptz not null default now(),
  primary key (product_id, kind, days_left)
);

-- Sin políticas a propósito: ningún usuario puede leerla; solo la clave de servicio
alter table public.push_log enable row level security;

