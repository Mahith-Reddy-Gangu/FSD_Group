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

const clubs = [
  { id: 'yrc', name: 'Youth Red Cross (YRC)' },
  { id: 'painting-animation', name: 'Painting and Animation' },
  { id: 'student-council', name: 'Student Council' },
  { id: 'athletics', name: 'Athletics' },
]

const seed = {
  users: [{
    id: 'user-maya',
    name: 'Maya Patel',
    branch: 'Computer Science',
    year: '3',
    hostel: '',
    email: 'maya.patel@student.nitw.ac.in',
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
    { id: 'event-yrc-blood-donation', title: 'Blood Donation Camp', type: 'Community service', time: 'To be announced', place: 'Student Activity Centre', host: 'Youth Red Cross (YRC)', clubId: 'yrc', color: 'mint', spots: 0, image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=80', description: 'A campus blood donation drive organized by YRC. Event date and registration details will be announced by the club.', date: null },
    { id: 'event-painting-face-painting', title: 'Face Painting', type: 'Arts & culture', time: 'To be announced', place: 'Student Activity Centre', host: 'Painting and Animation', clubId: 'painting-animation', color: 'purple', spots: 0, image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=80', description: 'A creative face-painting session hosted by Painting and Animation. Event date and registration details will be announced by the club.', date: null },
    { id: 'event-student-council-diwali', title: 'Diwali Celebration', type: 'Festival', time: 'To be announced', place: 'NIT Warangal Stadium', host: 'Student Council', clubId: 'student-council', color: 'orange', spots: 0, image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1000&q=80', description: 'A campus Diwali celebration organized by the Student Council at the stadium. Event date and registration details will be announced.', date: null },
    { id: 'event-athletics-badminton', title: 'Intramural Badminton', type: 'Sports', time: 'To be announced', place: 'Indoor Badminton Courts', host: 'Athletics', clubId: 'athletics', color: 'blue', spots: 0, image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80', description: 'An Athletics-organized intramural badminton event for students. Event date and registration details will be announced by the club.', date: null },
  ],
  registrations: [],
  requests: [],
  offers: [],
  clubs,
  clubMemberships: clubs.map(club => ({ clubId: club.id, userId: 'user-maya', joinedAt: new Date().toISOString() })),
  clubJoinRequests: [],
}

function readData() {
  if (!fs.existsSync(dataPath)) {
    const initialData = { ...seed, users: seed.users.map(user => ({ ...user, createdAt: new Date().toISOString() })) }
    writeData(initialData)
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  let migrated = false
  const seenEmails = new Set()
  for (const user of data.users) {
    if (user.role === 'student' && !/^[^\s@]+@student\.nitw\.ac\.in$/i.test(user.email)) {
      user.email = `${user.email.split('@')[0]}@student.nitw.ac.in`.toLowerCase()
      migrated = true
    }
    if (seenEmails.has(user.email.toLowerCase())) throw new Error(`Duplicate student email after domain migration: ${user.email}`)
    seenEmails.add(user.email.toLowerCase())
    if (!user.branch) {
      user.branch = String(user.course || '').replace(/\s*[·-]\s*Year\s*\d+/i, '')
      if (!user.year && user.course) user.year = String(user.course.match(/(?:Year\s*)(\d+)/i)?.[1] || '')
      delete user.course
      migrated = true
    }
    if (user.year !== undefined) user.year = String(user.year)
    if (!user.createdAt) {
      user.createdAt = new Date().toISOString()
      migrated = true
    }
    if (!user.hostel) {
      user.hostel = ''
      migrated = true
    }
    if (typeof user.phone !== 'string') {
      user.phone = ''
      migrated = true
    }
  }
  if (!Array.isArray(data.registrations)) {
    data.registrations = []
    migrated = true
  } else if (data.registrations.some(registration => typeof registration === 'string' || !registration?.eventId || !registration?.userId)) {
    data.registrations = data.registrations.filter(registration => registration && typeof registration === 'object' && registration.eventId && registration.userId)
    migrated = true
  }
  if (!data.eventSchemaVersion) {
    data.events = seed.events.map(event => ({ ...event }))
    data.registrations = []
    data.eventSchemaVersion = 1
    migrated = true
  }
  if (!Array.isArray(data.clubs)) {
    data.clubs = clubs.map(club => ({ ...club }))
    migrated = true
  }
  if (!Array.isArray(data.clubMemberships)) {
    data.clubMemberships = clubs.map(club => ({ clubId: club.id, userId: 'user-maya', joinedAt: new Date().toISOString() }))
    migrated = true
  }
  if (!Array.isArray(data.clubJoinRequests)) {
    data.clubJoinRequests = []
    migrated = true
  }
  if (migrated) writeData(data)
  return data
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
app.use(express.json({ limit: '4mb' }))

app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'campusloop-api' }))

app.post('/api/auth/login', (request, response) => {
  const { email, password } = request.body
  const data = readData()
  const user = data.users.find(item => item.email.toLowerCase() === String(email || '').toLowerCase())
  if (!user || !bcrypt.compareSync(String(password || ''), user.passwordHash)) return response.status(401).json({ message: 'Email or password is incorrect.' })
  response.json({ token: tokenFor(user), user: publicUser(user) })
})

app.post('/api/auth/register', (request, response) => {
  const { name, branch, year, hostel = '', phone, email, password } = request.body
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : ''
  const phoneDigits = normalizedPhone.replace(/\D/g, '')
  if (!name || !branch || !year || !normalizedEmail || !password || String(password).length < 6 || !normalizedPhone) return response.status(400).json({ message: 'Name, branch, year, phone number, student email, and a password of at least 6 characters are required.' })
  if (!/^[^\s@]+@student\.nitw\.ac\.in$/.test(normalizedEmail)) return response.status(400).json({ message: 'Use your @student.nitw.ac.in student email address.' })
  if (!/^\+?[0-9().\-\s]+$/.test(normalizedPhone) || phoneDigits.length < 7 || phoneDigits.length > 15) return response.status(400).json({ message: 'Enter a valid phone number with 7 to 15 digits.' })
  if (String(name).trim().length > 100 || String(branch).trim().length > 100 || String(year).trim().length > 20 || String(hostel).trim().length > 100 || normalizedPhone.length > 25) return response.status(400).json({ message: 'Name, branch, year, hostel, or phone number is too long.' })
  const data = readData()
  if (data.users.some(user => user.email.toLowerCase() === normalizedEmail)) return response.status(409).json({ message: 'An account with this email already exists.' })
  const user = { id: `user-${Date.now()}`, name: name.trim(), branch: branch.trim(), year: String(year).trim(), hostel: String(hostel).trim(), phone: normalizedPhone, email: normalizedEmail, passwordHash: bcrypt.hashSync(String(password), 10), role: 'student', createdAt: new Date().toISOString() }
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
  const listings = data.listings
    .filter(item => item.postType === 'wanted' && (item.status === 'Open' || item.ownerId === request.user.id))
    .map(item => ({ ...item, saved: (item.savedBy || []).includes(request.user.id) }))
  response.json({ listings })
})

app.post('/api/listings', requireAuth, (request, response) => {
  const { title, category, description = '', image = '' } = request.body
  const categories = ['Books', 'Electronics', 'Study gear', 'Room & living']
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 120 || !categories.includes(category)) {
    return response.status(400).json({ message: 'A title (up to 120 characters) and a valid category are required.' })
  }
  if (typeof description !== 'string' || description.length > 500) return response.status(400).json({ message: 'The description must be 500 characters or fewer.' })
  if (typeof image !== 'string' || (image && (!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(image) || image.length > 3 * 1024 * 1024))) {
    return response.status(400).json({ message: 'Choose a JPEG image smaller than 2 MB after resizing.' })
  }
  const data = readData()
  const listing = {
    id: `listing-${Date.now()}`,
    postType: 'wanted',
    status: 'Open',
    title: title.trim(),
    category,
    description: description.trim(),
    image,
    ownerId: request.user.id,
    owner: request.user.name,
    initials: request.user.name.split(' ').map(part => part[0]).join(''),
    color: 'blue',
    createdAt: new Date().toISOString(),
    savedBy: [],
  }
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

app.post('/api/listings/:id/offers', requireAuth, (request, response) => {
  const data = readData()
  const listing = data.listings.find(item => item.id === request.params.id && item.postType === 'wanted')
  if (!listing) return response.status(404).json({ message: 'Resource request not found.' })
  if (listing.status !== 'Open') return response.status(409).json({ message: 'This resource request is already closed.' })
  if (listing.ownerId === request.user.id) return response.status(403).json({ message: 'You cannot send an offer to your own request.' })
  const message = typeof request.body.message === 'string' ? request.body.message.trim() : ''
  if (!message || message.length > 1000) return response.status(400).json({ message: 'Write a message of up to 1,000 characters.' })
  data.offers ||= []
  const offer = {
    id: `offer-${Date.now()}`,
    listingId: listing.id,
    senderId: request.user.id,
    recipientId: listing.ownerId,
    message,
    createdAt: new Date().toISOString(),
  }
  data.offers.push(offer)
  writeData(data)
  response.status(201).json({ offer })
})

app.get('/api/offers/my', requireAuth, (request, response) => {
  const data = readData()
  const offers = (data.offers || [])
    .filter(offer => offer.recipientId === request.user.id)
    .map(offer => ({
      ...offer,
      senderName: data.users.find(user => user.id === offer.senderId)?.name || 'Campus student',
      senderEmail: data.users.find(user => user.id === offer.senderId)?.email || '',
      senderPhone: data.users.find(user => user.id === offer.senderId)?.phone || '',
      listing: data.listings.find(item => item.id === offer.listingId),
    }))
  response.json({ offers })
})

app.patch('/api/listings/:id/close', requireAuth, (request, response) => {
  const data = readData()
  const listing = data.listings.find(item => item.id === request.params.id && item.postType === 'wanted')
  if (!listing) return response.status(404).json({ message: 'Resource request not found.' })
  if (listing.ownerId !== request.user.id) return response.status(403).json({ message: 'Only the student who posted this request can close it.' })
  if (listing.status !== 'Open') return response.status(409).json({ message: 'This resource request is already closed.' })
  listing.status = 'Fulfilled'
  listing.closedAt = new Date().toISOString()
  writeData(data)
  response.json({ listing })
})

app.get('/api/requests/my', requireAuth, (request, response) => {
  const data = readData()
  const requests = data.requests.filter(item => item.requesterId === request.user.id).map(item => ({ ...item, listing: data.listings.find(listing => listing.id === item.listingId) }))
  response.json({ requests })
})

app.get('/api/events', requireAuth, (request, response) => {
  const data = readData()
  const visibleCount = new Map()
  const events = data.events.filter(event => {
    const count = visibleCount.get(event.clubId) || 0
    if (count >= 2) return false
    visibleCount.set(event.clubId, count + 1)
    return true
  })
  response.json({ events: events.map(event => ({
    ...event,
    registered: data.registrations.some(registration => registration.eventId === event.id && registration.userId === request.user.id),
  })) })
})

app.get('/api/clubs', requireAuth, (request, response) => {
  const data = readData()
  const result = data.clubs.map(club => {
    const isMember = data.clubMemberships.some(member => member.clubId === club.id && member.userId === request.user.id)
    const joinRequest = data.clubJoinRequests.find(item => item.clubId === club.id && item.userId === request.user.id && item.status === 'pending')
    const pendingRequests = isMember
      ? data.clubJoinRequests.filter(item => item.clubId === club.id && item.status === 'pending').map(item => ({
        id: item.id,
        userId: item.userId,
        name: data.users.find(user => user.id === item.userId)?.name || 'Campus student',
      }))
      : []
    return { ...club, isMember, requestPending: Boolean(joinRequest), pendingRequests }
  })
  response.json({ clubs: result })
})

app.post('/api/clubs/:id/join-requests', requireAuth, (request, response) => {
  const data = readData()
  const club = data.clubs.find(item => item.id === request.params.id)
  if (!club) return response.status(404).json({ message: 'Club not found.' })
  if (data.clubMemberships.some(item => item.clubId === club.id && item.userId === request.user.id)) return response.status(409).json({ message: 'You are already a member of this club.' })
  if (data.clubJoinRequests.some(item => item.clubId === club.id && item.userId === request.user.id && item.status === 'pending')) return response.status(409).json({ message: 'Your request to join this club is already pending.' })
  const joinRequest = { id: `club-request-${Date.now()}`, clubId: club.id, userId: request.user.id, status: 'pending', createdAt: new Date().toISOString() }
  data.clubJoinRequests.push(joinRequest)
  writeData(data)
  response.status(201).json({ request: joinRequest })
})

app.post('/api/clubs/:id/join-requests/:requestId/approve', requireAuth, (request, response) => {
  const data = readData()
  const club = data.clubs.find(item => item.id === request.params.id)
  if (!club) return response.status(404).json({ message: 'Club not found.' })
  if (!data.clubMemberships.some(item => item.clubId === club.id && item.userId === request.user.id)) return response.status(403).json({ message: 'Only an existing club member can approve membership requests.' })
  const joinRequest = data.clubJoinRequests.find(item => item.id === request.params.requestId && item.clubId === club.id)
  if (!joinRequest || joinRequest.status !== 'pending') return response.status(404).json({ message: 'Pending membership request not found.' })
  joinRequest.status = 'approved'
  joinRequest.approvedAt = new Date().toISOString()
  joinRequest.approvedBy = request.user.id
  data.clubMemberships.push({ clubId: club.id, userId: joinRequest.userId, joinedAt: joinRequest.approvedAt })
  writeData(data)
  response.json({ approved: true })
})

app.post('/api/events', requireAuth, (request, response) => {
  const { title, type, date, time, place, description = '', clubId } = request.body
  const data = readData()
  const club = data.clubs.find(item => item.id === clubId)
  if (!club) return response.status(400).json({ message: 'Choose a valid organizing club.' })
  if (!data.clubMemberships.some(item => item.clubId === club.id && item.userId === request.user.id)) return response.status(403).json({ message: 'You must be an approved member of the organizing club to post an event.' })
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 100 || typeof type !== 'string' || !type.trim() || type.trim().length > 60) return response.status(400).json({ message: 'Event name and type are required and must be within 100 and 60 characters.' })
  const parsedDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00.000Z`) : null
  const today = new Date().toISOString().slice(0, 10)
  if (!parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date || date < today) return response.status(400).json({ message: 'Choose a valid date today or later.' })
  if (typeof time !== 'string' || !time.trim() || time.trim().length > 80 || typeof place !== 'string' || !place.trim() || place.trim().length > 120) return response.status(400).json({ message: 'Event time and location are required.' })
  if (typeof description !== 'string' || description.length > 500) return response.status(400).json({ message: 'Event details must be 500 characters or fewer.' })
  const upcomingCount = data.events.filter(event => event.clubId === club.id && (!event.date || event.date >= today)).length
  if (upcomingCount >= 2) return response.status(409).json({ message: 'This club already has two upcoming events listed.' })
  const event = {
    id: `event-${Date.now()}`,
    title: title.trim(),
    type: type.trim(),
    date,
    day: String(Number(date.slice(8, 10))),
    month: new Date(`${date}T00:00:00`).toLocaleString('en', { month: 'short' }).toUpperCase(),
    time: time.trim(),
    place: place.trim(),
    description: description.trim(),
    host: club.name,
    clubId: club.id,
    color: ['mint', 'purple', 'orange', 'blue'][data.events.length % 4],
    spots: 0,
    image: '',
    createdBy: request.user.id,
  }
  data.events.push(event)
  writeData(data)
  response.status(201).json({ event: { ...event, registered: false } })
})

app.delete('/api/events/:id', requireAuth, (request, response) => {
  const data = readData()
  const eventIndex = data.events.findIndex(item => item.id === request.params.id)
  if (eventIndex < 0) return response.status(404).json({ message: 'Event not found.' })
  const event = data.events[eventIndex]
  if (!data.clubMemberships.some(item => item.clubId === event.clubId && item.userId === request.user.id)) return response.status(403).json({ message: 'Only an approved member of the organizing club can remove this event.' })
  const today = new Date().toISOString().slice(0, 10)
  if (!event.date || event.date >= today) return response.status(409).json({ message: 'An event can only be removed after its scheduled date has passed.' })
  data.events.splice(eventIndex, 1)
  data.registrations = data.registrations.filter(registration => registration.eventId !== event.id)
  writeData(data)
  response.json({ removed: true })
})

app.post('/api/events/:id/registration', requireAuth, (request, response) => {
  const data = readData()
  const event = data.events.find(item => item.id === request.params.id)
  if (!event) return response.status(404).json({ message: 'Event not found.' })
  const registrationIndex = data.registrations.findIndex(item => item.eventId === event.id && item.userId === request.user.id)
  const registered = registrationIndex >= 0
  data.registrations = registered
    ? data.registrations.filter((_, index) => index !== registrationIndex)
    : [...data.registrations, { eventId: event.id, userId: request.user.id, joinedAt: new Date().toISOString() }]
  writeData(data)
  response.json({ registered: !registered })
})

app.get('/api/events/:id/guest-list', requireAuth, (request, response) => {
  const data = readData()
  const event = data.events.find(item => item.id === request.params.id)
  if (!event) return response.status(404).json({ message: 'Event not found.' })
  const isOrganizer = data.clubMemberships.some(member => member.clubId === event.clubId && member.userId === request.user.id)
  if (!isOrganizer) return response.status(403).json({ message: 'Only approved members of the organizing club can view this guest list.' })
  const attendees = data.registrations
    .filter(registration => registration.eventId === event.id)
    .map(registration => {
      const user = data.users.find(item => item.id === registration.userId)
      return user ? { name: user.name, email: user.email, joinedAt: registration.joinedAt } : null
    })
    .filter(Boolean)
    .sort((first, second) => first.name.localeCompare(second.name))
  response.json({ event: { id: event.id, title: event.title }, attendees })
})

app.patch('/api/profile', requireAuth, (request, response) => {
  const data = readData()
  const user = data.users.find(item => item.id === request.user.id)
  const { branch, year, hostel = '' } = request.body
  if (typeof branch !== 'string' || !branch.trim() || typeof year !== 'string' || !year.trim()) return response.status(400).json({ message: 'Branch and year are required.' })
  if (branch.trim().length > 100 || year.trim().length > 20 || typeof hostel !== 'string' || hostel.trim().length > 100) return response.status(400).json({ message: 'Branch, year, or hostel is too long.' })
  user.branch = branch.trim()
  user.year = year.trim()
  user.hostel = hostel.trim()
  writeData(data)
  response.json({ user: publicUser(user) })
})

app.listen(port, () => console.log(`CampusLoop API running on http://localhost:${port}`))