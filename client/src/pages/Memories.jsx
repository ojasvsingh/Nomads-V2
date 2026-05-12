import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMemories, deleteMemory } from '../api/memories'

export default function Memories() {
    const [memories, setMemories] = useState([])
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const res = await getMemories()
                setMemories(res.data)
            }catch (err) {
                setError('Failed to load memories')
            }
        }
        fetchMemories()
    }, [])

    const handleDelete = async (id) => {
        try {
            await deleteMemory(id)
            setMemories(memories.filter((m) => m.id !== id))
        } catch (err) {
            setError('Failed to delete memory')
        }
    }

  return (
    <div>
      <h1>My Memories</h1>
      <button onClick={() => navigate('/memories/create')}>+ New Memory</button>
      {error && <p>{error}</p>}
      {memories.map((memory) => (
        <div key={memory.id}>
          <h2>{memory.title}</h2>
          <p>{memory.country}</p>
          <p>{new Date(memory.visitedAt).toLocaleDateString()}</p>
          <p>{memory.description}</p>
          <button onClick={() => handleDelete(memory.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}