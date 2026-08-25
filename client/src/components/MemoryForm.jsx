import { useState, useRef, useEffect, useMemo } from 'react'
import { COUNTRY_LIST } from '../utils/countries'
import { uploadPhotos } from '../api/memories'
import { getTrips } from '../api/trips'
import './MemoryForm.css'

const TODAY = new Date().toISOString().split('T')[0]

export default function MemoryForm({ initialValues, onSubmit, submitLabel, error }) {
  const [form, setForm] = useState({
    title: initialValues?.title || '',
    countryCode: initialValues?.countryCode || '',
    visitedAt: initialValues?.visitedAt || '',
    visitedAtEnd: initialValues?.visitedAtEnd || '',
    description: initialValues?.description || '',
    isPublic: initialValues?.isPublic ?? true,
    tripId: initialValues?.tripId ? String(initialValues.tripId) : ''
  })

  // existing URLs (populated in edit mode from saved memory)
  const [existingPhotos, setExistingPhotos] = useState(
    initialValues?.photos || []
  )
  // new local files selected by the user
  const [newFiles, setNewFiles] = useState([]) // [{ file: File, preview: string }]

  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const [trips, setTrips] = useState([])
  const [tripSort, setTripSort] = useState('country')

  useEffect(() => {
    getTrips().then((res) => setTrips(res.data)).catch(() => {})
  }, [])

  const sortedTrips = useMemo(() => {
    const list = [...trips]
    if (tripSort === 'country' && form.countryCode) {
      list.sort((a, b) => {
        const aMatch = a.countryCode === form.countryCode ? 0 : 1
        const bMatch = b.countryCode === form.countryCode ? 0 : 1
        if (aMatch !== bMatch) return aMatch - bMatch
        return new Date(b.startDate) - new Date(a.startDate)
      })
    } else {
      list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    }
    return list
  }, [trips, tripSort, form.countryCode])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const entries = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setNewFiles(prev => [...prev, ...entries])
    e.target.value = ''
  }

  const removeExisting = (index) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const removeNew = (index) => {
    URL.revokeObjectURL(newFiles[index].preview)
    setNewFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let photoUrls = [...existingPhotos]
      if (newFiles.length > 0) {
        const res = await uploadPhotos(newFiles.map(f => f.file))
        photoUrls = [...photoUrls, ...res.data.urls]
      }
      const country = COUNTRY_LIST.find((c) => c.code === form.countryCode)?.name || ''
      await onSubmit({ ...form, country, photos: photoUrls, tripId: form.tripId || null })
    } finally {
      setSubmitting(false)
    }
  }

  const totalPhotos = existingPhotos.length + newFiles.length

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

      <div className="memory-form-row">
        <div className="field">
          <label htmlFor="visitedAtEnd">End Date <span className="photo-count">(optional, for multi-day)</span></label>
          <input
            id="visitedAtEnd"
            name="visitedAtEnd"
            type="date"
            value={form.visitedAtEnd}
            min={form.visitedAt || undefined}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="tripId">Add to Trip</label>
        <div className="trip-sort-toggle">
          <button
            type="button"
            className={tripSort === 'country' ? 'active' : ''}
            onClick={() => setTripSort('country')}
          >
            Match country
          </button>
          <button
            type="button"
            className={tripSort === 'recent' ? 'active' : ''}
            onClick={() => setTripSort('recent')}
          >
            Most recent
          </button>
        </div>
        <select id="tripId" name="tripId" value={form.tripId} onChange={handleChange}>
          <option value="">None / Standalone</option>
          {sortedTrips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.name} · {trip.country} · {new Date(trip.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
            </option>
          ))}
        </select>
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
        <label>Photos {totalPhotos > 0 && <span className="photo-count">({totalPhotos})</span>}</label>
        <div className="photo-picker">
          {existingPhotos.map((url, i) => (
            <div key={`ex-${i}`} className="photo-thumb">
              <img src={url} alt="" />
              <button type="button" className="photo-remove" onClick={() => removeExisting(i)}>×</button>
            </div>
          ))}
          {newFiles.map((entry, i) => (
            <div key={`new-${i}`} className="photo-thumb">
              <img src={entry.preview} alt="" />
              <button type="button" className="photo-remove" onClick={() => removeNew(i)}>×</button>
            </div>
          ))}
          <button
            type="button"
            className="photo-add-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="photo-add-icon">+</span>
            <span>Add Photos</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
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
