import { useState, useEffect, useRef, useMemo } from 'react'

// Mapeo código ISO → presentación. Extender aquí cuando lleguen más países
// vía Awin u otras fuentes; la lista visible se deriva dinámicamente del
// catálogo (availableCountries), este diccionario sólo aporta bandera y label.
const COUNTRY_DATA = {
  MX: { flag: '🇲🇽', labelKey: 'country_mx' },
  CO: { flag: '🇨🇴', labelKey: 'country_co' },
}

const ALL_FLAG = '🌎'

// Devuelve { flag, label } para un código ISO. Fallback para códigos sin
// entrada en el diccionario: globo + código en mayúsculas.
function resolveCountry(code, t) {
  const data = COUNTRY_DATA[code]
  if (!data) return { flag: ALL_FLAG, label: code.toUpperCase() }
  return { flag: data.flag, label: t(data.labelKey) }
}

export default function CountryDropdown({
  selectedCountry,
  setSelectedCountry,
  availableCountries,
  t,
  variant = 'header',
  onSelect,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  const isHeader = variant === 'header'

  const triggerLabel = useMemo(() => {
    if (selectedCountry === 'ALL') {
      return { flag: ALL_FLAG, label: t('all_countries') }
    }
    return resolveCountry(selectedCountry, t)
  }, [selectedCountry, t])

  // Resultados de búsqueda: vacío cuando no hay query (modo colapsado).
  // Match por nombre traducido o por código ISO (case-insensitive, includes).
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return availableCountries
      .map((code) => ({ code, ...resolveCountry(code, t) }))
      .filter(
        (c) => c.label.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      )
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [query, availableCountries, t])

  const isSearching = searchResults !== null

  // Click fuera + Escape cierran (sólo header — drawer vive dentro de su propio overlay).
  useEffect(() => {
    if (!open || !isHeader) return
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, isHeader])

  // Reset query y autofocus del buscador al abrir.
  useEffect(() => {
    if (open) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  function handleSelect(code) {
    setSelectedCountry(code)
    setOpen(false)
    onSelect?.(code)
  }

  function renderRow(code, label, flag) {
    return (
      <button
        onClick={() => handleSelect(code)}
        className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-[#FAFAFA] text-[13px]"
        role="option"
        aria-selected={selectedCountry === code}
      >
        <span className="flex items-center gap-2">
          <span aria-hidden="true">{flag}</span>
          <span>{label}</span>
        </span>
        {selectedCountry === code && (
          <span aria-hidden="true" className="text-black">✓</span>
        )}
      </button>
    )
  }

  const allCountriesRow = renderRow('ALL', t('all_countries'), ALL_FLAG)

  // Body del panel: cambia entre modo colapsado (selected + ALL) y modo búsqueda.
  let body
  if (isSearching) {
    if (searchResults.length === 0) {
      body = (
        <div className="px-4 py-6 text-[12px] text-[var(--muted)] text-center">
          {t('no_country_results')}
        </div>
      )
    } else {
      body = (
        <ul className="max-h-64 overflow-y-auto py-1">
          {searchResults.map((c) => (
            <li key={c.code}>{renderRow(c.code, c.label, c.flag)}</li>
          ))}
        </ul>
      )
    }
  } else {
    // Modo colapsado: sólo seleccionado (si no es ALL) + separador + Todos los países.
    body = (
      <>
        {selectedCountry !== 'ALL' && (
          <ul className="py-1 border-b border-[var(--line)]">
            <li>
              {renderRow(selectedCountry, triggerLabel.label, triggerLabel.flag)}
            </li>
          </ul>
        )}
        <div>{allCountriesRow}</div>
      </>
    )
  }

  const panel = (
    <div
      className={
        isHeader
          ? 'absolute right-0 top-full mt-2 w-64 bg-white border border-[var(--line)] shadow-lg rounded-md z-50 overflow-hidden'
          : 'mt-2 w-full bg-white border border-[var(--line)] rounded-md overflow-hidden'
      }
      role="listbox"
    >
      <div className="p-2 border-b border-[var(--line)]">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search_country_placeholder')}
          className="w-full px-3 py-2 text-[13px] bg-[#FAFAFA] border border-[var(--line)] rounded focus:outline-none focus:border-black"
        />
      </div>
      {body}
    </div>
  )

  return (
    <div ref={rootRef} className={isHeader ? 'relative' : 'w-full'}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          isHeader
            ? 'flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium border border-[var(--line)] rounded-full hover:bg-[#FAFAFA] transition-colors'
            : 'w-full flex items-center justify-between px-4 py-3 text-[14px] font-medium border border-[var(--line)] rounded-md hover:bg-[#FAFAFA] transition-colors'
        }
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span aria-hidden="true">{triggerLabel.flag}</span>
          <span>{triggerLabel.label}</span>
        </span>
        <span aria-hidden="true" className={`text-[var(--muted)] transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && panel}
    </div>
  )
}
