// Envío diario de avisos de plazos (lo lanza pg_cron a las 08:00 UTC).
// Protegida con el secreto CRON_SECRET: nadie externo puede dispararla.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { buildMessage, dueNotifications, madridToday, type Product } from "../_shared/deadlines.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:jemendo90@gmail.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

type Sub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string };

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Supabase limita a 1000 filas por consulta: se pagina
async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await build(from, from + size - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < size) break;
  }
  return rows;
}

const chunk = <T>(arr: T[], n: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!safeEqual(req.headers.get("x-cron-secret") ?? "", CRON_SECRET)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const today = madridToday();

    const subs = await fetchAll<Sub>((from, to) =>
      admin.from("push_subscriptions").select("id,user_id,endpoint,p256dh,auth").range(from, to)
    );
    const subsByUser = new Map<string, Sub[]>();
    for (const s of subs) {
      if (!subsByUser.has(s.user_id)) subsByUser.set(s.user_id, []);
      subsByUser.get(s.user_id)!.push(s);
    }

    let usersNotified = 0;
    let pushesSent = 0;
    let subsRemoved = 0;

    for (const userChunk of chunk([...subsByUser.keys()], 200)) {
      const products = await fetchAll<Product>((from, to) =>
        admin.from("products")
          .select("id,user_id,name,ret_days,ret_start,war_start,war_years")
          .in("user_id", userChunk)
          .range(from, to)
      );

      const due = dueNotifications(products, today);
      if (due.length === 0) continue;

      // Descartar lo que ya se avisó (mismo producto, tipo y días restantes)
      const logged = new Set<string>();
      for (const idChunk of chunk([...new Set(due.map((d) => d.productId))], 200)) {
        const rows = await fetchAll<{ product_id: string; kind: string; days_left: number }>((from, to) =>
          admin.from("push_log").select("product_id,kind,days_left").in("product_id", idChunk).range(from, to)
        );
        rows.forEach((r) => logged.add(`${r.product_id}|${r.kind}|${r.days_left}`));
      }
      const pending = due.filter((d) => !logged.has(`${d.productId}|${d.kind}|${d.daysLeft}`));

      for (const userId of userChunk) {
        const items = pending.filter((d) => d.userId === userId);
        if (items.length === 0) continue;

        const payload = JSON.stringify(buildMessage(items));
        let delivered = 0;

        for (const s of subsByUser.get(userId) ?? []) {
          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
              payload,
              { TTL: 60 * 60 * 20, urgency: "high" },
            );
            delivered++;
            pushesSent++;
          } catch (err) {
            const code = (err as { statusCode?: number }).statusCode;
            if (code === 404 || code === 410) {
              // Dispositivo dado de baja: limpiar
              await admin.from("push_subscriptions").delete().eq("id", s.id);
              subsRemoved++;
            } else {
              console.error("Fallo de envío push:", code, (err as Error).message);
            }
          }
        }

        // Solo se marca como avisado si llegó a algún dispositivo
        if (delivered > 0) {
          usersNotified++;
          await admin.from("push_log").upsert(
            items.map((d) => ({ product_id: d.productId, kind: d.kind, days_left: d.daysLeft })),
            { onConflict: "product_id,kind,days_left", ignoreDuplicates: true },
          );
        }
      }
    }

    const summary = { today, subscriptions: subs.length, usersNotified, pushesSent, subsRemoved };
    console.log("Resumen:", JSON.stringify(summary));
    return Response.json(summary);
  } catch (err) {
    console.error("Error general:", err);
    return new Response("Error interno", { status: 500 });
  }
});

