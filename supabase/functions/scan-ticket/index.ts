// Edge Function: scan-ticket
// Analiza la foto o PDF de un ticket de compra en el servidor con Google Gemini Flash
// sin que el usuario tenga que configurar ninguna clave API, aplicando el límite
// mensual gratuito (5 escaneos/mes en plan Gratis, ilimitado en plan Pro).

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_MONTHLY_LIMIT = 5;
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

const PROMPT = `Analiza este ticket, factura o comprobante de compra de principio a fin, prestando especial atención tanto a los productos como a la LETRA PEQUEÑA de la parte inferior del ticket (plazos de devolución, si se devuelve el dinero o se entrega un vale para gastar en la tienda, condiciones y garantías).
REGLA CRÍTICA: NO inventes ningún dato que no esté en el ticket. Si un campo no aparece en absoluto, devuelve "" o null.

Devuelve ÚNICAMENTE un objeto JSON válido con estas claves exactas:
- "productName": nombre exacto del producto o productos comprados (si hay varios, pon los principales o resúmelos; si no se ve, "")
- "brand": marca del producto SOLO si aparece escrita en el ticket (NO pongas el nombre de la tienda como marca; si no consta, "")
- "price": importe total final pagado en euros como número decimal (ej: 49.99). Si no se ve, null
- "store": nombre del comercio o tienda emisora del ticket tal como aparece impreso (si no se ve, "")
- "purchaseDate": fecha de compra impresa en el ticket en formato YYYY-MM-DD (si no se ve, "")
- "returnDays": número entero de días para devolver o cambiar según el pie o texto del ticket (ej: si pone "plazo para devolver 15 días", pon 15; si pone "1 mes", pon 30; si no menciona plazo, null)
- "returnConditions": TODA la información de devolución escrita en el ticket, especialmente la letra pequeña inferior (ej: si dice que no se abonará dinero en efectivo sino que se deberá gastar el dinero en la tienda / vale de compra, requisito de presentar ticket, embalaje, etc.). Si no dice nada, ""
- "warrantyYears": años de garantía como número SOLO si el ticket lo menciona explícitamente (si no, null)
- "coverage": qué cubre la garantía si lo indica el ticket (si no, "")
- "noCoverage": qué no cubre la garantía si lo indica el ticket (si no, "")
- "notes": número de ticket/factura, NIF/CIF, método de pago y listado detallado de todos los artículos con su precio individual`;

function currentMadridMonth(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
  }).format(now).slice(0, 7);
}

function jsonResp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResp({ ok: false, error: "unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const geminiKey = (Deno.env.get("GEMINI_API_KEY") || "").trim();

  // Verificar sesión del usuario
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return jsonResp({ ok: false, error: "unauthorized" }, 401);
  }
  const userId = userData.user.id;
  const month = currentMadridMonth();

  const admin = createClient(supabaseUrl, serviceKey);

  // Obtener o inicializar el uso del mes actual
  const { data: existingRow } = await admin
    .from("ai_scan_usage")
    .select("scans_used, monthly_limit, is_pro")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  const used = existingRow?.scans_used ?? 0;
  const limit = existingRow?.monthly_limit ?? DEFAULT_MONTHLY_LIMIT;
  const isPro = Boolean(existingRow?.is_pro);
  const remaining = isPro ? 999999 : Math.max(0, limit - used);

  let body: { action?: string; mimeType?: string; base64Data?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Consulta rápida de cuota sin consumir escaneo
  if (body.action === "status") {
    return jsonResp({
      ok: true,
      configured: Boolean(geminiKey),
      usage: { used, limit, remaining, isPro, month },
    });
  }

  if (!geminiKey) {
    return jsonResp({
      ok: false,
      error: "not_configured",
      usage: { used, limit, remaining, isPro, month },
    });
  }

  if (!isPro && used >= limit) {
    return jsonResp({
      ok: false,
      error: "quota_exceeded",
      usage: { used, limit, remaining: 0, isPro, month },
    });
  }

  const mimeType = (body.mimeType || "image/jpeg").trim();
  const base64Data = (body.base64Data || "").trim();

  if (!base64Data || base64Data.length < 32) {
    return jsonResp({ ok: false, error: "invalid_payload" }, 400);
  }
  // Límite de seguridad (~10 MB en base64)
  if (base64Data.length > 14_000_000) {
    return jsonResp({ ok: false, error: "payload_too_large" }, 413);
  }

  let parsedJson: Record<string, unknown> | null = null;
  let usedModel = "";

  for (const model of MODELS) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inline_data: { mime_type: mimeType, data: base64Data } },
                  { text: PROMPT },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.0,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!resp.ok) continue;
      const resultJson = await resp.json();
      const rawText = resultJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const cleanJson = String(rawText).replace(/```json/gi, "").replace(/```/g, "").trim();
      const candidate = JSON.parse(cleanJson);
      if (candidate && typeof candidate === "object") {
        parsedJson = candidate;
        usedModel = model;
        break;
      }
    } catch {
      // Probar siguiente modelo de respaldo
    }
  }

  if (!parsedJson) {
    return jsonResp({
      ok: false,
      error: "ai_unavailable",
      usage: { used, limit, remaining, isPro, month },
    });
  }

  // Solo descontamos 1 escaneo cuando la extracción con IA ha tenido éxito
  const newUsed = used + 1;
  await admin.from("ai_scan_usage").upsert(
    {
      user_id: userId,
      month,
      scans_used: newUsed,
      monthly_limit: limit,
      is_pro: isPro,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,month" }
  );

  const newRemaining = isPro ? 999999 : Math.max(0, limit - newUsed);

  return jsonResp({
    ok: true,
    model: usedModel,
    data: parsedJson,
    usage: { used: newUsed, limit, remaining: newRemaining, isPro, month },
  });
});
