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

export const createTrip = (data) => API.post('/trips', data)
export const getTrips = () => API.get('/trips')
export const getTrip = (id) => API.get(`/trips/${id}`)
export const updateTrip = (id, data) => API.put(`/trips/${id}`, data)
export const deleteTrip = (id) => API.delete(`/trips/${id}`)
