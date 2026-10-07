import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import Nav from '../components/Nav'
import {
    ApiError,
    auth,
    birthDateStore,
    type DestinyMatrix,
    matrixApi,
    type MatrixPoint,
    userApi,
    type UserUsage,
} from '../lib/api'

/**
 * Матриця Долі: розрахунок (GET /api/matrix — без AI, для всіх)
 * + прочитання від Lunaris (POST /api/matrix/reading — VIP/Admin, списує розклад).
 */

// Координати точок на октаграмі (viewBox 1000×1000) — та сама геометрія, що в Бібліотеці.
const POS: Record<MatrixPoint['key'], [number, number]> = {
    top: [500, 130],
    left: [130, 500],
    right: [870, 500],
    bottom: [500, 870],
    center: [500, 500],
}

function roman(n: number): string {
    const map: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
    let out = ''
    for (const [v, s] of map) while (n >= v) { out += s; n -= v }
    return out
}

/** Той самий маркер курсиву, що й у чаті: *текст* → <em>. */
function renderText(text: string) {
    return text.split(/\*([^*]+)\*/g).map((part, i) =>
        i % 2 === 1 ? <em key={i}>{part}</em> : <span key={i}>{part}</span>)
}

export default function Matrix() {
    const [birthDate, setBirthDate] = useState(birthDateStore.get())
    const [matrix, setMatrix] = useState<DestinyMatrix | null>(null)
    const [active, setActive] = useState<MatrixPoint['key']>('center')
    const [question, setQuestion] = useState('')
    const [reply, setReply] = useState<string | null>(null)
    const [loading, setLoading] = useState<'calc' | 'read' | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [usage, setUsage] = useState<UserUsage | null>(null)

    const loggedIn = auth.isAuthenticated()
    const today = new Date().toISOString().slice(0, 10)

    useEffect(() => {
        if (loggedIn) userApi.usage().then(setUsage).catch(() => { /* не критично */ })
        // Дата вже збережена — одразу показуємо матрицю.
        if (birthDate) calculate(birthDate)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function calculate(date = birthDate) {
        if (!date) return
        setLoading('calc')
        setError(null)
        setReply(null)
        try {
            setMatrix(await matrixApi.calculate(date))
            birthDateStore.set(date)
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Не вдалося розрахувати матрицю')
        } finally {
            setLoading(null)
        }
    }

    async function read() {
        if (!birthDate) return
        setLoading('read')
        setError(null)
        try {
            const res = await matrixApi.reading(birthDate, question.trim())
            setMatrix(res.matrix)
            setReply(res.reply)
            userApi.usage().then(setUsage).catch(() => {})
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Звʼязок із картами обірвався… Спробуйте ще раз.')
        } finally {
            setLoading(null)
        }
    }

    const point = matrix?.points.find(p => p.key === active)
    const canRead = loggedIn && usage?.destinyMatrix

    return (
        <>
            <Nav/>
            <main className="mx-main">
                <div className="j-head fade-up d1">
                    <div className="j-eyebrow">Матриця Долі</div>
                    <h1>Ваша <span className="accent">октаграма</span></h1>
                    <p className="lede">Дата народження розкладається на Старші Аркани. Тут немає випадковості —
                        це постійна структура вашої особистості. А в чаті її можна поєднати з розкладом Таро.</p>
                </div>

                <form className="mx-form fade-up d2" onSubmit={e => { e.preventDefault(); calculate() }}>
                    <label htmlFor="mx-date">Дата народження</label>
                    <input id="mx-date" type="date" value={birthDate} min="1900-01-01" max={today}
                           onChange={e => setBirthDate(e.target.value)} required/>
                    <button className="btn btn-primary" disabled={!birthDate || loading !== null}>
                        {loading === 'calc' ? 'Рахую…' : 'Розрахувати'}
                    </button>
                </form>

                {error && <div className="mx-error">{error}</div>}

                {matrix && (
                    <div className="mx-layout fade-up d3">
                        <div className="mx-stage">
                            <svg viewBox="0 0 1000 1000" role="img" aria-label="Октаграма Матриці Долі">
                                <polygon points="500,130 870,500 500,870 130,500" fill="none" stroke="#c9a24a" strokeWidth="2" opacity="0.7"/>
                                <polygon points="238,238 762,238 762,762 238,762" fill="none" stroke="#c9a24a" strokeWidth="1.5" opacity="0.35"/>
                                <line x1="500" y1="130" x2="500" y2="870" stroke="#c9a24a" strokeWidth="0.8" opacity="0.25"/>
                                <line x1="130" y1="500" x2="870" y2="500" stroke="#c9a24a" strokeWidth="0.8" opacity="0.25"/>
                                {matrix.points.map(p => {
                                    const [x, y] = POS[p.key]
                                    const r = p.key === 'center' ? 78 : 58
                                    const on = p.key === active
                                    return (
                                        <g key={p.key} className="mx-node" onClick={() => setActive(p.key)}
                                           onMouseEnter={() => setActive(p.key)}>
                                            <circle cx={x} cy={y} r={r + 14} fill="#c9a24a" opacity={on ? 0.18 : 0}/>
                                            <circle cx={x} cy={y} r={r} fill={on ? '#c9a24a' : '#160f28'} stroke="#c9a24a" strokeWidth="2"/>
                                            <text x={x} y={y + 14} textAnchor="middle" fontSize={p.key === 'center' ? 46 : 38}
                                                  fill={on ? '#15101e' : '#e8c678'} fontFamily="'Cormorant Garamond',serif" fontStyle="italic">
                                                {roman(p.arcana)}
                                            </text>
                                        </g>
                                    )
                                })}
                            </svg>
                        </div>

                        <div className="mx-points">
                            {matrix.points.map(p => (
                                <button key={p.key} type="button" className={`mx-point ${p.key === active ? 'on' : ''}`}
                                        onClick={() => setActive(p.key)}>
                                    <span className="mx-rom">{roman(p.arcana)}</span>
                                    <span className="mx-meta">
                                        <span className="t">{p.title}</span>
                                        <span className="s">{p.nameUkr} · {p.keywords}</span>
                                    </span>
                                </button>
                            ))}
                            {point && (
                                <div className="panel mx-detail">
                                    <h3>{point.title}: <em>{point.nameUkr}</em></h3>
                                    <p>{point.meaning}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {matrix && (
                    <section className="mx-reading fade-up d3">
                        <h2>Прочитання від <em>Lunaris</em></h2>
                        {canRead ? (
                            <>
                                <textarea placeholder="Необовʼязково: що саме хочете дізнатися? (стосунки, робота, призначення…)"
                                          maxLength={300} rows={2} value={question}
                                          onChange={e => setQuestion(e.target.value)}/>
                                <div className="mx-actions">
                                    <button className="btn btn-primary" onClick={read} disabled={loading !== null}>
                                        {loading === 'read' ? 'Lunaris читає матрицю…' : 'Прочитати матрицю'}
                                    </button>
                                    <Link to="/chat" className="btn">Поєднати з Таро в чаті →</Link>
                                </div>
                                {reply && (
                                    <div className="mx-reply">
                                        {reply.split(/\n{2,}/).filter(Boolean).map((p, i) => <p key={i}>{renderText(p)}</p>)}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="panel panel-cta">
                                <p>{loggedIn
                                    ? 'AI-прочитання Матриці та поєднання її з розкладом Таро входять у пакет VIP.'
                                    : 'Увійдіть, щоб отримати прочитання від Lunaris.'}</p>
                                <Link to={loggedIn ? '/pricing' : '/login'} className="btn btn-primary">
                                    {loggedIn ? 'Переглянути пакети →' : 'Увійти →'}
                                </Link>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </>
    )
}
