const express = require('express')
const cors = require('cors')
require('dotenv').config()
const authRoutes = require('./routes/auth')
const memoryRoutes = require('./routes/memories')

//create express app and accept requests from react app
const app = express()
app.use(cors({origin: 'http://localhost:5173', credentials:true}))
app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' })) //test endpoint

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

app.use('/api/memories', memoryRoutes)