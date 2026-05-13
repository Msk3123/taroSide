import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { api, auth, userApi, type CurrentUser } from '../lib/api'

/**
 * Profile — особистий кабінет з 4 вкладками.
 *
 * Backend wiring:
 *   - Tab "Акаунт" → справжній PUT /api/User/{id} (UserName + Email)
 *   - Tab "Безпека" → UI готовий, бекенд для зміни пароля / 2FA / сесій ще не написано
 *     (треба додати endpoints у AuthController). Кнопки показують toast як placeholder.
 *   - Tab "Налаштування" → preferences треба зберігати у новому полі (наприклад,
 *     AppUser.Preferences як JSON, або окрема таблиця UserPreferences).
 *   - Tab "Статистика" → потребує GROUP BY-запит над Reading + ReadingCard;
 *     поки що mock-числа з дизайну.
 *
 * Avatar — генеруємо з першої літери userName (як у дизайні: великий "R").
 */
type Tab = 'account' | 'security' | 'prefs' | 'stats'

const TABS: { id: Tab; label: string }[] = [
  { id: 'account', label: 'Акаунт' },
  { id: 'security', label: 'Безпека' },
  { id: 'prefs', label: 'Налаштування' },
  { id: 'stats', label: 'Статистика' },
]

const ROLE_LABEL: Record<CurrentUser['role'], string> = {
  Guest: 'Гість',
  Free: 'Подорожник',
  Premium: 'Pro · Оракул',
}

export default function Profile() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('account')
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    userName: '',
    email: '',
    firstName: '',
    dateOfBirth: '',
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/login')
      return
    }
    api<CurrentUser>('/api/user/me')
      .then(data => {
        setUser(data)
        auth.setUser(data)
        setForm(f => ({ ...f, userName: data.userName, email: data.email }))
      })
      .catch(() => {
        auth.clearToken()
        navigate('/login')
      })
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
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
      showToast(`✕ ${msg.slice(0, 60)}`)
    } finally {
      setSaving(false)
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
              <div className="panel-sub">Ім'я та публічний профіль</div>
              <div className="row-2">
                <div className="field">
                  <label>Ім'я</label>
                  <input
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Raven"
                  />
                </div>
                <div className="field">
                  <label>Псевдонім</label>
                  <input
                    value={form.userName}
                    onChange={e => setForm({ ...form, userName: e.target.value })}
                    required
                  />
                </div>
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
              <div className="field">
                <label>
                  Дата народження{' '}
                  <span className="label-hint">— для астро-контексту</span>
                </label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Збереження…' : 'Зберегти'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setForm({
                      userName: user.userName,
                      email: user.email,
                      firstName: '',
                      dateOfBirth: '',
                    })
                  }
                >
                  Скасувати
                </button>
              </div>
            </div>

            <div className="panel">
              <h2>Підписка</h2>
              <div className="panel-sub">Поточний пакет</div>
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
                <span className="val">4 / 9</span>
              </div>
              <div className="actions">
                <Link to="/pricing" className="btn btn-primary">
                  Перейти на Pro →
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* SECURITY */}
        <div className={`pane${tab === 'security' ? ' on' : ''}`} role="tabpanel">
          <div className="pf-grid fade-up d3">
            <div className="panel">
              <h2>Зміна пароля</h2>
              <div className="panel-sub">Оновити секрет</div>
              <div className="field">
                <label>Поточний пароль</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="field">
                <label>Новий пароль</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="field">
                <label>Підтвердити</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => showToast('✦ TODO: AuthController.ChangePassword')}
                >
                  Оновити пароль
                </button>
              </div>
            </div>

            <div className="panel">
              <h2>Двофакторна автентифікація</h2>
              <div className="panel-sub">Додаткова печать на дверях</div>
              <ToggleRow
                title="Email-код при вході"
                sub="Кожен раз з нового пристрою"
                defaultOn
              />
              <ToggleRow title="Authenticator app" sub="TOTP (Google / Authy)" />
              <ToggleRow
                title="Сповіщення про вхід"
                sub="Email при підозрілому пристрої"
                defaultOn
              />
            </div>

            <div className="panel panel-full">
              <h2>Активні сеанси</h2>
              <div className="panel-sub">Пристрої з доступом до акаунта</div>
              <div className="stat-row">
                <div>
                  <div className="t-row-title">Chrome · macOS · Київ</div>
                  <div className="t-row-sub">Поточний сеанс · щойно</div>
                </div>
                <span className="pf-tag pf-tag-soft">Активний</span>
              </div>
              <SessionRow device="Safari · iPhone · Львів" when="14 годин тому" />
              <SessionRow device="Firefox · Windows · Невідомо" when="5 днів тому" />
            </div>
          </div>
        </div>

        {/* PREFS */}
        <div className={`pane${tab === 'prefs' ? ' on' : ''}`} role="tabpanel">
          <div className="pf-grid fade-up d3">
            <div className="panel">
              <h2>Сповіщення</h2>
              <div className="panel-sub">Що надсилати на email</div>
              <ToggleRow
                title="Картка дня"
                sub="Щоранку — одна карта-настанова"
                defaultOn
              />
              <ToggleRow
                title="Місячні цикли"
                sub="Нагадування про повний місяць"
                defaultOn
              />
              <ToggleRow title="Новини та оновлення" sub="Нові розклади, статті, акції" />
              <ToggleRow title="Маркетинг" sub="Спецпропозиції на Pro" />
            </div>

            <div className="panel">
              <h2>Інтерфейс</h2>
              <div className="panel-sub">Зовнішність та мова</div>
              <div className="field">
                <label>Мова</label>
                <select defaultValue="uk">
                  <option value="uk">Українська</option>
                  <option value="en">English</option>
                  <option value="pl">Polski</option>
                </select>
              </div>
              <div className="field">
                <label>Часовий пояс</label>
                <select defaultValue="kyiv">
                  <option value="kyiv">Europe/Kyiv (UTC+3)</option>
                  <option value="warsaw">Europe/Warsaw (UTC+2)</option>
                  <option value="utc">UTC</option>
                </select>
              </div>
              <ToggleRow title="Звуки розкладу" sub="Звук перемішування карт" defaultOn />
              <ToggleRow title="Зменшити анімації" sub="Для слабшого пристрою" />
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className={`pane${tab === 'stats' ? ' on' : ''}`} role="tabpanel">
          <div className="pf-grid fade-up d3">
            <div className="panel">
              <h2>Ваша подорож</h2>
              <div className="panel-sub">Загальні цифри</div>
              <Stat lab="Усього розкладів" val="128" />
              <Stat lab="З них на 3 карти" val="94" />
              <Stat lab="На 5 карт" val="28" />
              <Stat lab="На 7 карт" val="6" />
              <Stat lab="Збережено в журналі" val="42" />
            </div>

            <div className="panel">
              <h2>Часті карти</h2>
              <div className="panel-sub">Які з'являються найчастіше</div>
              <Stat lab="☾ Місяць · XVIII" val="14×" />
              <Stat lab="⚔ Колісниця · VII" val="11×" />
              <Stat lab="⚖ Справедливість · XI" val="9×" />
              <Stat lab="☉ Сонце · XIX" val="8×" />
              <Stat lab="⚝ Самітник · IX" val="7×" />
            </div>

            <div className="panel danger panel-full">
              <h2>Небезпечна зона</h2>
              <div className="panel-sub">Назад дороги не буде</div>
              <div className="toggle-row">
                <div>
                  <div className="t">Експортувати дані</div>
                  <div className="s">Завантажити всі розклади та нотатки (GDPR)</div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => showToast('✦ TODO: експорт у JSON/PDF')}
                >
                  Завантажити →
                </button>
              </div>
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
                  onClick={() => {
                    if (confirm('Ви впевнені? Це не можна скасувати.')) {
                      showToast('✕ Запит на видалення прийнято')
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

/* ----------------- маленькі підкомпоненти ----------------- */

function ToggleRow({
  title,
  sub,
  defaultOn = false,
}: {
  title: string
  sub: string
  defaultOn?: boolean
}) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="toggle-row">
      <div>
        <div className="t">{title}</div>
        <div className="s">{sub}</div>
      </div>
      <label className="switch">
        <input type="checkbox" checked={on} onChange={e => setOn(e.target.checked)} />
        <span />
      </label>
    </div>
  )
}

function SessionRow({ device, when }: { device: string; when: string }) {
  return (
    <div className="stat-row">
      <div>
        <div className="t-row-title">{device}</div>
        <div className="t-row-sub">{when}</div>
      </div>
      <button type="button" className="btn-danger btn-danger-sm">
        Завершити
      </button>
    </div>
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
