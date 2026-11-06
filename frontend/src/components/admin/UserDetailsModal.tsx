import { useEffect, useState } from 'react'
import { adminApi, UNLIMITED, type AdminUser, type AdminUserDetails } from '../../lib/api'
import UserConversations from './UserConversations'

type PaidRole = 'Free' | 'Premium' | 'Vip'

const TERMS: { label: string; days: number | null }[] = [
  { label: '7 днів', days: 7 },
  { label: '30 днів', days: 30 },
  { label: '90 днів', days: 90 },
  { label: 'Назавжди', days: null },
]

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
const lim = (n: number) => (n >= UNLIMITED ? '∞' : String(n))

interface Props {
  userId: string
  onClose: () => void
  /** Оновлений рядок — щоб батьківська таблиця не перезавантажувалась. */
  onUpdated: (u: AdminUser) => void
  onWrite: (userId: string) => void
}

/**
 * Картка користувача: профіль, активність, переписки з Lunaris і видача тарифу на термін.
 */
export default function UserDetailsModal({ userId, onClose, onUpdated, onWrite }: Props) {
  const [u, setU] = useState<AdminUserDetails | null>(null)
  const [role, setRole] = useState<PaidRole>('Premium')
  const [days, setDays] = useState<number | null>(30)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    adminApi.userDetails(userId).then(setU).catch(e => setMsg({ kind: 'err', text: (e as Error).message }))
  }, [userId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function grant() {
    try {
      const updated = await adminApi.grantSubscription(userId, role, role === 'Free' ? null : days)
      onUpdated(updated)
      setU(await adminApi.userDetails(userId))
      setMsg({ kind: 'ok', text: role === 'Free' ? 'Підписку знято' : `Видано ${role} ${days ? `на ${days} днів` : 'назавжди'}` })
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    }
  }

  return (
    <div className="ud-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ud-card" role="dialog" aria-modal="true" aria-label="Профіль користувача">
        <button type="button" className="lock-close" onClick={onClose} aria-label="Закрити">✕</button>

        {!u ? (
          <div className="panel-sub">{msg?.text ?? 'Завантаження…'}</div>
        ) : (
          <>
            <div className="ud-head">
              <div className="ud-avatar">{u.userName.charAt(0).toUpperCase()}</div>
              <div>
                <h2>{u.userName}</h2>
                <div className="panel-sub">{u.email}</div>
              </div>
            </div>

            <div className="ud-stats">
              <div><span className="l">Тариф</span><span className="v">{u.role}</span></div>
              <div><span className="l">Діє до</span><span className="v">{u.subscriptionExpiresAt ? fmtDate(u.subscriptionExpiresAt) : (u.role === 'Free' ? '—' : 'безстроково')}</span></div>
              <div><span className="l">Зареєстрований</span><span className="v">{fmtDate(u.createdAt)}</span></div>
              <div><span className="l">Остання активність</span><span className="v">{fmtDate(u.lastActiveAt)}</span></div>
              <div><span className="l">Розмов</span><span className="v">{u.conversationsCount}</span></div>
              <div><span className="l">Повідомлень</span><span className="v">{u.messagesCount}</span></div>
              <div><span className="l">Розкладів (усього)</span><span className="v">{u.readingsCount}</span></div>
              <div><span className="l">Листів у підтримку</span><span className="v">{u.supportMessagesCount}</span></div>
              <div><span className="l">Сьогодні розкладів</span><span className="v">{u.dailyQuestionsUsed} / {lim(u.readingsLimit)}</span></div>
              <div><span className="l">Сьогодні повідомлень</span><span className="v">{u.dailyChatMessagesUsed} / {lim(u.chatMessagesLimit)}</span></div>
              {u.activeDiscount && (
                <div><span className="l">Знижка за промокодом</span><span className="v">{u.activeDiscount.percent}% · {u.activeDiscount.code}</span></div>
              )}
            </div>

            {u.role === 'Admin' ? (
              <div className="panel-sub">Це адмін — тариф не потрібен.</div>
            ) : (
              <div className="ud-grant">
                <h3>Видати підписку</h3>
                <div className="ud-row">
                  {(['Premium', 'Vip', 'Free'] as PaidRole[]).map(r => (
                    <button key={r} type="button" className={`ud-chip ${role === r ? 'on' : ''}`} onClick={() => setRole(r)}>
                      {r === 'Free' ? 'Зняти (Free)' : r === 'Vip' ? 'VIP' : r}
                    </button>
                  ))}
                </div>
                {role !== 'Free' && (
                  <div className="ud-row">
                    {TERMS.map(t => (
                      <button key={t.label} type="button" className={`ud-chip ${days === t.days ? 'on' : ''}`} onClick={() => setDays(t.days)}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="ud-row">
                  <button type="button" className="btn btn-primary" onClick={grant}>Застосувати</button>
                  <button type="button" className="btn btn-ghost" onClick={() => onWrite(u.id)}>Написати в чат</button>
                </div>
                <div className="panel-sub">Коли термін мине, тариф сам повернеться на Free.</div>
              </div>
            )}
            {msg && <div className={`admin-status ${msg.kind}`}>{msg.text}</div>}

            <UserConversations userId={u.id} />
          </>
        )}
      </div>
    </div>
  )
}
