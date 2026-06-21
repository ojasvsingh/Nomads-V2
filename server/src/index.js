const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()
const authRoutes = require('./routes/auth')
const memoryRoutes = require('./routes/memories')
const mapRoutes = require('./routes/map')
const exploreRoutes = require('./routes/explore')
const uploadRoutes = require('./routes/upload')

//create express app and accept requests from react app
const app = express()
app.use(cors({origin: 'http://localhost:5173', credentials:true}))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))

app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' })) //test endpoint

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

app.use('/api/memories', memoryRoutes)
app.use('/api/map', mapRoutes)
app.use('/api/explore', exploreRoutes)
app.use('/api/upload', uploadRoutes)