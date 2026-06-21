const router = require('express').Router()
const { explore, getExploreHistory } = require('../controllers/exploreController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

router.get('/', getExploreHistory)
router.post('/', explore)

module.exports = router
