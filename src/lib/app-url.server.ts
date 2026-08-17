/**
 * Šio projekto bazinis adresas laiškų nuorodoms.
 * Pirmenybė — vykdymo aplinkos / užklausos kilmė, kad adresas liktų teisingas
 * peržiūroje, gamyboje ir po pervadinimo. Konstanta naudojama tik kaip atsarga.
 */
export const APP_BASE_URL_FALLBACK = "https://demo-hotel-engine.lovable.app";

function envBaseUrl(): string | null {
  const candidates = [
    process.env["APP_BASE_URL"],
    process.env["VITE_APP_BASE_URL"],
    process.env["PUBLIC_APP_URL"],
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return new URL(c).origin;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Grąžina absoliučią nuorodą į šią programą.
 * Naudoja užklausos origin (tas pats diegimas), tada aplinkos kintamąjį, tada atsargą.
 */
export function appLink(path: string, requestedOrigin?: string): string {
  let base = envBaseUrl() ?? APP_BASE_URL_FALLBACK;
  if (requestedOrigin) {
    try {
      base = new URL(requestedOrigin).origin;
    } catch {
      /* ignore */
    }
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
