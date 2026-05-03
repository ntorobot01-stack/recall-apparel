// Capa 1 del pipeline de filtrado (las capas 2/3/4 son CHECK constraints +
// RLS en Postgres, ver ARCHITECTURE.md seccion 7). Aca rechazamos todo lo
// que ya sabemos que la DB rechazaria, asi no quemamos round-trips
// innecesarios y podemos dar reasons humano-legibles para offer_history.
//
// Contrato:
//   validateOffer(raw, opts?) devuelve success con la oferta normalizada,
//   o rechazo con un reason string en snake_case.
//
// El campo `reason` es el que se persiste en offer_history.reason cuando
// una oferta sale del catalogo. Snake_case y autocontenido para que el
// log sea greppable sin contexto adicional.

const VALID_GENDERS = new Set(['men', 'women', 'unisex'])

export function validateOffer(raw, opts = {}) {
  const minDiscount = opts.minDiscount ?? 20

  // V1: sku
  if (!raw.sku || String(raw.sku).trim() === '') {
    return { valid: false, reason: 'sku_vacio_o_ausente' }
  }
  // V2: store_id
  if (!raw.store_id || String(raw.store_id).trim() === '') {
    return { valid: false, reason: 'store_id_vacio_o_ausente' }
  }
  // V3: title
  if (!raw.title || String(raw.title).trim() === '') {
    return { valid: false, reason: 'title_vacio_o_ausente' }
  }
  // V4: external_id (DB NOT NULL)
  if (!raw.external_id || String(raw.external_id).trim() === '') {
    return { valid: false, reason: 'external_id_vacio_o_ausente' }
  }
  // V5: store_name (DB NOT NULL)
  if (!raw.store_name || String(raw.store_name).trim() === '') {
    return { valid: false, reason: 'store_name_vacio_o_ausente' }
  }

  // V6: affiliate_url presente y no vacio (capa 3a del usuario)
  if (!raw.affiliate_url || String(raw.affiliate_url).trim() === '') {
    return { valid: false, reason: 'affiliate_url_ausente' }
  }
  // V7: affiliate_url con protocolo http(s) (capa 3b del usuario)
  if (!/^https?:\/\//i.test(raw.affiliate_url)) {
    return { valid: false, reason: 'affiliate_url_protocolo_invalido' }
  }

  // V8: current_price numero finito > 0
  const current = Number(raw.current_price)
  if (!Number.isFinite(current) || current <= 0) {
    return { valid: false, reason: 'current_price_invalido' }
  }
  // V9: original_price numero finito > 0
  const original = Number(raw.original_price)
  if (!Number.isFinite(original) || original <= 0) {
    return { valid: false, reason: 'original_price_invalido' }
  }
  // V10: current < original (sino descuento ficticio)
  if (current >= original) {
    return { valid: false, reason: 'descuento_ficticio_current_ge_original' }
  }

  // V11: discount >= minDiscount, default 20% (capa 1, garantia estructural)
  const discount = Math.floor(((original - current) / original) * 100)
  if (discount < minDiscount) {
    return { valid: false, reason: `descuento_bajo_umbral_${discount}_lt_${minDiscount}` }
  }

  // V12: is_on_sale boolean true estricto (capa 2 del usuario)
  if (raw.is_on_sale !== true) {
    return { valid: false, reason: 'is_on_sale_no_es_true' }
  }

  // V13: images array con length >= 1 (capa 4 del usuario)
  if (!Array.isArray(raw.images) || raw.images.length < 1) {
    return { valid: false, reason: 'sin_imagenes' }
  }

  // V14: gender en set cerrado (DB CHECK constraint)
  if (!VALID_GENDERS.has(raw.gender)) {
    return { valid: false, reason: `gender_invalido_${raw.gender}` }
  }

  // V15: currency ISO 3 letras (DB schema)
  if (!raw.currency || String(raw.currency).length !== 3) {
    return { valid: false, reason: 'currency_invalida' }
  }

  // V16: in_stock estricto boolean true (Sesion 2 spec, defensive).
  // Razones diferenciadas: undefined/null senala feed mal mapeado;
  // false/otros valores senalan producto agotado o tipo invalido.
  if (raw.in_stock !== true) {
    const r = (raw.in_stock === undefined || raw.in_stock === null)
      ? 'in_stock_no_definido'
      : 'sin_stock'
    return { valid: false, reason: r }
  }

  // Exito: shape normalizado para upsert en verified_offers.
  return {
    valid: true,
    offer: {
      external_id: String(raw.external_id),
      sku: String(raw.sku),
      title: String(raw.title),
      brand: raw.brand ?? null,
      description: raw.description ?? null,
      category: raw.category ?? null,
      gender: raw.gender,
      images: raw.images,
      current_price: current,
      original_price: original,
      discount_percent: discount,
      currency: String(raw.currency),
      store_id: String(raw.store_id),
      store_name: String(raw.store_name),
      affiliate_url: raw.affiliate_url,
      direct_url: raw.direct_url ?? null,
      country_availability: Array.isArray(raw.country_availability) ? raw.country_availability : [],
      sizes_available: Array.isArray(raw.sizes_available) ? raw.sizes_available : [],
      in_stock: true,
      is_on_sale: true,
      expires_at: raw.expires_at ?? null,
    },
  }
}
