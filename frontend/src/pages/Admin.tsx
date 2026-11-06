import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { adminApi, auth, type AdminUser, type AdminStats } from '../lib/api'
import AdminAnalytics from '../components/admin/AdminAnalytics'
import AdminPromos from '../components/admin/AdminPromos'
import AdminSupport from '../components/admin/AdminSupport'
import UserDetailsModal from '../components/admin/UserDetailsModal'

type Tab = 'users' | 'promos' | 'analytics' | 'support'

const CRUMBS: Record<Tab, [string, string]> = {
  users: ['Спільнота', 'Користувачі'],
  promos: ['Спільнота', 'Промокоди'],
  analytics: ['Система', 'Аналітика'],
  support: ['Спільнота', 'Підтримка'],
}

const ALL_ROLES: AdminUser['role'][] = ['Guest', 'Free', 'Premium', 'Vip', 'Admin']

export default function Admin() {
  const [tab, setTab] = useState<Tab>('users')
  // Картка користувача (модалка) і з ким відкрити чат підтримки
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [supportUserId, setSupportUserId] = useState<string | null>(null)
  const [supportUnread, setSupportUnread] = useState(0)
  const onUnreadChange = useCallback((n: number) => setSupportUnread(n), [])
  // мобільна «шухляда» з меню адмінки
  const [sbOpen, setSbOpen] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'err', text: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const navigate = useNavigate()
  // Свій рядок у таблиці блокуємо: бекенд однаково не дасть змінити/видалити себе
  const currentUserId = auth.getUser()?.id

  // Сторінка лише для адмінів. Це UX-заслін: реальний захист — [Authorize(Roles="Admin")]
  useEffect(() => {
    const u = auth.getUser()
    if (!u || u.role !== 'Admin') navigate('/login')
  }, [navigate])

  // Бейдж «Підтримка» в сайдбарі видно з будь-якої вкладки
  useEffect(() => {
    adminApi.supportThreads()
      .then(t => setSupportUnread(t.reduce((sum, x) => sum + x.unread, 0)))
      .catch(() => { /* не критично */ })
  }, [])

  function go(t: Tab) {
    setTab(t)
    setSbOpen(false)
  }

  function openSupport(userId: string) {
    setSupportUserId(userId)
    setDetailsId(null)
    go('support')
  }

  function logout() {
    auth.clearToken()
    navigate('/login')
  }

  useEffect(() => {
    if (tab === 'users') {
      fetchUsers()
      fetchStats()
    }
  }, [tab])

  async function fetchUsers() {
    try {
      setUsers(await adminApi.listUsers())
    } catch (e) {
      setStatus({ kind: 'err', text: `Не вдалось завантажити користувачів: ${(e as Error).message}` })
    }
  }

  async function fetchStats() {
    try {
      setStats(await adminApi.stats())
    } catch {
      /* статистика не критична — таблиця працює й без неї */
    }
  }

  async function changeRole(id: string, role: AdminUser['role']) {
    try {
      const updated = await adminApi.setRole(id, role)
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)))
      showToast(`✦ Роль змінено на ${role}`)
    } catch (e) {
      setStatus({ kind: 'err', text: `Не вдалось змінити роль: ${(e as Error).message}` })
    }
  }

  async function delUser(id: string) {
    try {
      await adminApi.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      showToast('✕ Користувача видалено')
      fetchStats()
    } catch (e) {
      setStatus({ kind: 'err', text: `Не вдалось видалити: ${(e as Error).message}` })
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2000)
  }

  return (
    <div className="admin-app">
      {/* SIDEBAR */}
      <div className={`sb-backdrop ${sbOpen ? 'on' : ''}`} onClick={() => setSbOpen(false)} />
      <aside className={`sidebar ${sbOpen ? 'open' : ''}`}>
        <Link to="/" className="sb-brand">
          <span className="sb-brand-mark"><BrandMark size={22} /></span>
          <div>Lunaris <small>Admin</small></div>
        </Link>

        <div className="sb-group-label">Спільнота</div>
        <button type="button" className={`sb-item ${tab === 'users' ? 'active' : ''}`} onClick={() => go('users')}>
          <span className="ic">♁</span> Користувачі й підписки
        </button>
        <button type="button" className={`sb-item ${tab === 'promos' ? 'active' : ''}`} onClick={() => go('promos')}>
          <span className="ic">✦</span> Промокоди
        </button>
        <button type="button" className={`sb-item ${tab === 'support' ? 'active' : ''}`} onClick={() => go('support')}>
          <span className="ic">✉</span> Підтримка
          {supportUnread > 0 && <span className="su-badge">{supportUnread}</span>}
        </button>

        <div className="sb-group-label">Система</div>
        <button type="button" className={`sb-item ${tab === 'analytics' ? 'active' : ''}`} onClick={() => go('analytics')}>
          <span className="ic">∞</span> Аналітика
        </button>
        <Link to="/" className="sb-item"><span className="ic">☾</span> На сайт</Link>
        <button type="button" className="sb-item" onClick={logout}><span className="ic">↗</span> Вихід</button>
      </aside>

      {/* MAIN */}
      <section className="main-scroll">
        <div className="topbar">
          <button
            type="button"
            className="head-btn sb-toggle"
            aria-label="Меню адмінки"
            aria-expanded={sbOpen}
            onClick={() => setSbOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M4 7h16M4 12h16M4 17h16"/>
            </svg>
          </button>
          <div className="breadcrumb">
            Lunaris <span className="sep">›</span>
            {CRUMBS[tab][0]} <span className="sep">›</span> <span className="cur">{CRUMBS[tab][1]}</span>
          </div>
          <div className="topbar-actions">
            <span className="admin-badge">✦ Адміністратор</span>
          </div>
        </div>

        {tab === 'analytics' && <AdminAnalytics />}
        {tab === 'promos' && <AdminPromos />}
        {tab === 'support' && (
          <AdminSupport key={supportUserId ?? "inbox"} initialUserId={supportUserId} onOpenUser={setDetailsId} onUnreadChange={onUnreadChange} />
        )}

        {tab === 'users' && (
        <>
        <div className="page-head">
          <div>
            <h1>Користувачі <span className="accent">спільноти</span></h1>
            <div className="sub">Ролі, тарифи та акаунти</div>
          </div>
          <div className="stats">
            <div className="stat"><div className="n">{stats?.totalUsers ?? '—'}</div><div className="l">користувачів</div></div>
            <div className="stat"><div className="n">{stats?.totalConversations ?? '—'}</div><div className="l">розмов</div></div>
            <div className="stat"><div className="n">{stats?.totalMessages ?? '—'}</div><div className="l">повідомлень</div></div>
          </div>
        </div>

        <div className="panel">
          <h2>
            Усі користувачі{' '}
            <span style={{ color: 'var(--gold-soft)', fontStyle: 'italic' }}>
              ({users.length})
            </span>
          </h2>
          <div className="panel-sub">Натисніть на ім'я — відкриється профіль: переписки, видача підписки, чат підтримки</div>
          {status && (
            <div className={`admin-status ${status.kind}`} style={{ marginBottom: 10 }}>{status.text}</div>
          )}

          <div className="card-list">
            {users.length === 0 ? (
              <div className="empty-state">
                <div className="glyph">♁</div>
                <div className="t">Поки нікого</div>
                <div className="s">Користувачі з'являться після реєстрації.</div>
              </div>
            ) : (
              users.map(u => {
                const isSelf = u.id === currentUserId
                return (
                  <div key={u.id} className="card-row">
                    <div className="cr-sym">♁</div>
                    <button type="button" className="cr-meta cr-open" onClick={() => setDetailsId(u.id)}>
                      <div className="t">
                        {u.userName}{' '}
                        {isSelf && (
                          <span style={{ color: 'var(--gold-soft)', fontSize: '0.8em' }}>· це ви</span>
                        )}
                      </div>
                      <div className="s">
                        {u.email} · сьогодні: {u.dailyChatMessagesUsed} повід. / {u.dailyQuestionsUsed} розкладів
                        {u.subscriptionExpiresAt && ` · ${u.role} до ${new Date(u.subscriptionExpiresAt).toLocaleDateString('uk-UA')}`}
                      </div>
                    </button>
                    <select
                      className="role-select"
                      value={u.role}
                      disabled={isSelf}
                      onChange={e => changeRole(u.id, e.target.value as AdminUser['role'])}
                      title={isSelf ? 'Власну роль змінити не можна' : 'Змінити роль'}
                    >
                      {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="cr-actions">
                      <button
                        className="cr-btn del"
                        title={isSelf ? 'Себе видалити не можна' : 'Видалити акаунт'}
                        disabled={isSelf}
                        onClick={() => delUser(u.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
        </>
        )}
      </section>

      {detailsId && (
        <UserDetailsModal
          userId={detailsId}
          onClose={() => setDetailsId(null)}
          onUpdated={upd => setUsers(prev => prev.map(x => (x.id === upd.id ? upd : x)))}
          onWrite={openSupport}
        />
      )}

      <div className={`toast ${toast ? 'show' : ''}`}>{toast ?? '✦'}</div>
    </div>
  )
}
