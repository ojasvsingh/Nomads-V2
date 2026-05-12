import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return (
    <div>
      <h1>Welcome {user?.username}!</h1>
      <button onClick={() => navigate('/memories')}>My Memories</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}