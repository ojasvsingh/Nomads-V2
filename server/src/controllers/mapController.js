const prisma = require('../lib/prisma')

exports.getVisitedCountries = async (req, res) => {
  try {
    const countries = await prisma.visitedCountry.findMany({
      where: { userId: req.user.id }
    })
    res.json(countries)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

//marks and unmarks countries off of a click
exports.toggleCountry = async (req, res) => {
  const { countryCode, countryName } = req.body
  if (!countryCode || !countryName)
    return res.status(400).json({ error: 'Country code and name are required' })

  try {
    const existing = await prisma.visitedCountry.findUnique({
      where: { userId_countryCode: { userId: req.user.id, countryCode } }
    })

    if (existing) {
      await prisma.visitedCountry.delete({
        where: { userId_countryCode: { userId: req.user.id, countryCode } }
      })
      return res.json({ visited: false, countryCode })
    }

    const country = await prisma.visitedCountry.create({
      data: { countryCode, countryName, userId: req.user.id }
    })
    res.json({ visited: true, country })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}