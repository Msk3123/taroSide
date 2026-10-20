import {useNavigate} from 'react-router-dom'
import {auth} from '../lib/api'

/** Вихід з акаунта: чистимо токен і ведемо на /login. Спільне для Nav і сайдбару чату. */
export function useLogout() {
    const navigate = useNavigate()
    return () => {
        auth.clearToken()
        navigate('/login')
    }
}
