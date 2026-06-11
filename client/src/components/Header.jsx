import { NavLink, Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import './Header.css'

export default function Header() {
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) => (isActive ? 'active' : '')

  return (
    <header className="app-header">
      <Link to={token ? '/dashboard' : '/login'} className="brand">Nomads</Link>

      <nav className="app-nav">
        {token ? (
          <>
            <NavLink to="/dashboard" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/memories" end className={linkClass}>Memories</NavLink>
            <NavLink to="/memories/create" end className={linkClass}>New Memory</NavLink>
            <NavLink to="/map" end className={linkClass}>Map</NavLink>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
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
