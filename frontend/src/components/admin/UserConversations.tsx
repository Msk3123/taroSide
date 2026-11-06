import { useEffect, useState } from 'react'
import { adminApi, type AdminConversation, type AdminMessage, type DrawnCard } from '../../lib/api'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function parseCards(json: string | null): DrawnCard[] {
  if (!json) return []
  try {
    return JSON.parse(json) as DrawnCard[]
  } catch {
    return []
  }
}

/** Той самий маркер курсиву, що й у чаті: *текст* → <em>. */
function renderText(text: string) {
  return text.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : <span key={i}>{part}</span>)
}

/** Переписки користувача з Lunaris: лише читання. Кожен перегляд бекенд пише в лог. */
export default function UserConversations({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<AdminConversation[] | null>(null)
  const [open, setOpen] = useState<AdminConversation | null>(null)
  const [messages, setMessages] = useState<AdminMessage[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi.userConversations(userId).then(setConversations).catch(e => setError((e as Error).message))
  }, [userId])

  async function openConversation(c: AdminConversation) {
    setOpen(c)
    setMessages(null)
    setError(null)
    try {
      setMessages(await adminApi.userConversation(userId, c.id))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="ud-chats">
      <h3>Переписки{conversations && ` (${conversations.length})`}</h3>
      {error && <div className="admin-status err">{error}</div>}

      {open ? (
        <>
          <button type="button" className="ud-chip ud-chat-back" onClick={() => setOpen(null)}>← До списку</button>
          <div className="ud-chat-title">{open.title}</div>
          {!messages && !error && <div className="panel-sub">Завантаження…</div>}
          {messages?.length === 0 && <div className="panel-sub">У цій розмові ще немає повідомлень.</div>}
          <div className="ud-chat-log">
            {messages?.map(m => {
              const cards = parseCards(m.cardsJson)
              return (
                <div key={m.id} className={`ud-msg ${m.role === 'user' ? 'user' : 'oracle'}`}>
                  <div className="ud-msg-who">{m.role === 'user' ? 'Користувач' : 'Lunaris'} · {fmtDate(m.createdAt)}</div>
                  {cards.length > 0 && (
                    <div className="ud-msg-cards">
                      {cards.map(c => `${c.symbol} ${c.name}${c.isReversed ? ' ↓' : ''}`).join(' · ')}
                    </div>
                  )}
                  <div className="ud-msg-text">{renderText(m.content)}</div>
                </div>
              )
            })}
          </div>
        </>
      ) : !conversations ? (
        !error && <div className="panel-sub">Завантаження…</div>
      ) : conversations.length === 0 ? (
        <div className="panel-sub">Людина ще не спілкувалась із Lunaris.</div>
      ) : (
        <div className="ud-chat-list">
          {conversations.map(c => (
            <button key={c.id} type="button" className="ud-chat-row" onClick={() => openConversation(c)}>
              <span className="t">{c.title}</span>
              <span className="s">{fmtDate(c.updatedAt)} · {c.messagesCount} повід. · {c.readingsCount} розкл.</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
