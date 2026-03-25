import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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

/**
 * Admin page renders its own full-screen dashboard layout and
 * should NOT have the floating gold corners that the marketing
 * pages use. Decide based on pathname.
 */
function Chrome() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const isChat = pathname.startsWith('/chat')
  if (isAdmin || isChat) return null
  return <Corners />
}

export default function App() {
  return (
    <BrowserRouter>
      <Chrome />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/library" element={<Library />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
