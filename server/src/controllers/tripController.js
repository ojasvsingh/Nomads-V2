const prisma = require('../lib/prisma')

//creates a new trip with name, countries and date range, saves it to db with user id from the middleware auth
exports.createTrip = async (req, res) => {
  const { name, countryCodes, startDate, endDate, coverPhoto } = req.body
  if (!name || !Array.isArray(countryCodes) || countryCodes.length === 0 || !startDate || !endDate)
    return res.status(400).json({ error: 'Name, at least one country, start date and end date are required' })

  if (new Date(endDate) < new Date(startDate))
    return res.status(400).json({ error: 'End date cannot be before start date' })

  try {
    const trip = await prisma.trip.create({
      data: {
        name,
        countryCodes,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverPhoto: coverPhoto || null,
        userId: req.user.id
      }
    })
    res.status(201).json(trip)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

//gets all trips for a user, most recent trip date first
exports.getTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      orderBy: { startDate: 'desc' },
      include: { _count: { select: { memories: true } } }
    })
    res.json(trips)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

//gets a single trip by id, with its memories in chronological order. makes sure the trip belongs to the user
exports.getTrip = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { memories: { orderBy: { visitedAt: 'asc' } } }
    })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    if (trip.userId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' })
    res.json(trip)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

//updates a trip based on the id of the trip and user
exports.updateTrip = async (req, res) => {
  const { name, countryCodes, startDate, endDate, coverPhoto } = req.body
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    if (trip.userId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' })

    if (countryCodes !== undefined && (!Array.isArray(countryCodes) || countryCodes.length === 0))
      return res.status(400).json({ error: 'At least one country is required' })

    const nextStart = startDate ? new Date(startDate) : trip.startDate
    const nextEnd = endDate ? new Date(endDate) : trip.endDate
    if (nextEnd < nextStart)
      return res.status(400).json({ error: 'End date cannot be before start date' })

    const updated = await prisma.trip.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        countryCodes,
        startDate: startDate ? nextStart : undefined,
        endDate: endDate ? nextEnd : undefined,
        coverPhoto
      }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

//deletes a trip if the trip id and user id match. memories that belonged to it become standalone (tripId set to null)
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    if (trip.userId !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' })

    await prisma.trip.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Trip deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
