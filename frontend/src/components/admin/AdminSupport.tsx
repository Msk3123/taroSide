import { useCallback, useEffect, useRef, useState } from 'react'
import { adminApi, type SupportMessage, type SupportThread } from '../../lib/api'

const POLL_MS = 15_000

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

interface Props {
  /** Відкрити одразу гілку цього юзера (кнопка «Написати» в картці користувача). */
  initialUserId: string | null
  /** Відкрити картку юзера (щоб видати підписку просто з листування). */
  onOpenUser: (userId: string) => void
  /** Повідомити батька про кількість непрочитаних (бейдж у сайдбарі). */
  onUnreadChange: (count: number) => void
}

/** Вкладка «Підтримка»: зліва «вхідні», справа листування з вибраним користувачем. */
export default function AdminSupport({ initialUserId, onOpenUser, onUnreadChange }: Props) {
  const [threads, setThreads] = useState<SupportThread[]>([])
  const [active, setActive] = useState<string | null>(initialUserId)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const loadThreads = useCallback(() => {
    adminApi.supportThreads()
      .then(t => { setThreads(t); onUnreadChange(t.reduce((s, x) => s + x.unread, 0)) })
      .catch(e => setError((e as Error).message))
  }, [onUnreadChange])

  useEffect(() => {
    loadThreads()
    const t = setInterval(loadThreads, POLL_MS)
    return () => clearInterval(t)
  }, [loadThreads])

  useEffect(() => {
    if (!active) return
    // відкриття гілки на бекенді позначає її прочитаною → оновлюємо і список
    adminApi.supportThread(active).then(m => { setMessages(m); loadThreads() }).catch(e => setError((e as Error).message))
  }, [active, loadThreads])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length])

  async function reply() {
    const v = text.trim()
    if (!v || !active) return
    try {
      const m = await adminApi.supportReply(active, v)
      setMessages(prev => [...prev, m])
      setText('')
      loadThreads()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const current = threads.find(t => t.userId === active)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Чат <span className="accent">підтримки</span></h1>
          <div className="sub">Користувачі пишуть зі сторінки «Підтримка» · оновлення кожні 15 с</div>
        </div>
      </div>
      {error && <div className="admin-status err an-pad">{error}</div>}

      <div className={`su-grid ${active ? 'has-active' : ''}`}>
        <div className="panel su-threads">
          <h2>Вхідні</h2>
          {threads.length === 0 && <div className="panel-sub">Поки ніхто не писав</div>}
          {threads.map(t => (
            <button
              key={t.userId}
              type="button"
              className={`su-thread ${t.userId === active ? 'on' : ''}`}
              onClick={() => setActive(t.userId)}
            >
              <div className="row">
                <span className="nm">{t.userName}</span>
                {t.unread > 0 && <span className="su-badge">{t.unread}</span>}
              </div>
              <div className="last">{t.lastFromAdmin ? 'Ви: ' : ''}{t.lastText}</div>
              <div className="meta">{t.role} · {fmt(t.lastAt)}</div>
            </button>
          ))}
        </div>

        <div className="panel su-chat">
          {!active ? (
            <div className="empty-state"><div className="glyph">☾</div><div className="t">Оберіть розмову зліва</div></div>
          ) : (
            <>
              <div className="su-chat-head">
                <button type="button" className="btn su-back" onClick={() => setActive(null)}>←</button>
                <div>
                  <div className="nm">{current?.userName ?? 'Користувач'}</div>
                  <div className="meta">{current?.email} · {current?.role}</div>
                </div>
                <button type="button" className="btn btn-ghost" onClick={() => onOpenUser(active)}>
                  Профіль і підписка
                </button>
              </div>
              <div className="sp-list" ref={listRef}>
                {messages.length === 0 && <div className="sp-empty">Повідомлень ще немає — напишіть першим.</div>}
                {messages.map(m => (
                  <div key={m.id} className={`sp-msg ${m.fromAdmin ? 'me' : 'admin'}`}>
                    <div className="sp-who">{m.fromAdmin ? 'Ви' : current?.userName ?? 'Користувач'} · {fmt(m.createdAt)}</div>
                    <div className="sp-text">{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="sp-compose">
                <textarea
                  value={text}
                  maxLength={2000}
                  placeholder="Відповідь…"
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); reply() } }}
                />
                <button type="button" className="btn btn-primary" onClick={reply} disabled={!text.trim()}>Надіслати</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
