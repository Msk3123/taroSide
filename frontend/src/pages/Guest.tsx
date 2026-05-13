import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../components/BrandMark'

type Tier = 'free' | 'registered' | 'pro'

interface SpreadDef {
  count: string | number
  roman: string
  label: string
  name: string
  desc: string
  dots: number
  tier: Tier
  d: string // fade-up delay class
}

const SPREADS: SpreadDef[] = [
  { count: 3, roman: 'III', label: 'Три карти', name: 'Минуле · Теперішнє · Майбутнє',
    desc: 'Базове віщування. Швидкий погляд на плин часу навколо вашого питання.',
    dots: 3, tier: 'free', d: 'd3' },
  { count: 5, roman: 'V', label: "П'ять карт", name: "П'ятикутник",
    desc: 'Обставини, перешкоди, поради, наслідки та підсумок ситуації.',
    dots: 5, tier: 'registered', d: 'd4' },
  { count: 7, roman: 'VII', label: 'Сім карт', name: 'Підкова долі',
    desc: 'Глибокий розгляд ситуації з урахуванням зовнішніх сил та скритих впливів.',
    dots: 7, tier: 'registered', d: 'd5' },
  { count: 12, roman: 'XII', label: 'Дванадцять карт', name: 'Колесо року',
    desc: 'Прогноз на дванадцять місяців уперед — місяць за місяцем, знак за знаком.',
    dots: 12, tier: 'pro', d: 'd6' },
  { count: 'inf', roman: '∞', label: 'Скільки захочете', name: 'Вільний розклад',
    desc: 'Власні позиції, власна кількість карт. Повна свобода віщування для Pro.',
    dots: 10, tier: 'pro', d: 'd7' },
]

/** Reusable lock chain + padlock overlay — rendered inside a locked spread card. */
function ChainOverlay() {
  return (
    <div className="chain-overlay">
      <svg viewBox="0 0 200 320" preserveAspectRatio="none" fill="none"
        stroke="#8a5a3a" strokeWidth={1.5} opacity={0.85}>
        <path d="M-20 60 L220 220" strokeWidth={2.5} stroke="#6b4628" />
        <g>
          {[[15, 75], [35, 88], [55, 101], [75, 114], [95, 127],
            [115, 140], [135, 153], [155, 166], [175, 179], [195, 192]]
            .map(([cx, cy], i) => (
              <ellipse key={`a-${i}`} cx={cx} cy={cy} rx={5} ry={9}
                transform={`rotate(-33 ${cx} ${cy})`} />
            ))}
        </g>
        <path d="M220 80 L-20 260" strokeWidth={2.5} stroke="#6b4628" />
        <g>
          {[[200, 95], [180, 110], [160, 125], [140, 140], [120, 155],
            [100, 170], [80, 185], [60, 200], [40, 215], [20, 230]]
            .map(([cx, cy], i) => (
              <ellipse key={`b-${i}`} cx={cx} cy={cy} rx={5} ry={9}
                transform={`rotate(33 ${cx} ${cy})`} />
            ))}
        </g>
        <g transform="translate(100 150)">
          <rect x={-12} y={-3} width={24} height={20} rx={2} fill="#3a2418" stroke="#c9a24a" />
          <path d="M-7 -3 L-7 -10 Q-7 -16 0 -16 Q7 -16 7 -10 L7 -3" stroke="#c9a24a" strokeWidth={2} />
          <circle cx={0} cy={7} r={2} fill="#c9a24a" />
        </g>
      </svg>
    </div>
  )
}

export default function Guest() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [lockData, setLockData] = useState<SpreadDef | null>(null)
  const [chatValue, setChatValue] = useState('')
  const [chatHint, setChatHint] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLockData(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function onSpreadClick(s: SpreadDef, i: number) {
    if (s.tier !== 'free') {
      setLockData(s)
      return
    }
    setSelectedIdx(i)
  }

  function sendChat() {
    const v = chatValue.trim()
    if (!v) return
    setChatValue('')
    setChatHint(`✦ Карти почули: "${v.slice(0, 40)}${v.length > 40 ? '…' : ''}"`)
  }

  const selected = SPREADS[selectedIdx]
  const selLabel = `${selected.count} карти — ${selected.name}`

  return (
    <>
      {/* Custom guest nav with centered registration CTA */}
      <nav className="fade-up d1">
        <Link to="/" className="brand">
          <span className="brand-mark"><BrandMark size={28} /></span>
          Lunaris
        </Link>
        <Link to="/register" className="top-cta">
          <span className="star">✦</span> Зареєструватися
        </Link>
        <div className="nav-links">
          <span className="guest-badge">Гість</span>
          <Link to="/login" className="btn">Увійти</Link>
        </div>
      </nav>

      <main className="guest-main">
        <div className="guest-header fade-up d2">
          <div className="guest-eyebrow">Із чого почнемо</div>
          <h1>Оберіть <span className="accent">розклад</span></h1>
          <p className="lede">
            Зосередьтеся на питанні, яке вас тривожить. Оберіть розклад, і карти
            дадуть відповідь. Як гість, ви можете скористатися базовим розкладом
            на три карти — цього вистачає, щоб зазирнути у час.
          </p>
        </div>

        <div className="limits-strip fade-up d3">
          <div className="limit-item active">
            <div className="limit-tier">Гість</div>
            <div className="limit-detail">1 розклад на 3 карти · на день</div>
          </div>
          <div className="limit-item">
            <div className="limit-tier">Зареєстрований</div>
            <div className="limit-detail">5× по 3 · 3× по 5 · 1× по 7 карт</div>
          </div>
          <div className="limit-item">
            <div className="limit-tier">Pro</div>
            <div className="limit-detail">До 20 розкладів будь-якого виду</div>
          </div>
          <div className="limit-reset">Оновлення о 00:00</div>
        </div>

        <div className="spread-grid">
          {SPREADS.map((s, i) => {
            const isSelected = i === selectedIdx && s.tier === 'free'
            const isLocked = s.tier !== 'free'
            const classes = [
              'spread',
              'fade-up',
              s.d,
              isSelected ? 'selected' : '',
              isLocked ? 'locked' : '',
            ].filter(Boolean).join(' ')

            return (
              <div key={i} className={classes} onClick={() => onSpreadClick(s, i)}>
                {s.tier === 'free' && <div className="spread-free">Безкоштовно</div>}
                {s.tier === 'registered' && (
                  <div className="lock-badge lock-badge-user">Увійти</div>
                )}
                {s.tier === 'pro' && <div className="lock-badge">Pro</div>}

                <div className="spread-count">{s.roman}</div>
                <div className="spread-label">{s.label}</div>
                <div className="spread-name">{s.name}</div>
                <div className="spread-desc">{s.desc}</div>

                <div className="spread-dots">
                  {Array.from({ length: s.dots }).map((_, k) => <span key={k} />)}
                </div>

                {isLocked && <ChainOverlay />}
                {s.tier === 'registered' && (
                  <div className="pro-ribbon ribbon-user">Увійдіть, щоб відкрити</div>
                )}
                {s.tier === 'pro' && (
                  <div className="pro-ribbon">Розблокувати в Pro</div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      {/* Bottom chat input dock */}
      <div className="chat-dock fade-up d8">
        <div className="chat-dock-inner">
          <div className="chat-input-wrap">
            <button className="chat-plus" title="Додати">+</button>
            <input
              type="text"
              className="chat-input"
              placeholder={chatHint ?? 'Запитайте карти про будь-що...'}
              value={chatValue}
              onChange={e => setChatValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendChat() }}
            />
            <button className="chat-send" title="Спитати" onClick={sendChat}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5 M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
          <div className="chat-hint">
            Обрано: <span className="sel">{selLabel}</span>
          </div>
        </div>
      </div>

      {/* Lock modal */}
      <div
        className={`lock-modal ${lockData ? 'open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setLockData(null) }}
      >
        {lockData && (
          <div className="lock-modal-card">
            <button className="lock-close" onClick={() => setLockData(null)}>✕</button>
            <div className="auth-eyebrow">☾ Закриті врата ☾</div>
            {lockData.tier === 'registered' ? (
              <>
                <h1 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300, fontSize: 38, marginBottom: 14,
                }}>
                  Увійдіть, щоб{' '}
                  <span style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>
                    відкрити
                  </span>
                </h1>
                <p style={{
                  fontSize: 14, lineHeight: 1.7, color: 'var(--ink-dim)',
                  marginBottom: 32, textWrap: 'pretty' as never,
                }}>
                  «{lockData.name}» — розклад на {lockData.count} карт. Доступно
                  безкоштовно для зареєстрованих подорожників. Створіть акаунт
                  або увійдіть, щоб зняти замок.
                </p>
                <Link to="/register" className="btn btn-primary auth-submit"
                  style={{ marginBottom: 12 }}>
                  Зареєструватися →
                </Link>
              </>
            ) : (
              <>
                <h1 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300, fontSize: 38, marginBottom: 14,
                }}>
                  Доступ у{' '}
                  <span style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>
                    Pro
                  </span>
                </h1>
                <p style={{
                  fontSize: 14, lineHeight: 1.7, color: 'var(--ink-dim)',
                  marginBottom: 32, textWrap: 'pretty' as never,
                }}>
                  «{lockData.name}» — розклад на{' '}
                  {lockData.count === 'inf' ? 'будь-яку кількість' : lockData.count}{' '}
                  карт. Доступно лише у Pro-пакеті. Оберіть підписку, щоб зняти ланцюги.
                </p>
                <Link to="/pricing" className="btn btn-primary auth-submit"
                  style={{ marginBottom: 12 }}>
                  Обрати Pro →
                </Link>
              </>
            )}
            <button
              className="btn"
              onClick={() => setLockData(null)}
              style={{
                display: 'block', width: '100%', textAlign: 'center', padding: 10,
              }}
            >
              Залишитися з трьома картами
            </button>
          </div>
        )}
      </div>
    </>
  )
}
