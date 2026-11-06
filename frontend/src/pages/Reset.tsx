import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav'
import PasswordInput from '../components/PasswordInput'
import { api } from '../lib/api'

/**
 * Reset — встановлення нового пароля за посиланням з листа (/reset?uid=…&token=…).
 * Правила збігаються з бекендом: Identity зараховує лише латинські великі й малі літери.
 */
const RULES = [
  { id: 'len', label: 'Мінімум 8 символів', test: (v: string) => v.length >= 8 },
  { id: 'up', label: 'Велика латинська літера (A–Z)', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'low', label: 'Мала латинська літера (a–z)', test: (v: string) => /[a-z]/.test(v) },
  { id: 'num', label: 'Цифра', test: (v: string) => /\d/.test(v) },
]

export default function Reset() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('uid')
  const token = searchParams.get('token')

  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [done, setDone] = useState(false)
  const [mismatch, setMismatch] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passed = useMemo(() => RULES.map(r => r.test(p1)), [p1])
  const score = passed.filter(Boolean).length

  const strengthLabel = score < 2 ? '— Слабкий —' : score < 4 ? '— Середній —' : '— Сильний —'
  const strengthColor = score < 2 ? '#8a5a3a' : score < 4 ? 'var(--gold)' : 'var(--gold-soft)'
  // скільки смужок засвітити (з 3) і яким класом
  const litBars = Math.min(3, Math.ceil(score * 0.75))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (p1 !== p2) {
      setMismatch(true)
      return
    }
    setMismatch(false)
    setLoading(true)
    try {
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ userId, token, newPassword: p1 }),
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося оновити пароль')
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

          {done ? (
            <div className="recover-success">
              <div className="glyph">✦</div>
              <h2>Пароль <span className="accent">оновлено</span></h2>
              <p>Новий ключ прийнятий. Карти вас впізнають — час повертатися до колоди.</p>
              <Link to="/login" className="btn btn-primary">Увійти →</Link>
            </div>
          ) : !userId || !token ? (
            <>
              <div className="auth-eyebrow">☾ Новий ключ</div>
              <h1>Посилання <span className="accent">неповне</span></h1>
              <p className="auth-sub">
                Відкрийте посилання з листа повністю або запросіть новий лист.
              </p>
              <Link to="/forgot" className="btn btn-primary auth-submit">Запросити новий лист →</Link>
            </>
          ) : (
            <>
              <div className="auth-eyebrow">☾ Новий ключ</div>
              <h1>Створіть <span className="accent">пароль</span></h1>
              <p className="auth-sub">
                Придумайте новий пароль — він стане вашим ключем до колоди.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Новий пароль</label>
                  <PasswordInput
                    placeholder="••••••••"
                    value={p1}
                    onChange={e => setP1(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <div className="strength">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`bar${i < litBars ? ` on-${litBars}` : ''}`} />
                    ))}
                  </div>
                  <div className="strength-label" style={{ color: strengthColor }}>
                    {p1 ? strengthLabel : '— Надійність паролю —'}
                  </div>
                </div>

                <ul className="rules">
                  {RULES.map((r, i) => (
                    <li key={r.id} className={passed[i] ? 'ok' : ''}>{r.label}</li>
                  ))}
                </ul>

                <div className="field">
                  <label>Підтвердіть пароль</label>
                  <PasswordInput
                    placeholder="••••••••"
                    value={p2}
                    onChange={e => { setP2(e.target.value); setMismatch(false) }}
                    style={mismatch ? { borderColor: '#d66666' } : undefined}
                    autoComplete="new-password"
                    required
                  />
                </div>
                {mismatch && <div className="auth-error">Паролі не збігаються</div>}
                {error && (
                  <div className="auth-error">
                    {error} <Link to="/forgot">Запросити новий лист</Link>
                  </div>
                )}
                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? 'Зачекайте…' : 'Зберегти пароль →'}
                </button>
              </form>

              <div className="auth-aux">
                <Link to="/login">← Повернутися до входу</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
