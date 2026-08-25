const prisma = require('../lib/prisma')

//creates a new memory with country title and date, saves it to db with user id from the middleware auth
exports.createMemory = async (req, res) => {
  const { title, description, country, countryCode, visitedAt, visitedAtEnd, photos, isPublic, tripId } = req.body
  if (!title || !country || !countryCode || !visitedAt)
    return res.status(400).json({ error: 'Title, country, country code and date are required' })

  if (new Date(visitedAt) > new Date())
    return res.status(400).json({ error: 'Visit date cannot be in the future' })

  if (visitedAtEnd && new Date(visitedAtEnd) < new Date(visitedAt))
    return res.status(400).json({ error: 'End date cannot be before start date' })

  try {
    if (tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: parseInt(tripId) } })
      if (!trip || trip.userId !== req.user.id)
        return res.status(400).json({ error: 'Invalid trip' })
    }

    const memory = await prisma.memory.create({
      data: {
        title,
        description,
        country,
        countryCode,
        visitedAt: new Date(visitedAt),
        visitedAtEnd: visitedAtEnd ? new Date(visitedAtEnd) : null,
        photos: photos || [],
        isPublic: isPublic || false,
        userId: req.user.id,
        tripId: tripId ? parseInt(tripId) : null
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

//gets all memories for a user filtered by country code
exports.getMemoriesByCountry = async (req, res) => {
    try {
        const memories = await prisma.memory.findMany({
            where: { userId: req.user.id, countryCode: req.params.countryCode },
            orderBy: { visitedAt: 'desc' }
        })
        res.json(memories)
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
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
  const { title, description, country, countryCode, visitedAt, visitedAtEnd, photos, isPublic, tripId } = req.body
  try {
    const memory = await prisma.memory.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!memory) return res.status(404).json({ error: 'Memory not found' })
    if (memory.userId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' })

    if (visitedAt && new Date(visitedAt) > new Date())
      return res.status(400).json({ error: 'Visit date cannot be in the future' })

    const nextStart = visitedAt ? new Date(visitedAt) : memory.visitedAt
    if (visitedAtEnd && new Date(visitedAtEnd) < nextStart)
      return res.status(400).json({ error: 'End date cannot be before start date' })

    if (Object.prototype.hasOwnProperty.call(req.body, 'tripId') && tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: parseInt(tripId) } })
      if (!trip || trip.userId !== req.user.id)
        return res.status(400).json({ error: 'Invalid trip' })
    }

    const updated = await prisma.memory.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        description,
        country,
        countryCode,
        visitedAt: visitedAt ? new Date(visitedAt) : undefined,
        visitedAtEnd: Object.prototype.hasOwnProperty.call(req.body, 'visitedAtEnd')
          ? (visitedAtEnd ? new Date(visitedAtEnd) : null)
          : undefined,
        photos,
        isPublic,
        tripId: Object.prototype.hasOwnProperty.call(req.body, 'tripId')
          ? (tripId ? parseInt(tripId) : null)
          : undefined
      }
    })

    // keep the visited-countries list in sync if the country changed
    if (countryCode) {
      await prisma.visitedCountry.upsert({
        where: { userId_countryCode: { userId: req.user.id, countryCode } },
        update: {},
        create: { countryCode, countryName: country, userId: req.user.id }
      })
    }

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


