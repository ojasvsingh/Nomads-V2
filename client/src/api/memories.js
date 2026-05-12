import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5001/api'
})

//check for token and attach it to header automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const createMemory = (data) => API.post('/memories', data)
export const getMemories = () => API.get('/memories')
export const getMemory = (id) => API.get(`/memories/${id}`)
export const updateMemory = (id, data) => API.put(`/memories/${id}`, data)
export const deleteMemory = (id) => API.delete(`/memories/${id}`)