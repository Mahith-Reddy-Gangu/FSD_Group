import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import Lenis from 'lenis'
import { motion, useInView } from 'framer-motion'
import * as THREE from 'three'
import WAVES from 'vanta/dist/vanta.waves.min.js'
import {
  ArrowUpRight,
  ArrowRight,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  GraduationCap,
  Globe2,
  Heart,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  MessageCircle,
  PackageOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Ticket,
  UserRound,
  UsersRound,
  X,
  Zap,
} from 'lucide-react'
import './styles.css'

const initialListings = [
  { id: 1, title: 'Casio fx-991EX Calculator', category: 'Study gear', condition: 'Like new', mode: 'Borrow', price: 'Free', owner: 'Nisha Rao', initials: 'NR', color: 'coral', image: 'https://images.unsplash.com/photo-1616628182503-47a55d7f2d91?auto=format&fit=crop&w=900&q=80', saved: false },
  { id: 2, title: 'Introduction to Algorithms', category: 'Books', condition: 'Good', mode: 'Exchange', price: 'For a book', owner: 'Arjun Mehta', initials: 'AM', color: 'blue', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80', saved: true },
  { id: 3, title: 'Sony WH-1000XM4 Headphones', category: 'Electronics', condition: 'Excellent', mode: 'Borrow', price: 'Free', owner: 'Diya Shah', initials: 'DS', color: 'green', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80', saved: false },
  { id: 4, title: 'IKEA Desk Lamp', category: 'Room & living', condition: 'Good', mode: 'Give away', price: 'Free', owner: 'Kabir Singh', initials: 'KS', color: 'yellow', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80', saved: false },
]

const events = [
  { id: 1, month: 'OCT', day: '14', title: 'Designing for a more human campus', type: 'Talk', time: '5:30 PM - 7:00 PM', place: 'Innovation Lab', host: 'Design Society', color: 'mint', spots: 48, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80', description: 'A practical conversation about the small systems that make campus life feel welcoming, legible, and shared.' },
  { id: 2, month: 'OCT', day: '18', title: 'Sunset community run', type: 'Wellbeing', time: '6:00 AM - 7:30 AM', place: 'East Gate Lawn', host: 'Campus Athletics', color: 'orange', spots: 24, image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1000&q=80', description: 'Start the weekend with a relaxed 5K loop around campus. All paces welcome, no timing pressure.' },
  { id: 3, month: 'OCT', day: '22', title: 'Open mic: after hours', type: 'Community', time: '7:00 PM - 9:30 PM', place: 'The Courtyard', host: 'Arts Collective', color: 'purple', spots: 12, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80', description: 'Bring a song, a poem, a story, or simply a friend. The stage is yours for ten minutes.' },
]

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'exchange', label: 'Resource exchange', icon: PackageOpen, count: 12 },
  { id: 'events', label: 'Events calendar', icon: CalendarDays, count: 3 },
  { id: 'profile', label: 'My profile', icon: UserRound },
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem('campusloop-token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Something went wrong. Please try again.')
  return body
}

function App() {
  const [activeView, setActiveView] = useState('overview')
  const [listings, setListings] = useState([])
  const [events, setEvents] = useState([])
  const [registered, setRegistered] = useState([])
  const [requests, setRequests] = useState([])
  const [profile, setProfile] = useState(null)
  const [toast, setToast] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function loadApplication() {
      try {
        let token = sessionStorage.getItem('campusloop-token')
        if (!token) return
        const auth = await apiFetch('/auth/me')
        setProfile(auth.user)
        const [listingData, eventData, requestData] = await Promise.all([apiFetch('/listings'), apiFetch('/events'), apiFetch('/requests/my')])
        setListings(listingData.listings)
        setEvents(eventData.events)
        setRegistered(eventData.events.filter(event => event.registered).map(event => event.id))
        setRequests(requestData.requests)
      } catch (error) {
        setLoadError(error.message)
      } finally {
        setLoading(false)
      }
    }
    loadApplication()
  }, [])

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true })
    let frame
    const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf) }
    frame = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(frame); lenis.destroy() }
  }, [])

  useEffect(() => {
    gsap.fromTo('.app-shell', { opacity: 0 }, { opacity: 1, duration: 0.65, ease: 'power2.out' })
    gsap.fromTo('.sidebar, .topbar, .hero-panel', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' })
  }, [])

  useEffect(() => {
    gsap.fromTo('.page-wrap > *', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: 'power3.out' })
  }, [activeView])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  const notify = (message, icon = Check) => setToast({ message, icon })
  const navigate = (view) => { setActiveView(view); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const toggleSave = async (id) => {
    try {
      const result = await apiFetch(`/listings/${id}/save`, { method: 'PATCH' })
      setListings(items => items.map(item => item.id === id ? { ...item, saved: result.saved } : item))
    } catch (error) { notify(error.message, CircleHelp) }
  }
  const toggleRegistration = async (id) => {
    const joined = registered.includes(id)
    try {
      const result = await apiFetch(`/events/${id}/registration`, { method: 'POST' })
      setRegistered(items => result.registered ? [...items, id] : items.filter(item => item !== id))
      setEvents(items => items.map(event => event.id === id ? { ...event, registered: result.registered } : event))
    } catch (error) { notify(error.message, CircleHelp); return }
    notify(joined ? 'Registration cancelled' : 'You’re on the guest list', joined ? CalendarDays : Ticket)
  }
  const addListing = async (listing) => {
    try {
      const result = await apiFetch('/listings', { method: 'POST', body: JSON.stringify(listing) })
      setListings(items => [result.listing, ...items])
      setShowCreate(false)
      notify('Your listing is live', PackageOpen)
    } catch (error) { notify(error.message, CircleHelp) }
  }
  const requestListing = async (id, owner) => {
    try {
      const result = await apiFetch(`/listings/${id}/requests`, { method: 'POST' })
      setRequests(items => [{ ...result.request, listing: listings.find(item => item.id === id) }, ...items])
      notify(`Request sent to ${owner}`, MessageCircle)
    } catch (error) { notify(error.message, CircleHelp) }
  }
  const updateProfile = async (draft) => {
    try {
      const result = await apiFetch('/profile', { method: 'PATCH', body: JSON.stringify(draft) })
      setProfile(result.user)
      notify('Profile updated', UserRound)
    } catch (error) { notify(error.message, CircleHelp) }
  }

  if (loading) return <div className="app-loading"><div className="brand-mark"><Leaf size={17} /></div><strong>Opening CampusLoop</strong><span>Connecting to your campus space...</span></div>
  if (loadError) return <div className="app-loading"><div className="brand-mark"><CircleHelp size={17} /></div><strong>CampusLoop is offline</strong><span>{loadError}</span><button className="button button-dark" onClick={() => window.location.reload()}>Try again</button></div>
  if (!profile) return <LoginScreen />

  const lostAndFoundMode = activeView === 'lost-found'
  return (
    <div className={`app-shell ${activeView === 'overview' ? 'overview-mode' : ''} ${activeView === 'events' ? 'events-mode' : ''} ${activeView === 'profile' ? 'profile-mode' : ''} ${lostAndFoundMode ? 'lost-found-mode' : ''}`}>
      {activeView === 'overview' ? null : lostAndFoundMode ? <div className="lost-found-backdrop" aria-hidden="true" /> : <SiteVideoBackground />}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Leaf size={17} strokeWidth={2.5} /></div><span>campus<span>loop</span></span></div>
        <div className="campus-switcher"><div className="campus-avatar">NC</div><div><strong>North Campus</strong><span>Student space</span></div><ChevronRight size={15} /></div>
        <p className="nav-label">Workspace</p>
        <nav>{navItems.map(({ id, label, icon: Icon, count }) => <button key={id} className={`nav-item ${activeView === id ? 'active' : ''}`} onClick={() => navigate(id)}><Icon size={18} /><span>{label}</span>{count && <em>{count}</em>}</button>)}</nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note"><Sparkles size={16} /><strong>Make campus yours.</strong><span>Small exchanges make a bigger place feel close.</span></div>
        <button className="nav-item muted" onClick={() => navigate('profile')}><Settings size={18} /><span>Settings</span></button>
        <div className="sidebar-profile"><div className="avatar avatar-coral">{profile.name.split(' ').map(part => part[0]).join('')}</div><div><strong>{profile.name}</strong><span>Student account</span></div><button onClick={() => setShowAuth(true)} aria-label="Open account menu"><LogOut size={16} /></button></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(value => !value)} aria-label="Toggle navigation"><Menu size={20} /></button>
          <div className="breadcrumb"><span>North Campus</span><ChevronRight size={14} /><strong>{navItems.find(item => item.id === activeView)?.label || 'Overview'}</strong></div>
          <div className="top-actions"><div className="search-mini"><Search size={16} /><input placeholder="Search campusloop" onChange={(event) => event.target.value && navigate('exchange')} /></div><button className="icon-button notification-button" onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications"><Bell size={18} /><i /></button><button className="avatar avatar-coral top-avatar" onClick={() => navigate('profile')}>{profile.name.split(' ').map(part => part[0]).join('')}</button></div>
          {showNotifications && <div className="notification-pop"><div className="pop-header"><strong>Notifications</strong><span>2 new</span></div><div className="notification-row"><div className="notification-dot green" /><span><strong>Meera</strong> saved your calculator listing.<small>8 minutes ago</small></span></div><div className="notification-row"><div className="notification-dot orange" /><span><strong>Open mic</strong> is almost full.<small>Yesterday</small></span></div></div>}
        </header>

        <div className="page-wrap">
          {activeView === 'overview' && <Overview navigate={navigate} listings={listings} events={events} registered={registered} notify={notify} />}
          {activeView === 'exchange' && <Exchange listings={listings} onSave={toggleSave} onCreate={() => setShowCreate(true)} onRequest={requestListing} notify={notify} />}
          {activeView === 'events' && <Events events={events} registered={registered} onRegister={toggleRegistration} onOpen={setSelectedEvent} navigate={navigate} />}
          {activeView === 'profile' && <Profile profile={profile} onSave={updateProfile} listings={listings} registered={registered} requests={requests} navigate={navigate} />}
          {activeView === 'profile' && <RequestHistory requests={requests} />}
        </div>
      </main>

      {showCreate && <CreateListing onClose={() => setShowCreate(false)} onSubmit={addListing} />}
      {showAuth && <AuthModal profile={profile} onClose={() => setShowAuth(false)} onSignedOut={() => { sessionStorage.removeItem('campusloop-token'); window.location.reload() }} />}
      {selectedEvent && <EventModal event={selectedEvent} registered={registered.includes(selectedEvent.id)} onClose={() => setSelectedEvent(null)} onRegister={() => { toggleRegistration(selectedEvent.id); setSelectedEvent(null) }} />}
      {toast && <div className="toast"><toast.icon size={17} /><span>{toast.message}</span></div>}
    </div>
  )
}

function VantaBackground() {
  const container = useRef(null)
  const effect = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !container.current) return undefined
    const createWaves = WAVES.default || WAVES
    effect.current = createWaves({
      el: container.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 1,
      color: 0x173a36,
      shininess: 34,
      waveHeight: 17,
      waveSpeed: 0.42,
      zoom: 0.72,
    })
    return () => {
      effect.current?.destroy()
      effect.current = null
    }
  }, [])

  return <div ref={container} className="vanta-background" aria-hidden="true" />
}

function SiteVideoBackground() {
  return <div className="site-video-background" aria-hidden="true"><video src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4" muted autoPlay loop playsInline preload="auto" /><div /></div>
}

function useTypewriter(text, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let interval
    const delay = setTimeout(() => {
      let index = 0
      interval = setInterval(() => {
        index += 1
        setDisplayed(text.slice(0, index))
        if (index >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
    }, startDelay)
    return () => { clearTimeout(delay); clearInterval(interval) }
  }, [speed, startDelay, text])

  return { displayed, done }
}

function MainframeVideo() {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    let previousX = null
    let targetTime = null
    let seeking = false

    const clamp = value => Math.min(Math.max(value, 0), video.duration || 0)
    const seek = () => {
      if (!Number.isFinite(video.duration) || targetTime === null || seeking) return
      seeking = true
      video.currentTime = targetTime
    }
    const onMetadata = () => {
      targetTime = video.duration * 0.08
      video.currentTime = targetTime
    }
    const onSeeked = () => {
      seeking = false
      if (targetTime !== null && Math.abs(video.currentTime - targetTime) > 0.02) seek()
    }
    const onMouseMove = event => {
      if (!Number.isFinite(video.duration)) return
      if (previousX === null) { previousX = event.clientX; return }
      const delta = event.clientX - previousX
      previousX = event.clientX
      const baseTime = targetTime ?? video.currentTime
      targetTime = clamp(baseTime + (delta / window.innerWidth) * 0.8 * video.duration)
      seek()
    }

    video.addEventListener('loadedmetadata', onMetadata)
    video.addEventListener('seeked', onSeeked)
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      video.removeEventListener('loadedmetadata', onMetadata)
      video.removeEventListener('seeked', onSeeked)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return <video ref={videoRef} className="mainframe-video" muted playsInline preload="auto" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4" />
}

function CopyIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="1.5" /><path d="M5 15V5.5C5 4.67 5.67 4 6.5 4H16" /></svg>
}

function LoginScreen() {
  const [mode, setMode] = useState('login')
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ name: '', course: '', email: 'maya.patel@campus.edu', password: 'campusloop' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { displayed, done } = useTypewriter('Glad you stopped in. Good taste tends to find us. Now, what are we building?')

  const submit = async event => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const result = await apiFetch(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) })
      sessionStorage.setItem('campusloop-token', result.token)
      window.location.reload()
    } catch (requestError) {
      setError(requestError.message)
      setSubmitting(false)
    }
  }
  const update = (field, value) => setForm(current => ({ ...current, [field]: value }))
  const jumpToAuth = () => document.querySelector('.mainframe-auth')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const copyEmail = async () => { await navigator.clipboard.writeText('hello@mainframe.co'); setCopied(true); setTimeout(() => setCopied(false), 1600) }
  const links = ['Labs', 'Studio', 'Openings', 'Shop']

  return <main className="mainframe-login">
    <MainframeVideo />
    <div className="mainframe-wash" />
    <header className="mainframe-nav">
      <a className="mainframe-logo" href="#top">Mainframe® <span>✳︎</span></a>
      <nav className="mainframe-links">{links.map(link => <a key={link} href={`#${link.toLowerCase()}`}>{link}</a>).reduce((items, link, index) => index === 0 ? [link] : [...items, <span key={`${links[index - 1]}-comma`}>, </span>, link], [])}</nav>
      <a className="mainframe-contact" href="mailto:hello@mainframe.co">Get in touch</a>
      <button className={`mainframe-menu-button ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(open => !open)} aria-label="Toggle navigation"><span /><span /><span /></button>
    </header>
    <div className={`mainframe-mobile-menu ${menuOpen ? 'is-open' : ''}`}>{links.map(link => <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{link}</a>)}<a href="mailto:hello@mainframe.co" onClick={() => setMenuOpen(false)}>Get in touch</a></div>
    <section className="mainframe-hero" id="top">
      <div className="mainframe-copy">
        <p className="mainframe-intro">Hey there, meet A.R.I.A,<br />Mainframe's Adaptive Response Interface Agent</p>
        <p className="mainframe-typewriter">{displayed}{!done && <span className="mainframe-cursor" />}</p>
        <div className="mainframe-actions"><button onClick={jumpToAuth}>Pitch us an idea</button><button onClick={() => { setMode('register'); jumpToAuth() }}>Come work here</button><button onClick={copyEmail}>Send a brief hello</button><button onClick={jumpToAuth}>See how we operate</button><button className="mainframe-email" onClick={copyEmail}>Reach us: <span>hello@mainframe.co</span><CopyIcon />{copied && <em>Copied</em>}</button></div>
      </div>
      <aside className="mainframe-auth" id="auth">
        <p className="mainframe-auth-kicker">CAMPUSLOOP / {mode === 'login' ? 'STUDENT ACCESS' : 'NEW MEMBER'}</p>
        <h2>{mode === 'login' ? 'Welcome back.' : 'Join the loop.'}</h2>
        <form onSubmit={submit}>{mode === 'register' && <><label>Full name<input value={form.name} onChange={event => update('name', event.target.value)} placeholder="Maya Patel" required /></label><label>Course & year<input value={form.course} onChange={event => update('course', event.target.value)} placeholder="Computer Science · Year 3" required /></label></>}<label>Campus email<input type="email" value={form.email} onChange={event => update('email', event.target.value)} placeholder="you@campus.edu" required /></label><label>Password<input type="password" value={form.password} onChange={event => update('password', event.target.value)} minLength={6} required /></label>{error && <p className="mainframe-form-error">{error}</p>}<button className="mainframe-submit" disabled={submitting}>{submitting ? 'Connecting...' : mode === 'login' ? 'Enter CampusLoop' : 'Create account'}<ArrowUpRight size={15} /></button></form>
        <div className="mainframe-demo"><span>Evaluation access</span><strong>maya.patel@campus.edu</strong><small>Password: campusloop</small></div>
        <button className="mainframe-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create a student account' : 'Back to sign in'}</button>
      </aside>
    </section>
  </main>
}

function PageIntro({ eyebrow, title, body, action, onAction }) {
  return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{body && <p className="intro-copy">{body}</p>}</div>{action && <button className="button button-dark" onClick={onAction}>{action}<Plus size={16} /></button>}</div>
}

function Overview({ navigate, listings, events, notify }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const submitEmail = event => { event.preventDefault(); if (email.trim()) { setSubscribed(true); notify('You are on the CampusLoop list', Check) } }
  return <main className="asme-overview">
    <section className="asme-hero" id="asme-top">
      <video className="asme-hero-video" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4" muted autoPlay playsInline preload="auto" loop />
      <div className="asme-hero-shade" />
      <AsmeNav navigate={navigate} />
      <div className="asme-hero-content"><h1>Make campus feel <em>closer</em>.</h1><form className="asme-email-pill liquid-glass" onSubmit={submitEmail}><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Get campus updates" aria-label="Email address" required /><button type="submit" aria-label="Subscribe">{subscribed ? <Check size={20} /> : <ArrowRight size={20} />}</button></form><p>Share what you have, discover what is happening, and stay connected to the people and places that make North Campus yours.</p><button className="asme-manifesto liquid-glass" onClick={() => document.querySelector('#asme-about')?.scrollIntoView({ behavior: 'smooth' })}>Explore CampusLoop</button></div>
      <div className="asme-socials"><button className="liquid-glass" aria-label="Instagram"><Heart size={20} /></button><button className="liquid-glass" aria-label="Twitter"><MessageCircle size={20} /></button><button className="liquid-glass" aria-label="CampusLoop"><Globe2 size={20} /></button></div>
    </section>
    <AboutSection />
    <FeaturedVideoSection />
    <PhilosophySection />
    <ServicesSection navigate={navigate} />
  </main>
}

function AsmeNav({ navigate }) {
  return <header className="asme-nav liquid-glass"><a className="asme-brand" href="#asme-top"><Globe2 size={24} /> <span>CampusLoop</span></a><nav><a href="#asme-about">Why CampusLoop</a><a href="#asme-services">Modules</a><a href="#asme-philosophy">How it works</a></nav><div className="asme-nav-actions"><button onClick={() => document.querySelector('#asme-services')?.scrollIntoView({ behavior: 'smooth' })}>Explore modules</button><button className="liquid-glass" onClick={() => navigate('profile')}>Open profile</button></div></header>
}

function Reveal({ children, className = '', ...props }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-100px' })
  return <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 40 }} animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: .8, ease: 'easeOut' }} {...props}>{children}</motion.div>
}

function AboutSection() {
  return <section className="asme-section asme-about" id="asme-about"><Reveal><p className="asme-label">Why CampusLoop</p></Reveal><Reveal><h2>Small exchanges make a <em>big campus</em> feel<br className="asme-desktop-break" /> <em>close, useful, and shared.</em></h2></Reveal></section>
}

function FeaturedVideoSection() {
  return <section className="asme-section asme-featured"><Reveal className="asme-featured-frame"><video src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4" muted autoPlay loop playsInline preload="auto" /><div className="asme-video-gradient" /><div className="asme-featured-overlay"><div className="liquid-glass asme-approach"><p className="asme-label">Campus in motion</p><p>CampusLoop brings resources, events, and student life into one shared space, so finding help or finding your people takes less effort.</p></div><button className="liquid-glass asme-round-button">See what is happening <ArrowUpRight size={16} /></button></div></Reveal></section>
}

function PhilosophySection() {
  return <section className="asme-section asme-philosophy" id="asme-philosophy"><Reveal><h2>Share <em>x</em> Participate</h2></Reveal><div className="asme-philosophy-grid"><Reveal className="asme-philosophy-media" transition={{ duration: .8, delay: .1 }}><video src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4" muted autoPlay loop playsInline preload="auto" /></Reveal><Reveal className="asme-philosophy-copy" transition={{ duration: .8, delay: .2 }}><div><p className="asme-label">Find what you need</p><p>Browse books, calculators, electronics, and everyday essentials shared by students around campus. Save a listing, send a request, and make the exchange simple.</p></div><div className="asme-divider" /><div><p className="asme-label">Show up for more</p><p>Discover talks, runs, club activities, and cultural events. Register for what interests you and keep your week connected to campus life.</p></div></Reveal></div></section>
}

function ServicesSection({ navigate }) {
  const services = [{ tag: 'Module 01', title: 'Resource Exchange', description: 'Find books, study gear, electronics, and useful things shared by students. Create listings, save favorites, and send a request when you find what you need.', video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4', view: 'exchange' }, { tag: 'Module 02', title: 'Events Calendar', description: 'See what is happening across campus, explore event details, and register for talks, runs, club activities, and community moments.', video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4', view: 'events' }]
  return <section className="asme-section asme-services" id="asme-services"><Reveal className="asme-services-heading"><h2>Find your way around</h2><span>CampusLoop modules</span></Reveal><div className="asme-service-grid">{services.map((service, index) => <Reveal key={service.title} className="liquid-glass asme-service-card" transition={{ duration: .8, delay: index * .15 }}><div className="asme-service-video"><video src={service.video} muted autoPlay loop playsInline preload="auto" /><div /></div><div className="asme-service-body"><div className="asme-service-top"><p className="asme-label">{service.tag}</p><button className="liquid-glass" aria-label={`Open ${service.title}`} onClick={() => navigate(service.view)}><ArrowUpRight size={17} /></button></div><h3>{service.title}</h3><p>{service.description}</p></div></Reveal>)}</div></section>
}

function Metric({ icon: Icon, value, label, detail, color, onClick }) { return <button className="metric-card" onClick={onClick}><div className={`metric-icon ${color}-bg`}><Icon size={19} /></div><strong className="metric-value">{value}</strong><span>{label}</span><small>{detail}</small><ArrowUpRight className="metric-arrow" size={16} /></button> }

function Exchange({ listings, onSave, onCreate, onRequest, notify }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All items')
  const filtered = listings.filter(item => `${item.title} ${item.category} ${item.owner}`.toLowerCase().includes(query.toLowerCase()) && (category === 'All items' || item.category === category))
  return <><PageIntro eyebrow="RESOURCE EXCHANGE" title="Useful things, shared freely." body="Give something a second life, find what you need, and keep campus moving." action="List an item" onAction={onCreate} /><section className="module-toolbar"><div className="search-field"><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search books, gear, anything..." /></div><div className="filter-pills">{['All items', 'Books', 'Electronics', 'Study gear', 'Room & living'].map(item => <button className={category === item ? 'selected' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><span className="result-count">{filtered.length} results</span></section><div className="exchange-layout"><aside className="exchange-aside"><div className="aside-card dark-card"><Sparkles size={21} /><strong>Have more<br />than you need?</strong><span>Pass it forward to someone on campus.</span><button onClick={onCreate}>Create a listing <Plus size={15} /></button></div><div className="aside-filter"><p className="eyebrow">How it works</p><div className="step"><b>01</b><span><strong>Find a thing</strong><small>Search by what you need</small></span></div><div className="step"><b>02</b><span><strong>Send a request</strong><small>Say hello to the owner</small></span></div><div className="step"><b>03</b><span><strong>Make the exchange</strong><small>Meet somewhere public</small></span></div></div></aside><section className="listing-grid">{filtered.map(item => <ListingCard key={item.id} item={item} onSave={() => onSave(item.id)} onRequest={() => onRequest(item.id, item.owner)} />)}{filtered.length === 0 && <div className="empty-state"><Search size={28} /><strong>Nothing in that corner yet.</strong><span>Try another search or share something of your own.</span></div>}</section></div></>
}

function ListingCard({ item, onSave, onRequest, compact = false }) { return <article className={`listing-card ${compact ? 'compact' : ''}`}><div className="listing-image"><img src={item.image} alt="" /><span className="listing-mode">{item.mode}</span><button className={`save-button ${item.saved ? 'saved' : ''}`} onClick={onSave} aria-label="Save listing"><Heart size={17} fill={item.saved ? 'currentColor' : 'none'} /></button></div><div className="listing-body"><div className="listing-meta"><span>{item.category}</span><span>•</span><span>{item.condition}</span></div><h3>{item.title}</h3><div className="listing-footer"><div className={`avatar avatar-${item.color}`}>{item.initials}</div><span><strong>{item.owner}</strong><small>{item.price}</small></span><button className="request-button" onClick={onRequest}>{compact ? <ArrowUpRight size={16} /> : 'Request'} </button></div></div></article> }

function Events({ events: eventItems, registered, onRegister, onOpen, navigate }) {
  return <LumoraEvents events={eventItems} registered={registered} onRegister={onRegister} onOpen={onOpen} navigate={navigate} />
}

const lumoraVideos = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4',
]
const lumoraLabels = ['Golden Hour', 'Still Water', 'Deep Woods', 'Quiet Dawn']

function LumoraEvents({ events, registered, onRegister, onOpen, navigate }) {
  const [activeEvent, setActiveEvent] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pointerStart = useRef(null)
  const cooldown = useRef(null)
  const event = events[activeEvent % Math.max(events.length, 1)]

  useEffect(() => () => clearTimeout(cooldown.current), [])

  const move = direction => {
    if (isTransitioning || events.length < 2) return
    setIsTransitioning(true)
    setActiveEvent(index => (index + direction + events.length) % events.length)
    cooldown.current = setTimeout(() => setIsTransitioning(false), 1000)
  }
  const onWheel = wheelEvent => { if (Math.abs(wheelEvent.deltaX) > 18 || Math.abs(wheelEvent.deltaY) > 38) move(wheelEvent.deltaX > 18 || wheelEvent.deltaY > 38 ? 1 : -1) }
  const onPointerDown = pointerEvent => { pointerStart.current = pointerEvent.clientX }
  const onPointerUp = pointerEvent => { if (pointerStart.current === null) return; const distance = pointerEvent.clientX - pointerStart.current; pointerStart.current = null; if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1) }

  return <section className={`lumora-events ${activeEvent === 2 ? 'is-dark-content' : ''}`} onWheel={onWheel} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
    <div className="lumora-video-stack" aria-hidden="true">{lumoraVideos.map((video, index) => <video key={video} className={index === activeEvent ? 'is-active' : ''} src={video} muted autoPlay loop playsInline preload="auto" />)}</div>
    <img className="lumora-train-overlay" src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png" alt="" aria-hidden="true" />
    <header className="lumora-nav"><button className="lumora-logo lumora-route-link" onClick={() => navigate('overview')}>CampusLoop</button><nav className="lumora-desktop-nav liquid-glass"><button onClick={() => navigate('overview')}>Overview</button><button onClick={() => navigate('exchange')}>Resource Exchange</button><button onClick={() => navigate('events')}>Events Calendar</button><button onClick={() => navigate('profile')}>My Profile</button></nav><button className="lumora-menu-button liquid-glass" onClick={() => setMenuOpen(open => !open)} aria-label="Toggle events menu">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></header>
    <div className={`lumora-mobile-menu ${menuOpen ? 'is-open' : ''}`}><button onClick={() => { setMenuOpen(false); navigate('overview') }}>Overview</button><button onClick={() => { setMenuOpen(false); navigate('exchange') }}>Resource Exchange</button><button onClick={() => { setMenuOpen(false); navigate('events') }}>Events Calendar</button><button onClick={() => { setMenuOpen(false); navigate('profile') }}>My Profile</button></div>
    <main className="lumora-content" id="events"><div className="lumora-badge liquid-glass">CampusLoop / {event?.type || 'Campus event'}</div><p className="lumora-kicker">{event?.host || 'CampusLoop events'} · {event?.month} {event?.day}</p><h1>{event?.title || 'Find your focus.'}</h1><p className="lumora-subtext">{event?.description || 'Discover the people, places, and moments that make campus feel connected.'}</p><div className="lumora-event-facts"><span>{event?.time}</span><span>{event?.place}</span></div><div className="lumora-actions"><button className="lumora-primary" onClick={() => onRegister(event.id)}>{registered.includes(event.id) ? 'Going' : 'Join event'}<ArrowUpRight size={16} /></button><button className="lumora-secondary liquid-glass" onClick={() => onOpen(event)}>View details</button></div><div className="lumora-switcher">{events.map((item, index) => <button key={item.id} className={index === activeEvent ? 'is-active' : ''} onClick={() => !isTransitioning && move(index > activeEvent ? 1 : -1)}>{lumoraLabels[index % lumoraLabels.length]}<span>{item.day} {item.month}</span></button>)}</div></main>
    <div className="lumora-bottom-stats"><span>{events.length} Upcoming Events</span><i>|</i><span>{events.filter(item => registered.includes(item.id)).length} Registered Plans</span><i>|</i><span>North Campus</span><i>|</i><span>Scroll or swipe to explore</span></div><div className="lumora-arrows"><button onClick={() => move(-1)} aria-label="Previous event">←</button><button onClick={() => move(1)} aria-label="Next event">→</button></div>
  </section>
}

const mostarSights = [
  { kicker: 'Old Bridge', title: 'Stari Most', text: "The stone arch over the Neretva and Mostar's main landmark.", icon: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png' },
  { kicker: 'Bazaar Street', title: 'Kujundziluk', text: 'Copper shops, souvenirs, and the old bazaar lane by the bridge.', icon: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png' },
  { kicker: 'Viewpoint', title: 'Koski Mehmed Pasha Mosque', text: 'A classic minaret view back toward Stari Most and the river.', icon: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230448_825949c9-ccdb-4857-b4a6-e349eccc9010.png' },
  { kicker: 'Ottoman House', title: 'Kajtaz House', text: "A preserved residential house showing Mostar's Ottoman layers.", icon: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png' },
  { kicker: 'Museum', title: 'War Photo Exhibition', text: "A compact, moving stop for context on the city's recent history.", icon: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png' },
]

function MostarHeader() {
  return <header className="mostar-nav" aria-label="Events navigation"><a className="mostar-logo" href="#cinema">CampusLoop / Events</a><nav aria-label="Events menu"><a href="#cinema">Intro</a><a href="#campus-events">Campus events</a><a href="#routes">Profile</a></nav><button className="mostar-language" aria-label="Current section"><span>LIVE</span></button></header>
}

function MostarEvents({ events, registered, onRegister, onOpen }) {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const controlsRef = useRef(null)
  const [activeSight, setActiveSight] = useState(mostarSights.length)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return undefined
    let targetScroll = 0
    let smoothScroll = 0
    let rafPending = false
    let initialized = false
    let mouseX = 0
    let mouseY = 0
    let targetMouseX = 0
    let targetMouseY = 0
    const root = document.documentElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
    const smoothstep = (start, end, value) => { const x = clamp((value - start) / (end - start)); return x * x * (3 - 2 * x) }
    const lerp = (start, end, amount) => start + (end - start) * amount
    const segment = (value, enterStart, enterEnd, exitStart, exitEnd) => { const enter = smoothstep(enterStart, enterEnd, value); const exit = smoothstep(exitStart, exitEnd, value); return { enter, exit, active: enter * (1 - exit) } }
    const distance = () => clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight - window.innerHeight)
    const setVar = (name, value) => root.style.setProperty(name, value)
    const update = () => {
      rafPending = false
      targetScroll = distance()
      if (!initialized || reduceMotion.matches) { smoothScroll = targetScroll; initialized = true } else smoothScroll = lerp(smoothScroll, targetScroll, .14)
      if (Math.abs(smoothScroll - targetScroll) < .08) smoothScroll = targetScroll
      mouseX = lerp(mouseX, targetMouseX, .12)
      mouseY = lerp(mouseY, targetMouseY, .12)
      const frame2 = segment(smoothScroll, 560, 900, 1300, 1620)
      const frame3 = segment(smoothScroll, 1760, 2140, 2540, 2700)
      const progress = clamp(smoothScroll / 2700)
      const introExit = smoothstep(90, 650, smoothScroll)
      const sightsEnter = Math.pow(smoothstep(2760, 3560, smoothScroll), 1.55)
      const controlsEnter = smoothstep(3360, 3660, smoothScroll)
      const blurActive = clamp(frame2.active + frame3.active)
      const splitDrift = Math.pow(frame2.enter, 1.5)
      const backScale = .76 + progress * .2 + frame2.enter * .18 + frame3.enter * .16
      const sharedHeroY = progress * -74
      const sharedHeroScale = progress * .23
      const screenTop = Math.min(220, Math.max(112, window.innerHeight * .19)) - 50
      const parentTop = window.innerHeight - (window.innerHeight - screenTop) / backScale
      setVar('--mx', (reduceMotion.matches ? 0 : mouseX).toFixed(4)); setVar('--my', (reduceMotion.matches ? 0 : mouseY).toFixed(4))
      setVar('--back-opacity', 1 - frame2.active * .06); setVar('--back-x', `${mouseX * -12}px`); setVar('--back-y', `${mouseY * -4}px`); setVar('--back-scale', backScale)
      setVar('--four-y', `${10 + progress * 10}vh`); setVar('--four-scale', .78 + progress * .16); setVar('--bazaar-y', `${20 - progress * 8}vh`); setVar('--blur-px', `${blurActive * 14}px`); setVar('--back-brightness', 1 - blurActive * .255); setVar('--bazaar-blur-px', `${frame2.active * 14}px`); setVar('--bazaar-brightness', 1 - frame2.active * .255 - frame3.active * .06); setVar('--bazaar-saturation', 1 + frame3.active * .18)
      setVar('--shade-opacity', 1); setVar('--shade-z', frame2.active > .02 ? '2' : '0'); setVar('--shade-top-alpha', blurActive * .465); setVar('--shade-mid-alpha', blurActive * .42); setVar('--shade-bottom-alpha', blurActive * .51)
      setVar('--title-y', `${introExit * -210}px`); setVar('--title-scale', 1 - introExit * .08); setVar('--title-opacity', 1 - introExit)
      setVar('--bridge-x', `calc(-50% + ${mouseX * 18}px)`); setVar('--bridge-y', `${mouseY * 8 + sharedHeroY - frame2.exit * 760}px`); setVar('--bridge-bottom', `${5 - frame2.enter * 13}vh`); setVar('--bridge-width', `${67.2 + frame2.enter * 37.8}vw`); setVar('--bridge-scale', 1.02 + sharedHeroScale + frame2.exit * .46)
      setVar('--split-left-x', `calc(-50% + ${-splitDrift * 46}vw + ${mouseX * 22}px)`); setVar('--split-left-y', `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`); setVar('--split-left-scale', 1 + sharedHeroScale + frame2.enter * .74); setVar('--split-right-x', `calc(-50% + ${splitDrift * 46}vw + ${mouseX * 22}px)`); setVar('--split-right-y', `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`); setVar('--split-right-scale', 1 + sharedHeroScale + frame2.enter * .74)
      setVar('--frame2-opacity', frame2.active * (1 - frame3.enter)); setVar('--frame2-x', `calc(-50% + ${mouseX * 10}px)`); setVar('--frame2-y', `calc(-50% + ${mouseY * 8 - frame2.exit * 150}px)`); setVar('--frame2-scale', 1.06 + frame2.enter * .08 + frame2.exit * .08); setVar('--intro-copy-y', `${introExit * 90}px`); setVar('--intro-copy-opacity', 1 - introExit); setVar('--panel2-opacity', frame2.active * (1 - frame2.exit)); setVar('--panel2-y', `calc(-50% + ${-frame2.exit * 86 + (1 - frame2.enter) * 58}px)`); setVar('--panel3-opacity', frame3.active * (1 - frame3.exit)); setVar('--panel3-y', `calc(-50% + ${-frame3.exit * 86 + (1 - frame3.enter) * 58}px)`)
      setVar('--sights-visibility', sightsEnter > .01 ? 'visible' : 'hidden'); setVar('--sights-enter-x', `${(1 - sightsEnter) * 420}vw`); setVar('--sights-scale', 1 / backScale); setVar('--sights-top', `${parentTop}px`); setVar('--sights-screen-top', `${screenTop}px`); setVar('--sights-controls-opacity', controlsEnter); controlsRef.current?.classList.toggle('is-ready', controlsEnter > .98)
      if (Math.abs(smoothScroll - targetScroll) > .08 || Math.abs(mouseX - targetMouseX) > .001 || Math.abs(mouseY - targetMouseY) > .001) requestTick()
    }
    const requestTick = () => { if (!rafPending) { rafPending = true; requestAnimationFrame(update) } }
    const onScroll = () => requestTick()
    const onResize = () => { updateSlider(); requestTick() }
    const onPointer = event => { targetMouseX = event.clientX / window.innerWidth - .5; targetMouseY = event.clientY / window.innerHeight - .5; requestTick() }
    const updateSlider = () => { const card = track.querySelector('.mostar-sight-card'); if (!card) return; const gap = parseFloat(getComputedStyle(track).columnGap || '0'); root.style.setProperty('--sights-shift', `${-(card.offsetWidth + gap) * activeSight}px`) }
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onResize); window.addEventListener('pointermove', onPointer, { passive: true }); updateSlider(); requestTick()
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); window.removeEventListener('pointermove', onPointer); root.style.cssText = '' }
  }, [activeSight])

  const moveSight = direction => setActiveSight(index => index + direction >= mostarSights.length * 2 ? index + direction - mostarSights.length : index + direction < mostarSights.length ? index + direction + mostarSights.length : index + direction)
  const selectSight = sight => onOpen(events[mostarSights.indexOf(sight) % Math.max(events.length, 1)])
  const cards = [...mostarSights, ...mostarSights, ...mostarSights]
  useEffect(() => {
    const host = sectionRef.current?.parentElement
    if (!host) return undefined
    const mount = document.createElement('div')
    mount.className = 'campus-events-after-mount'
    host.appendChild(mount)
    const eventRoot = createRoot(mount)
    eventRoot.render(<CampusEventsAfter events={events} registered={registered} onRegister={onRegister} onOpen={onOpen} />)
    return () => { eventRoot.unmount(); mount.remove() }
  }, [events, registered, onRegister, onOpen])
  return <main className="mostar-route"><section className="cinema-scroll" aria-label="Mostar cinematic scroll story" ref={sectionRef}><div className="mostar-stage"><div className="mostar-world"><img className="mostar-scene sky-img" src="https://raft-blast-61784561.figma.site/_assets/v11/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png" alt="" /><MostarHeader /><div className="mostar-back-stack"><img className="mostar-scene back-img back-four" src="https://raft-blast-61784561.figma.site/_assets/v11/8a7f8af50e0ce92ec2e228e7b0b4112178c51cf1.png" alt="" /><div className="mostar-sights-slider"><div className="mostar-sights-track" ref={trackRef}>{cards.map((sight, index) => <article className={`mostar-sight-card ${index === activeSight ? 'is-active' : ''}`} key={`${sight.title}-${index}`} role="button" tabIndex="0" aria-label={`Open ${sight.title} card`} onClick={() => selectSight(sight)} onKeyDown={event => (event.key === 'Enter' || event.key === ' ') && selectSight(sight)}><span className="sight-kicker">{sight.kicker}</span><img className="sight-pin" src={sight.icon} alt="" /><h3>{sight.title}</h3><p>{sight.text}</p></article>)}</div></div><img className="mostar-scene back-img back-bazaar" src="https://raft-blast-61784561.figma.site/_assets/v11/864afe00e41e2fa20a5aa546e15cb807e0f81384.png" alt="" /></div><div className="mostar-sights-controls" ref={controlsRef}><button onClick={() => moveSight(-1)} aria-label="Previous sight">←</button><button onClick={() => moveSight(1)} aria-label="Next sight">→</button></div><h1 className="mostar-hero-title">MOSTAR</h1><img className="mostar-scene splitframe-img splitframe-left" src="https://raft-blast-61784561.figma.site/_assets/v11/7536d7b60a1fce482cf6edf3f0bffd3bad5d0f8a.png" alt="" /><img className="mostar-scene splitframe-img splitframe-right" src="https://raft-blast-61784561.figma.site/_assets/v11/392db6a6a6b98e868bd7f8d3f55bb719d51e5028.png" alt="" /><img className="mostar-scene bridge-img" src="https://raft-blast-61784561.figma.site/_assets/v11/c6a6d8ef49bca43f708aa852692942c45ec950d4.png" alt="" /><img className="mostar-scene frame-two-img" src="https://raft-blast-61784561.figma.site/_assets/v11/ba75252bab2b1c510987b74837770f7bc8a6b2d4.png" alt="" /><div className="mostar-shade" /><section className="mostar-intro-copy" aria-label="Mostar overview"><p>A stone arch, emerald water, and a compact old city made for slow mornings, late light, and one unforgettable crossing.</p><div className="hero-tags" aria-label="Mostar highlights"><span>Old Bridge</span><span>Neretva River</span><span>UNESCO old city</span></div></section><section className="mostar-story-panel mostar-story-bridge" aria-label="Old Bridge details"><h2>The bridge is the city's compass.</h2><p>Stari Most links the banks of the Neretva and anchors a historic quarter shaped by Ottoman, Mediterranean, and European layers.</p><dl className="facts"><div><dt>1566</dt><dd>Original bridge completed</dd></div><div><dt>2005</dt><dd>Old Bridge Area inscribed by UNESCO</dd></div></dl></section><section className="mostar-story-panel mostar-story-bazaar" aria-label="Old town details"><h2>The bazaar keeps Mostar close.</h2><p>Stone lanes, mosque courtyards, copper stalls, and riverside coffee stay within a short walk of Stari Most.</p><button className="note-button"><span aria-hidden="true">↗</span><span>Open old town notes</span></button></section></div></div></section></main>
}

function CampusEventsAfter({ events, registered, onRegister, onOpen }) {
  return <section className="campus-events-after" id="campus-events"><div className="campus-events-after-inner"><p className="campus-events-kicker">CampusLoop / Events Calendar</p><h1>What is happening<br /><em>around campus.</em></h1><p className="campus-events-lede">After the cinematic intro, find the real events, dates, places, and people waiting for you this week.</p><div className="campus-events-list">{events.map(event => <article className="campus-event-card" key={event.id} onClick={() => onOpen(event)}><div className={`campus-event-date ${event.color}`}><strong>{event.day}</strong><span>{event.month}</span></div><div className="campus-event-info"><p>{event.host} · {event.type}</p><h2>{event.title}</h2><span>{event.time} · {event.place}</span></div><button className={`campus-event-action ${registered.includes(event.id) ? 'is-registered' : ''}`} onClick={click => { click.stopPropagation(); onRegister(event.id) }}>{registered.includes(event.id) ? 'Going' : 'Join event'}<ArrowUpRight size={15} /></button></article>)}</div></div></section>
}

function MostarEventsLayout({ events, registered, onRegister, onOpen }) {
  return <main className="mostar-calendar-page"><div className="mostar-calendar-backdrop"><img src="https://raft-blast-61784561.figma.site/_assets/v11/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png" alt="" /><img src="https://raft-blast-61784561.figma.site/_assets/v11/864afe00e41e2fa20a5aa546e15cb807e0f81384.png" alt="" /><img src="https://raft-blast-61784561.figma.site/_assets/v11/c6a6d8ef49bca43f708aa852692942c45ec950d4.png" alt="" /></div><div className="mostar-calendar-shade" /><MostarHeader /><section className="campus-events-content"><div className="campus-events-heading"><p>CampusLoop / Events Calendar</p><h1>Find your next<br /><em>reason to show up.</em></h1><span>Real events, clear details, and one place to keep your campus week moving.</span></div><div className="campus-events-list">{events.map(event => <article className="campus-event-card" key={event.id} onClick={() => onOpen(event)}><div className={`campus-event-date ${event.color}`}><strong>{event.day}</strong><span>{event.month}</span></div><div className="campus-event-info"><p>{event.host} · {event.type}</p><h2>{event.title}</h2><span>{event.time} · {event.place}</span></div><button className={`campus-event-action ${registered.includes(event.id) ? 'is-registered' : ''}`} onClick={click => { click.stopPropagation(); onRegister(event.id) }}>{registered.includes(event.id) ? 'Going' : 'Join event'}<ArrowUpRight size={15} /></button></article>)}</div></section></main>
}

function EventCard({ event, registered, onRegister, onOpen }) { return <article className="event-card"><button className="event-image" onClick={onOpen}><img src={event.image} alt="" /><span className={`date-badge ${event.color}`}><b>{event.day}</b><small>{event.month}</small></span><span className="event-type">{event.type}</span></button><div className="event-body"><p className="eyebrow">{event.host}</p><h3>{event.title}</h3><div className="event-detail"><Clock3 size={15} /><span>{event.time}</span></div><div className="event-detail"><Compass size={15} /><span>{event.place}</span></div><div className="event-actions"><span>{event.spots} spots left</span><button className={`button ${registered ? 'button-success' : 'button-dark'}`} onClick={onRegister}>{registered ? <><Check size={15} /> Going</> : <>Join event <Ticket size={15} /></>}</button></div></div></article> }

function Profile({ profile, onSave, listings, registered, requests, navigate }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)
  const save = () => { onSave(draft); setEditing(false) }
  return <AccountHero profile={profile} onSave={onSave} listings={listings} registered={registered} requests={requests} navigate={navigate} />
  return <><PageIntro eyebrow="MY PROFILE" title="Your campus identity." body="Keep your details close and see the little footprint you’re making here." action={editing ? 'Save changes' : 'Edit profile'} onAction={editing ? save : () => setEditing(true)} /><div className="profile-grid"><section className="profile-card identity-card"><div className="identity-top"><div className="profile-avatar">MP</div><div><p className="eyebrow">STUDENT ACCOUNT</p><h2>{profile.name}</h2><span>{profile.course}</span></div></div><div className="profile-stats"><div><strong>{listings.length}</strong><span>Listings</span></div><div><strong>{registered.length}</strong><span>Events joined</span></div><div><strong>4.9</strong><span>Trust score</span></div></div>{editing ? <div className="edit-fields"><label>Full name<input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label><label>Course & year<input value={draft.course} onChange={event => setDraft({ ...draft, course: event.target.value })} /></label><label>Email address<input value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} /></label></div> : <div className="profile-details"><div><span>Email</span><strong>{profile.email}</strong></div><div><span>Member since</span><strong>September 2025</strong></div><div><span>Home base</span><strong>North Campus</strong></div></div>}</section><aside className="profile-side"><div className="trust-card"><div className="trust-orbit"><span>4.9</span></div><div><p className="eyebrow">TRUST SCORE</p><h3>A good human, apparently.</h3><span>Built from 12 kind exchanges.</span></div></div><button className="profile-link" onClick={() => navigate('exchange')}><PackageOpen size={18} /><span><strong>Manage your listings</strong><small>{listings.length} items currently shared</small></span><ChevronRight size={16} /></button><button className="profile-link" onClick={() => navigate('events')}><CalendarDays size={18} /><span><strong>Review your calendar</strong><small>{registered.length} registrations this month</small></span><ChevronRight size={16} /></button></aside></div></>
}

const accountVideoUrls = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_030107_874273ea-684a-4e90-bb96-8fdfde48d53d.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_032424_3c9c2a9d-807b-4482-80e6-dd6d9dfd4545.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260627_094019_4214ea73-b963-46a4-8327-61489192de99.mp4',
]

function AccountHero({ profile, onSave, listings, registered, requests, navigate }) {
  const [activeVideo, setActiveVideo] = useState(0)
  const [sources, setSources] = useState(accountVideoUrls)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)
  const [clock, setClock] = useState('')
  useEffect(() => {
    const updateClock = () => setClock(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()))
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    let objectUrls = []
    Promise.all(accountVideoUrls.map(async url => { try { const response = await fetch(url); const blob = await response.blob(); const objectUrl = URL.createObjectURL(blob); objectUrls.push(objectUrl); return objectUrl } catch { return url } })).then(setSources)
    return () => objectUrls.forEach(url => URL.revokeObjectURL(url))
  }, [])
  const save = () => { onSave(draft); setEditing(false) }
  const initials = profile.name.split(' ').map(part => part[0]).join('')
  return <main className="account-hero"><div className="account-video-stack">{sources.map((source, index) => <video key={source} src={source} className={activeVideo === index ? 'is-active' : ''} muted autoPlay loop playsInline preload="auto" />)}</div><div className="account-video-shade" /><header className="account-nav"><button className="account-logo" onClick={() => navigate('overview')}>CampusLoop</button><nav><button onClick={() => navigate('overview')}>Overview</button><button onClick={() => navigate('exchange')}>Resource Exchange</button><button onClick={() => navigate('events')}>Events</button></nav><div className="account-nav-right"><span>{profile.email}</span><span>LOCAL {clock}</span></div></header><section className="account-content"><div className="account-topline"><div><p className="account-label">01 / MY PROFILE</p><h1>{profile.name}<em>.</em></h1><p className="account-role">{profile.course} · Student account</p></div><div className="account-status"><span /> <b>Available for campus</b></div></div><div className="account-bottom"><div className="account-switcher"><p className="account-label">Profile view</p><button className={activeVideo === 0 ? 'is-active' : ''} onClick={() => setActiveVideo(0)}>01 / WATER WAVE</button><button className={activeVideo === 1 ? 'is-active' : ''} onClick={() => setActiveVideo(1)}>02 / GRIDWAVE</button><button className={activeVideo === 2 ? 'is-active' : ''} onClick={() => setActiveVideo(2)}>03 / LIGHT TUNNEL</button></div><div className="account-details"><p>{editing ? 'Keep your account details current for exchanges and campus registrations.' : `Your account holds ${listings.length} listings, ${registered.length} event registrations, and ${requests.length} exchange requests.`}</p>{editing ? <div className="account-edit-fields"><input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} aria-label="Full name" /><input value={draft.course} onChange={event => setDraft({ ...draft, course: event.target.value })} aria-label="Course and year" /><button onClick={save}>Save changes</button></div> : <button className="account-project-button" onClick={() => setEditing(true)}>Edit account <ArrowUpRight size={16} /></button>}</div></div></section><div className="account-stats"><span>{listings.length} Shared Listings</span><i>|</i><span>{registered.length} Events Joined</span><i>|</i><span>{requests.length} Requests Sent</span><i>|</i><span>Trust 4.9</span></div></main>
}

function RequestHistory({ requests }) {
  return <section className="request-history"><div className="section-heading"><div><p className="eyebrow">EXCHANGE ACTIVITY</p><h2>Requests sent</h2></div><span className="result-count">{requests.length} total</span></div>{requests.length === 0 ? <p className="empty-copy">No requests yet. Find something useful in the exchange.</p> : <div className="request-history-list">{requests.slice(0, 5).map(request => <div className="request-row" key={request.id}><span><strong>{request.listing?.title || 'Campus listing'}</strong><small>{new Date(request.createdAt).toLocaleDateString()} · {request.status}</small></span><Check size={15} /></div>)}</div>}</section>
}

function CreateListing({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', category: 'Books', condition: 'Good', mode: 'Borrow', price: 'Free', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80' })
  const submit = (event) => { event.preventDefault(); if (!form.title.trim()) return; onSubmit(form) }
  return <div className="modal-backdrop"><form className="modal listing-modal" onSubmit={submit}><button type="button" className="modal-close" onClick={onClose}><X size={18} /></button><p className="eyebrow">NEW LISTING</p><h2>Share something useful.</h2><p className="modal-copy">A clear title is all it takes to get started. You can add photos later.</p><label>What are you sharing?<input autoFocus value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="e.g. A really good desk lamp" /></label><div className="field-row"><label>Category<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}><option>Books</option><option>Electronics</option><option>Study gear</option><option>Room & living</option></select></label><label>Condition<select value={form.condition} onChange={event => setForm({ ...form, condition: event.target.value })}><option>Like new</option><option>Good</option><option>Well loved</option></select></label></div><div className="mode-select"><span>How can people have it?</span><div>{['Borrow', 'Exchange', 'Give away'].map(mode => <button type="button" className={form.mode === mode ? 'selected' : ''} key={mode} onClick={() => setForm({ ...form, mode })}>{mode}</button>)}</div></div><div className="modal-actions"><button type="button" className="button button-light" onClick={onClose}>Cancel</button><button className="button button-dark" type="submit">Publish listing <ArrowUpRight size={16} /></button></div></form></div>
}

function AuthModal({ profile, onClose, onSignedOut }) { return <div className="modal-backdrop"><div className="modal auth-modal"><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="auth-orb"><Leaf size={22} /></div><p className="eyebrow">CAMPUSLOOP ACCOUNT</p><h2>Welcome back, {profile.name.split(' ')[0]}.</h2><p className="modal-copy">Your account is securely connected to the CampusLoop API. Your listings, registrations, and profile changes are saved for your next visit.</p><div className="signed-in"><div className="avatar avatar-coral">{profile.name.split(' ').map(part => part[0]).join('')}</div><span><strong>{profile.email}</strong><small>Student account · North Campus</small></span><Check size={18} /></div><button className="button button-dark full-button" onClick={onClose}>Continue to CampusLoop <ArrowUpRight size={16} /></button><button className="sign-out" onClick={onSignedOut}>Sign out</button></div></div> }

function EventModal({ event, registered, onClose, onRegister }) { return <div className="modal-backdrop"><div className="modal event-modal"><button className="modal-close" onClick={onClose}><X size={18} /></button><img src={event.image} alt="" /><div className="event-modal-content"><p className="eyebrow">{event.host} · {event.type}</p><h2>{event.title}</h2><p>{event.description}</p><div className="event-modal-facts"><span><Clock3 size={16} />{event.time}</span><span><Compass size={16} />{event.place}</span></div><button className={`button ${registered ? 'button-success' : 'button-dark'} full-button`} onClick={onRegister}>{registered ? <><Check size={15} /> You’re going</> : <>Join this event <Ticket size={15} /></>}</button></div></div></div> }

createRoot(document.getElementById('root')).render(<App />)
