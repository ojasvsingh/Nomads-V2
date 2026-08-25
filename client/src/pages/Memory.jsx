import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getMemory, deleteMemory } from '../api/memories'
import { getFlagEmoji } from '../utils/countries'
import './Memory.css'

export default function Memory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [memory, setMemory] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMemory = async () => {
      setLoading(true)
      try {
        const res = await getMemory(id)
        setMemory(res.data)
      } catch (err) {
        setError('Failed to load this memory')
      } finally {
        setLoading(false)
      }
    }
    fetchMemory()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this memory? This cannot be undone.')) return
    try {
      await deleteMemory(id)
      navigate('/memories')
    } catch (err) {
      setError('Failed to delete this memory')
    }
  }

  if (loading) {
    return (
      <div className="page memory-page">
        <p>Loading memory…</p>
      </div>
    )
  }

  if (error || !memory) {
    return (
      <div className="page memory-page">
        <Link to="/memories" className="memory-back">← Back to Memories</Link>
        <p className="error-text">{error || 'Memory not found'}</p>
      </div>
    )
  }

  return (
    <div className="page memory-page">
      <Link to="/memories" className="memory-back">← Back to Memories</Link>

      <div className="card memory-detail">
        <header className="memory-detail-header">
          <div className="memory-detail-title-group">
            <h1>{memory.title}</h1>
            <p className="memory-detail-meta">
              {getFlagEmoji(memory.countryCode)} {memory.country} ·{' '}
              {new Date(memory.visitedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              {memory.visitedAtEnd && ` – ${new Date(memory.visitedAtEnd).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}`}
            </p>
            {memory.tripId && (
              <Link to={`/trips/${memory.tripId}`} className="memory-trip-link">Part of a trip →</Link>
            )}
            {!memory.isPublic && <span className="memory-private-badge">Private</span>}
          </div>
          <div className="memory-detail-actions">
            <Link to={`/memories/${memory.id}/edit`} className="btn btn-secondary">Edit</Link>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </header>

        {memory.photos?.length > 0 && (
          <div className="memory-gallery">
            {memory.photos.map((url, i) => (
              <img key={i} src={url} alt={`${memory.title} photo ${i + 1}`} />
            ))}
          </div>
        )}

        {memory.description && (
          <div className="memory-description">
            <p>{memory.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
