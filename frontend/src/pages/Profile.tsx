import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import PasswordInput from '../components/PasswordInput'
import {
  auth,
  authApi,
  conversationApi,
  userApi,
  UNLIMITED,
  type CurrentUser,
  type UserUsage,
} from '../lib/api'

/**
 * Profile — особистий кабінет.
 *
 * Усі дані тепер справжні:
 *   - Tab "Акаунт"  → PUT /api/User/{id} (UserName + Email) + реальні денні ліміти.
 *   - Tab "Безпека" → POST /api/auth/change-password (реальна зміна пароля).
 *   - Tab "Статистика" → агрегати з реальних даних (розмови + денне використання).
 *
 * Прибрано заглушки: фейкові сесії, 2FA-перемикачі, mock-числа статистики,
 * не-збережувані поля (ім'я/дата народження) і вкладку «Налаштування» без бекенду.
 */
type Tab = 'account' | 'security' | 'stats'

const TABS: { id: Tab; label: string }[] = [
  { id: 'account', label: 'Акаунт' },
  { id: 'security', label: 'Безпека' },
  { id: 'stats', label: 'Статистика' },
]

const ROLE_LABEL: Record<CurrentUser['role'], string> = {
  Guest: 'Гість',
  Free: 'Free · Подорожній',
  Premium: 'Premium · Оракул',
  Vip: 'VIP · Містик',
  Admin: 'Адмін',
}

function limitText(used: number, limit: number): string {
  return `${used} / ${limit >= UNLIMITED ? '∞' : limit}`
}

export default function Profile() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('account')
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [usage, setUsage] = useState<UserUsage | null>(null)
  const [conversationCount, setConversationCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ userName: '', email: '' })
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/login')
      return
    }
    userApi
      .me()
      .then(data => {
        setUser(data)
        auth.setUser(data)
        setForm({ userName: data.userName, email: data.email })
      })
      .catch(() => {
        auth.clearToken()
        navigate('/login')
      })
      .finally(() => setLoading(false))

    userApi.usage().then(setUsage).catch(() => {})
    conversationApi.list().then(list => setConversationCount(list.length)).catch(() => {})
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  const handleSaveAccount = async (e: FormEvent) => {
    if (!user) return
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await userApi.update(user.id, {
        userName: form.userName,
        email: form.email,
      })
      const next: CurrentUser = { ...user, userName: updated.userName, email: updated.email }
      setUser(next)
      auth.setUser(next)
      showToast('✦ Збережено')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Помилка збереження'
      showToast(`✕ ${msg.slice(0, 80)}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (pwd.next !== pwd.confirm) {
      showToast('✕ Паролі не збігаються')
      return
    }
    setChangingPwd(true)
    try {
      await authApi.changePassword(pwd.current, pwd.next)
      setPwd({ current: '', next: '', confirm: '' })
      showToast('✦ Пароль оновлено')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Помилка зміни пароля'
      showToast(`✕ ${msg.slice(0, 90)}`)
    } finally {
      setChangingPwd(false)
    }
  }

  if (loading || !user) {
    return (
      <>
        <Nav />
        <main className="pf-main">
          <div className="fade-up d2" style={{ textAlign: 'center', padding: '4rem' }}>
            Завантаження...
          </div>
        </main>
      </>
    )
  }

  const initial = user.userName.charAt(0).toUpperCase() || '?'
  const registeredDate = new Date(user.createdAt).toLocaleDateString('uk-UA')

  return (
    <>
      <Nav />
      <main className="pf-main">
        <div className="pf-head fade-up d1">
          <div className="pf-avatar">{initial}</div>
          <div className="pf-meta">
            <h1>
              {user.userName} · <span className="accent">{ROLE_LABEL[user.role]}</span>
            </h1>
            <div className="email">{user.email}</div>
            <span className="pf-tag">✦ Зареєстрований · {registeredDate}</span>
          </div>
        </div>

        <div className="pf-tabs fade-up d2" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`pf-tab${tab === t.id ? ' on' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ACCOUNT */}
        <div className={`pane${tab === 'account' ? ' on' : ''}`} role="tabpanel">
          <form className="pf-grid fade-up d3" onSubmit={handleSaveAccount}>
            <div className="panel">
              <h2>Особисті дані</h2>
              <div className="panel-sub">Псевдонім та email</div>
              <div className="field">
                <label>Псевдонім</label>
                <input
                  value={form.userName}
                  onChange={e => setForm({ ...form, userName: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Збереження…' : 'Зберегти'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setForm({ userName: user.userName, email: user.email })}
                >
                  Скасувати
                </button>
              </div>
            </div>

            <div className="panel">
              <h2>Підписка</h2>
              <div className="panel-sub">Поточний пакет і денні ліміти</div>
              <div className="stat-row">
                <span className="lab">План</span>
                <span className="val plan-tag">{ROLE_LABEL[user.role]}</span>
              </div>
              <div className="stat-row">
                <span className="lab">Дата активації</span>
                <span className="val val-plain">{registeredDate}</span>
              </div>
              <div className="stat-row">
                <span className="lab">Розкладів сьогодні</span>
                <span className="val">
                  {usage ? limitText(usage.readingsUsed, usage.readingsLimit) : '…'}
                </span>
              </div>
              <div className="stat-row">
                <span className="lab">Повідомлень сьогодні</span>
                <span className="val">
                  {usage ? limitText(usage.chatMessagesUsed, usage.chatMessagesLimit) : '…'}
                </span>
              </div>
              {user.role !== 'Vip' && user.role !== 'Admin' && (
                <div className="actions">
                  <Link to="/pricing" className="btn btn-primary">
                    Отримати Premium →
                  </Link>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* SECURITY */}
        <div className={`pane${tab === 'security' ? ' on' : ''}`} role="tabpanel">
          <form className="pf-grid fade-up d3" onSubmit={handleChangePassword}>
            <div className="panel">
              <h2>Зміна пароля</h2>
              <div className="panel-sub">Оновити секрет</div>
              <div className="field">
                <label>Поточний пароль</label>
                <PasswordInput
                  value={pwd.current}
                  onChange={e => setPwd({ ...pwd, current: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="field">
                <label>Новий пароль</label>
                <PasswordInput
                  value={pwd.next}
                  onChange={e => setPwd({ ...pwd, next: e.target.value })}
                  placeholder="Мінімум 8 символів"
                  required
                />
              </div>
              <div className="field">
                <label>Підтвердити</label>
                <PasswordInput
                  value={pwd.confirm}
                  onChange={e => setPwd({ ...pwd, confirm: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={changingPwd}>
                  {changingPwd ? 'Оновлення…' : 'Оновити пароль'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* STATS */}
        <div className={`pane${tab === 'stats' ? ' on' : ''}`} role="tabpanel">
          <div className="pf-grid fade-up d3">
            <div className="panel">
              <h2>Ваша подорож</h2>
              <div className="panel-sub">Реальні цифри вашого акаунта</div>
              <Stat lab="Усього розмов" val={conversationCount !== null ? String(conversationCount) : '…'} />
              <Stat
                lab="Розкладів сьогодні"
                val={usage ? limitText(usage.readingsUsed, usage.readingsLimit) : '…'}
              />
              <Stat
                lab="Повідомлень сьогодні"
                val={usage ? limitText(usage.chatMessagesUsed, usage.chatMessagesLimit) : '…'}
              />
              <Stat lab="Карт у розкладі (макс)" val={usage ? String(usage.maxCards) : '…'} />
              <Stat lab="Учасник з" val={registeredDate} />
            </div>

            <div className="panel danger panel-full">
              <h2>Небезпечна зона</h2>
              <div className="panel-sub">Назад дороги не буде</div>
              <div className="toggle-row">
                <div>
                  <div className="t t-danger">Видалити акаунт</div>
                  <div className="s">
                    Усі розклади, нотатки та підписки буде стерто. Незворотньо.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={async () => {
                    if (!confirm('Ви впевнені? Це не можна скасувати.')) return
                    try {
                      await userApi.remove(user.id)
                      auth.clearToken()
                      navigate('/register')
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : 'Помилка'
                      showToast(`✕ ${msg.slice(0, 80)}`)
                    }
                  }}
                >
                  Видалити акаунт
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  )
}

function Stat({ lab, val }: { lab: string; val: string }) {
  return (
    <div className="stat-row">
      <span className="lab">{lab}</span>
      <span className="val">{val}</span>
    </div>
  )
}
