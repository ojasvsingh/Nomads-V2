import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import useAuthStore from '../store/authStore'
import './Auth.css'

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await register(form)
      setAuth(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <div className="auth-logo" aria-hidden="true">🧭</div>
        <h1>Join Nomads</h1>
        <p className="auth-subtitle">Create an account to start your scrapbook.</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="wanderlust92"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
