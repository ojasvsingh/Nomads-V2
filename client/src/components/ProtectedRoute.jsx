import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'


//protected route to stop people from accessing dashboard without a login
export default function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token)

  if (!token) {
    return <Navigate to="/login" />
  }

  return children
}