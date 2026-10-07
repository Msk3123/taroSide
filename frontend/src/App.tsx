import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { track } from './lib/analytics'
import Corners from './components/Corners'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Guest from './pages/Guest'
import Chat from './pages/Chat'
import Pricing from './pages/Pricing'
import Library from './pages/Library'
import Admin from './pages/Admin'
import Faq from './pages/Faq'
import Profile from './pages/Profile'
import Forgot from './pages/Forgot'
import Reset from './pages/Reset'
import NotFound from './pages/NotFound'
import About from './pages/About'
import CardDetail from './pages/CardDetail'
import Trainer from './pages/Trainer'
import TrainerSession from './pages/TrainerSession'
import Journal from './pages/Journal'
import Reading from './pages/Reading'
import Deck from './pages/Deck'
import Matrix from './pages/Matrix'
import Support from './pages/Support'

/**
 * Admin page renders its own full-screen dashboard layout and
 * should NOT have the floating gold corners that the marketing
 * pages use. Decide based on pathname.
 */
function Chrome() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const isChat = pathname.startsWith('/chat')
  // 404 та інші повноекранні маршрути малюють власний фон без плаваючих кутів.
  const knownPaths = ['/', '/login', '/register', '/guest', '/chat', '/pricing',
    '/library', '/admin', '/faq', '/profile', '/forgot', '/reset', '/about', '/trainer',
    '/trainer-session', '/journal', '/reading', '/matrix', '/deck', '/support']
  const isUnknown = !knownPaths.includes(pathname) && !pathname.startsWith('/card')
  if (isAdmin || isChat || isUnknown) return null
  return <Corners />
}

/** Шле page_view на кожну зміну маршруту (SPA не перезавантажує сторінку, тож сам сервер цього не бачить). */
function PageTracker() {
  const { pathname } = useLocation()
  // StrictMode у dev запускає ефект двічі — не рахуємо той самий шлях двічі поспіль
  const last = useRef<string | null>(null)
  useEffect(() => {
    if (last.current === pathname) return
    last.current = pathname
    track('page_view', pathname)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <Chrome />
      <PageTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/library" element={<Library />} />
        <Route path="/deck" element={<Deck />} />
        <Route path="/matrix" element={<Matrix />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/about" element={<About />} />
        <Route path="/trainer" element={<Trainer />} />
        <Route path="/trainer-session" element={<TrainerSession />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/card/:rom" element={<CardDetail />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
