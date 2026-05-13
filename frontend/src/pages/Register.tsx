import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { api } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ userName: '', email: '', password: '' })
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
      await api('/api/user', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка реєстрації')
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

          <div className="auth-eyebrow">Lunaris · Реєстрація</div>
          <h1>Ваш <span className="accent">шлях починається</span></h1>
          <p className="auth-sub">
            Створіть акаунт, щоб зберігати розклади та отримувати персональні тлумачення.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field">
                <label>Ім'я (нікнейм)</label>
                <input
                  type="text"
                  name="userName"
                  placeholder="Максим"
                  value={form.userName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Дата народження</label>
                <input type="date" />
              </div>
            </div>
            <div className="field">
              <label>Електронна пошта</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input
                type="password"
                name="password"
                placeholder="Мінімум 8 символів"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Зачекайте...' : 'Приєднатися →'}
            </button>
          </form>

          <div className="auth-aux">
            Вже маєте акаунт?{' '}
            <Link to="/login">Увійти</Link>
          </div>
        </div>
      </main>
    </>
  )
}
