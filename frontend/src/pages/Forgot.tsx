import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

/**
 * Forgot — запит на відновлення пароля.
 *
 * Бекенд email-флоу (токен + лист) ще не реалізовано, тож сторінка показує
 * стан «лист надіслано» локально. Коли зʼявиться endpoint — підставити виклик сюди.
 */
export default function Forgot() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO(backend): POST /api/auth/forgot-password { email }
    setSent(true)
  }

  return (
    <>
      <Nav />
      <main className="auth-main">
        <div className="auth-card fade-up d2">
          <div className="auth-pin tl" /><div className="auth-pin tr" />
          <div className="auth-pin bl" /><div className="auth-pin br" />

          {!sent ? (
            <>
              <div className="auth-eyebrow">☾ Відновлення ключа</div>
              <h1>Забули <span className="accent">пароль?</span></h1>
              <p className="auth-sub">
                Буває. Введіть пошту — надішлемо посилання для відновлення.
                Карти пам'ятають усіх своїх подорожників.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Електронна пошта</label>
                  <input
                    type="email"
                    placeholder="raven@nightsky.ua"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary auth-submit">
                  Надіслати посилання →
                </button>
              </form>

              <div className="auth-aux">
                Згадали? <Link to="/login">Повернутися до входу</Link>
              </div>
            </>
          ) : (
            <div className="recover-success">
              <div className="glyph">✉</div>
              <h2>Лист <span className="accent">вирушив</span></h2>
              <p>Ми надіслали посилання для відновлення пароля на</p>
              <p className="email">{email}</p>
              <p style={{ marginTop: 20 }}>
                Перевірте пошту — інколи Місяць ховає листи у папку «Спам».
                Посилання дійсне 1 годину.
              </p>
              <Link to="/login" className="btn btn-ghost" style={{ marginTop: 12 }}>
                ← До входу
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
