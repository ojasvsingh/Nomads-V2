import useAuthStore from '../store/authStore'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div>
      <h1>Welcome {user?.username}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}