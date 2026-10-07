import {useState} from 'react'
import {Link} from 'react-router-dom'
import Nav from '../components/Nav'

/**
 * Журнал розкладів — особистий архів (шаблон journal.html).
 * Дані поки статичні-приклади: бекенд ще не персистить карти розкладів
 * (відомий гап). Коли з'явиться збереження readings — підставимо реальні.
 */

interface JRow {
    rom: string
    title: string
    sub: string
    cards: string[]
    dateY: string
    dateT: string
    saved?: boolean
}

interface JGroup {
    month: string
    rows: JRow[]
}

const GROUPS: JGroup[] = [
    {
        month: 'Квітень · 2026',
        rows: [
            {rom: 'III', title: 'Чи варто змінити роботу?', sub: 'Минуле · Теперішнє · Майбутнє', cards: ['⚖', '☾', '⚔'], dateY: 'Сьогодні', dateT: '14:02', saved: true},
            {rom: 'V', title: 'Стосунки з Мариною', sub: "П'ятикутник · Аналіз ситуації", cards: ['♥', '⚔', '☾', '⚖', '☉'], dateY: 'Сьогодні', dateT: '10:44'},
            {rom: 'III', title: 'Фінансовий період до літа', sub: 'Минуле · Теперішнє · Майбутнє', cards: ['🜃', '⚚', '☉'], dateY: 'Вт', dateT: '28.04'},
            {rom: 'VII', title: 'Прихована причина моєї тривоги', sub: 'Підкова долі · Глибокий розгляд', cards: ['☾', '⚔', '⛧', '⚝', '✦', '⚱', '☉'], dateY: 'Пн', dateT: '27.04', saved: true},
            {rom: 'III', title: 'Щоденний витяг', sub: 'Картка дня · автоматично', cards: ['☉'], dateY: 'Пн', dateT: '27.04'},
        ],
    },
    {
        month: 'Березень · 2026',
        rows: [
            {rom: 'V', title: 'Подорож на південь', sub: "П'ятикутник", cards: ['⚔', '☉', '🜃', '✦', '∞'], dateY: '11.04', dateT: '—'},
            {rom: 'III', title: 'Переїзд та родина', sub: 'Минуле · Теперішнє · Майбутнє', cards: ['♀', '⊕', '☥'], dateY: '08.04', dateT: '—'},
            {rom: 'III', title: 'Перший розклад', sub: 'Минуле · Теперішнє · Майбутнє', cards: ['✦', '⚚', '☾'], dateY: '02.04', dateT: '—'},
        ],
    },
]

const PILLS = ['Усі', 'III', 'V', 'VII', '★ Збережені'] as const

export default function Journal() {
    const [pill, setPill] = useState<string>('Усі')
    const [query, setQuery] = useState('')

    const match = (r: JRow) => {
        if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false
        if (pill === 'Усі') return true
        if (pill === '★ Збережені') return !!r.saved
        return r.rom === pill
    }

    return (
        <>
            <Nav/>

            <main className="j-main">
                <div className="j-head fade-up d1">
                    <div className="j-eyebrow">Особистий журнал</div>
                    <h1>Архів <span className="accent">розкладів</span></h1>
                    <p className="lede">Усі ваші запити до карт, збережені в одному місці. Перегляньте,
                        як змінювалися відповіді, як рухається ваша доля.</p>
                    {/* Сторінка поки на захардкоджених даних (бекенд Readings не наповнюється) — чесно кажемо */}
                    <div className="demo-banner">
                        ☾ Це демо-приклад того, яким буде Журнал — записи нижче вигадані. Ваші справжні
                        розклади вже зберігаються в <Link to="/chat">історії Гадання</Link>.
                    </div>
                </div>

                <div className="j-tools fade-up d2">
                    <input
                        placeholder="🔍 Пошук за темою або картою…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    {PILLS.map(p => (
                        <button
                            key={p}
                            className={`j-pill ${pill === p ? 'on' : ''}`}
                            onClick={() => setPill(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <div className="j-list fade-up d3">
                    {GROUPS.map(g => {
                        const rows = g.rows.filter(match)
                        if (rows.length === 0) return null
                        return (
                            <div key={g.month}>
                                <div className="month-label">{g.month}</div>
                                {rows.map((r, i) => (
                                    <Link key={i} to="/reading" className="j-row">
                                        <span className="j-rom">{r.rom}</span>
                                        <div className="j-meta">
                                            <div className="t">{r.title}</div>
                                            <div className="s">{r.sub}</div>
                                        </div>
                                        <div className="j-cards">
                                            {r.cards.map((c, ci) => <span key={ci} className="j-mini">{c}</span>)}
                                        </div>
                                        <div className="j-date"><span className="y">{r.dateY}</span>{r.dateT}</div>
                                    </Link>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </main>
        </>
    )
}
