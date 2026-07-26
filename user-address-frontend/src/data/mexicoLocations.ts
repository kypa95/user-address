// Local catalog for the address autocompletes (Mexico).
// The 32 states are complete. Municipios are a representative set per state —
// the autocomplete runs in freeSolo mode, so any value not listed can still be
// typed. Extend MUNICIPIOS as needed.

export const ESTADOS = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
];

export const MUNICIPIOS = {
  Aguascalientes: ['Aguascalientes', 'Jesús María', 'Calvillo', 'Rincón de Romos', 'Pabellón de Arteaga'],
  'Baja California': ['Tijuana', 'Mexicali', 'Ensenada', 'Tecate', 'Rosarito'],
  'Baja California Sur': ['La Paz', 'Los Cabos', 'Comondú', 'Loreto', 'Mulegé'],
  Campeche: ['Campeche', 'Ciudad del Carmen', 'Champotón', 'Escárcega', 'Calkiní'],
  Chiapas: ['Tuxtla Gutiérrez', 'Tapachula', 'San Cristóbal de las Casas', 'Comitán', 'Palenque'],
  Chihuahua: ['Chihuahua', 'Ciudad Juárez', 'Delicias', 'Cuauhtémoc', 'Parral'],
  'Ciudad de México': [
    'Álvaro Obregón',
    'Azcapotzalco',
    'Benito Juárez',
    'Coyoacán',
    'Cuauhtémoc',
    'Gustavo A. Madero',
    'Iztapalapa',
    'Miguel Hidalgo',
    'Tlalpan',
    'Venustiano Carranza',
  ],
  Coahuila: ['Saltillo', 'Torreón', 'Monclova', 'Piedras Negras', 'Acuña'],
  Colima: ['Colima', 'Manzanillo', 'Tecomán', 'Villa de Álvarez', 'Comala'],
  Durango: ['Durango', 'Gómez Palacio', 'Lerdo', 'Santiago Papasquiaro', 'El Salto'],
  'Estado de México': [
    'Toluca',
    'Ecatepec',
    'Naucalpan',
    'Nezahualcóyotl',
    'Tlalnepantla',
    'Cuautitlán Izcalli',
    'Chimalhuacán',
    'Atizapán de Zaragoza',
  ],
  Guanajuato: ['Guanajuato', 'León', 'Irapuato', 'Celaya', 'Salamanca', 'Silao'],
  Guerrero: ['Chilpancingo', 'Acapulco', 'Iguala', 'Zihuatanejo', 'Taxco'],
  Hidalgo: ['Pachuca', 'Tulancingo', 'Tula de Allende', 'Tizayuca', 'Huejutla'],
  Jalisco: ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Puerto Vallarta', 'Tlajomulco'],
  Michoacán: ['Morelia', 'Uruapan', 'Zamora', 'Lázaro Cárdenas', 'Apatzingán'],
  Morelos: ['Cuernavaca', 'Jiutepec', 'Cuautla', 'Temixco', 'Yautepec'],
  Nayarit: ['Tepic', 'Bahía de Banderas', 'Santiago Ixcuintla', 'Compostela', 'Xalisco'],
  'Nuevo León': ['Monterrey', 'Guadalupe', 'San Nicolás de los Garza', 'Apodaca', 'General Escobedo', 'San Pedro Garza García'],
  Oaxaca: ['Oaxaca de Juárez', 'Salina Cruz', 'Juchitán', 'Tuxtepec', 'Huajuapan'],
  Puebla: ['Puebla', 'Tehuacán', 'San Martín Texmelucan', 'Atlixco', 'Cholula'],
  Querétaro: ['Querétaro', 'San Juan del Río', 'Corregidora', 'El Marqués', 'Tequisquiapan'],
  'Quintana Roo': ['Cancún', 'Chetumal', 'Playa del Carmen', 'Cozumel', 'Tulum'],
  'San Luis Potosí': ['San Luis Potosí', 'Soledad de Graciano Sánchez', 'Ciudad Valles', 'Matehuala', 'Rioverde'],
  Sinaloa: ['Culiacán', 'Mazatlán', 'Los Mochis', 'Guasave', 'Navolato'],
  Sonora: ['Hermosillo', 'Ciudad Obregón', 'Nogales', 'San Luis Río Colorado', 'Navojoa'],
  Tabasco: ['Villahermosa', 'Cárdenas', 'Comalcalco', 'Macuspana', 'Huimanguillo'],
  Tamaulipas: ['Ciudad Victoria', 'Reynosa', 'Matamoros', 'Nuevo Laredo', 'Tampico', 'Altamira'],
  Tlaxcala: ['Tlaxcala', 'Apizaco', 'Huamantla', 'Chiautempan', 'Calpulalpan'],
  Veracruz: ['Xalapa', 'Veracruz', 'Coatzacoalcos', 'Córdoba', 'Orizaba', 'Poza Rica'],
  Yucatán: ['Mérida', 'Valladolid', 'Kanasín', 'Tizimín', 'Progreso'],
  Zacatecas: ['Zacatecas', 'Fresnillo', 'Guadalupe', 'Jerez', 'Río Grande'],
};

export function municipiosOf(estado) {
  return MUNICIPIOS[estado] ?? [];
}

/** The only country the app registers addresses for. */
export const PAIS_DEFAULT = 'México';

/** Catalog fed to the country select. Add entries here to support more countries. */
export const PAISES = [PAIS_DEFAULT];

/**
 * Matches a stored country against the catalog ignoring case and accents, so a
 * row saved as "Mexico" still selects "México" instead of showing an empty box.
 * Returns the stored value untouched when it is not in the catalog.
 *
 * @param {string} value
 * @returns {string}
 */
export function normalizePais(value) {
  const stored = (value ?? '').trim();
  if (!stored) return PAIS_DEFAULT;

  // sensitivity 'base' treats "Mexico" and "México" as the same string.
  const match = PAISES.find(
    (pais) => pais.localeCompare(stored, 'es', { sensitivity: 'base' }) === 0,
  );

  return match ?? stored;
}
