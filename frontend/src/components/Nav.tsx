import {useEffect, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import BrandMark from './BrandMark'
import {auth, supportApi} from '../lib/api'

export function Nav() {
    const navigate = useNavigate()
    const loggedIn = auth.isAuthenticated()
    const isAdmin = auth.getUser()?.role === 'Admin'
    // мобільне меню (бургер); на десктопі ігнорується — кнопки видно завжди
    const [open, setOpen] = useState(false)
    // нові відповіді адміна в чаті підтримки
    const [unread, setUnread] = useState(0)

    useEffect(() => {
        if (!loggedIn) return
        supportApi.unread().then(setUnread).catch(() => { /* не критично */ })
    }, [loggedIn])

    const handleLogout = () => {
        auth.clearToken()
        navigate('/login')
    }

    return (
        <nav className={`site-nav${open ? ' open' : ''}`}>
            <Link to="/" className="brand">
                <BrandMark size={28}/>
                <span>Lunaris</span>
            </Link>
            <button
                type="button"
                className="burger"
                aria-label="Меню"
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
            >
                <span/><span/><span/>
            </button>
            {/* клік по будь-якому пункту «спливає» сюди і закриває меню */}
            <div className="nav-links" onClick={() => setOpen(false)}>
                <Link to="/library" className="btn">Бібліотека</Link>
                <Link to="/matrix" className="btn">Матриця</Link>
                <Link to="/trainer" className="btn">Тренер</Link>
                <Link to="/pricing" className="btn">Пакети</Link>
                <Link to="/faq" className="btn">FAQ</Link>
                {loggedIn ? (
                    <>
                        <Link to="/chat" className="btn">Гадання</Link>
                        <Link to="/journal" className="btn">Журнал</Link>
                        {isAdmin && <Link to="/admin" className="btn btn-primary">Адмінка</Link>}
                        <Link to="/support" className="btn">
                            Підтримка{unread > 0 && <span className="nav-badge">{unread}</span>}
                        </Link>
                        <Link to="/profile" className="btn">Профіль</Link>
                        <button type="button" className="btn" onClick={handleLogout}>Вийти</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn">Вхід</Link>
                        <Link to="/register" className="btn btn-primary">Приєднатися →</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Nav
