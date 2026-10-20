import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import BackLink from '../components/BackLink'
import { track } from '../lib/analytics'

/**
 * Хто може відкрити розклад. Має збігатися з бекендом:
 * Spread.RequiredRole (SpreadConfiguration) + ліміти RolePolicies.
 * Гість (без акаунта) розкладів не робить узагалі — бекенд для гостей їх не має.
 */
type Tier = 'registered' | 'premium' | 'vip' | 'soon'

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
    dots: 3, tier: 'registered', d: 'd3' },
  { count: 5, roman: 'V', label: "П'ять карт", name: "П'ятикутник",
    desc: 'Обставини, перешкоди, поради, наслідки та підсумок ситуації.',
    dots: 5, tier: 'premium', d: 'd4' },
  { count: 7, roman: 'VII', label: 'Сім карт', name: 'Підкова долі',
    desc: 'Глибокий розгляд ситуації з урахуванням зовнішніх сил та скритих впливів.',
    dots: 7, tier: 'premium', d: 'd5' },
  { count: 12, roman: 'XII', label: 'Дванадцять карт', name: 'Колесо року',
    desc: 'Прогноз на дванадцять місяців уперед — місяць за місяцем, знак за знаком.',
    dots: 12, tier: 'vip', d: 'd6' },
  { count: 'inf', roman: '∞', label: 'Скільки захочете', name: 'Вільний розклад',
    desc: 'Власні позиції, власна кількість карт. Зараз у розробці — скоро з’явиться для VIP.',
    dots: 10, tier: 'soon', d: 'd7' },
]

const BADGE: Record<Tier, string> = {
  registered: 'Після реєстрації',
  premium: 'Premium',
  vip: 'VIP',
  soon: 'Скоро',
}

const RIBBON: Record<Tier, string> = {
  registered: 'Безкоштовно з акаунтом',
  premium: 'Доступно в Premium',
  vip: 'Доступно у VIP',
  soon: 'У розробці',
}

/** Автовідповідь гостю: без акаунта бекенд розкладів не робить, тож чесно про це кажемо. */
const GUEST_REPLY = [
  'Привіт! Я Lunaris ☾',
  'Поки що гості не можуть робити розклади — команда розробника якраз працює над гостьовим режимом.',
  'Але якщо хочеш погадати вже зараз — зареєструйся: це безкоштовно, і тобі одразу відкриються 2 розклади на день на 3 карти.',
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
  const [lockData, setLockData] = useState<SpreadDef | null>(null)
  const [chatValue, setChatValue] = useState('')
  // Що гість написав і чи показуємо автовідповідь Lunaris
  const [asked, setAsked] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLockData(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function sendChat() {
    const v = chatValue.trim()
    if (!v) return
    setChatValue('')
    setAsked(v)
    // Сам текст питання не відправляємо — лише факт «гість хотів погадати» (для воронки в адмінці)
    track('guest_message')
  }

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
      <BackLink />

      <main className="guest-main">
        <div className="guest-header fade-up d2">
          <div className="guest-eyebrow">Із чого почнемо</div>
          <h1>Оберіть <span className="accent">розклад</span></h1>
          <p className="lede">
            Ось які розклади є в Lunaris. Гостям вони поки недоступні — гостьовий режим
            ще в розробці. Після безкоштовної реєстрації відкривається базовий розклад
            на три карти, решта — у пакетах Premium і VIP.
          </p>
        </div>

        <div className="limits-strip fade-up d3">
          <div className="limit-item active">
            <div className="limit-tier">Гість</div>
            <div className="limit-detail">Лише перегляд · розкладів немає</div>
          </div>
          <div className="limit-item">
            <div className="limit-tier">Free · з акаунтом</div>
            <div className="limit-detail">2 розклади на день · 3 карти</div>
          </div>
          <div className="limit-item">
            <div className="limit-tier">Premium</div>
            <div className="limit-detail">7 на день · до 7 карт</div>
          </div>
          <div className="limit-item">
            <div className="limit-tier">VIP</div>
            <div className="limit-detail">20 на день · до 12 карт</div>
          </div>
          <div className="limit-reset">Оновлення о 00:00 UTC</div>
        </div>

        <div className="spread-grid">
          {SPREADS.map((s, i) => {
            // Для гостя замкнене все: базовий розклад — після реєстрації, решта — тарифи
            const classes = ['spread', 'fade-up', s.d, 'locked'].join(' ')

            return (
              <div key={i} className={classes} onClick={() => setLockData(s)}>
                <div className={`lock-badge ${s.tier === 'registered' ? 'lock-badge-user' : ''}`}>{BADGE[s.tier]}</div>

                <div className="spread-count">{s.roman}</div>
                <div className="spread-label">{s.label}</div>
                <div className="spread-name">{s.name}</div>
                <div className="spread-desc">{s.desc}</div>

                <div className="spread-dots">
                  {Array.from({ length: s.dots }).map((_, k) => <span key={k} />)}
                </div>

                <ChainOverlay />
                <div className={`pro-ribbon ${s.tier === 'registered' ? 'ribbon-user' : ''}`}>{RIBBON[s.tier]}</div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Bottom chat input dock */}
      <div className="chat-dock fade-up d8">
        <div className="chat-dock-inner">
          {asked && (
            <div className="guest-reply" role="status">
              <button type="button" className="guest-reply-close" onClick={() => setAsked(null)} aria-label="Закрити">✕</button>
              <div className="guest-reply-q">Ви: {asked.length > 80 ? asked.slice(0, 80) + '…' : asked}</div>
              <div className="guest-reply-who">☾ Lunaris</div>
              {GUEST_REPLY.map((line, i) => <p key={i}>{line}</p>)}
              <div className="guest-reply-actions">
                <Link to="/register" className="btn btn-primary">Зареєструватися →</Link>
                <Link to="/login" className="btn btn-ghost">Вже маю акаунт</Link>
              </div>
            </div>
          )}
          <div className="chat-input-wrap">
            <input
              type="text"
              className="chat-input"
              maxLength={500}
              placeholder="Запитайте карти про будь-що..."

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
            Ви гість · <span className="sel">розклади відкриються після реєстрації</span>
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
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300, fontSize: 38, marginBottom: 14,
            }}>
              {lockData.tier === 'registered' && <>Зареєструйтесь, щоб <span style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>відкрити</span></>}
              {lockData.tier === 'premium' && <>Доступно в <span style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>Premium</span></>}
              {lockData.tier === 'vip' && <>Доступно у <span style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>VIP</span></>}
              {lockData.tier === 'soon' && <>Ще <span style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>в розробці</span></>}
            </h1>
            <p style={{
              fontSize: 14, lineHeight: 1.7, color: 'var(--ink-dim)',
              marginBottom: 32, textWrap: 'pretty' as never,
            }}>
              {lockData.tier === 'registered' && <>«{lockData.name}» — розклад на {lockData.count} карти. Безкоштовний для всіх, хто створив акаунт: 2 розклади на день.</>}
              {lockData.tier === 'premium' && <>«{lockData.name}» — розклад на {lockData.count} карт, входить у пакет Premium. Оплата на сайті поки не працює — але підписку можна отримати, написавши розробнику.</>}
              {lockData.tier === 'vip' && <>«{lockData.name}» — розклад на {lockData.count} карт, входить у пакет VIP. Оплата на сайті поки не працює — але підписку можна отримати, написавши розробнику.</>}
              {lockData.tier === 'soon' && <>«{lockData.name}» з власною кількістю карт і позиціями ще доробляється. Коли запрацює — він буде у пакеті VIP.</>}
            </p>
            {lockData.tier === 'registered' ? (
              <Link to="/register" className="btn btn-primary auth-submit" style={{ marginBottom: 12 }}>
                Зареєструватися →
              </Link>
            ) : lockData.tier !== 'soon' && (
              <Link to="/pricing" className="btn btn-primary auth-submit" style={{ marginBottom: 12 }}>
                Як отримати {lockData.tier === 'vip' ? 'VIP' : 'Premium'} →
              </Link>
            )}
            <button
              className="btn"
              onClick={() => setLockData(null)}
              style={{
                display: 'block', width: '100%', textAlign: 'center', padding: 10,
              }}
            >
              Закрити
            </button>
          </div>
        )}
      </div>
    </>
  )
}
