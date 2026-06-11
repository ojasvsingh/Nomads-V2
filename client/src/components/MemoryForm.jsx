import { useState } from 'react'
import { COUNTRY_LIST } from '../utils/countries'
import './MemoryForm.css'

const TODAY = new Date().toISOString().split('T')[0]

export default function MemoryForm({ initialValues, onSubmit, submitLabel, error }) {
  const [form, setForm] = useState({
    title: initialValues?.title || '',
    countryCode: initialValues?.countryCode || '',
    visitedAt: initialValues?.visitedAt || '',
    description: initialValues?.description || '',
    isPublic: initialValues?.isPublic ?? true
  })
  const [photos, setPhotos] = useState(initialValues?.photos?.length ? initialValues.photos : [''])
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handlePhotoChange = (index, value) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? value : p)))
  }

  const addPhotoField = () => setPhotos((prev) => [...prev, ''])
  const removePhotoField = (index) => setPhotos((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const country = COUNTRY_LIST.find((c) => c.code === form.countryCode)?.name || ''
    const data = {
      ...form,
      country,
      photos: photos.map((p) => p.trim()).filter(Boolean)
    }
    try {
      await onSubmit(data)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="memory-form" onSubmit={handleSubmit}>
      {error && <p className="error-text">{error}</p>}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="A weekend in Lisbon"
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

        <div className="field">
          <label htmlFor="visitedAt">Date Visited</label>
          <input
            id="visitedAt"
            name="visitedAt"
            type="date"
            value={form.visitedAt}
            max={TODAY}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="description">Journal Entry</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What made this trip memorable?"
        />
      </div>

      <div className="field">
        <label>Photos</label>
        <div className="memory-form-photos">
          {photos.map((url, i) => (
            <div className="memory-form-photo-row" key={i}>
              <input
                type="url"
                value={url}
                placeholder="https://example.com/photo.jpg"
                onChange={(e) => handlePhotoChange(i, e.target.value)}
              />
              {photos.length > 1 && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => removePhotoField(i)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm memory-form-add-photo" onClick={addPhotoField}>
            + Add Photo URL
          </button>
        </div>
      </div>

      <label className="memory-form-toggle">
        <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} />
        Make this memory public
      </label>

      <button type="submit" className="btn btn-primary memory-form-submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
