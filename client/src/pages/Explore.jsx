import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { askExplore } from '../api/explore'
import './Explore.css'

export default function Explore() {
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')
    setReply('')
    try {
      const res = await askExplore(message)
      setReply(res.data.reply)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page explore-page">
      <header className="explore-header">
        <h1>Explore</h1>
        <p className="explore-subtitle">
          Describe your dream trip and get a personalised plan based on where you've already been.
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

      {reply && !loading && (
        <div className="explore-reply card">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{reply}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
