const router = require('express').Router()
const { getVisitedCountries, toggleCountry } = require('../controllers/mapController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

router.get('/', getVisitedCountries)
router.post('/toggle', toggleCountry)

module.exports = router