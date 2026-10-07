import Nav from '../components/Nav'
import { TAROT_DATA, type SuitKey } from '../data/tarotData'
import { cardSvg } from '../lib/cardArt'

/**
 * Колода — галерея всіх 78 карт у лінійній графіці (шаблон deck.html).
 * SVG генерує lib/cardArt.ts. Дані статичні, тож будуємо секції один раз
 * при завантаженні модуля — 78 рядків SVG не перебудовуються на ререндер.
 */
const SUIT_NAMES: Record<SuitKey, string> = {
  wands: 'Жезли',
  cups: 'Кубки',
  swords: 'Мечі',
  pentacles: 'Пентаклі',
}

interface Tile {
  key: string
  svg: string
  cap: string
}

interface Section {
  title: string
  sub: string
  tiles: Tile[]
}

function buildSections(): Section[] {
  const major: Section = {
    title: 'Старші аркани',
    sub: String(TAROT_DATA.majorArcana.length),
    tiles: TAROT_DATA.majorArcana.map(c => ({ key: c.rom, svg: cardSvg(c), cap: c.en })),
  }
  const minor = (Object.keys(SUIT_NAMES) as SuitKey[]).map(s => ({
    title: SUIT_NAMES[s],
    sub: TAROT_DATA.minorMeanings[s].theme,
    tiles: TAROT_DATA.minorMeanings[s].cards.map(c => ({ key: s + ':' + c.r, svg: cardSvg(c, s), cap: '' })),
  }))
  return [major, ...minor]
}

const SECTIONS = buildSections()

export default function Deck() {
  return (
    <>
      <Nav />
      <main className="cs-main">
        <h1 className="fade-up d1">Колода <em>Lunaris</em></h1>
        <p className="cs-sub fade-up d2">
          78 карт в одній лінійній мові: 22 Старші аркани сценами, 56 Молодших — знаки масті та фігури двору.
        </p>

        {SECTIONS.map(sec => (
          <section key={sec.title}>
            <h2 className="cs-sec">{sec.title}<em>{sec.sub}</em></h2>
            <div className="cs-grid">
              {sec.tiles.map(t => (
                <div key={t.key}>
                  <div className="cs-card" dangerouslySetInnerHTML={{ __html: t.svg }} />
                  {t.cap && <div className="cs-cap">{t.cap}</div>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  )
}
