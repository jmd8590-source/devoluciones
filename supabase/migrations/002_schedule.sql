-- Programa el envío diario de avisos (08:00 UTC = 09:00 en invierno / 10:00 en verano, hora de Madrid).
-- ANTES de ejecutar: sustituye TU_CRON_SECRET por el mismo valor que guardaste
-- como secreto CRON_SECRET en las funciones. NO subas este archivo con el valor real.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Si ya existía, se reprograma
select cron.unschedule('gp-deadline-pushes')
where exists (select 1 from cron.job where jobname = 'gp-deadline-pushes');

select cron.schedule(
  'gp-deadline-pushes',
  '0 8 * * *',
  $$
  select net.http_post(
    url     := 'https://ynmqlzpqsyvhzlspzfkd.supabase.co/functions/v1/send-deadline-pushes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'TU_CRON_SECRET'
    ),
    body    := '{}'::jsonb
  );
  $$
);

