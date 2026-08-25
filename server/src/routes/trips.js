const router = require('express').Router()
const { createTrip, getTrips, getTrip, updateTrip, deleteTrip } = require('../controllers/tripController')
const authMiddleware = require('../middleware/auth')

//user must be logged in to use any routes
router.use(authMiddleware)

router.post('/', createTrip)
router.get('/', getTrips)
router.get('/:id', getTrip)
router.put('/:id', updateTrip)
router.delete('/:id', deleteTrip)

module.exports = router
