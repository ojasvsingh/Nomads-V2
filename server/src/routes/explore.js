const router = require('express').Router()
const { explore } = require('../controllers/exploreController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

router.post('/', explore)

module.exports = router
