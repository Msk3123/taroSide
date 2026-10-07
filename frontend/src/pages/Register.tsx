import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { api } from '../lib/api'

/**
 * Реєстрація за дизайн-шаблоном register.html.
 * Бекенд приймає { userName, email, password } — поле «Повторіть» перевіряється
 * лише на клієнті, чекбокс згоди обов'язковий (атрибут required блокує сабміт).
 */
export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ userName: '', email: '', password: '' })
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: { target: HTMLInputElement }) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError(null)
    if (form.password !== password2) {
      setError('Паролі не збігаються')
      return
    }
    setLoading(true)
    try {
      await api('/api/auth/register', {
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
          <span className="auth-pin tl" /><span className="auth-pin tr" />
          <span className="auth-pin bl" /><span className="auth-pin br" />

          <div className="auth-eyebrow">☾ Новий подорожник ☾</div>
          <h1>Відкрий <span className="accent">колоду</span></h1>
          <p className="auth-sub">
            Створіть обліковий запис — і отримаєте 2 безкоштовні розклади на день,
            а вся історія розмов з Lunaris збережеться у вашому профілі.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="userName">Ім'я подорожника</label>
              <input
                id="userName"
                type="text"
                name="userName"
                placeholder="Як до вас звертатися?"
                value={form.userName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Поштова скринька</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="raven@lunaris.night"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-row">
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
              <div className="field">
                <label htmlFor="password2">Повторіть</label>
                <input
                  id="password2"
                  type="password"
                  placeholder="••••••••"
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                  required
                />
              </div>
            </div>

            <label className="auth-checkbox" style={{ margin: '8px 0 24px' }}>
              <input type="checkbox" required />
              <span>
                Розумію, що тлумачення створює ШІ — це інструмент рефлексії,
                а не порада лікаря, юриста чи фінансиста
              </span>
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Зачекайте…' : 'Ступити у темряву →'}
            </button>
          </form>

          <div className="auth-divider">або</div>

          <Link to="/guest" className="btn btn-ghost auth-submit">
            ✦ Продовжити як гість
          </Link>

          <div className="auth-aux">
            Вже є обліковий запис? <Link to="/login">Увійти</Link>
          </div>
        </div>
      </main>
    </>
  )
}
