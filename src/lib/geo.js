// ─────────────────────────────────────────────────────────────────────
// Geolocalización del usuario
// ─────────────────────────────────────────────────────────────────────
//
// Detecta el país del visitante por IP usando ipapi.co (gratis, 1k req/día).
// Devuelve un código que mapea al filtro de origen por defecto:
//   - 'MX' → usuario en México: arranca con ofertas locales primero
//   - 'CO' → usuario en Colombia: arranca con ofertas locales primero
//   - 'GLOBAL' → cualquier otro país: arranca con todas las ofertas
//
// Si la detección falla (sin red, IP bloqueada, timeout), defaultea a 'GLOBAL'.
// ─────────────────────────────────────────────────────────────────────

// Bandera mostrada junto al nombre de cada tienda en las cards.
export const ORIGIN_FLAGS = {
  MX: '🇲🇽',
  CO: '🇨🇴',
  GLOBAL: '🌎',
}

export async function detectUserRegion() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) return 'GLOBAL'
    const data = await response.json()
    const country = data.country_code

    if (country === 'MX') return 'MX'
    if (country === 'CO') return 'CO'
    return 'GLOBAL'
  } catch {
    return 'GLOBAL'
  }
}
