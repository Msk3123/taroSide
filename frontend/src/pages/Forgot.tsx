import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { api } from '../lib/api'
import { TIKTOK_URL } from '../lib/links'

/**
 * Forgot — запит листа для відновлення пароля.
 * Бекенд відповідає однаково для наявної й невідомої пошти, тож і текст успіху нейтральний.
 */
export default function Forgot() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося надіслати лист')
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

          {sent ? (
            <div className="recover-success">
              <div className="glyph">✦</div>
              <h2>Перевірте <span className="accent">пошту</span></h2>
              <p>
                Якщо акаунт із такою поштою існує, ми надіслали на неї посилання для нового пароля.
                Воно діє 1 годину. Не бачите листа? Загляньте в «Спам».
              </p>
              <Link to="/login" className="btn btn-primary">Повернутися до входу</Link>
            </div>
          ) : (
            <>
              <div className="auth-eyebrow">☾ Відновлення ключа</div>
              <h1>Забули <span className="accent">пароль?</span></h1>
              <p className="auth-sub">
                Вкажіть пошту, з якою реєструвались, і ми надішлемо посилання для нового пароля.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="email">Поштова скринька</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="raven@lunaris.night"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                  />
                </div>

                {error && (
                  <div className="auth-error">
                    {error}{' '}
                    <a href={TIKTOK_URL} target="_blank" rel="noreferrer">Написати в TikTok ↗</a>
                  </div>
                )}

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? 'Зачекайте…' : 'Надіслати посилання →'}
                </button>
              </form>

              <div className="auth-aux">
                Згадали? <Link to="/login">Повернутися до входу</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
