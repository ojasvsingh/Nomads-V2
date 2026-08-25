import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTrips } from '../api/trips'
import TripCard from '../components/TripCard'
import './Trips.css'

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await getTrips()
        setTrips(res.data)
      } catch (err) {
        setError('Failed to load trips')
      } finally {
        setLoading(false)
      }
    }
    fetchTrips()
  }, [])

  return (
    <div className="page trips-page">
      <header className="trips-header">
        <div>
          <h1>My Trips</h1>
          <p className="trips-subtitle">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned or logged
          </p>
        </div>
        <Link to="/trips/new" className="btn btn-primary">+ New Trip</Link>
      </header>

      {error && <p className="error-text">{error}</p>}

      {loading && <p>Loading your trips…</p>}

      {!loading && trips.length === 0 && (
        <div className="card empty-state">
          <p>You haven't created any trips yet. Group your memories by trip to see them together.</p>
          <Link to="/trips/new" className="btn btn-primary">Create your first trip</Link>
        </div>
      )}

      {trips.length > 0 && (
        <div className="memory-grid">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}
