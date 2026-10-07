import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { auth, supportApi, type SupportMessage } from '../lib/api'
import { TIKTOK_URL } from '../lib/links'

/** Як часто перевіряти нові відповіді адміна, поки сторінка відкрита. */
const POLL_MS = 15_000

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

/**
 * Чат користувача з адміном: питання, купівля підписки, баги.
 * Без WebSocket — просте опитування раз на 15 с. Для листування з підтримкою цього досить,
 * а коду вдесятеро менше (SignalR можна додати потім, коли буде потреба в «миттєвості»).
 */
export default function Support() {
  const loggedIn = auth.isAuthenticated()
  const [messages, setMessages] = useState<SupportMessage[] | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!loggedIn) return
    const load = () => supportApi.thread().then(setMessages).catch(() => setMessages(m => m ?? []))
    load()
    const t = setInterval(load, POLL_MS)
    return () => clearInterval(t)
  }, [loggedIn])

  // Нове повідомлення → прокручуємо донизу
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages?.length])

  async function send() {
    const v = text.trim()
    if (!v || sending) return
    setSending(true)
    setError(null)
    try {
      const msg = await supportApi.send(v)
      setMessages(prev => [...(prev ?? []), msg])
      setText('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося надіслати')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Nav />
      <main className="sp-main">
        <div className="sp-head fade-up d1">
          <div className="f-eyebrow">Підтримка</div>
          <h1 className="f-title">Напишіть <span className="accent">розробнику</span></h1>
          <p className="f-lede">
            Питання, ідея, баг або хочете Premium/VIP раніше, ніж запрацює оплата на сайті —
            пишіть сюди. Відповідає сам розробник, зазвичай протягом дня.
          </p>
        </div>

        {!loggedIn ? (
          <div className="sp-card fade-up d2">
            <p>Щоб написати в підтримку, увійдіть в акаунт — так ми знатимемо, кому відповісти і кому видати підписку.</p>
            <div className="sp-actions">
              <Link to="/login" className="btn btn-primary">Увійти</Link>
              <Link to="/register" className="btn btn-ghost">Створити акаунт</Link>
            </div>
            <p className="sp-note">
              Не можете увійти (наприклад, забули пароль)? Напишіть нам у{' '}
              <a href={TIKTOK_URL} target="_blank" rel="noreferrer">TikTok</a>.
            </p>
          </div>
        ) : (
          <div className="sp-card sp-chat fade-up d2">
            <div className="sp-list" ref={listRef}>
              {messages === null && <div className="sp-empty">Завантаження…</div>}
              {messages?.length === 0 && (
                <div className="sp-empty">
                  Тут поки порожньо. Напишіть, що вас цікавить, — наприклад:
                  «Хочу Premium на місяць, як це зробити?»
                </div>
              )}
              {messages?.map(m => (
                <div key={m.id} className={`sp-msg ${m.fromAdmin ? 'admin' : 'me'}`}>
                  <div className="sp-who">{m.fromAdmin ? 'Розробник Lunaris' : 'Ви'} · {fmt(m.createdAt)}</div>
                  <div className="sp-text">{m.text}</div>
                </div>
              ))}
            </div>
            <div className="sp-compose">
              <textarea
                value={text}
                maxLength={2000}
                placeholder="Ваше повідомлення…"
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                  // Enter — надіслати, Shift+Enter — новий рядок
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
                }}
              />
              <button type="button" className="btn btn-primary" onClick={send} disabled={sending || !text.trim()}>
                {sending ? '…' : 'Надіслати'}
              </button>
            </div>
            {error && <div className="sp-error">{error}</div>}
          </div>
        )}
      </main>
    </>
  )
}
