import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { api } from '../lib/api'

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

export default function Admin() {
  const [cards, setCards] = useState<UiCard[]>([])
  const [form, setForm] = useState<UiCard>(emptyForm)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<{ kind: 'ok' | 'err', text: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => { fetchCards() }, [])

  async function fetchCards() {
    try {
      const data = await api<BackendCard[]>('/api/cards')
      setCards(data.map(toUi))
    } catch (e) {
      setStatus({ kind: 'err', text: `Не вдалось завантажити: ${(e as Error).message}` })
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
      <aside className="sidebar">
        <Link to="/" className="sb-brand">
          <span className="sb-brand-mark"><BrandMark size={22} /></span>
          <div>Lunaris <small>Admin</small></div>
        </Link>

        <div className="sb-group-label">Колода</div>
        <a href="#" className="sb-item active"><span className="ic">✦</span> Карти</a>
        <a href="#" className="sb-item"><span className="ic">☾</span> Розклади</a>
        <a href="#" className="sb-item"><span className="ic">☉</span> Тлумачення</a>

        <div className="sb-group-label">Спільнота</div>
        <a href="#" className="sb-item"><span className="ic">♁</span> Користувачі</a>
        <a href="#" className="sb-item"><span className="ic">☿</span> Підписки</a>
        <a href="#" className="sb-item"><span className="ic">⚖</span> Модерація</a>

        <div className="sb-group-label">Система</div>
        <a href="#" className="sb-item"><span className="ic">∞</span> Аналітика</a>
        <a href="#" className="sb-item"><span className="ic">⚙</span> Налаштування</a>
        <Link to="/login" className="sb-item"><span className="ic">↗</span> Вихід</Link>
      </aside>

      {/* MAIN */}
      <section className="main-scroll">
        <div className="topbar">
          <div className="breadcrumb">
            Lunaris <span className="sep">›</span>
            Колода <span className="sep">›</span>
            <span className="cur">Додати карту</span>
          </div>
          <div className="topbar-actions">
            <span className="admin-badge">✦ Адміністратор</span>
          </div>
        </div>

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
      </section>

      <div className={`toast ${toast ? 'show' : ''}`}>{toast ?? '✦'}</div>
    </div>
  )
}
