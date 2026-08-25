import { useNavigate } from 'react-router-dom'
import { getFlagEmoji } from '../utils/countries'
import './TripCard.css'

function formatRange(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} – ${endStr}`
}

export default function TripCard({ trip }) {
  const navigate = useNavigate()
  const memoryCount = trip._count?.memories ?? 0

  return (
    <div className="trip-card" onClick={() => navigate(`/trips/${trip.id}`)}>
      <div className="trip-card-photo">
        {trip.coverPhoto ? (
          <img src={trip.coverPhoto} alt={trip.name} />
        ) : (
          <div className="trip-card-placeholder">
            <span>{getFlagEmoji(trip.countryCode)}</span>
          </div>
        )}
      </div>
      <div className="trip-card-caption">
        <h3>{trip.name}</h3>
        <p className="trip-card-meta">
          {getFlagEmoji(trip.countryCode)} {trip.country}
        </p>
        <p className="trip-card-date">{formatRange(trip.startDate, trip.endDate)}</p>
        <p className="trip-card-count">{memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}</p>
      </div>
    </div>
  )
}
