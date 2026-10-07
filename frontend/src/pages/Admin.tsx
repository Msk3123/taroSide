import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { api, adminApi, auth, type AdminUser, type AdminStats } from '../lib/api'
import AdminAnalytics from '../components/admin/AdminAnalytics'
import AdminSupport from '../components/admin/AdminSupport'
import UserDetailsModal from '../components/admin/UserDetailsModal'

type Tab = 'cards' | 'users' | 'analytics' | 'support'

const CRUMBS: Record<Tab, [string, string]> = {
  cards: ['Колода', 'Додати карту'],
  users: ['Спільнота', 'Користувачі'],
  analytics: ['Система', 'Аналітика'],
  support: ['Спільнота', 'Підтримка'],
}

type ArcanaKey = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'

interface BackendCard {
  id: number
  name: string
  nameUkr: string
  arcana: number
  suit: number | null
  uprightMeaning: string
  reversedMeaning: string
  imageUrl: string | null
}

interface UiCard {
  id?: number
  en: string
  ua: string
  arcana: ArcanaKey
  rank: string
  keywords: string
  up: string
  rev: string
}

const arcanaLabels: Record<ArcanaKey, string> = {
  major: 'Старші',
  wands: 'Жезли',
  cups: 'Кубки',
  swords: 'Мечі',
  pentacles: 'Пентаклі',
}

const symFallback: Record<ArcanaKey, string> = {
  major: '✦',
  wands: '🜂',
  cups: '🜄',
  swords: '🜁',
  pentacles: '🜃',
}

/** Backend → UI */
function toUi(c: BackendCard): UiCard {
  let arcana: ArcanaKey = 'major'
  if (c.arcana === 1) {
    arcana = (['wands', 'cups', 'swords', 'pentacles'] as const)[c.suit ?? 0] ?? 'wands'
  }
  return {
    id: c.id,
    en: c.name,
    ua: c.nameUkr,
    arcana,
    rank: '',
    keywords: '',
    up: c.uprightMeaning,
    rev: c.reversedMeaning,
  }
}

/** UI → backend */
function toBackendPayload(c: UiCard) {
  const isMajor = c.arcana === 'major'
  const suitIdx: Record<Exclude<ArcanaKey, 'major'>, number> = {
    wands: 0, cups: 1, swords: 2, pentacles: 3,
  }
  return {
    name: c.en,
    nameUkr: c.ua,
    arcana: isMajor ? 0 : 1,
    suit: isMajor ? null : suitIdx[c.arcana as Exclude<ArcanaKey, 'major'>],
    uprightMeaning: c.up,
    reversedMeaning: c.rev,
    imageUrl: null,
  }
}

const emptyForm: UiCard = {
  en: '', ua: '', arcana: 'major', rank: '', keywords: '', up: '', rev: '',
}

const ALL_ROLES: AdminUser['role'][] = ['Guest', 'Free', 'Premium', 'Vip', 'Admin']

export default function Admin() {
  const [tab, setTab] = useState<Tab>('cards')
  // Картка користувача (модалка) і з ким відкрити чат підтримки
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [supportUserId, setSupportUserId] = useState<string | null>(null)
  const [supportUnread, setSupportUnread] = useState(0)
  const onUnreadChange = useCallback((n: number) => setSupportUnread(n), [])
  // мобільна «шухляда» з меню адмінки
  const [sbOpen, setSbOpen] = useState(false)
  const [cards, setCards] = useState<UiCard[]>([])
  const [form, setForm] = useState<UiCard>(emptyForm)
  const [search, setSearch] = useState('')
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

  useEffect(() => { fetchCards() }, [])

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

  async function fetchCards() {
    try {
      const data = await api<BackendCard[]>('/api/cards')
      setCards(data.map(toUi))
    } catch (e) {
      setStatus({ kind: 'err', text: `Не вдалось завантажити: ${(e as Error).message}` })
    }
  }

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

  async function addCard(e: React.FormEvent) {
    e.preventDefault()
    if (!form.en.trim() || !form.ua.trim()) return
    try {
      await api('/api/cards', {
        method: 'POST',
        body: JSON.stringify(toBackendPayload(form)),
      })
      setForm(emptyForm)
      showToast('✦ Карту збережено')
      setStatus({ kind: 'ok', text: 'Збережено' })
      fetchCards()
    } catch (e) {
      setStatus({ kind: 'err', text: `Помилка збереження: ${(e as Error).message}` })
    }
  }

  async function delCard(id?: number) {
    if (!id) return
    try {
      await api(`/api/cards/${id}`, { method: 'DELETE' })
      showToast('✕ Карту видалено')
      fetchCards()
    } catch (e) {
      setStatus({ kind: 'err', text: `Не вдалось видалити: ${(e as Error).message}` })
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return cards
    return cards.filter(c =>
      c.ua.toLowerCase().includes(q) || c.en.toLowerCase().includes(q)
    )
  }, [cards, search])

  const majorCount = cards.filter(c => c.arcana === 'major').length
  const minorCount = cards.length - majorCount

  return (
    <div className="admin-app">
      {/* SIDEBAR */}
      <div className={`sb-backdrop ${sbOpen ? 'on' : ''}`} onClick={() => setSbOpen(false)} />
      <aside className={`sidebar ${sbOpen ? 'open' : ''}`}>
        <Link to="/" className="sb-brand">
          <span className="sb-brand-mark"><BrandMark size={22} /></span>
          <div>Lunaris <small>Admin</small></div>
        </Link>

        <div className="sb-group-label">Колода</div>
        <button type="button" className={`sb-item ${tab === 'cards' ? 'active' : ''}`} onClick={() => go('cards')}>
          <span className="ic">✦</span> Карти
        </button>

        <div className="sb-group-label">Спільнота</div>
        <button type="button" className={`sb-item ${tab === 'users' ? 'active' : ''}`} onClick={() => go('users')}>
          <span className="ic">♁</span> Користувачі й підписки
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
        {tab === 'support' && (
          <AdminSupport key={supportUserId ?? "inbox"} initialUserId={supportUserId} onOpenUser={setDetailsId} onUnreadChange={onUnreadChange} />
        )}

        {tab === 'cards' && (
        <>
        <div className="page-head">
          <div>
            <h1>Додати <span className="accent">карту</span></h1>
            <div className="sub">Керування колодою Таро</div>
          </div>
          <div className="stats">
            <div className="stat"><div className="n">{cards.length}</div><div className="l">карт у базі</div></div>
            <div className="stat"><div className="n">{majorCount}</div><div className="l">старших</div></div>
            <div className="stat"><div className="n">{minorCount}</div><div className="l">молодших</div></div>
          </div>
        </div>

        <div className="content-grid">
          {/* FORM */}
          <div className="panel">
            <h2>Нова карта</h2>
            <div className="panel-sub">Заповніть поля та збережіть</div>

            <form onSubmit={addCard}>
              <div className="row-2">
                <div className="field">
                  <label>Назва <span className="hint">англ.</span></label>
                  <input
                    value={form.en}
                    onChange={e => setForm({ ...form, en: e.target.value })}
                    placeholder="The Moon"
                    required
                  />
                </div>
                <div className="field">
                  <label>Назва <span className="hint">укр.</span></label>
                  <input
                    value={form.ua}
                    onChange={e => setForm({ ...form, ua: e.target.value })}
                    placeholder="Місяць"
                    required
                  />
                </div>
              </div>

              <div className="row-2">
                <div className="field">
                  <label>Аркан</label>
                  <select
                    value={form.arcana}
                    onChange={e => setForm({ ...form, arcana: e.target.value as ArcanaKey })}
                  >
                    <option value="major">Major Arcana · Старші</option>
                    <option value="wands">Wands · Жезли</option>
                    <option value="cups">Cups · Кубки</option>
                    <option value="swords">Swords · Мечі</option>
                    <option value="pentacles">Pentacles · Пентаклі</option>
                  </select>
                </div>
                <div className="field">
                  <label>Номер / ранг</label>
                  <input
                    value={form.rank}
                    onChange={e => setForm({ ...form, rank: e.target.value })}
                    placeholder="XVIII або Queen"
                  />
                </div>
              </div>

              <div className="field">
                <label>Ключові слова <span className="hint">через · (крапку-розділювач)</span></label>
                <input
                  value={form.keywords}
                  onChange={e => setForm({ ...form, keywords: e.target.value })}
                  placeholder="Ілюзія · Страх · Підсвідомість"
                />
              </div>

              <div className="field">
                <label>Значення <span className="hint">пряме</span></label>
                <textarea
                  value={form.up}
                  onChange={e => setForm({ ...form, up: e.target.value })}
                  placeholder="Туман, сумніви, підсвідомі страхи, інтуїтивні сигнали, таємниці…"
                />
              </div>

              <div className="field">
                <label>Значення <span className="hint">перевернуте</span></label>
                <textarea
                  value={form.rev}
                  onChange={e => setForm({ ...form, rev: e.target.value })}
                  placeholder="Ясність після туману, викриття обману…"
                />
              </div>

              <div className="panel-actions">
                <button type="submit" className="btn btn-primary">Зберегти карту →</button>
                <button type="button" className="btn btn-ghost" onClick={() => setForm(emptyForm)}>
                  Очистити
                </button>
                {status && (
                  <span className={`admin-status ${status.kind}`}>{status.text}</span>
                )}
              </div>
            </form>
          </div>

          {/* LIST */}
          <div className="panel">
            <h2>
              Карти в базі{' '}
              <span style={{ color: 'var(--gold-soft)', fontStyle: 'italic' }}>
                ({cards.length})
              </span>
            </h2>
            <div className="panel-sub">Останні додані</div>

            <div className="field">
              <input
                placeholder="🔍  Пошук по назві…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: 'rgba(10,8,18,0.6)' }}
              />
            </div>

            <div className="card-list">
              {cards.length === 0 ? (
                <div className="empty-state">
                  <div className="glyph">☾</div>
                  <div className="t">Колода порожня</div>
                  <div className="s">Додайте першу карту, щоб почати.</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="glyph">∅</div>
                  <div className="t">Нічого не знайдено</div>
                  <div className="s">Спробуйте інший запит.</div>
                </div>
              ) : (
                filtered.map(c => (
                  <div key={c.id ?? `${c.en}-${c.ua}`} className="card-row">
                    <div className="cr-sym">{symFallback[c.arcana]}</div>
                    <div className="cr-meta">
                      <div className="t">
                        {c.ua}{' '}
                        <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic', fontSize: '0.8em' }}>
                          · {c.en}
                        </span>
                      </div>
                      <div className="s">{arcanaLabels[c.arcana]}</div>
                    </div>
                    <div className="cr-tag">{arcanaLabels[c.arcana]}</div>
                    <div className="cr-actions">
                      <button className="cr-btn" title="Редагувати" disabled>✎</button>
                      <button
                        className="cr-btn del"
                        title="Видалити"
                        onClick={() => delCard(c.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </>
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
          <div className="panel-sub">Натисніть на ім'я — відкриється профіль, де можна видати підписку на термін або написати людині</div>
          {status && tab === 'users' && (
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
