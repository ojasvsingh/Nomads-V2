const router = require('express').Router()
const { createMemory, getMemories, getMemory, updateMemory, deleteMemory } = require('../controllers/memoryController')
const authMiddleware = require('../middleware/auth')

//user must be logged in to use any routes
router.use(authMiddleware)

router.post('/', createMemory)
router.get('/', getMemories)
router.get('/:id', getMemory)
router.put('/:id', updateMemory)
router.delete('/:id', deleteMemory)

module.exports = router
