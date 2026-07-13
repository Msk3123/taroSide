import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { api, auth, type CurrentUser } from '../lib/api'

/**
 * Вхід за дизайн-шаблоном login.html.
 * Поле «Поштова скринька або ім'я» прив'язане до userName, бо саме його
 * очікує бекенд (/api/auth/login). «Запам'ятати» — поки що декоративний чекбокс.
 */
export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ userName: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: { target: HTMLInputElement }) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await api<{ token: string; userName: string; role: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      auth.setToken(data.token)

      const user = await api<CurrentUser>('/api/user/me')
      auth.setUser(user)

      navigate('/profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося з\'єднатися з сервером')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />
      <main className="auth-main">
        <div className="auth-card fade-up d2">
          <span className="auth-pin tl" /><span className="auth-pin tr" />
          <span className="auth-pin bl" /><span className="auth-pin br" />

          <div className="auth-eyebrow">☾ Повернення ☾</div>
          <h1>З поверненням, <span className="accent">мрійнику</span></h1>
          <p className="auth-sub">
            Карти чекали на вас. Увійдіть, щоб продовжити свою подорож крізь Аркани
            та переглянути збережені розклади.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="userName">Поштова скринька або ім'я</label>
              <input
                id="userName"
                type="text"
                name="userName"
                placeholder="raven@lunaris.night"
                value={form.userName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Таємне слово</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-options">
              <label className="auth-checkbox">
                <input type="checkbox" />
                <span>Запам'ятати</span>
              </label>
              <Link to="/forgot" className="auth-forgot">Забули слово?</Link>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Завантаження…' : 'Відкрити колоду →'}
            </button>
          </form>

          <div className="auth-divider">або</div>

          <Link to="/guest" className="btn btn-ghost auth-submit">
            ✦ Продовжити як гість
          </Link>

          <div className="auth-aux">
            Новий тут? <Link to="/register">Створити акаунт</Link>
          </div>
        </div>
      </main>
    </>
  )
}
