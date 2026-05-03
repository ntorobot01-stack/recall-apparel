// Entrypoint del sync worker.
//
// Modo por default: dry-run (no escribe a la DB, solo imprime el diff).
// Modo write:        flag --write (aplica entered/updated/exited y loguea).
//
// Source por default: mock. Se selecciona via --source <name>.
// Cuando lleguen credenciales de Awin, agregar awin al map SOURCES + un
// import de ./sources/awin.js — sin otros cambios estructurales.
//
// Las credenciales se cargan via Node 24 --env-file=.env.local desde los
// scripts de package.json. El worker NUNCA debe correr con la publishable
// key del frontend — db.js valida el prefijo y aborta si el operador se
// equivoca.

import { runSync } from './sync.js'
import * as mockSource from './sources/mock.js'

const SOURCES = { mock: mockSource }

const args = process.argv.slice(2)
const dryRun = !args.includes('--write')
const sourceArgIdx = args.indexOf('--source')
const sourceName = sourceArgIdx >= 0 ? args[sourceArgIdx + 1] : 'mock'
const minDiscount = Number(process.env.MIN_DISCOUNT_PERCENT ?? 20)

const source = SOURCES[sourceName]
if (!source) {
  console.error(
    `Source desconocida: '${sourceName}'. Disponibles: ${Object.keys(SOURCES).join(', ')}`
  )
  process.exit(1)
}

const line = '─'.repeat(70)
const banner = dryRun
  ? '[DRY RUN] No se escribira nada a la DB. Solo se muestra el diff.'
  : '[WRITE] Las diferencias se aplicaran a verified_offers + offer_history.'

console.log(line)
console.log('Recall Apparel — Sync Worker')
console.log(banner)
console.log(`Source: ${source.name}  |  min_discount: ${minDiscount}%`)
console.log(line)

const summary = await runSync({ source, dryRun, minDiscount })

console.log('')
console.log('Resultados')
console.log(`  fetched:   ${summary.fetched}`)
console.log(`  validated: ${summary.validated}`)

console.log(`  rejected:  ${summary.rejected.length}`)
for (const r of summary.rejected) {
  console.log(`    ✗ ${r.sku ?? '(no sku)'}  →  ${r.reason}`)
}

console.log(`  entered:   ${summary.entered.length}`)
for (const sku of summary.entered) {
  console.log(`    + ${sku}`)
}

console.log(`  updated:   ${summary.updated.length}`)
for (const sku of summary.updated) {
  console.log(`    ~ ${sku}`)
}

console.log(`  exited:    ${summary.exited.length}`)
for (const x of summary.exited) {
  console.log(`    − ${x.sku}  (${x.reason})`)
}

console.log(`  errors:    ${summary.errors.length}`)
for (const e of summary.errors) {
  console.log(`    ! ${e.kind} ${e.sku} @ ${e.store_id}: ${e.error}`)
}

console.log(line)
if (summary.errors.length > 0) {
  console.log(`${summary.errors.length} errores no fatales — revisar arriba.`)
  process.exit(1)
} else if (dryRun) {
  console.log('Listo. Para aplicar realmente: `npm run worker:run`.')
} else {
  console.log('Cambios aplicados a verified_offers + offer_history.')
}
