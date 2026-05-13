import { useEffect, useMemo, useState } from 'react'
import Nav from '../components/Nav'
import { TAROT_DATA, type MajorCard, type MinorCard, type SuitKey } from '../data/tarotData'

type Filter = 'all' | 'major' | SuitKey

interface DetailCard {
  num: string
  en: string
  ua: string
  sym: string
  kw: string
  up: string
  rev: string
}

function majorToDetail(c: MajorCard): DetailCard {
  return { num: c.rom, en: c.en, ua: c.ua, sym: c.sym, kw: c.keywords, up: c.up, rev: c.rev }
}
function minorToDetail(c: MinorCard, suit: SuitKey): DetailCard {
  const suitEn = { wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pentacles' }[suit]
  return { num: c.r, en: `${c.r} of ${suitEn}`, ua: c.ua, sym: c.sym, kw: c.keywords, up: c.up, rev: c.rev }
}

function Tile({
  card, onOpen,
}: {
  card: DetailCard
  onOpen: (d: DetailCard) => void
}) {
  const kwTrimmed = card.up.length > 140 ? card.up.slice(0, 140) + '…' : card.up
  return (
    <div className="tcard" onClick={() => onOpen(card)}>
      <div className="tcard-inner">
        <div className="tcard-num">· {card.num} ·</div>
        <div className="tcard-sym">{card.sym}</div>
        <div className="tcard-name">{card.ua}</div>
      </div>
      <div className="tcard-tip">
        <div className="tip-kw">{card.kw}</div>
        <div className="tip-desc">{kwTrimmed}</div>
      </div>
    </div>
  )
}

export default function Library() {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<DetailCard | null>(null)

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const q = query.trim().toLowerCase()

  const matches = (card: DetailCard, suit: Filter) => {
    const suitOk = filter === 'all' || filter === suit
    if (!suitOk) return false
    if (!q) return true
    const hay = `${card.ua} ${card.en} ${card.kw} ${card.up}`.toLowerCase()
    return hay.includes(q)
  }

  const majorList = useMemo(
    () => TAROT_DATA.majorArcana.map(majorToDetail).filter(c => matches(c, 'major')),
    [filter, q]
  )
  const suitLists = useMemo(() => {
    const keys: SuitKey[] = ['wands', 'cups', 'swords', 'pentacles']
    return Object.fromEntries(keys.map(k => [
      k,
      TAROT_DATA.minorMeanings[k].cards.map(c => minorToDetail(c, k)).filter(c => matches(c, k))
    ])) as Record<SuitKey, DetailCard[]>
  }, [filter, q])

  const suitMeta: { key: SuitKey; sym: string; ua: string; en: string; theme: string }[] = [
    { key: 'wands',     sym: '🜂', ua: 'Жезли',     en: 'Wands',     theme: 'Вогонь · Воля · Дія' },
    { key: 'cups',      sym: '🜄', ua: 'Кубки',     en: 'Cups',      theme: 'Вода · Почуття · Любов' },
    { key: 'swords',    sym: '🜁', ua: 'Мечі',      en: 'Swords',    theme: 'Повітря · Розум · Слово' },
    { key: 'pentacles', sym: '🜃', ua: 'Пентаклі',  en: 'Pentacles', theme: 'Земля · Матерія · Ресурси' },
  ]

  return (
    <>
      <Nav />

      <main className="lib-main">
        <div className="lib-header fade-up d2">
          <div className="lib-eyebrow">Бібліотека · Вікі</div>
          <h1>Мистецтво <span className="accent">карт</span></h1>
          <p className="lede">
            Коротке знання для мандрівника: п'ять методів розкладу та 78 карт колоди Таро.
            Наведіть курсор, щоб побачити суть карти; клацніть — щоб відкрити повний опис.
          </p>
        </div>

        <div className="sec-nav fade-up d3">
          <a href="#methods">Методи розкладу</a>
          <a href="#major">Старші Аркани</a>
          <a href="#wands">Жезли</a>
          <a href="#cups">Кубки</a>
          <a href="#swords">Мечі</a>
          <a href="#pentacles">Пентаклі</a>
        </div>

        {/* METHODS */}
        <section id="methods" className="fade-up d4">
          <h2 className="sec">Методи <span className="accent">розкладу</span></h2>
          <div className="sec-sub">Як карти говорять із вами</div>
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
        </section>

        {/* SEARCH */}
        <section className="fade-up d5">
          <h2 className="sec">Колода · <span className="accent">78 карт</span></h2>
          <div className="sec-sub">Пошук та фільтр</div>
          <div className="search-row">
            <input
              className="search-in"
              placeholder="Пошук карти — напр. «Місяць», «Fool», «любов»…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div className="suit-filters">
              {(['all', 'major', 'wands', 'cups', 'swords', 'pentacles'] as Filter[]).map(k => (
                <button
                  key={k}
                  className={`suit-pill ${filter === k ? 'on' : ''}`}
                  onClick={() => setFilter(k)}
                >
                  {k === 'all' ? 'Усі'
                    : k === 'major' ? 'Старші'
                    : k === 'wands' ? 'Жезли'
                    : k === 'cups' ? 'Кубки'
                    : k === 'swords' ? 'Мечі'
                    : 'Пентаклі'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* MAJOR */}
        {majorList.length > 0 && (
          <section id="major" className="fade-up d6">
            <div className="suit-head">
              <span className="suit-sym">✦</span>
              <div className="suit-title">Старші Аркани <em>Major · 22 карти</em></div>
              <span className="suit-theme">Душа · Доля · Архетипи</span>
            </div>
            <div className="deck-grid">
              {majorList.map(c => <Tile key={c.num} card={c} onOpen={setOpen} />)}
            </div>
          </section>
        )}

        {/* MINORS */}
        {suitMeta.map(meta => {
          const list = suitLists[meta.key]
          if (list.length === 0) return null
          return (
            <section id={meta.key} key={meta.key} className="fade-up">
              <div className="suit-head">
                <span className="suit-sym">{meta.sym}</span>
                <div className="suit-title">
                  {meta.ua} <em>{meta.en} · 14 карт</em>
                </div>
                <span className="suit-theme">{meta.theme}</span>
              </div>
              <div className="deck-grid">
                {list.map(c => <Tile key={`${meta.key}-${c.num}`} card={c} onOpen={setOpen} />)}
              </div>
            </section>
          )
        })}
      </main>

      {/* Modal */}
      <div
        className={`card-modal ${open ? 'open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setOpen(null) }}
      >
        {open && (
          <div className="cm-body">
            <button className="cm-close" onClick={() => setOpen(null)}>✕</button>
            <div className="cm-big-card">
              <div className="cm-big-num">· {open.num} ·</div>
              <div className="cm-big-sym">{open.sym}</div>
              <div className="cm-big-name">{open.en}</div>
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
