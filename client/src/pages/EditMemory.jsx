import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getMemory, updateMemory } from '../api/memories'
import MemoryForm from '../components/MemoryForm'
import './MemoryFormPage.css'

export default function EditMemory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [memory, setMemory] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMemory = async () => {
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

  const handleSubmit = async (data) => {
    setError(null)
    try {
      await updateMemory(id, data)
      navigate(`/memories/${id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  if (loading) {
    return (
      <div className="page memory-form-page">
        <p>Loading memory…</p>
      </div>
    )
  }

  if (!memory) {
    return (
      <div className="page memory-form-page">
        <Link to="/memories" className="memory-back">← Back to Memories</Link>
        <p className="error-text">{error || 'Memory not found'}</p>
      </div>
    )
  }

  return (
    <div className="page memory-form-page">
      <header className="memory-form-header">
        <h1>Edit Memory</h1>
        <p className="memory-form-subtitle">Update the details of this trip.</p>
      </header>
      <div className="card memory-form-card">
        <MemoryForm
          initialValues={{
            title: memory.title,
            countryCode: memory.countryCode,
            visitedAt: memory.visitedAt?.split('T')[0],
            visitedAtEnd: memory.visitedAtEnd?.split('T')[0] || '',
            description: memory.description || '',
            photos: memory.photos || [],
            isPublic: memory.isPublic,
            tripId: memory.tripId
          }}
          onSubmit={handleSubmit}
          submitLabel="Update Memory"
          error={error}
        />
      </div>
    </div>
  )
}
