// Cliente Supabase server-side con privilegios service_role.
// SOLO se usa desde el sync worker. NUNCA importar desde codigo del frontend.
//
// La service_role key bypassa Row Level Security: con ella el worker puede
// INSERT/UPDATE/DELETE sobre verified_offers y offer_history. Si se filtra al
// browser, alguien puede borrar la tabla entera desde la consola del navegador.

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY

if (!url || !key) {
  throw new Error(
    'Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en el entorno. ' +
    'Crear .env.local (ver .env.local.example) y correr el worker con ' +
    '`npm run worker:dry` o `npm run worker:run` (los scripts ya pasan --env-file).'
  )
}

// Defense-in-depth: la anon/publishable key empieza con `sb_publishable_`.
// Si el worker la recibiera por error, todas las escrituras fallarian silenciosa
// o ruidosamente por RLS. Mejor abortar aca con un mensaje claro.
if (key.startsWith('sb_publishable_')) {
  throw new Error(
    'SUPABASE_SECRET_KEY parece ser la publishable key (sb_publishable_*). ' +
    'El worker requiere la SECRET key (sb_secret_* o JWT eyJ...). ' +
    'Revisar Supabase Dashboard -> Project Settings -> API Keys -> service_role.'
  )
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// Devuelve solo las columnas necesarias para el diff. Mantener el SELECT
// chico abarata la corrida cuando el catalogo crezca a miles de filas.
export async function fetchCurrentOffersForStore(storeId) {
  const { data, error } = await supabase
    .from('verified_offers')
    .select('sku, store_id, current_price, original_price, discount_percent, in_stock')
    .eq('store_id', storeId)
  if (error) throw new Error(`fetchCurrentOffersForStore(${storeId}): ${error.message}`)
  return data ?? []
}

export async function upsertOffer(offer) {
  const { error } = await supabase
    .from('verified_offers')
    .upsert(offer, { onConflict: 'sku,store_id' })
  if (error) throw new Error(`upsertOffer(${offer.sku} @ ${offer.store_id}): ${error.message}`)
}

export async function deleteOffer(sku, storeId) {
  const { error } = await supabase
    .from('verified_offers')
    .delete()
    .eq('sku', sku)
    .eq('store_id', storeId)
  if (error) throw new Error(`deleteOffer(${sku} @ ${storeId}): ${error.message}`)
}

export async function logHistory(entry) {
  const { error } = await supabase.from('offer_history').insert(entry)
  if (error) throw new Error(`logHistory(${entry.sku}, ${entry.event_type}): ${error.message}`)
}
