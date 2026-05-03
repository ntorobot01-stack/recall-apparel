// Nucleo del sync worker: orquesta validacion + diff vs estado actual de
// verified_offers + aplicacion (upsert/delete) + log inmutable en
// offer_history. Una sola corrida por invocacion; idempotente.
//
// Diff por (sku, store_id) — el unique compuesto de la tabla:
//   - entered  = en valid, no en current
//   - updated  = en ambos, pero current_price/original_price/discount/in_stock cambio
//   - exited   = en current, no en valid
//                  reason = razon de rechazo de validate.js si la oferta
//                           reaparecio degradada, o "not in feed" si el
//                           feed simplemente dejo de mencionarla.
//
// dryRun=true computa el diff completo (lectura de DB requerida) pero no
// escribe nada. dryRun=false aplica cambios y loguea cada uno en
// offer_history.

import { fetchCurrentOffersForStore, upsertOffer, deleteOffer, logHistory } from './db.js'
import { validateOffer } from './validate.js'

export async function runSync({ source, dryRun, minDiscount }) {
  const summary = {
    source: source.name,
    dryRun,
    fetched: 0,
    validated: 0,
    rejected: [],
    entered: [],
    updated: [],
    exited: [],
    errors: [],
  }

  // ── Fase 1: fetch + validacion ─────────────────────────────────────────
  const raw = await source.fetch()
  summary.fetched = raw.length

  // Map<store_id, Map<sku, offer>>  — ofertas validas agrupadas via Map.set
  const validByStore = new Map()
  // Map<store_id, Map<sku, reason>> — rechazos identificables por (sku, store_id)
  const rejectedByStore = new Map()
  const allStoreIds = new Set()

  for (const r of raw) {
    const result = validateOffer(r, { minDiscount })
    if (result.valid) {
      const offer = result.offer
      if (!validByStore.has(offer.store_id)) validByStore.set(offer.store_id, new Map())
      validByStore.get(offer.store_id).set(offer.sku, offer)
      allStoreIds.add(offer.store_id)
    } else {
      summary.rejected.push({ sku: r.sku ?? null, reason: result.reason })
      if (r.sku && r.store_id) {
        if (!rejectedByStore.has(r.store_id)) rejectedByStore.set(r.store_id, new Map())
        rejectedByStore.get(r.store_id).set(r.sku, result.reason)
        allStoreIds.add(r.store_id)
      }
    }
  }
  summary.validated = raw.length - summary.rejected.length

  // ── Fase 2: diff + apply (per store) ───────────────────────────────────
  for (const storeId of allStoreIds) {
    const validForStore = validByStore.get(storeId) ?? new Map()
    const rejectedForStore = rejectedByStore.get(storeId) ?? new Map()
    const current = await fetchCurrentOffersForStore(storeId)

    // entered + updated
    for (const [sku, offer] of validForStore) {
      const existing = current.find(c => c.sku === sku)
      if (!existing) {
        summary.entered.push(sku)
        if (!dryRun) {
          try {
            await upsertOffer(offer)
            await logHistory({
              sku,
              store_id: storeId,
              event_type: 'entered',
              discount_percent: offer.discount_percent,
              current_price: offer.current_price,
              original_price: offer.original_price,
              reason: null,
            })
          } catch (err) { pushError(summary, 'enter', sku, storeId, err) }
        }
      } else if (offerChanged(existing, offer)) {
        summary.updated.push(sku)
        if (!dryRun) {
          try {
            await upsertOffer(offer)
            await logHistory({
              sku,
              store_id: storeId,
              event_type: 'updated',
              discount_percent: offer.discount_percent,
              current_price: offer.current_price,
              original_price: offer.original_price,
              reason: null,
            })
          } catch (err) { pushError(summary, 'update', sku, storeId, err) }
        }
      }
    }

    // exited (no aparece en valid; razon = rechazo previo o feed gone)
    for (const existing of current) {
      if (validForStore.has(existing.sku)) continue
      const reason = rejectedForStore.get(existing.sku) ?? 'not_in_feed'
      summary.exited.push({ sku: existing.sku, reason })
      if (!dryRun) {
        try {
          await deleteOffer(existing.sku, storeId)
          await logHistory({
            sku: existing.sku,
            store_id: storeId,
            event_type: 'exited',
            discount_percent: null,
            current_price: null,
            original_price: null,
            reason,
          })
        } catch (err) { pushError(summary, 'exit', existing.sku, storeId, err) }
      }
    }
  }

  return summary
}

function offerChanged(existing, incoming) {
  return (
    Number(existing.current_price) !== incoming.current_price ||
    Number(existing.original_price) !== incoming.original_price ||
    existing.discount_percent !== incoming.discount_percent ||
    existing.in_stock !== incoming.in_stock
  )
}

function pushError(summary, kind, sku, storeId, err) {
  summary.errors.push({ kind, sku, store_id: storeId, error: err.message })
}
