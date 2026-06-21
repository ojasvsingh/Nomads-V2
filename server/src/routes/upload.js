const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middleware/auth')

const uploadsDir = path.join(__dirname, '../../public/uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, unique + path.extname(file.originalname).toLowerCase())
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only image files are allowed'))
  }
})

router.post('/', authMiddleware, upload.array('photos', 10), (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`
  const urls = req.files.map(f => `${baseUrl}/uploads/${f.filename}`)
  res.json({ urls })
})

module.exports = router
