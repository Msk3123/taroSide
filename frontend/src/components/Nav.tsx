import {Link, useNavigate} from 'react-router-dom'
import BrandMark from './BrandMark'
import {auth} from '../lib/api'

export function Nav() {
    const navigate = useNavigate()
    const loggedIn = auth.isAuthenticated()

    const handleLogout = () => {
        auth.clearToken()
        navigate('/login')
    }

    return (
        <nav>
            <Link to="/" className="brand">
                <BrandMark size={28}/>
                <span>Lunaris</span>
            </Link>
            <div className="nav-links">
                <Link to="/library" className="btn">Бібліотека</Link>
                <Link to="/pricing" className="btn">Пакети</Link>
                <Link to="/faq" className="btn">FAQ</Link>
                {loggedIn ? (
                    <>
                        <Link to="/chat" className="btn">Гадання</Link>
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
