import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getMe } from '../api/auth'
import { getMemories } from '../api/memories'
import { getVisitedCountries } from '../api/map'
import MemoryCard from '../components/MemoryCard'
import './Dashboard.css'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const setAuth = useAuthStore((state) => state.setAuth)
  const [memories, setMemories] = useState([])
  const [countriesVisited, setCountriesVisited] = useState(0)
  const [loading, setLoading] = useState(true)

  // user info isn't persisted across reloads, only the token is - refetch it if missing
  useEffect(() => {
    if (!user && token) {
      getMe().then((res) => setAuth(res.data, token)).catch(() => {})
    }
  }, [user, token, setAuth])

  useEffect(() => {
    const load = async () => {
      try {
        const [memoriesRes, countriesRes] = await Promise.all([getMemories(), getVisitedCountries()])
        setMemories(memoriesRes.data)
        setCountriesVisited(countriesRes.data.length)
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const recentMemories = memories.slice(0, 3)
  const mostRecent = memories[0]
  const displayName = user?.displayName || user?.username || 'traveler'

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <h1>Welcome back, {displayName}</h1>
        <p className="dashboard-subtitle">Here's a look at your journey so far.</p>
      </header>

      <div className="dashboard-stats">
        <div className="card stat-card">
          <span className="stat-value">{memories.length}</span>
          <span className="stat-label">Memories Logged</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{countriesVisited}</span>
          <span className="stat-label">Countries Visited</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value stat-value-sm">{mostRecent ? mostRecent.title : '—'}</span>
          <span className="stat-label">
            {mostRecent
              ? `Most Recent · ${mostRecent.country} · ${new Date(mostRecent.visitedAt).toLocaleDateString()}`
              : 'Most Recent Trip'}
          </span>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/memories/create" className="btn btn-primary">+ Add Memory</Link>
        <Link to="/map" className="btn btn-secondary">View Map</Link>
        <Link to="/memories" className="btn btn-secondary">View All Memories</Link>
        <Link to="/explore" className="btn btn-secondary">✈ Explore Trips</Link>
      </div>

      <section className="dashboard-recent">
        <div className="dashboard-recent-header">
          <h2>Recent Memories</h2>
          {memories.length > 3 && <Link to="/memories">See all memories →</Link>}
        </div>

        {loading && <p>Loading your memories…</p>}

        {!loading && memories.length === 0 && (
          <div className="card empty-state">
            <p>You haven't logged any memories yet. Your scrapbook is waiting.</p>
            <Link to="/memories/create" className="btn btn-primary">Create your first memory</Link>
          </div>
        )}

        {!loading && recentMemories.length > 0 && (
          <div className="memory-grid">
            {recentMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
