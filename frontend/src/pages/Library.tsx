import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import BackLink from '../components/BackLink'
import { TAROT_DATA, type MajorCard, type MinorCard, type SuitKey } from '../data/tarotData'
import { cardSvg } from '../lib/cardArt'

/**
 * Бібліотека — вікі з бічною панеллю і чотирма розділами (шаблон library.html):
 * Методи розкладу · Матриця Долі · Ментал-Тренер · Колода.
 * Активний розділ живе в хеші URL (#deck), тож на нього можна дати пряме посилання.
 */
type Sec = 'methods' | 'matrix' | 'trainer' | 'deck'
type Filter = 'all' | 'major' | SuitKey
type Zone = 'comfort' | 'purpose' | 'karma' | 'male' | 'female'

const CRUMBS: Record<Sec, string> = {
  methods: 'Методи розкладу',
  matrix: 'Матриця Долі',
  trainer: 'Ментал-Тренер',
  deck: 'Колода',
}

const SIDEBAR: { sec: Sec; ic: string; label: string; mobile: string; cnt?: number }[] = [
  { sec: 'methods', ic: '✦', label: 'Методи розкладу', mobile: 'Методи', cnt: TAROT_DATA.spreads.length },
  { sec: 'matrix', ic: '⌖', label: 'Матриця Долі', mobile: 'Матриця Долі' },
  { sec: 'trainer', ic: '⚖︎', label: 'Ментал-Тренер', mobile: 'Тренер' },
  { sec: 'deck', ic: '☾', label: 'Колода', mobile: 'Колода', cnt: 78 },
]

const ZONES: { zone: Zone; rom: string; name: string; pos: string; desc: string }[] = [
  { zone: 'comfort', rom: '⊙', name: 'Зона комфорту', pos: 'Центр',
    desc: 'Ваш головний аркан. Це стан, у якому ви природно себе почуваєте — ваша базова енергія, сильні сторони й спосіб реагувати на світ. Центр Матриці показує, ким ви є без масок.' },
  { zone: 'purpose', rom: '↑', name: 'Призначення', pos: 'Верх',
    desc: 'Соціальна задача — те, заради чого ви прийшли. Показує сферу, де ваша реалізація буде найлегшою і найдохіднішою. Розкривається зазвичай після 40 років.' },
  { zone: 'karma', rom: '↓', name: 'Кармічний хвіст', pos: 'Низ',
    desc: 'Три аркани, що описують борги минулого — повторювані патерни, які тягнуться з роду. Це те, що доведеться відпрацювати, щоб рухатися вперед без блоків.' },
  { zone: 'male', rom: '♂', name: 'Чоловіча лінія', pos: 'Ліворуч',
    desc: 'Спадок по батьківській лінії: соціальні сценарії, ставлення до влади, грошей та дії. Тут видно, які установки ви успадкували від чоловіків роду.' },
  { zone: 'female', rom: '♀', name: 'Жіноча лінія', pos: 'Праворуч',
    desc: 'Спадок по материнській лінії: емоційність, здатність приймати, тілесність і безпека. Часто саме тут ховаються фінансові блоки.' },
]

const SUIT_META: { key: SuitKey; sym: string; ua: string; en: string; theme: string }[] = [
  { key: 'wands',     sym: '🜂', ua: 'Жезли',    en: 'Wands',     theme: 'Вогонь · Воля · Дія' },
  { key: 'cups',      sym: '🜄', ua: 'Кубки',    en: 'Cups',      theme: 'Вода · Почуття · Любов' },
  { key: 'swords',    sym: '🜁', ua: 'Мечі',     en: 'Swords',    theme: 'Повітря · Розум · Слово' },
  { key: 'pentacles', sym: '🜃', ua: 'Пентаклі', en: 'Pentacles', theme: 'Земля · Матерія · Ресурси' },
]

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Усі' },
  { key: 'major', label: 'Старші' },
  ...SUIT_META.map(s => ({ key: s.key as Filter, label: s.ua })),
]

interface DetailCard {
  key: string
  en: string
  ua: string
  kw: string
  up: string
  rev: string
  svg: string
  search: string
}

function toDetail(c: MajorCard | MinorCard, suit?: SuitKey): DetailCard {
  const isMinor = suit !== undefined
  const en = isMinor
    ? `${(c as MinorCard).r} of ${SUIT_META.find(s => s.key === suit)!.en}`
    : (c as MajorCard).en
  return {
    key: isMinor ? `${suit}:${(c as MinorCard).r}` : (c as MajorCard).rom,
    en,
    ua: c.ua,
    kw: c.keywords,
    up: c.up,
    rev: c.rev,
    svg: cardSvg(c, suit),
    search: `${c.ua} ${en} ${c.keywords} ${c.up}`.toLowerCase(),
  }
}

// Колода статична — SVG усіх 78 карт будуємо один раз при завантаженні модуля
const MAJOR = TAROT_DATA.majorArcana.map(c => toDetail(c))
const MINOR = Object.fromEntries(
  SUIT_META.map(s => [s.key, TAROT_DATA.minorMeanings[s.key].cards.map(c => toDetail(c, s.key))])
) as Record<SuitKey, DetailCard[]>

function Tile({ card, onOpen }: { card: DetailCard; onOpen: (d: DetailCard) => void }) {
  const tip = card.up.length > 140 ? card.up.slice(0, 140) + '…' : card.up
  return (
    <div className="tcard" onClick={() => onOpen(card)}>
      <div className="tcard-art" dangerouslySetInnerHTML={{ __html: card.svg }} />
      <div className="tcard-tip">
        <div className="tip-kw">{card.kw}</div>
        <div className="tip-desc">{tip}</div>
      </div>
    </div>
  )
}

function readSec(hash: string): Sec {
  const h = hash.replace('#', '')
  return h in CRUMBS ? (h as Sec) : 'methods'
}

export default function Library() {
  const location = useLocation()
  const navigate = useNavigate()
  const sec = readSec(location.hash)
  const scrollRef = useRef<HTMLElement>(null)

  const [zone, setZone] = useState<Zone>('comfort')
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<DetailCard | null>(null)

  const showSec = (s: Sec) => {
    navigate({ hash: s }, { replace: true })
    scrollRef.current?.scrollTo({ top: 0 })
  }

  // Escape закриває модалку
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const q = query.trim().toLowerCase()
  const sections = useMemo(() => {
    const pass = (list: DetailCard[], key: Filter) =>
      filter === 'all' || filter === key ? list.filter(c => !q || c.search.includes(q)) : []
    return {
      major: pass(MAJOR, 'major'),
      ...Object.fromEntries(SUIT_META.map(s => [s.key, pass(MINOR[s.key], s.key)])),
    } as Record<'major' | SuitKey, DetailCard[]>
  }, [filter, q])

  const zoneProps = (z: Zone) => ({
    className: `mx-node ${zone === z ? 'on' : ''}`,
    onClick: () => setZone(z),
    onMouseEnter: () => setZone(z),
  })

  return (
    <>
      <div className="lib-app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <Link to="/" className="sb-brand">
            <span className="sb-brand-mark"><BrandMark size={22} /></span>
            <div>Lunaris <small>Бібліотека</small></div>
          </Link>

          <div className="sb-group-label">Розділи</div>
          {SIDEBAR.map(item => (
            <button
              key={item.sec}
              className={`sb-item ${sec === item.sec ? 'active' : ''}`}
              onClick={() => showSec(item.sec)}
            >
              <span className="ic">{item.ic}</span> {item.label}
              {item.cnt !== undefined && <span className="cnt">{item.cnt}</span>}
            </button>
          ))}

          <div className="sb-foot">
            <Link to="/guest" className="btn btn-primary sb-cta">Почати розклад →</Link>
          </div>
        </aside>

        {/* MAIN */}
        <section className="main-scroll" ref={scrollRef}>
          <BackLink className="lib-back" />
          <div className="topbar">
            <div className="breadcrumb">
              Lunaris <span className="sep">›</span> Бібліотека <span className="sep">›</span>{' '}
              <span className="cur">{CRUMBS[sec]}</span>
            </div>
            <div className="topbar-links">
              <Link to="/pricing" className="btn">Пакети</Link>
              <Link to="/chat" className="btn btn-ghost">Чат</Link>
            </div>
          </div>

          <div className="mobile-nav">
            {SIDEBAR.map(item => (
              <button
                key={item.sec}
                className={sec === item.sec ? 'active' : ''}
                onClick={() => showSec(item.sec)}
              >{item.mobile}</button>
            ))}
          </div>

          {/* ===== 1. METHODS ===== */}
          {sec === 'methods' && (
            <div className="pane on">
              <div className="doc">
                <div className="doc-eyebrow">Розділ I · Методи</div>
                <h1>Методи <em>розкладу</em></h1>
                <p className="lede">
                  П'ять способів поставити питання картам. Кожен метод — це своя геометрія позицій і своя
                  глибина відповіді. Оберіть той, що відповідає масштабу вашого запиту.
                </p>
                <div className="methods-grid">
                  {TAROT_DATA.spreads.map(s => (
                    <div key={s.name} className="method">
                      <div className="method-head">
                        <span className="method-rom">{s.roman}</span>
                        <span className="method-name">{s.name}</span>
                      </div>
                      <div className="method-tier">{s.tier} · {s.subtitle}</div>
                      <div className="method-desc">{s.desc}</div>
                      <div className="method-use">Коли використовувати — {s.use}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== 2. MATRIX OF DESTINY ===== */}
          {sec === 'matrix' && (
            <div className="pane on">
              <div className="doc">
                <div className="doc-eyebrow">Розділ II · Матриця</div>
                <h1>Як працює <em>Матриця Долі</em></h1>
                <p className="lede">
                  Матриця Долі — це математична система, що розкладає вашу дату народження на 22 Старших
                  Аркани. На відміну від Таро, тут немає випадковості: карти обчислюються за фіксованими
                  формулами й описують структуру особистості, кармічні задачі та фінансовий потенціал.
                </p>

                <div className="matrix-layout">
                  <div className="matrix-stage">
                    <svg viewBox="0 0 1000 1000" role="img" aria-label="Октаграма Матриці Долі">
                      <defs>
                        <radialGradient id="mxGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#c9a24a" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#c9a24a" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      <circle cx="500" cy="500" r="440" fill="url(#mxGlow)" />
                      <circle cx="500" cy="500" r="392" fill="none" stroke="#c9a24a" strokeWidth="1" strokeDasharray="4 8" opacity="0.35" />

                      {/* Квадрат A — ромб, квадрат B — прямий */}
                      <polygon points="500,120 880,500 500,880 120,500" fill="none" stroke="#c9a24a" strokeWidth="2" opacity="0.75" />
                      <polygon points="231,231 769,231 769,769 231,769" fill="none" stroke="#c9a24a" strokeWidth="2" opacity="0.55" />

                      <line x1="500" y1="120" x2="500" y2="880" stroke="#c9a24a" strokeWidth="0.8" opacity="0.25" />
                      <line x1="120" y1="500" x2="880" y2="500" stroke="#c9a24a" strokeWidth="0.8" opacity="0.25" />
                      <line x1="231" y1="231" x2="769" y2="769" stroke="#c9a24a" strokeWidth="0.8" opacity="0.2" />
                      <line x1="769" y1="231" x2="231" y2="769" stroke="#c9a24a" strokeWidth="0.8" opacity="0.2" />

                      <g {...zoneProps('purpose')}>
                        <circle className="mx-halo" cx="500" cy="120" r="46" fill="#c9a24a" opacity="0" />
                        <circle className="dot" cx="500" cy="120" r="19" fill="#c9a24a" />
                        <text x="500" y="66" textAnchor="middle" fill="#e8c678" fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontSize="34">Призначення</text>
                      </g>
                      <g {...zoneProps('karma')}>
                        <circle className="mx-halo" cx="500" cy="880" r="46" fill="#c9a24a" opacity="0" />
                        <circle className="dot" cx="500" cy="880" r="19" fill="#c9a24a" />
                        <text x="500" y="952" textAnchor="middle" fill="#e8c678" fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontSize="34">Кармічний хвіст</text>
                      </g>
                      <g {...zoneProps('male')}>
                        <circle className="mx-halo" cx="120" cy="500" r="46" fill="#c9a24a" opacity="0" />
                        <circle className="dot" cx="120" cy="500" r="19" fill="#c9a24a" />
                        <text x="120" y="565" textAnchor="middle" fill="#a89c85" fontFamily="'JetBrains Mono',monospace" fontSize="22" letterSpacing="3">РІД ♂</text>
                      </g>
                      <g {...zoneProps('female')}>
                        <circle className="mx-halo" cx="880" cy="500" r="46" fill="#c9a24a" opacity="0" />
                        <circle className="dot" cx="880" cy="500" r="19" fill="#c9a24a" />
                        <text x="880" y="565" textAnchor="middle" fill="#a89c85" fontFamily="'JetBrains Mono',monospace" fontSize="22" letterSpacing="3">РІД ♀</text>
                      </g>

                      {[[231, 231], [769, 231], [769, 769], [231, 769]].map(([x, y]) => (
                        <circle key={`c${x}-${y}`} cx={x} cy={y} r="13" fill="#160f28" stroke="#c9a24a" strokeWidth="2" />
                      ))}
                      {[[500, 310], [500, 690], [310, 500], [690, 500]].map(([x, y]) => (
                        <circle key={`m${x}-${y}`} cx={x} cy={y} r="9" fill="#c9a24a" opacity="0.6" />
                      ))}

                      <g {...zoneProps('comfort')}>
                        <circle className="mx-halo" cx="500" cy="500" r="82" fill="#c9a24a" opacity="0" />
                        <circle cx="500" cy="500" r="62" fill="none" stroke="#c9a24a" strokeWidth="1.5" opacity="0.5" />
                        <circle className="dot" cx="500" cy="500" r="34" fill="#c9a24a" />
                        <text x="500" y="514" textAnchor="middle" fill="#15101e" fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontSize="38">XX</text>
                      </g>
                    </svg>
                  </div>

                  <div className="zones">
                    {ZONES.map(z => (
                      <div
                        key={z.zone}
                        className={`zone ${zone === z.zone ? 'on' : ''}`}
                        onClick={() => setZone(z.zone)}
                        onMouseEnter={() => setZone(z.zone)}
                      >
                        <div className="zone-head">
                          <span className="zone-rom">{z.rom}</span>
                          <span className="zone-name">{z.name}</span>
                          <span className="zone-pos">{z.pos}</span>
                        </div>
                        <div className="zone-desc">{z.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <h2>Таро <em>vs</em> Матриця</h2>
                <div className="doc-sub">Два різні інструменти</div>
                <div className="feat-grid">
                  <div className="panel">
                    <div className="feat-glyph">☾</div>
                    <h3>Таро — ситуація</h3>
                    <p>Карти витягуються випадково і відповідають на конкретне питання «тут і зараз». Розклад змінюється щодня, бо змінюється ситуація. Це діагностика поточного моменту.</p>
                  </div>
                  <div className="panel">
                    <div className="feat-glyph">⌖</div>
                    <h3>Матриця — структура</h3>
                    <p>Карти обчислюються з дати народження й не змінюються ніколи. Це карта вашої особистості: постійні сильні сторони, кармічні задачі та фінансовий потенціал.</p>
                  </div>
                </div>

                <h2>Як <em>рахується</em></h2>
                <div className="doc-sub">Формула октаграми</div>
                <p>
                  Дата народження розкладається на три базові числа: <em>день</em>, <em>місяць</em> і <em>рік</em>.
                  Якщо число більше 22 — з нього віднімається 22, доки не залишиться значення в діапазоні Старших Арканів.
                </p>
                <p>
                  Ці три числа стають вершинами октаграми: ліва (чоловіча лінія), верхня (призначення) та права
                  (жіноча). Четверта вершина — сума перших трьох, зведена до аркану. Центр — це сума всіх чотирьох.
                  Далі за тією ж логікою заповнюються діагоналі та внутрішні вузли.
                </p>
                <p>
                  Тому Матриця й не потребує тасування колоди: результат детермінований і однаковий за будь-якого
                  перерахунку. Роль ШІ тут — не витягти карту, а <em>прочитати зв'язки</em> між арканами й скласти
                  з них зв'язний текст.
                </p>

                <div className="panel panel-cta">
                  <h3>Доступ до Матриці Долі</h3>
                  <p>Розрахунок арканів — безкоштовно для всіх. Текстовий висновок від ШІ та поєднання з Таро — у пакеті VIP.</p>
                  <Link to="/matrix" className="btn btn-primary">Розрахувати свою матрицю →</Link>
                </div>
              </div>
            </div>
          )}

          {/* ===== 3. TRAINER ===== */}
          {sec === 'trainer' && (
            <div className="pane on">
              <div className="doc">
                <div className="doc-eyebrow">Розділ III · Тренер</div>
                <h1>Ментал-<em>Тренер</em></h1>
                <p className="lede">
                  Режим, у якому ШІ не дає готової відповіді. Спершу ви самі тлумачите карти, і лише потім бачите
                  прочитання тренера поруч зі своїм. Так інтуїція тренується, а не атрофується.
                </p>

                <div className="steps-grid">
                  <div className="panel">
                    <div className="step-num">· I ·</div>
                    <h3>Запит</h3>
                    <p>Формулюєте ситуацію, яку хочете розібрати. Не «що мене чекає», а «чому я застряг». Тренер підказує, як переформулювати питання, якщо воно закрите.</p>
                  </div>
                  <div className="panel">
                    <div className="step-num">· II ·</div>
                    <h3>Ваше тлумачення</h3>
                    <p>Витягуєте карти — випадково або обираючи свідомо. Перш ніж побачити текст ШІ, описуєте власними словами, що ви бачите в цих символах.</p>
                  </div>
                  <div className="panel">
                    <div className="step-num">· III ·</div>
                    <h3>Дзеркало ШІ</h3>
                    <p>Тренер показує своє читання поруч із вашим і рахує відсоток збігу. Ви бачите, де інтуїція влучила, а де є сліпа пляма.</p>
                  </div>
                </div>

                <h2>Що це <em>дає</em></h2>
                <div className="doc-sub">Три ефекти регулярної практики</div>
                <div className="feat-grid">
                  <div className="panel">
                    <div className="feat-glyph">∿</div>
                    <h3>Тижневі тренди</h3>
                    <p>ШІ аналізує історію ваших сесій і знаходить патерни: «третій день поспіль питаєте про кар'єру і випадають Мечі — ви вигораєте».</p>
                  </div>
                  <div className="panel">
                    <div className="feat-glyph">↟</div>
                    <h3>Прогрес інтуїції</h3>
                    <p>Метрика збігу ваших тлумачень із тренером за місяць. Не магія, а вимірюваний показник того, наскільки ви навчилися читати символи.</p>
                  </div>
                  <div className="panel">
                    <div className="feat-glyph">⌬</div>
                    <h3>Свідомий витяг</h3>
                    <p>Можна не тасувати, а самому обрати карти, що «покликали». Цей вибір теж стає даними для аналізу ваших станів.</p>
                  </div>
                  <div className="panel">
                    <div className="feat-glyph">⊙</div>
                    <h3>Персональна стратегія</h3>
                    <p>На основі патернів тренер формує конкретний план дій на 3–7 днів. Без езотерики — практичні кроки під вашу ситуацію.</p>
                  </div>
                </div>

                <div className="panel panel-cta">
                  <h3>Спробувати Ментал-Тренера</h3>
                  <p>Зараз доступна демо-сесія для всіх. Аналітика патернів і ШІ-дзеркало — у розробці, з’являться у пакеті VIP.</p>
                  <div className="cta-row">
                    <Link to="/trainer-session" className="btn btn-primary">Почати сесію →</Link>
                    <Link to="/trainer" className="btn btn-ghost">Детальніше</Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== 4. DECK ===== */}
          {sec === 'deck' && (
            <div className="pane on">
              <div className="doc">
                <div className="doc-eyebrow">Розділ IV · Колода</div>
                <h1>Колода · <em>78 карт</em></h1>
                <p className="lede">
                  22 Старших Аркани описують долю й великі життєві етапи, 56 Молодших — щоденні події за чотирма
                  стихіями. Наведіть курсор, щоб побачити суть карти; клацніть — щоб відкрити повний опис.
                </p>

                <div className="search-row">
                  <input
                    className="search-in"
                    placeholder="Пошук — напр. «Місяць», «Fool», «любов»…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                  <div className="suit-filters">
                    {FILTERS.map(f => (
                      <button
                        key={f.key}
                        className={`suit-pill ${filter === f.key ? 'on' : ''}`}
                        onClick={() => setFilter(f.key)}
                      >{f.label}</button>
                    ))}
                  </div>
                </div>

                {sections.major.length > 0 && (
                  <div className="suit-section">
                    <div className="suit-head">
                      <span className="suit-sym">✦</span>
                      <div className="suit-title">Старші Аркани <em>Major · 22</em></div>
                      <span className="suit-theme">Душа · Доля · Архетипи</span>
                    </div>
                    <div className="deck-grid">
                      {sections.major.map(c => <Tile key={c.key} card={c} onOpen={setOpen} />)}
                    </div>
                  </div>
                )}

                {SUIT_META.map(meta => sections[meta.key].length > 0 && (
                  <div className="suit-section" key={meta.key}>
                    <div className="suit-head">
                      <span className="suit-sym">{meta.sym}</span>
                      <div className="suit-title">{meta.ua} <em>{meta.en} · 14</em></div>
                      <span className="suit-theme">{meta.theme}</span>
                    </div>
                    <div className="deck-grid">
                      {sections[meta.key].map(c => <Tile key={c.key} card={c} onOpen={setOpen} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Модалка карти */}
      <div
        className={`card-modal lib-modal ${open ? 'open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setOpen(null) }}
      >
        {open && (
          <div className="cm-body">
            <button className="cm-close" onClick={() => setOpen(null)}>✕</button>
            <div className="cm-big-card ca-host">
              <div className="ca" dangerouslySetInnerHTML={{ __html: open.svg }} />
            </div>
            <div className="cm-info">
              <h3>{open.ua}</h3>
              <div className="en">{open.en}</div>
              <div className="kw">{open.kw}</div>
              <div className="cm-meaning">
                <div className="lab">Пряме значення</div>
                <div className="val">{open.up}</div>
              </div>
              <div className="cm-meaning">
                <div className="lab">Перевернуте</div>
                <div className="val">{open.rev}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
