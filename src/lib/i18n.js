// ─────────────────────────────────────────────────────────────────────
// i18n — diccionario único ES/EN
// ─────────────────────────────────────────────────────────────────────

export const TRANSLATIONS = {
  es: {
    // Top strip
    top_strip_left: '// Solo ofertas · Actualizado hoy',
    top_strip_right: 'No procesamos pagos · Te llevamos a la tienda oficial',

    // Header
    aggregator_tagline: 'Premium Streetwear · Aggregator',
    deals_active: (n) => `${n} ofertas activas`,

    // Selector de país (CountryDropdown)
    search_country_placeholder: 'Buscar país...',
    all_countries: 'Todos los países',
    country_mx: 'México',
    country_co: 'Colombia',
    no_country_results: 'Sin ofertas en este país por ahora',

    // Tagline (franja editorial bajo el header)
    tagline_text: 'MARCAS OFICIALES · DROPS NUEVOS CADA DÍA · SIN INTERMEDIARIOS',

    // Filtro de género (gender_kids existe en el schema pero no se expone en UI)
    gender_label: 'Género',
    gender_all: 'Todos',
    gender_men: 'Hombre',
    gender_women: 'Mujer',
    gender_unisex: 'Unisex',

    // Navegación principal (mega-menú desktop / drawer mobile)
    nav_men: 'HOMBRE',
    nav_women: 'MUJER',
    nav_unisex: 'UNISEX',
    nav_footwear: 'CALZADO',
    nav_clothing: 'ROPA',
    nav_accessories_grouped: 'ACCESORIOS',
    nav_bags: 'BOLSOS',

    // Drawer mobile + breadcrumb
    open_menu: 'Menú',
    close_menu: 'Cerrar',
    back: 'Volver',
    view_all_in: (gender) => `Ver todo ${gender}`,
    clear_filters: 'Limpiar',
    region_label: 'Región',
    language_label: 'Idioma',

    // Filtro de categoría
    category_label: 'Categoría',
    category_all: 'Todas',
    category_footwear: 'Calzado',
    category_tops: 'Ropa superior',
    category_bottoms: 'Ropa inferior',
    category_sets: 'Conjuntos',
    category_outerwear: 'Abrigo',
    category_accessories: 'Accesorios',
    category_bags: 'Bolsos',
    category_jewelry: 'Joyería',

    // Drawer de filtros (mobile)
    open_filters: 'Filtros',
    close_filters: 'Cerrar',

    // Hero
    hero_title_line1: 'Recall.',
    hero_title_line2: 'El lugar del streetwear premium.',
    hero_subtitle:
      'Pieza por pieza. Tienda por tienda. Te traemos los mejores precios del streetwear premium en un solo lugar. Tú haces click. Compras directo en la tienda oficial. Así de simple.',

    // Catalog
    catalog_title: 'Catálogo',
    catalog_meta: (n) => `${n} piezas`,
    catalog_empty: 'No hay ofertas con este filtro. Cambia el origen para ver más.',

    // Product card
    go_to: 'Ir a',
    trust_badge: 'Pago 100% seguro en la tienda oficial',

    // Modal
    secure_redirect: 'Redirección segura',
    we_take_you_to: 'Te llevamos a',
    leaving_message: (store, brand) =>
      `Estás saliendo de Recall Apparel. Tu pago y tus datos serán procesados directamente por **${store}**, la tienda oficial de **${brand}**.`,
    verifying_link: 'Verificando enlace…',

    // Footer
    footer_description:
      'Agregador de afiliación. No vendemos ni almacenamos inventario, no procesamos pagos. Te llevamos directo a la tienda oficial de cada marca.',
    footer_how_title: 'Cómo funciona',
    footer_how_1: 'Encontramos ofertas en boutiques oficiales.',
    footer_how_2: 'Te mostramos el precio que verás en la tienda.',
    footer_how_3: 'Tú compras directo. Nosotros sólo te conectamos.',
    footer_legal: 'Legal',
    legal_1: 'Recall Apparel participa en programas de afiliación.',
    legal_2: 'Marcas, imágenes y precios pertenecen a sus respectivos dueños.',
    legal_3: 'Cada precio se muestra en la moneda original de la tienda destino.',
  },

  en: {
    top_strip_left: '// Deals only · Updated today',
    top_strip_right: "We don't process payments · We take you to the official store",

    aggregator_tagline: 'Premium Streetwear · Aggregator',
    deals_active: (n) => `${n} active deals`,

    search_country_placeholder: 'Search country...',
    all_countries: 'All countries',
    country_mx: 'Mexico',
    country_co: 'Colombia',
    no_country_results: 'No deals in this country yet',

    tagline_text: 'OFFICIAL BRANDS · NEW DROPS EVERY DAY · NO MIDDLEMEN',

    gender_label: 'Gender',
    gender_all: 'All',
    gender_men: 'Men',
    gender_women: 'Women',
    gender_unisex: 'Unisex',

    nav_men: 'MEN',
    nav_women: 'WOMEN',
    nav_unisex: 'UNISEX',
    nav_footwear: 'FOOTWEAR',
    nav_clothing: 'CLOTHING',
    nav_accessories_grouped: 'ACCESSORIES',
    nav_bags: 'BAGS',

    open_menu: 'Menu',
    close_menu: 'Close',
    back: 'Back',
    view_all_in: (gender) => `View all ${gender}`,
    clear_filters: 'Clear',
    region_label: 'Region',
    language_label: 'Language',

    category_label: 'Category',
    category_all: 'All',
    category_footwear: 'Footwear',
    category_tops: 'Tops',
    category_bottoms: 'Bottoms',
    category_sets: 'Sets',
    category_outerwear: 'Outerwear',
    category_accessories: 'Accessories',
    category_bags: 'Bags',
    category_jewelry: 'Jewelry',

    open_filters: 'Filters',
    close_filters: 'Close',

    hero_title_line1: 'Recall.',
    hero_title_line2: 'The home of premium streetwear.',
    hero_subtitle:
      'Piece by piece. Store by store. We bring you the best prices in premium streetwear, all in one place. You click. You buy at the official store. Simple as that.',

    catalog_title: 'Catalog',
    catalog_meta: (n) => `${n} pieces`,
    catalog_empty: 'No deals match this filter. Change the origin to see more.',

    go_to: 'Go to',
    trust_badge: '100% secure payment at the official store',

    secure_redirect: 'Secure redirect',
    we_take_you_to: 'Taking you to',
    leaving_message: (store, brand) =>
      `You are leaving Recall Apparel. Your payment and data will be processed directly by **${store}**, the official store of **${brand}**.`,
    verifying_link: 'Verifying link…',

    footer_description:
      "Affiliate aggregator. We don't sell or stock inventory, we don't process payments. We take you straight to the official store of each brand.",
    footer_how_title: 'How it works',
    footer_how_1: 'We find deals at official boutiques.',
    footer_how_2: 'We show you the price you will see at the store.',
    footer_how_3: "You buy direct. We just connect you.",
    footer_legal: 'Legal',
    legal_1: 'Recall Apparel participates in affiliate programs.',
    legal_2: 'Brands, images and prices belong to their respective owners.',
    legal_3: 'Each price is shown in the original currency of the destination store.',
  },
}

export const LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

export function detectInitialLanguage() {
  if (typeof navigator === 'undefined') return 'en'
  const lang = (
    navigator.language ||
    (navigator.languages && navigator.languages[0]) ||
    'en'
  ).toLowerCase()
  return lang.startsWith('es') ? 'es' : 'en'
}

export function makeT(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en
  return (key, ...args) => {
    const value = dict[key]
    if (typeof value === 'function') return value(...args)
    return value !== undefined ? value : key
  }
}
