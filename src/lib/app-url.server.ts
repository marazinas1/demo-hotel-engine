/** Kanoninis administravimo sistemos adresas — naudojamas laiškų nuorodose. */
export const APP_BASE_URL = "https://admin.dharma.revoo.lt";

/**
 * Grąžina nuorodą į kanoninį prodo adresą.
 * Kliento perduotas origin naudojamas tik lokaliam dev (localhost).
 */
export function appLink(path: string, requestedOrigin?: string): string {
  let base = APP_BASE_URL;
  if (requestedOrigin) {
    try {
      const u = new URL(requestedOrigin);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") base = u.origin;
    } catch {
      /* ignore */
    }
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
