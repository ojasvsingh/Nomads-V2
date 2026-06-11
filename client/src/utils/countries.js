import countries from 'i18n-iso-countries'
import en from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(en)

// The world-atlas map data uses some short/abbreviated Natural Earth names
// that don't resolve via i18n-iso-countries directly - map those manually
// so the map and the memory form agree on the same ISO_A3 code.
const NAME_OVERRIDES = {
  'W. Sahara': 'ESH',
  'Dem. Rep. Congo': 'COD',
  'Dominican Rep.': 'DOM',
  'Falkland Is.': 'FLK',
  'Fr. S. Antarctic Lands': 'ATF',
  'Central African Rep.': 'CAF',
  'Eq. Guinea': 'GNQ',
  Laos: 'LAO',
  Syria: 'SYR',
  Moldova: 'MDA',
  'Solomon Is.': 'SLB',
  Brunei: 'BRN',
  'Bosnia and Herz.': 'BIH',
  Macedonia: 'MKD',
  'S. Sudan': 'SSD'
}

// converts a world-atlas country name to an ISO 3166-1 alpha-3 code
export function nameToAlpha3(name) {
  return countries.getAlpha3Code(name, 'en') || NAME_OVERRIDES[name] || name
}

// alphabetical { code, name } list for the country picker, derived from ISO data
export const COUNTRY_LIST = Object.entries(countries.getNames('en', { select: 'official' }))
  .map(([alpha2, name]) => ({ code: countries.alpha2ToAlpha3(alpha2), name }))
  .sort((a, b) => a.name.localeCompare(b.name))

export function getCountryName(alpha3) {
  const alpha2 = countries.alpha3ToAlpha2(alpha3)
  return alpha2 ? countries.getName(alpha2, 'en') : alpha3
}

// converts an ISO_A3 code to a flag emoji via regional indicator symbols
export function getFlagEmoji(alpha3) {
  const alpha2 = countries.alpha3ToAlpha2(alpha3)
  if (!alpha2) return '\u{1F30D}'
  return alpha2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}
