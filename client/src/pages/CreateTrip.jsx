import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTrip } from '../api/trips'
import { COUNTRY_LIST } from '../utils/countries'
import './MemoryFormPage.css'

export default function CreateTrip() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', countryCode: '', startDate: '', endDate: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const country = COUNTRY_LIST.find((c) => c.code === form.countryCode)?.name || ''
      const res = await createTrip({ ...form, country })
      navigate(`/trips/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page memory-form-page">
      <header className="memory-form-header">
        <h1>New Trip</h1>
        <p className="memory-form-subtitle">Set up a trip to group memories under. You can add a cover photo later.</p>
      </header>
      <div className="card memory-form-card">
        <form className="memory-form" onSubmit={handleSubmit}>
          {error && <p className="error-text">{error}</p>}

          <div className="field">
            <label htmlFor="name">Trip Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Backpacking Argentina"
              required
            />
          </div>

          <div className="memory-form-row">
            <div className="field">
              <label htmlFor="countryCode">Country</label>
              <select id="countryCode" name="countryCode" value={form.countryCode} onChange={handleChange} required>
                <option value="" disabled>Select a country…</option>
                {COUNTRY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="memory-form-row">
            <div className="field">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary memory-form-submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Create Trip'}
          </button>
        </form>
      </div>
    </div>
  )
}
