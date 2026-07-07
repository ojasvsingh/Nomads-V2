const bcrypt = require('bcryptjs') //hashes passwords
const jwt = require('jsonwebtoken') //token
const prisma = require('../lib/prisma') //connects to db

//creates token with username and password
const generateToken = (user) =>
  jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' })

//register function
exports.register = async (req, res) => {
  const { email, username, password } = req.body
  if (!email || !username || !password)
    return res.status(400).json({ error: 'All fields are required' })

  //if someone has that user or email reject the register
  try {
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    })
    if (exists) return res.status(409).json({ error: 'Email or username already taken' })

    //hash the password and put it in the db
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, username, passwordHash }
    })

    //return token and user info for login
    res.status(201).json({ token: generateToken(user), user: { id: user.id, username: user.username, email: user.email } })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

//login function => looks up user by email and compares the password against stored hash, if valid return token and user info
exports.login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' })

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    res.json({ token: generateToken(user), user: { id: user.id, username: user.username, email: user.email } })
  } catch (err) {
    console.error('LOGIN ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

//function to fetch the currenclty logged in user's profile. Protected by auth middleware so req.user already has their id from the token
exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, username: true, displayName: true, bio: true, avatarUrl: true, isPrivate: true }
    })
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
}

