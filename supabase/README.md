# Activación de Notificaciones Web Push (Supabase)

Esta carpeta contiene las migraciones SQL y las Edge Functions necesarias para que GarantíasPro envíe notificaciones Web Push reales incluso cuando el navegador o la app instalada están cerrados.

## 1. Crear tablas y políticas RLS

Abre el **SQL Editor** de tu proyecto en Supabase (`https://supabase.com/dashboard/project/ynmqlzpqsyvhzlspzfkd/sql`) y ejecuta el contenido completo de:

- [`migrations/001_push.sql`](./migrations/001_push.sql)

Esto crea las tablas `public.push_subscriptions` (con RLS por usuario) y `public.push_log` (para evitar envíos duplicados en el mismo día).

---

## 2. Configurar secretos en Supabase Edge Functions

En el panel de Supabase (**Edge Functions → Secrets**) o mediante la CLI de Supabase, configura las siguientes variables de entorno:

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY="BHDxQdDnKCO-OclULjwKhQKujUg5aQbnPfH_5gPcZJF2hQ9ILea81P4mwuWbp1fU_ZAGmcWA24e0wJdHM-BtBAQ" \
  VAPID_PRIVATE_KEY="<TU_CLAVE_PRIVADA_VAPID>" \
  VAPID_SUBJECT="mailto:jemendo90@gmail.com" \
  CRON_SECRET="<TU_SECRETO_CRON_ALEATORIO>"
```

> **Nota**: `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya están disponibles automáticamente dentro de todas las Edge Functions de Supabase.

---

## 3. Desplegar las Edge Functions

Con la CLI de Supabase vinculada a tu proyecto (`supabase link --project-ref ynmqlzpqsyvhzlspzfkd`), despliega ambas funciones:

```bash
supabase functions deploy send-test-push --no-verify-jwt
supabase functions deploy send-deadline-pushes --no-verify-jwt
```

- `send-test-push`: Valida el token JWT del usuario autenticado y envía una notificación de prueba inmediata a todos sus dispositivos suscritos.
- `send-deadline-pushes`: Comprueba mediante `x-cron-secret` qué productos de todos los usuarios vencen en **7, 3, 1 o 0 días** (devolución) o **30 o 7 días** (garantía) según la fecha en zona horaria `Europe/Madrid`, envía los avisos Web Push y limpia automáticamente las suscripciones caducadas (`404` / `410`).

---

## 4. Programar el envío diario automático (08:00 UTC)

En el **SQL Editor** de Supabase, abre [`migrations/002_schedule.sql`](./migrations/002_schedule.sql), sustituye `TU_CRON_SECRET` por el mismo valor que hayas configurado en `CRON_SECRET` y ejecútalo.

Esto programa `pg_cron` + `pg_net` para invocar `send-deadline-pushes` todos los días a las **08:00 UTC** (09:00 en invierno / 10:00 en verano en España peninsular).

