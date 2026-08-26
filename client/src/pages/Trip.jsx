import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTrip, updateTrip, deleteTrip } from '../api/trips'
import { uploadPhotos } from '../api/memories'
import { getFlagEmoji, getCountryName } from '../utils/countries'
import MemoryCard from '../components/MemoryCard'
import CountryMultiSelect from '../components/CountryMultiSelect'
import './Trip.css'

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Trip() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('memories')

  const fetchTrip = async () => {
    try {
      const res = await getTrip(id)
      setTrip(res.data)
    } catch (err) {
      setError('Failed to load this trip')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrip()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const startEditing = () => {
    setForm({
      name: trip.name,
      countryCodes: trip.countryCodes || [],
      startDate: trip.startDate.split('T')[0],
      endDate: trip.endDate.split('T')[0],
      coverPhoto: trip.coverPhoto || ''
    })
    setEditing(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCoverPhotoSelect = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const res = await uploadPhotos([file])
      setForm((prev) => ({ ...prev, coverPhoto: res.data.urls[0] }))
    } catch (err) {
      setError('Failed to upload cover photo')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    if (form.countryCodes.length === 0) {
      setError('Select at least one country')
      return
    }
    setSaving(true)
    try {
      const res = await updateTrip(id, form)
      setTrip((prev) => ({ ...prev, ...res.data }))
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update trip')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this trip? Memories in it will become standalone, not deleted.')) return
    try {
      await deleteTrip(id)
      navigate('/trips')
    } catch (err) {
      setError('Failed to delete this trip')
    }
  }

  if (loading) {
    return (
      <div className="page trip-page">
        <p>Loading trip…</p>
      </div>
    )
  }

  if (error && !trip) {
    return (
      <div className="page trip-page">
        <Link to="/trips" className="memory-back">← Back to My Trips</Link>
        <p className="error-text">{error}</p>
      </div>
    )
  }

  const memories = trip.memories || []
  const media = memories.flatMap((m) => (m.photos || []).map((url) => ({ url, memoryId: m.id, title: m.title })))

  return (
    <div className="page trip-page">
      <Link to="/trips" className="memory-back">← Back to My Trips</Link>

      <div className="card trip-detail">
        {trip.coverPhoto && !editing && (
          <div className="trip-cover">
            <img src={trip.coverPhoto} alt={trip.name} />
          </div>
        )}

        {!editing ? (
          <header className="trip-detail-header">
            <div className="trip-detail-title-group">
              <h1>{trip.name}</h1>
              <p className="trip-detail-meta">
                {(trip.countryCodes || []).map((code) => (
                  <span key={code} className="trip-detail-country">
                    {getFlagEmoji(code)} {getCountryName(code)}
                  </span>
                ))} ·{' '}
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </p>
            </div>
            <div className="trip-detail-actions">
              <button className="btn btn-secondary" onClick={startEditing}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </header>
        ) : (
          <form className="memory-form trip-edit-form" onSubmit={handleSave}>
            <div className="field">
              <label htmlFor="name">Trip Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Countries</label>
              <CountryMultiSelect
                value={form.countryCodes}
                onChange={(countryCodes) => setForm((prev) => ({ ...prev, countryCodes }))}
              />
            </div>

            <div className="memory-form-row">
              <div className="field">
                <label htmlFor="startDate">Start Date</label>
                <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="endDate">End Date</label>
                <input id="endDate" name="endDate" type="date" value={form.endDate} min={form.startDate} onChange={handleChange} required />
              </div>
            </div>

            <div className="field">
              <label>Cover Photo</label>
              {form.coverPhoto && (
                <div className="photo-thumb trip-cover-thumb">
                  <img src={form.coverPhoto} alt="" />
                  <button type="button" className="photo-remove" onClick={() => setForm((p) => ({ ...p, coverPhoto: '' }))}>×</button>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleCoverPhotoSelect} />
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="trip-edit-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Trip'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}

        {!editing && (
          <>
            <div className="trip-tabs">
              <button className={tab === 'memories' ? 'active' : ''} onClick={() => setTab('memories')}>
                Memories ({memories.length})
              </button>
              <button className={tab === 'media' ? 'active' : ''} onClick={() => setTab('media')}>
                Media ({media.length})
              </button>
              <Link
                to="/memories/create"
                state={{ tripId: trip.id, countryCode: trip.countryCodes?.[0] }}
                className="btn btn-secondary trip-add-memory"
              >
                + Add Memory
              </Link>
            </div>

            {tab === 'memories' && (
              memories.length > 0 ? (
                <div className="memory-grid">
                  {memories.map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} />
                  ))}
                </div>
              ) : (
                <p className="trip-empty">No memories logged for this trip yet.</p>
              )
            )}

            {tab === 'media' && (
              media.length > 0 ? (
                <div className="trip-media-grid">
                  {media.map((item, i) => (
                    <img
                      key={i}
                      src={item.url}
                      alt={item.title}
                      onClick={() => navigate(`/memories/${item.memoryId}`)}
                    />
                  ))}
                </div>
              ) : (
                <p className="trip-empty">No photos yet — add some to this trip's memories.</p>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}
