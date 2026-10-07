import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

/**
 * Reset — встановлення нового пароля за посиланням з листа.
 *
 * Бекенд (перевірка токена + збереження) ще не реалізовано — сторінка показує
 * стан успіху локально. Логіка індикатора надійності та правил повністю робоча.
 */
const RULES = [
  { id: 'len', label: 'Мінімум 8 символів', test: (v: string) => v.length >= 8 },
  { id: 'up', label: 'Велика літера', test: (v: string) => /[A-ZА-ЯЇІЄ]/.test(v) },
  { id: 'num', label: 'Цифра', test: (v: string) => /\d/.test(v) },
  { id: 'sym', label: 'Спеціальний символ (! @ # …)', test: (v: string) => /[!@#$%^&*()_+\-={}\[\]|:;"'<>,.?/]/.test(v) },
]

export default function Reset() {
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  // setDone повернеться разом з ендпоінтом reset-password; поки успіху не буває
  const [done] = useState(false)
  const [mismatch, setMismatch] = useState(false)
  const [notReady, setNotReady] = useState(false)

  const passed = useMemo(() => RULES.map(r => r.test(p1)), [p1])
  const score = passed.filter(Boolean).length

  const strengthLabel = score < 2 ? '— Слабкий —' : score < 4 ? '— Середній —' : '— Сильний —'
  const strengthColor = score < 2 ? '#8a5a3a' : score < 4 ? 'var(--gold)' : 'var(--gold-soft)'
  // скільки смужок засвітити (з 3) і яким класом
  const litBars = Math.min(3, Math.ceil(score * 0.75))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (p1 !== p2) {
      setMismatch(true)
      return
    }
    // TODO(backend): POST /api/auth/reset-password { token, newPassword } — після нього повернути setDone(true).
    // Поки ендпоінта немає, не показуємо фальшивий «пароль оновлено».
    setMismatch(false)
    setNotReady(true)
  }

  return (
    <>
      <Nav />
      <main className="auth-main">
        <div className="auth-card fade-up d2">
          <div className="auth-pin tl" /><div className="auth-pin tr" />
          <div className="auth-pin bl" /><div className="auth-pin br" />

          {!done ? (
            <>
              <div className="auth-eyebrow">☾ Новий ключ</div>
              <h1>Створіть <span className="accent">пароль</span></h1>
              <p className="auth-sub">
                Посилання підтверджене. Придумайте новий пароль —
                він стане вашим ключем до колоди.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Новий пароль</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={p1}
                    onChange={e => setP1(e.target.value)}
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
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={p2}
                    onChange={e => { setP2(e.target.value); setMismatch(false) }}
                    style={mismatch ? { borderColor: '#d66666' } : undefined}
                    required
                  />
                </div>
                {notReady && (
                  <div className="auth-error">
                    Скидання пароля через пошту ще в розробці. Напишіть розробнику — відновимо доступ вручну
                    (див. <Link to="/forgot">сторінку відновлення</Link>).
                  </div>
                )}
                <button type="submit" className="btn btn-primary auth-submit">
                  Зберегти пароль →
                </button>
              </form>

              <div className="auth-aux">
                <Link to="/login">← Повернутися до входу</Link>
              </div>
            </>
          ) : (
            <div className="recover-success">
              <div className="glyph">✦</div>
              <h2>Пароль <span className="accent">оновлено</span></h2>
              <p>Новий ключ прийнятий. Карти вас впізнають — час повертатися до колоди.</p>
              <Link to="/login" className="btn btn-primary">Увійти →</Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
