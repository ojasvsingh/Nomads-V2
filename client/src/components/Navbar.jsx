import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import logo from '../assets/Nomads_logo2TB.jpeg'
import './Navbar.css'

export default function Navbar() {
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const createRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (createRef.current && !createRef.current.contains(e.target)) setCreateOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) => (isActive ? 'active' : '')

  return (
    <header className="navbar">
      <Link to={token ? '/dashboard' : '/login'} className="navbar-brand">
        <img src={logo} alt="Nomads" className="navbar-brand-logo" />
      </Link>

      <nav className="navbar-links">
        {token ? (
          <>
            <NavLink to="/dashboard" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/trips" end className={linkClass}>My Trips</NavLink>
            <div className="navbar-create" ref={createRef}>
              <button
                type="button"
                className="navbar-create-trigger"
                onClick={() => setCreateOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={createOpen}
              >
                Create
              </button>
              {createOpen && (
                <div className="navbar-create-menu">
                  <Link to="/trips/new" onClick={() => setCreateOpen(false)}>Create a Trip</Link>
                  <Link to="/memories/create" onClick={() => setCreateOpen(false)}>Create a Memory</Link>
                </div>
              )}
            </div>
            <NavLink to="/map" end className={linkClass}>Map</NavLink>
            <NavLink to="/explore" end className={linkClass}>Explore</NavLink>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" end className={linkClass}>Login</NavLink>
            <NavLink to="/register" end className={linkClass}>Register</NavLink>
          </>
        )}
      </nav>
    </header>
  )
}
