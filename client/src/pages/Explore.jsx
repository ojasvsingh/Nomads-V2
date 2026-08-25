import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { askExplore, getExploreHistory } from '../api/explore'
import './Explore.css'

export default function Explore() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    getExploreHistory()
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await askExplore(message)
      const newSession = {
        id: Date.now(),
        prompt: message,
        reply: res.data.reply,
        createdAt: new Date().toISOString()
      }
      setHistory(prev => [newSession, ...prev])
      setExpandedId(newSession.id)
      setMessage('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="page explore-page">
      <header className="explore-header">
        <h1>Explore</h1>
        <p className="explore-subtitle">
          Describe your dream trip and get a personalised plan based on what you like.
        </p>
      </header>

      <form className="explore-form card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="explore-input">What kind of trip are you dreaming of?</label>
          <textarea
            id="explore-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. 10-day beach trip in Southeast Asia under $2000, or cozy rainy cities in Europe..."
            rows={4}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary explore-submit"
          disabled={loading || !message.trim()}
        >
          {loading ? 'Planning…' : 'Plan my trip →'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading && (
        <div className="explore-loading card">
          <p>Crafting your trip plan…</p>
        </div>
      )}

      {!historyLoading && history.length === 0 && !loading && (
        <div className="card empty-state">
          <p>No trip plans yet — describe your dream trip above to get started.</p>
        </div>
      )}

      {history.length > 0 && (
        <section className="explore-history">
          <h2>Trip Plans</h2>
          <div className="explore-history-list">
            {history.map(session => (
              <div key={session.id} className="explore-history-item card">
                <button
                  className="explore-history-toggle"
                  onClick={() => toggleExpand(session.id)}
                >
                  <span className="explore-history-prompt">{session.prompt}</span>
                  <span className="explore-history-meta">
                    {new Date(session.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                    <span className="explore-history-chevron">
                      {expandedId === session.id ? '▲' : '▼'}
                    </span>
                  </span>
                </button>
                {expandedId === session.id && (
                  <div className="explore-reply">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{session.reply}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
