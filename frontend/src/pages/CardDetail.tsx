import { Link, useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import { TAROT_DATA } from '../data/tarotData'

/**
 * CardDetail (/card/:rom) — повна сторінка Старшого Аркану.
 * Дані беремо з реальної колоди (TAROT_DATA.majorArcana), а не з захардкодженого «Місяця».
 */
export default function CardDetail() {
  const { rom } = useParams<{ rom: string }>()
  const majors = TAROT_DATA.majorArcana
  const idx = majors.findIndex(c => c.rom === rom)
  const card = idx >= 0 ? majors[idx] : null

  if (!card) {
    return (
      <>
        <Nav />
        <main className="cd-main">
          <Link to="/library" className="cd-back">← До бібліотеки</Link>
          <p style={{ color: 'var(--ink-dim)' }}>Карту не знайдено.</p>
        </main>
      </>
    )
  }

  const keywords = card.keywords.split('·').map(k => k.trim()).filter(Boolean)
  // 4 сусідні аркани по колу як «споріднені».
  const related = [1, 2, 3, 4].map(off => majors[(idx + off) % majors.length])

  return (
    <>
      <Nav />
      <main className="cd-main">
        <Link to="/library" className="cd-back">← До бібліотеки</Link>

        <div className="cd-hero">
          <div className="cd-card">
            <div className="num">· {card.rom} ·</div>
            <div className="sym">{card.sym}</div>
            <div className="n">{card.en}</div>
          </div>
          <div className="cd-info">
            <div className="eyebrow">Старший Аркан · {card.rom}</div>
            <h1>{card.ua} <em>· {card.en}</em></h1>
            <div className="cd-kws">
              {keywords.map(k => <span className="cd-kw" key={k}>{k}</span>)}
            </div>
            <p className="cd-lead">{card.up}</p>
          </div>
        </div>

        <div className="cd-grid">
          <div className="cd-panel">
            <div className="head"><span className="rom">☽</span><h3>Пряме значення</h3></div>
            <p>{card.up}</p>
          </div>
          <div className="cd-panel">
            <div className="head"><span className="rom">☾</span><h3>Перевернуте</h3></div>
            <p>{card.rev}</p>
          </div>
        </div>

        <div className="cd-section">
          <div className="cd-label">Споріднені карти</div>
          <div className="related">
            {related.map(r => (
              <Link to={`/card/${encodeURIComponent(r.rom)}`} className="rel" key={r.rom}>
                <div className="rr">{r.rom}</div>
                <div className="rs">{r.sym}</div>
                <div className="rn">{r.en}</div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
