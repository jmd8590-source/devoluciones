// Lógica de plazos compartida por las funciones de avisos.
// Replica exactamente el cálculo de la app (app.js): fin de devolución =
// ret_start + ret_days; fin de garantía = war_start + war_years.
// Todas las fechas se manejan como "YYYY-MM-DD" en UTC para evitar
// desfases por cambio de hora.

export type Product = {
  id: string;
  user_id: string;
  name: string;
  ret_days: number | null;
  ret_start: string | null;
  war_start: string | null;
  war_years: number | null;
};

export type Due = {
  productId: string;
  userId: string;
  name: string;
  kind: "return" | "warranty";
  daysLeft: number;
};

// Cuántos días antes se avisa de cada tipo de plazo
export const RETURN_OFFSETS = [7, 3, 1, 0];
export const WARRANTY_OFFSETS = [30, 7];

const DAY_MS = 86_400_000;

function toUtc(iso: string): Date {
  return new Date(iso + "T00:00:00Z");
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Fecha de hoy en Madrid como YYYY-MM-DD */
export function madridToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(iso: string, days: number): string {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

export function addYears(iso: string, years: number): string {
  const d = toUtc(iso);
  d.setUTCFullYear(d.getUTCFullYear() + Math.floor(years));
  const extra = years - Math.floor(years);
  if (extra > 0) d.setUTCDate(d.getUTCDate() + Math.round(extra * 365));
  return toIso(d);
}

export function daysBetween(fromIso: string, toIsoStr: string): number {
  return Math.round((toUtc(toIsoStr).getTime() - toUtc(fromIso).getTime()) / DAY_MS);
}

const validDate = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(toUtc(s).getTime());

/** Productos cuyo plazo toca avisar hoy */
export function dueNotifications(products: Product[], today: string): Due[] {
  const out: Due[] = [];
  for (const p of products) {
    if (validDate(p.ret_start) && p.ret_days && p.ret_days > 0) {
      const left = daysBetween(today, addDays(p.ret_start, p.ret_days));
      if (RETURN_OFFSETS.includes(left)) {
        out.push({ productId: p.id, userId: p.user_id, name: p.name, kind: "return", daysLeft: left });
      }
    }
    if (validDate(p.war_start) && p.war_years && p.war_years > 0) {
      const left = daysBetween(today, addYears(p.war_start, p.war_years));
      if (WARRANTY_OFFSETS.includes(left)) {
        out.push({ productId: p.id, userId: p.user_id, name: p.name, kind: "warranty", daysLeft: left });
      }
    }
  }
  return out;
}

function shortName(name: string, max = 40): string {
  const n = (name || "Producto").trim();
  return n.length > max ? n.slice(0, max - 1) + "…" : n;
}

function singleText(it: Due): string {
  const n = shortName(it.name);
  if (it.kind === "return") {
    if (it.daysLeft === 0) return `${n}: hoy vence el plazo de devolución`;
    if (it.daysLeft === 1) return `${n}: mañana vence el plazo de devolución`;
    return `${n}: te quedan ${it.daysLeft} días para devolverlo`;
  }
  if (it.daysLeft === 0) return `${n}: hoy termina la garantía`;
  if (it.daysLeft === 1) return `${n}: mañana termina la garantía`;
  return `${n}: a la garantía le quedan ${it.daysLeft} días`;
}

/** Una sola notificación por usuario, agrupando los plazos del día */
export function buildMessage(items: Due[]): { title: string; body: string; tag: string; url: string } {
  const url = "./index.html#alerts";
  if (items.length === 1) {
    return { title: "GarantíasPro", body: singleText(items[0]), tag: "gp-deadline", url };
  }
  // Los más urgentes primero
  const sorted = [...items].sort((a, b) => a.daysLeft - b.daysLeft);
  const shown = sorted.slice(0, 3).map((it) => {
    const kind = it.kind === "return" ? "devolución" : "garantía";
    const when = it.daysLeft === 0 ? "hoy" : it.daysLeft === 1 ? "mañana" : `${it.daysLeft} días`;
    return `${shortName(it.name, 28)} (${kind}, ${when})`;
  });
  const more = sorted.length - shown.length;
  return {
    title: `Tienes ${items.length} plazos a punto de vencer`,
    body: shown.join(" · ") + (more > 0 ? ` y ${more} más` : ""),
    tag: "gp-deadline",
    url,
  };
}

