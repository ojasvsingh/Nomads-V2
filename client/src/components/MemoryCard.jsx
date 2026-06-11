import { useNavigate } from 'react-router-dom'
import { getFlagEmoji } from '../utils/countries'
import './MemoryCard.css'

// stable pseudo-random rotation per card so the scrapbook feel
// doesn't reshuffle on every re-render
function rotationFor(id) {
  const n = typeof id === 'number' ? id : String(id).split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
  return ((n * 47) % 7 - 3) * 1.1
}

export default function MemoryCard({ memory, onDelete }) {
  const navigate = useNavigate()
  const rotation = rotationFor(memory.id)
  const photo = memory.photos?.[0]

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(memory.id)
  }

  return (
    <div
      className="memory-card"
      style={{ '--rotation': `${rotation}deg` }}
      onClick={() => navigate(`/memories/${memory.id}`)}
    >
      <div className="memory-card-photo">
        {photo ? (
          <img src={photo} alt={memory.title} />
        ) : (
          <div className="memory-card-placeholder">
            <span>{getFlagEmoji(memory.countryCode)}</span>
          </div>
        )}
      </div>
      <div className="memory-card-caption">
        <h3>{memory.title}</h3>
        <p className="memory-card-meta">
          {getFlagEmoji(memory.countryCode)} {memory.country}
        </p>
        <p className="memory-card-date">
          {new Date(memory.visitedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
      {onDelete && (
        <button
          className="memory-card-delete"
          onClick={handleDelete}
          title="Delete memory"
          aria-label="Delete memory"
        >
          &times;
        </button>
      )}
    </div>
  )
}
