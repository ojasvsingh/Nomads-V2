const router = require('express').Router()
const { register, login, me } = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.post('/me', authMiddleware,me)

module.exports = router