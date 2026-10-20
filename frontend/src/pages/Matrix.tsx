import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import Nav from '../components/Nav'
import {
    ApiError,
    auth,
    birthDateStore,
    type Compatibility,
    type DestinyMatrix,
    type MatrixGroup,
    matrixApi,
    type MatrixPoint,
    userApi,
    type UserUsage,
} from '../lib/api'

/**
 * Матриця Долі: повна октаграма (метод 22 арканів) + Матриця сумісності пари.
 * Розрахунок (GET /api/matrix, /api/matrix/compatibility) — без AI, для всіх.
 * Прочитання від Lunaris (POST …/reading) — VIP/Admin, списує розклад.
 */

type Mode = 'personal' | 'pair'

// Координати точок на октаграмі (viewBox 1000×1000). Ключі = MatrixPoint.key з бекенду.
const POS: Record<string, [number, number]> = {
    center: [500, 500],
    top: [500, 110], right: [890, 500], bottom: [500, 890], left: [110, 500],
    fatherTop: [224, 224], motherTop: [776, 224], fatherBottom: [776, 776], motherBottom: [224, 776],
    // хвіст: D (низ) → D2 → D1; лінія грошей/любові йде від C1 (660,500) до D1 (500,660), K — посередині
    tailMid: [500, 775], tailInner: [500, 660],
    money: [620, 540], love: [540, 620],
}
const RADIUS: Record<string, number> = {center: 70, top: 52, right: 52, bottom: 52, left: 52}
const radius = (key: string) => RADIUS[key] ?? (key.startsWith('father') || key.startsWith('mother') ? 44 : 28)

const GROUPS: Record<Mode, { id: MatrixGroup; title: string; hint: string }[]> = {
    personal: [
        {id: 'personality', title: 'Ядро особистості',
            hint: 'Хто ви є: базова енергія, характер, таланти й ставлення до матеріального.'},
        {id: 'karma', title: 'Кармічний хвіст',
            hint: 'Три аркани внизу читаються як одна історія: старий сценарій → урок → вихід.'},
        {id: 'money_love', title: 'Гроші й любов',
            hint: 'Лінія в нижньому правому секторі: як до вас приходять гроші і які стосунки вам підходять.'},
        {id: 'family', title: 'Рід',
            hint: 'Діагоналі октаграми: що передалося від батька й матері — ресурс і незавершені задачі.'},
        {id: 'purpose', title: 'Призначення',
            hint: 'Три етапи життя. Рахуються з вертикалі, горизонталі й діагоналей, тому на октаграмі їх не видно.'},
    ],
    pair: [
        {id: 'personality', title: 'Енергія союзу',
            hint: 'Ті самі позиції, але про пару: що вас звело, як вас бачать разом, що надихає, побут.'},
        {id: 'karma', title: 'Карма пари',
            hint: 'Сценарій, який пара може повторювати, урок і спосіб його пройти.'},
        {id: 'money_love', title: 'Гроші й любов пари',
            hint: 'На чому тримається близькість і через що пара будує добробут.'},
        {id: 'purpose', title: 'Призначення пари',
            hint: 'Для чого ви одне одному, що даєте світу разом і найглибший сенс союзу.'},
    ],
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

function Octagram({points, active, onPick, label}: {
    points: MatrixPoint[]
    active: string
    onPick: (key: string) => void
    label: string
}) {
    const has = (k: string) => points.some(p => p.key === k)
    return (
        <svg viewBox="40 40 920 920" role="img" aria-label={label}>
            {/* прямий квадрат (особистість) і діагональний (рід) */}
            <polygon points="500,110 890,500 500,890 110,500" fill="none" stroke="#c9a24a" strokeWidth="2" opacity="0.7"/>
            {has('fatherTop') && (
                <polygon points="224,224 776,224 776,776 224,776" fill="none" stroke="#c9a24a" strokeWidth="1.5" opacity="0.4"/>
            )}
            <line x1="500" y1="110" x2="500" y2="890" stroke="#c9a24a" strokeWidth="0.8" opacity="0.25"/>
            <line x1="110" y1="500" x2="890" y2="500" stroke="#c9a24a" strokeWidth="0.8" opacity="0.25"/>
            {/* лінія грошей і любові: від внутрішньої правої точки до внутрішньої нижньої */}
            <line x1="660" y1="500" x2="500" y2="660" stroke="#c9a24a" strokeWidth="1.2" strokeDasharray="6 6" opacity="0.55"/>
            {points.map(p => {
                const pos = POS[p.key]
                if (!pos) return null           // призначення — не на октаграмі
                const [x, y] = pos
                const r = radius(p.key)
                const on = p.key === active
                const fs = p.key === 'center' ? 42 : r >= 52 ? 34 : r >= 44 ? 28 : 22
                return (
                    <g key={p.key} className="mx-node" onClick={() => onPick(p.key)} onMouseEnter={() => onPick(p.key)}>
                        <circle cx={x} cy={y} r={r + 12} fill="#c9a24a" opacity={on ? 0.18 : 0}/>
                        <circle cx={x} cy={y} r={r} fill={on ? '#c9a24a' : '#160f28'} stroke="#c9a24a" strokeWidth="2"/>
                        <text x={x} y={y + fs * 0.34} textAnchor="middle" fontSize={fs}
                              fill={on ? '#15101e' : '#e8c678'} fontFamily="'Cormorant Garamond',serif" fontStyle="italic">
                            {roman(p.arcana)}
                        </text>
                    </g>
                )
            })}
        </svg>
    )
}

export default function Matrix() {
    const [mode, setMode] = useState<Mode>('personal')
    const [birthDate, setBirthDate] = useState(birthDateStore.get())
    const [partnerDate, setPartnerDate] = useState('')
    const [matrix, setMatrix] = useState<DestinyMatrix | null>(null)
    const [compat, setCompat] = useState<Compatibility | null>(null)
    const [active, setActive] = useState('center')
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

    function switchMode(m: Mode) {
        setMode(m)
        setActive('center')
        setReply(null)
        setError(null)
        setQuestion('')
    }

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

    async function calculatePair() {
        if (!birthDate || !partnerDate) return
        setLoading('calc')
        setError(null)
        setReply(null)
        try {
            setCompat(await matrixApi.compatibility(birthDate, partnerDate))
            birthDateStore.set(birthDate)
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Не вдалося розрахувати сумісність')
        } finally {
            setLoading(null)
        }
    }

    async function read() {
        setLoading('read')
        setError(null)
        try {
            if (mode === 'personal') {
                const res = await matrixApi.reading(birthDate, question.trim())
                setMatrix(res.matrix)
                setReply(res.reply)
            } else {
                const res = await matrixApi.compatibilityReading(birthDate, partnerDate, question.trim())
                setCompat(res.compatibility)
                setReply(res.reply)
            }
            userApi.usage().then(setUsage).catch(() => {})
        } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Звʼязок із картами обірвався… Спробуйте ще раз.')
        } finally {
            setLoading(null)
        }
    }

    const points = mode === 'personal' ? matrix?.points : compat?.points
    const point = points?.find(p => p.key === active)
    const canRead = loggedIn && usage?.destinyMatrix
    const centerOf = (m: DestinyMatrix) => m.points.find(p => p.key === 'center')

    return (
        <>
            <Nav/>
            <main className="mx-main">
                <div className="j-head fade-up d1">
                    <div className="j-eyebrow">Матриця Долі</div>
                    <h1>{mode === 'personal' ? <>Ваша <span className="accent">октаграма</span></>
                        : <>Матриця <span className="accent">сумісності</span></>}</h1>
                    <p className="lede">
                        {mode === 'personal'
                            ? 'Дата народження розкладається на Старші Аркани за фіксованими формулами — тут немає випадковості. ' +
                              'Це постійна структура особистості: ядро, карма, рід, гроші, любов і призначення.'
                            : 'Базові точки двох матриць додаються, і з них рахується октаграма пари. ' +
                              'Вона показує енергію союзу, його урок і сильні сторони — але не відповідає «будете разом чи ні».'}
                    </p>
                </div>

                <div className="mx-tabs fade-up d2" role="tablist">
                    <button type="button" role="tab" aria-selected={mode === 'personal'}
                            className={mode === 'personal' ? 'on' : ''} onClick={() => switchMode('personal')}>
                        Моя матриця
                    </button>
                    <button type="button" role="tab" aria-selected={mode === 'pair'}
                            className={mode === 'pair' ? 'on' : ''} onClick={() => switchMode('pair')}>
                        Сумісність пари
                    </button>
                </div>

                {mode === 'personal' ? (
                    <form className="mx-form fade-up d2" onSubmit={e => { e.preventDefault(); calculate() }}>
                        <label htmlFor="mx-date">Дата народження</label>
                        <input id="mx-date" type="date" value={birthDate} min="1900-01-01" max={today}
                               onChange={e => setBirthDate(e.target.value)} required/>
                        <button className="btn btn-primary" disabled={!birthDate || loading !== null}>
                            {loading === 'calc' ? 'Рахую…' : 'Розрахувати'}
                        </button>
                    </form>
                ) : (
                    <form className="mx-form mx-form-pair fade-up d2" onSubmit={e => { e.preventDefault(); calculatePair() }}>
                        <div className="mx-field">
                            <label htmlFor="mx-date1">Ваша дата</label>
                            <input id="mx-date1" type="date" value={birthDate} min="1900-01-01" max={today}
                                   onChange={e => setBirthDate(e.target.value)} required/>
                        </div>
                        <div className="mx-field">
                            <label htmlFor="mx-date2">Дата партнера</label>
                            <input id="mx-date2" type="date" value={partnerDate} min="1900-01-01" max={today}
                                   onChange={e => setPartnerDate(e.target.value)} required/>
                        </div>
                        <button className="btn btn-primary" disabled={!birthDate || !partnerDate || loading !== null}>
                            {loading === 'calc' ? 'Рахую…' : 'Розрахувати пару'}
                        </button>
                    </form>
                )}

                {error && <div className="mx-error">{error}</div>}

                {points && (
                    <div className="mx-layout fade-up d3">
                        <div className="mx-stage">
                            <Octagram points={points} active={active} onPick={setActive}
                                      label={mode === 'personal' ? 'Октаграма Матриці Долі' : 'Октаграма сумісності'}/>
                            {mode === 'pair' && compat && (
                                <div className="mx-partners">
                                    <span>Зона комфорту: ви — <em>{centerOf(compat.first)?.nameUkr}</em></span>
                                    <span>партнер — <em>{centerOf(compat.second)?.nameUkr}</em></span>
                                </div>
                            )}
                        </div>

                        <div className="mx-points">
                            {point && (
                                <div className="panel mx-detail">
                                    <h3>{point.title}: <em>{point.nameUkr}</em> <span className="mx-num">{roman(point.arcana)}</span></h3>
                                    <p className="mx-hint"><span>Позиція</span>{point.hint}</p>
                                    <p><span className="mx-lab">Аркан</span>{point.keywords}. {point.meaning}</p>
                                </div>
                            )}
                            {GROUPS[mode].map(g => {
                                const items = points.filter(p => p.group === g.id)
                                if (!items.length) return null
                                return (
                                    <section key={g.id} className="mx-group">
                                        <h4>{g.title}</h4>
                                        <p className="mx-group-hint">{g.hint}</p>
                                        {items.map(p => (
                                            <button key={p.key} type="button" className={`mx-point ${p.key === active ? 'on' : ''}`}
                                                    onClick={() => setActive(p.key)}>
                                                <span className="mx-rom">{roman(p.arcana)}</span>
                                                <span className="mx-meta">
                                                    <span className="t">{p.title}</span>
                                                    <span className="s">{p.nameUkr} · {p.keywords}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </section>
                                )
                            })}
                        </div>
                    </div>
                )}

                {points && (
                    <section className="mx-reading fade-up d3">
                        <h2>{mode === 'personal' ? <>Прочитання від <em>Lunaris</em></> : <>Lunaris про <em>вашу пару</em></>}</h2>
                        {mode === 'pair' && (
                            <p className="mx-honest">
                                Чесно: жодна матриця не дає «100% будете разом» чи відсотка сумісності. Вона показує, що вас
                                зводить, де буде напруга і як її пройти. Рішення завжди за вами двома.
                            </p>
                        )}
                        {canRead ? (
                            <>
                                <textarea placeholder={mode === 'personal'
                                    ? 'Необовʼязково: що саме хочете дізнатися? (стосунки, робота, призначення…)'
                                    : 'Необовʼязково: що вас хвилює в цих стосунках?'}
                                          maxLength={300} rows={2} value={question}
                                          onChange={e => setQuestion(e.target.value)}/>
                                <div className="mx-actions">
                                    <button className="btn btn-primary" onClick={read} disabled={loading !== null}>
                                        {loading === 'read' ? 'Lunaris читає матрицю…'
                                            : mode === 'personal' ? 'Прочитати матрицю' : 'Прочитати сумісність'}
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
                                    ? 'Прочитання Матриці та сумісності від Lunaris і поєднання з Таро в чаті входять у пакет VIP. Розрахунок вище — безкоштовний.'
                                    : 'Увійдіть, щоб отримати прочитання від Lunaris. Розрахунок вище — безкоштовний для всіх.'}</p>
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
