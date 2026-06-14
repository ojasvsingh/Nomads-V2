import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createMemory } from '../api/memories'
import MemoryForm from '../components/MemoryForm'
import './MemoryFormPage.css'

export default function CreateMemory() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)

  const initialValues = location.state?.countryCode
    ? { countryCode: location.state.countryCode }
    : undefined

  const handleSubmit = async (data) => {
    setError(null)
    try {
      const res = await createMemory(data)
      navigate(`/memories/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <div className="page memory-form-page">
      <header className="memory-form-header">
        <h1>New Memory</h1>
        <p className="memory-form-subtitle">Add a fresh page to your travel scrapbook.</p>
      </header>
      <div className="card memory-form-card">
        <MemoryForm onSubmit={handleSubmit} submitLabel="Save Memory" error={error} initialValues={initialValues} />
      </div>
    </div>
  )
}
