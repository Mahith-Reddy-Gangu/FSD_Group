import cors from 'cors'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, 'data.json')
const port = Number(process.env.PORT || 4000)
const jwtSecret = process.env.JWT_SECRET || 'campusloop-local-development-secret'

const seed = {
  users: [{
    id: 'user-maya',
    name: 'Maya Patel',
    course: 'Computer Science · Year 3',
    email: 'maya.patel@campus.edu',
    passwordHash: bcrypt.hashSync('campusloop', 10),
    role: 'student',
  }],
  listings: [
    { id: 'listing-1', title: 'Casio fx-991EX Calculator', category: 'Study gear', condition: 'Like new', mode: 'Borrow', price: 'Free', owner: 'Nisha Rao', initials: 'NR', color: 'coral', image: 'https://images.unsplash.com/photo-1616628182503-47a55d7f2d91?auto=format&fit=crop&w=900&q=80', savedBy: [] },
    { id: 'listing-2', title: 'Introduction to Algorithms', category: 'Books', condition: 'Good', mode: 'Exchange', price: 'For a book', owner: 'Arjun Mehta', initials: 'AM', color: 'blue', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80', savedBy: ['user-maya'] },
    { id: 'listing-3', title: 'Sony WH-1000XM4 Headphones', category: 'Electronics', condition: 'Excellent', mode: 'Borrow', price: 'Free', owner: 'Diya Shah', initials: 'DS', color: 'green', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80', savedBy: [] },
    { id: 'listing-4', title: 'IKEA Desk Lamp', category: 'Room & living', condition: 'Good', mode: 'Give away', price: 'Free', owner: 'Kabir Singh', initials: 'KS', color: 'yellow', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80', savedBy: [] },
  ],
  events: [
    { id: 'event-1', month: 'OCT', day: '14', title: 'Designing for a more human campus', type: 'Talk', time: '5:30 PM - 7:00 PM', place: 'Innovation Lab', host: 'Design Society', color: 'mint', spots: 48, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80', description: 'A practical conversation about the small systems that make campus life feel welcoming, legible, and shared.' },
    { id: 'event-2', month: 'OCT', day: '18', title: 'Sunset community run', type: 'Wellbeing', time: '6:00 AM - 7:30 AM', place: 'East Gate Lawn', host: 'Campus Athletics', color: 'orange', spots: 24, image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1000&q=80', description: 'Start the weekend with a relaxed 5K loop around campus. All paces welcome, no timing pressure.' },
    { id: 'event-3', month: 'OCT', day: '22', title: 'Open mic: after hours', type: 'Community', time: '7:00 PM - 9:30 PM', place: 'The Courtyard', host: 'Arts Collective', color: 'purple', spots: 12, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80', description: 'Bring a song, a poem, a story, or simply a friend. The stage is yours for ten minutes.' },
  ],
  registrations: ['event-2'],
  requests: [],
}

function readData() {
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify(seed, null, 2))
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
}

function publicUser(user) {
  const { passwordHash, ...safeUser } = user
  return safeUser
}

function tokenFor(user) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' })
}

function requireAuth(request, response, next) {
  const header = request.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return response.status(401).json({ message: 'Authentication required.' })
  try {
    const payload = jwt.verify(token, jwtSecret)
    const data = readData()
    const user = data.users.find(item => item.id === payload.sub)
    if (!user) return response.status(401).json({ message: 'Session is no longer valid.' })
    request.user = user
    next()
  } catch {
    response.status(401).json({ message: 'Session is no longer valid.' })
  }
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'campusloop-api' }))

app.post('/api/auth/login', (request, response) => {
  const { email, password } = request.body
  const data = readData()
  const user = data.users.find(item => item.email.toLowerCase() === String(email || '').toLowerCase())
  if (!user || !bcrypt.compareSync(String(password || ''), user.passwordHash)) return response.status(401).json({ message: 'Email or password is incorrect.' })
  response.json({ token: tokenFor(user), user: publicUser(user) })
})

app.post('/api/auth/register', (request, response) => {
  const { name, course, email, password } = request.body
  if (!name || !course || !email || !password || String(password).length < 6) return response.status(400).json({ message: 'Name, course, email, and a password of at least 6 characters are required.' })
  const data = readData()
  if (data.users.some(user => user.email.toLowerCase() === String(email).toLowerCase())) return response.status(409).json({ message: 'An account with this email already exists.' })
  const user = { id: `user-${Date.now()}`, name: name.trim(), course: course.trim(), email: email.trim().toLowerCase(), passwordHash: bcrypt.hashSync(String(password), 10), role: 'student' }
  data.users.push(user)
  writeData(data)
  response.status(201).json({ token: tokenFor(user), user: publicUser(user) })
})

app.post('/api/auth/demo', (_request, response) => {
  const user = readData().users[0]
  response.json({ token: tokenFor(user), user: publicUser(user) })
})

app.get('/api/auth/me', requireAuth, (request, response) => response.json({ user: publicUser(request.user) }))

app.get('/api/listings', requireAuth, (request, response) => {
  const data = readData()
  response.json({ listings: data.listings.map(item => ({ ...item, saved: item.savedBy.includes(request.user.id) })) })
})

app.post('/api/listings', requireAuth, (request, response) => {
  const { title, category, condition, mode, price, image } = request.body
  if (!title || !category || !condition || !mode) return response.status(400).json({ message: 'Title, category, condition, and exchange mode are required.' })
  const data = readData()
  const listing = { id: `listing-${Date.now()}`, title: title.trim(), category, condition, mode, price: price || 'Free', image: image || 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80', owner: request.user.name, initials: request.user.name.split(' ').map(part => part[0]).join(''), color: 'blue', savedBy: [] }
  data.listings.unshift(listing)
  writeData(data)
  response.status(201).json({ listing: { ...listing, saved: false } })
})

app.patch('/api/listings/:id/save', requireAuth, (request, response) => {
  const data = readData()
  const listing = data.listings.find(item => item.id === request.params.id)
  if (!listing) return response.status(404).json({ message: 'Listing not found.' })
  const saved = listing.savedBy.includes(request.user.id)
  listing.savedBy = saved ? listing.savedBy.filter(id => id !== request.user.id) : [...listing.savedBy, request.user.id]
  writeData(data)
  response.json({ saved: !saved })
})

app.post('/api/listings/:id/requests', requireAuth, (request, response) => {
  const data = readData()
  const listing = data.listings.find(item => item.id === request.params.id)
  if (!listing) return response.status(404).json({ message: 'Listing not found.' })
  const exchangeRequest = { id: `request-${Date.now()}`, listingId: listing.id, requesterId: request.user.id, status: 'Pending', createdAt: new Date().toISOString() }
  data.requests.push(exchangeRequest)
  writeData(data)
  response.status(201).json({ request: exchangeRequest })
})

app.get('/api/requests/my', requireAuth, (request, response) => {
  const data = readData()
  const requests = data.requests.filter(item => item.requesterId === request.user.id).map(item => ({ ...item, listing: data.listings.find(listing => listing.id === item.listingId) }))
  response.json({ requests })
})

app.get('/api/events', requireAuth, (request, response) => {
  const data = readData()
  response.json({ events: data.events.map(event => ({ ...event, registered: data.registrations.includes(event.id) })) })
})

app.post('/api/events/:id/registration', requireAuth, (request, response) => {
  const data = readData()
  const event = data.events.find(item => item.id === request.params.id)
  if (!event) return response.status(404).json({ message: 'Event not found.' })
  const registered = data.registrations.includes(event.id)
  data.registrations = registered ? data.registrations.filter(id => id !== event.id) : [...data.registrations, event.id]
  writeData(data)
  response.json({ registered: !registered })
})

app.patch('/api/profile', requireAuth, (request, response) => {
  const data = readData()
  const user = data.users.find(item => item.id === request.user.id)
  const { name, course, email } = request.body
  if (!name || !course || !email) return response.status(400).json({ message: 'Name, course, and email are required.' })
  user.name = name.trim()
  user.course = course.trim()
  user.email = email.trim()
  writeData(data)
  response.json({ user: publicUser(user) })
})

app.listen(port, () => console.log(`CampusLoop API running on http://localhost:${port}`))