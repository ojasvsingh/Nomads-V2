import { COUNTRY_LIST, getFlagEmoji, getCountryName } from '../utils/countries'
import './CountryMultiSelect.css'

export default function CountryMultiSelect({ value, onChange }) {
  const addCountry = (code) => {
    if (code && !value.includes(code)) onChange([...value, code])
  }

  const removeCountry = (code) => {
    onChange(value.filter((c) => c !== code))
  }

  return (
    <div className="country-multiselect">
      {value.length > 0 && (
        <div className="country-chip-list">
          {value.map((code) => (
            <span key={code} className="country-chip">
              {getFlagEmoji(code)} {getCountryName(code)}
              <button type="button" onClick={() => removeCountry(code)}>×</button>
            </span>
          ))}
        </div>
      )}
      <select
        value=""
        onChange={(e) => addCountry(e.target.value)}
      >
        <option value="" disabled>Add a country…</option>
        {COUNTRY_LIST.filter((c) => !value.includes(c.code)).map((c) => (
          <option key={c.code} value={c.code}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}
