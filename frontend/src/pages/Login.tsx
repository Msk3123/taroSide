import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { api, auth, type CurrentUser } from '../lib/api'

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
          <div className="auth-pin tl" /><div className="auth-pin tr" />
          <div className="auth-pin bl" /><div className="auth-pin br" />

          <div className="auth-eyebrow">Lunaris · Вхід</div>
          <h1>Вітаємо, <span className="accent">подорожнику</span></h1>
          <p className="auth-sub">
            Введіть дані, щоб продовжити свій шлях крізь шепіт карт.
          </p>

            <form onSubmit={handleSubmit}>
              <div className="field-row">
                <div className="field">
                  <label>Ім'я (нікнейм)</label>
                  <input
                  type={"text"}
                  name={"userName"}
                  placeholder="Максим"
                  value={form.userName}
                  onChange={handleChange}
                  required
                  />
                </div>
                <div className="field">
                  <label>Пароль</label>
                  <input
                  type={"password"}
                  name={"password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  />
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Завантаження...' : 'Увійти'}
              </button>
            </form>

          <div className="auth-aux">
            Ще не з нами?{' '}
            <Link to="/register">Створити акаунт</Link>
          </div>
        </div>
      </main>
    </>
  )
}
