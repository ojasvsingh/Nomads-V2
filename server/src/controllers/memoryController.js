const prisma = require('../lib/prisma')

//creates a new memory with country title and date, saves it to db with user id from the middleware auth
exports.createMemory = async (req, res) => {
  const { title, description, country, countryCode, visitedAt, isPublic } = req.body
  if (!title || !country || !countryCode || !visitedAt)
    return res.status(400).json({ error: 'Title, country, country code and date are required' })

  try {
    const memory = await prisma.memory.create({
      data: {
        title,
        description,
        country,
        countryCode,
        visitedAt: new Date(visitedAt),
        isPublic: isPublic || false,
        userId: req.user.id
      }
    })

    // auto mark country as visited
    await prisma.visitedCountry.upsert({
      where: { userId_countryCode: { userId: req.user.id, countryCode } },
      update: {},
      create: { countryCode, countryName: country, userId: req.user.id }
    })

    res.status(201).json(memory)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

//gets all memories for a user
exports.getMemories = async (req, res) => {
    try {
        const memories = await prisma.memory.findMany({
            where: {userId: req.user.id },
            orderBy: { visitedAt: 'desc' }
        })
        res.json(memories)
    } catch (err) {
        res.status(500).json({ error: 'Server error '})
    }
}

//gets a single memory by id. makes sure the id in the memory matches the user id
exports.getMemory = async (req, res) => {
  try {
    const memory = await prisma.memory.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!memory) return res.status(404).json({ error: 'Memory not found' })
    if (memory.userId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' })
    res.json(memory)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

//updates a memory based on the id of the memory and user
exports.updateMemory = async (req, res) => {
  const { title, description, country, visitedAt, isPublic } = req.body
  try {
    const memory = await prisma.memory.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!memory) return res.status(404).json({ error: 'Memory not found' })
    if (memory.userId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' })

    const updated = await prisma.memory.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, country, visitedAt: new Date(visitedAt), isPublic }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

//deletes a memory if the memory id and user id match
exports.deleteMemory = async (req, res) => {
  try {
    const memory = await prisma.memory.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!memory) return res.status(404).json({ error: 'Memory not found' })
    if (memory.userId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' })

    await prisma.memory.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Memory deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}


