import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMemory } from '../api/memories'

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function CreateMemory() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    country: '',
    countryCode: '',
    visitedAt: '',
    isPublic: false
  })
  const [countries, setCountries] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // load the same country list used by the map so the names line up for visited-country matching
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(GEO_URL)
        const data = await res.json()
        const names = data.objects.countries.geometries
          .map((g) => g.properties.name)
          .sort((a, b) => a.localeCompare(b))
        setCountries(names)
      } catch (err) {
        console.error('Failed to load countries', err)
      }
    }
    fetchCountries()
  }, [])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (e.target.name === 'country') {
      setForm({ ...form, country: value, countryCode: value })
    } else {
      setForm({ ...form, [e.target.name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createMemory(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <div>
      <h1>Create Memory</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} />
        <select name="country" value={form.country} onChange={handleChange}>
          <option value="">Select a country</option>
          {countries.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <input name="visitedAt" type="date" max={new Date().toISOString().split('T')[0]} onChange={handleChange} />
        <textarea name="description" placeholder="Description" onChange={handleChange} />
        <label>
          <input name="isPublic" type="checkbox" onChange={handleChange} />
          Make public
        </label>
        <button type="submit">Save Memory</button>
      </form>
    </div>
  )
}