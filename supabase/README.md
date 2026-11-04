# Activación de Funciones Serverless (Web Push + Escaneo IA de Tickets)

Esta carpeta contiene las migraciones SQL y las Edge Functions de GarantíasPro para:
1. **Notificaciones Web Push reales** (`send-deadline-pushes` y `send-test-push`), incluso con el navegador o la app cerrados.
2. **Escaneo de tickets con IA en servidor (`scan-ticket`)** usando Google Gemini Flash (capa gratuita hasta 1.500 tickets/día a coste 0 €), con control automático de cuota mensual Freemium (**5 escaneos IA gratis/mes por usuario**, o ilimitados si `is_pro = true`).

---

## 1. Crear tablas y políticas RLS

Abre el **SQL Editor** de tu proyecto en Supabase (`https://supabase.com/dashboard/project/ynmqlzpqsyvhzlspzfkd/sql`) y ejecuta el contenido de:

1. [`migrations/001_push.sql`](./migrations/001_push.sql) — crea `public.push_subscriptions` y `public.push_log`.
2. [`migrations/003_ai_scans.sql`](./migrations/003_ai_scans.sql) — crea `public.ai_scan_usage` (control de los 5 escaneos IA gratuitos al mes por usuario y flag `is_pro`).

---

## 2. Configurar secretos en Supabase Edge Functions

En el panel de Supabase (**Edge Functions → Secrets**) o mediante la CLI de Supabase, configura las siguientes variables de entorno:

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY="BHDxQdDnKCO-OclULjwKhQKujUg5aQbnPfH_5gPcZJF2hQ9ILea81P4mwuWbp1fU_ZAGmcWA24e0wJdHM-BtBAQ" \
  VAPID_PRIVATE_KEY="<TU_CLAVE_PRIVADA_VAPID>" \
  VAPID_SUBJECT="mailto:jemendo90@gmail.com" \
  CRON_SECRET="<TU_SECRETO_CRON_ALEATORIO>" \
  GEMINI_API_KEY="<TU_CLAVE_GRATUITA_DE_GOOGLE_AI_STUDIO>"
```

> **Cómo obtener `GEMINI_API_KEY` gratis en 30 segundos**: entra en [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey), pulsa **Create API key** y pégala en el secreto `GEMINI_API_KEY`. La capa gratuita cubre hasta **1.500 tickets al día a coste 0 €**.

---

## 3. Desplegar las Edge Functions

Con la CLI de Supabase vinculada a tu proyecto (`supabase link --project-ref ynmqlzpqsyvhzlspzfkd`), despliega las tres funciones:

```bash
supabase functions deploy send-test-push --no-verify-jwt
supabase functions deploy send-deadline-pushes --no-verify-jwt
supabase functions deploy scan-ticket --no-verify-jwt
```

---

## 4. Programar el envío diario automático de avisos Push (08:00 UTC)

En el **SQL Editor** de Supabase, abre [`migrations/002_schedule.sql`](./migrations/002_schedule.sql), sustituye `TU_CRON_SECRET` por el mismo valor que hayas configurado en `CRON_SECRET` y ejecútalo.

---

## 5. Cómo activar el Plan Pro (escaneos IA ilimitados) a un usuario

Cuando quieras pasar un usuario a **Plan Pro** en la base de datos:

```sql
update public.ai_scan_usage
set is_pro = true
where user_id = 'UUID_DEL_USUARIO';
```
