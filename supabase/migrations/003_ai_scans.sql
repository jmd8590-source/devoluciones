-- Tabla de control de cuota mensual de escaneos con IA (Freemium / Pro).
-- Cada usuario dispone por defecto de 5 escaneos con IA al mes gratis (monthly_limit = 5).
-- Si is_pro = true, los escaneos con IA son ilimitados.

create table if not exists public.ai_scan_usage (
  user_id       uuid not null references auth.users(id) on delete cascade,
  month         text not null, -- formato YYYY-MM (ej. '2026-11')
  scans_used    integer not null default 0 check (scans_used >= 0),
  monthly_limit integer not null default 5 check (monthly_limit >= 0),
  is_pro        boolean not null default false,
  updated_at    timestamptz not null default now(),
  primary key (user_id, month)
);

alter table public.ai_scan_usage enable row level security;

-- Cada usuario puede consultar únicamente su propio contador mensual
drop policy if exists "ai_scan_usage_select_own" on public.ai_scan_usage;
create policy "ai_scan_usage_select_own"
  on public.ai_scan_usage for select
  using (auth.uid() = user_id);

-- Las escrituras/incrementos se realizan exclusivamente desde la Edge Function (service_role)
