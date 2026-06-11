import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getMemories, deleteMemory } from '../api/memories'
import MemoryCard from '../components/MemoryCard'
import './Memories.css'

export default function Memories() {
  const [memories, setMemories] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [countryFilter, setCountryFilter] = useState('all')

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await getMemories()
        setMemories(res.data)
      } catch (err) {
        setError('Failed to load memories')
      } finally {
        setLoading(false)
      }
    }
    fetchMemories()
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteMemory(id)
      setMemories((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      setError('Failed to delete memory')
    }
  }

  const countries = useMemo(() => {
    const unique = new Map()
    memories.forEach((m) => unique.set(m.countryCode, m.country))
    return Array.from(unique.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [memories])

  const filteredMemories = countryFilter === 'all'
    ? memories
    : memories.filter((m) => m.countryCode === countryFilter)

  return (
    <div className="page memories-page">
      <header className="memories-header">
        <div>
          <h1>My Memories</h1>
          <p className="memories-subtitle">
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'} in your scrapbook
          </p>
        </div>
        <Link to="/memories/create" className="btn btn-primary">+ New Memory</Link>
      </header>

      {error && <p className="error-text">{error}</p>}

      {memories.length > 0 && (
        <div className="field memories-filter">
          <label htmlFor="country-filter">Filter by country</label>
          <select id="country-filter" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
            <option value="all">All countries</option>
            {countries.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
      )}

      {loading && <p>Loading your memories…</p>}

      {!loading && memories.length === 0 && (
        <div className="card empty-state">
          <p>Your scrapbook is empty. Start logging the places you've explored.</p>
          <Link to="/memories/create" className="btn btn-primary">Create your first memory</Link>
        </div>
      )}

      {!loading && memories.length > 0 && filteredMemories.length === 0 && (
        <p className="memories-empty-filter">No memories found for this country.</p>
      )}

      {filteredMemories.length > 0 && (
        <div className="memory-grid">
          {filteredMemories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
