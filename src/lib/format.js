// Formateadores de precio. Cada producto se muestra siempre en su moneda
// original (la que cobra la tienda destino), sin conversión.

const CURRENCY_CONFIG = {
  MXN: { locale: 'es-MX', style: 'currency', currency: 'MXN', maximumFractionDigits: 0 },
  COP: { locale: 'es-CO', style: 'currency', currency: 'COP', maximumFractionDigits: 0 },
  USD: { locale: 'en-US', style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
}

export function fmt(amount, currency) {
  const cfg = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD
  try {
    return new Intl.NumberFormat(cfg.locale, cfg).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

export function discount(product) {
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
}
