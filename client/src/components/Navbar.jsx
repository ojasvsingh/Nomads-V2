import { NavLink, Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import './Navbar.css'

export default function Navbar() {
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) => (isActive ? 'active' : '')

  return (
    <header className="navbar">
      <Link to={token ? '/dashboard' : '/login'} className="navbar-brand">
        <span className="navbar-brand-icon" aria-hidden="true">🧭</span>
        Nomads
      </Link>

      <nav className="navbar-links">
        {token ? (
          <>
            <NavLink to="/dashboard" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/memories" end className={linkClass}>Memories</NavLink>
            <NavLink to="/memories/create" end className={linkClass}>New Memory</NavLink>
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
