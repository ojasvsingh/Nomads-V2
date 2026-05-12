import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMemory } from '../api/memories'

export default function CreateMemory() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    country: '',
    visitedAt: '',
    isPublic: false
  })
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createMemory(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <div>
      <h1>Create Memory</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} />
        <input name="country" placeholder="Country" onChange={handleChange} />
        <input name="visitedAt" type="date" onChange={handleChange} />
        <textarea name="description" placeholder="Description" onChange={handleChange} />
        <label>
          <input name="isPublic" type="checkbox" onChange={handleChange} />
          Make public
        </label>
        <button type="submit">Save Memory</button>
      </form>
    </div>
  )
}