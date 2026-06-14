const Anthropic = require('@anthropic-ai/sdk')
const prisma = require('../lib/prisma')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.explore = async (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required' })

  try {
    const visited = await prisma.visitedCountry.findMany({
      where: { userId: req.user.id }
    })
    const visitedNames = visited.map(c => c.countryName)

    const systemPrompt = `You are a travel planning assistant for Nomads, a personal travel journal app.
The user has already visited: ${visitedNames.length ? visitedNames.join(', ') : 'no countries yet'}.
When suggesting destinations, prefer places they haven't visited, but you can suggest revisiting somewhere if it's a great fit for their request.
Give a clear, structured trip plan: suggested countries/cities, rough duration, estimated budget, and a few highlights for each.`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    })

    res.json({ reply: response.content[0].text })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
