// Aviso de prueba para el usuario que lo pide (botón "Enviar aviso de prueba").
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:jemendo90@gmail.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Solo usuarios con sesión: se valida el token contra Auth
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "No autorizado" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "No autorizado" }, 401);
  const userId = userData.user.id;

  let endpoint: string | undefined;
  try { endpoint = (await req.json())?.endpoint; } catch { /* sin cuerpo */ }

  // Solo se envía a dispositivos de ESTE usuario
  let query = admin.from("push_subscriptions").select("id,endpoint,p256dh,auth").eq("user_id", userId);
  if (endpoint) query = query.eq("endpoint", endpoint);
  const { data: subs, error } = await query;
  if (error) return json({ error: "Error interno" }, 500);

  const payload = JSON.stringify({
    title: "GarantíasPro",
    body: "Perfecto: los avisos funcionan en este dispositivo.",
    tag: "gp-test",
    url: "./index.html#alerts",
  });

  let sent = 0;
  let removed = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload,
        { TTL: 300, urgency: "high" },
      );
      sent++;
    } catch (err) {
      const code = (err as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await admin.from("push_subscriptions").delete().eq("id", s.id);
        removed++;
      } else {
        console.error("Fallo de envío de prueba:", code, (err as Error).message);
      }
    }
  }
  return json({ sent, removed });
});

