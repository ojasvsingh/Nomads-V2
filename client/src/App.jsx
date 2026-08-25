import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import CreateMemory from './pages/CreateMemory'
import Memories from './pages/Memories'
import Memory from './pages/Memory'
import EditMemory from './pages/EditMemory'
import Trips from './pages/Trips'
import Trip from './pages/Trip'
import CreateTrip from './pages/CreateTrip'
import Map from './pages/Map'
import Explore from './pages/Explore'

export default function App() {
  return (
    //render the corresponding page based on the route
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/memories/create" element={
          <ProtectedRoute>
            <CreateMemory />
          </ProtectedRoute>
        } />
        <Route path="/memories" element={
          <ProtectedRoute>
            <Memories />
          </ProtectedRoute>
        } />
        <Route path="/memories/:id/edit" element={
          <ProtectedRoute>
            <EditMemory />
          </ProtectedRoute>
        } />
        <Route path="/memories/:id" element={
          <ProtectedRoute>
            <Memory />
          </ProtectedRoute>
        } />
        <Route path="/trips/new" element={
          <ProtectedRoute>
            <CreateTrip />
          </ProtectedRoute>
        } />
        <Route path="/trips/:id" element={
          <ProtectedRoute>
            <Trip />
          </ProtectedRoute>
        } />
        <Route path="/trips" element={
          <ProtectedRoute>
            <Trips />
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}