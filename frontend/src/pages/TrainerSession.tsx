import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import Nav from '../components/Nav'
import {TAROT_DATA, type MajorCard, type MinorCard, type SuitKey} from '../data/tarotData'
import {cardSvg} from '../lib/cardArt'

/**
 * Інтерактивна сесія ментального тренера (шаблон trainer-session.html).
 * 4 кроки: запит → карти → ваше тлумачення → дзеркало тренера.
 * Колода — усі 78 карт, кожна з шансом 25% випасти перевернутою.
 * «Дзеркало» поки рахується локально зі значень карт: окремого бекенд-ендпоінта
 * тренера ще немає. Сесії зберігаються в localStorage (lunaris-trainer-sessions).
 */

interface PoolCard {
    card: MajorCard | MinorCard
    suit?: SuitKey
    rom: string
}

interface Drawn extends PoolCard {
    isRev: boolean
    svg: string
}

interface CoachResult {
    paras: {head: string; text: string}[]
    score: number
    title: string
    feedback: string
}

const POOL: PoolCard[] = [
    ...TAROT_DATA.majorArcana.map(c => ({card: c, rom: c.rom})),
    ...(Object.keys(TAROT_DATA.minorMeanings) as SuitKey[]).flatMap(s =>
        TAROT_DATA.minorMeanings[s].cards.map(c => ({card: c, suit: s, rom: c.r}))),
]

const POSITIONS: Record<number, string[]> = {
    3: ['Минуле', 'Теперішнє', 'Майбутнє'],
    5: ['Корінь', 'Перешкода', 'Порада', 'Зовнішнє', 'Результат'],
    7: ['Минуле', 'Теперішнє', 'Прихований вплив', 'Порада', 'Зовні', 'Очікування', 'Результат'],
}

const METHODS = [
    {count: 3, rom: 'III', nm: 'Три карти'},
    {count: 5, rom: 'V', nm: "П'ять карт"},
    {count: 7, rom: 'VII', nm: 'Сім карт'},
]

const STEPS = [
    {n: 1, rom: 'I', lab: 'Запит'},
    {n: 2, rom: 'II', lab: 'Карти'},
    {n: 3, rom: 'III', lab: 'Ваше тлумачення'},
    {n: 4, rom: 'IV', lab: 'Дзеркало'},
]

const HINTS = [
    'Що блокує мене у проекті',
    'Чому повторюється конфлікт у стосунках',
    'Як я бачу себе через рік',
    'Що мені дає тривога останнього тижня',
]

const DECK_SIZE = 24
const Q_MAX = 400
const SESSIONS_KEY = 'lunaris-trainer-sessions'

const shuffled = <T, >(list: T[]) => [...list].sort(() => Math.random() - 0.5)

function draw(p: PoolCard): Drawn {
    const isRev = Math.random() < 0.25
    return {...p, isRev, svg: cardSvg(p.card, p.suit, {rev: isRev})}
}

// Локальне «дзеркало»: позиція за позицією зі значень карт + бал за збігом ключових слів
function localCoach(drawn: Drawn[], positions: string[], mine: string): CoachResult {
    const lower = mine.toLowerCase()
    const paras = drawn.map((d, i) => ({
        head: `${positions[i]} — ${d.card.ua}${d.isRev ? ' (перевернута)' : ''}.`,
        text: d.isRev ? (d.card.rev || d.card.up) : d.card.up,
    }))
    const words = drawn.flatMap(d => d.card.keywords.toLowerCase().split(' · '))
    const hit = words.filter(w => lower.includes(w.slice(0, 5))).length
    const namesHit = drawn.filter(d => lower.includes(d.card.ua.toLowerCase().split(' ').pop()!.slice(0, 4))).length
    const len = Math.min(1, mine.length / 400)
    const score = mine ? Math.round(Math.min(96, 30 + hit * 9 + namesHit * 6 + len * 25)) : 0
    return {
        paras,
        score,
        title: score >= 70 ? 'Ваша інтуїція звучить ясно' : score >= 45 ? 'Правильний напрям' : 'Є куди рости',
        feedback: mine
            ? `Ви торкнулися ${hit} з ${words.length} ключових тем розкладу. ` +
              (hit < words.length / 2
                  ? 'Спробуйте детальніше описати кожну позицію окремо.'
                  : "Наступного разу зверніть увагу на зв'язок між картами.")
            : 'Без власного тлумачення бал не рахується.',
    }
}

function saveSession(q: string, mine: string, score: number, drawn: Drawn[]) {
    try {
        const list = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]')
        list.unshift({
            at: new Date().toISOString(), q, mine, score,
            cards: drawn.map(d => ({rom: d.rom, suit: d.suit || null, ua: d.card.ua, rev: d.isRev})),
        })
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(list.slice(0, 50)))
    } catch {
        // приватний режим / заблоковане сховище — сесія просто не збережеться
    }
}

export default function TrainerSession() {
    const [step, setStep] = useState(1)
    const [count, setCount] = useState(3)
    const [mode, setMode] = useState<'random' | 'manual'>('random')
    const [deckOrder, setDeckOrder] = useState(() => shuffled(POOL))
    const [drawn, setDrawn] = useState<Drawn[]>([])
    const [picked, setPicked] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(false)
    const [loaderMsg, setLoaderMsg] = useState('Тренер тасує колоду...')
    const [shuffledOnce, setShuffledOnce] = useState(false)
    const [question, setQuestion] = useState('')
    const [qError, setQError] = useState(false)
    const [qWarn, setQWarn] = useState('')
    const [kwOpen, setKwOpen] = useState(false)
    const [yourInterp, setYourInterp] = useState('')
    const [yourFinal, setYourFinal] = useState('')
    const [coach, setCoach] = useState<CoachResult | null>(null)
    const [shownScore, setShownScore] = useState(0)

    const positions = POSITIONS[count]
    const complete = drawn.length === count

    // Анімація кола балу: від 0 до coach.score кроком 2%
    useEffect(() => {
        if (!coach) return
        let cur = 0
        const t = window.setInterval(() => {
            cur = Math.min(coach.score, cur + 2)
            setShownScore(cur)
            if (cur >= coach.score) window.clearInterval(t)
        }, 16)
        return () => window.clearInterval(t)
    }, [coach])

    function goStep(n: number) {
        setStep(n)
        window.scrollTo({top: 0, behavior: 'smooth'})
    }

    function rebuildDeck() {
        setDrawn([])
        setPicked(new Set())
        setDeckOrder(shuffled(POOL))
        setShuffledOnce(false)
    }

    function selectCount(c: number) {
        setCount(c)
        rebuildDeck()
    }

    function selectMode(m: 'random' | 'manual') {
        setMode(m)
        rebuildDeck()
    }

    function onQuestion(v: string) {
        setQuestion(v)
        setQError(false)
        setQWarn('')
    }

    function toCards() {
        const v = question.trim()
        if (v.length < 10) {
            setQError(true)
            setQWarn('Запит занадто короткий — хоча б одне речення')
            return
        }
        // \b не працює з кирилицею, тому межу слова перевіряємо пробілом
        if (/^(чи|коли|з ким)(\s|$)/i.test(v)) setQWarn('Спробуйте переформулювати через «що / як / чому»')
        goStep(2)
    }

    function pickManual(i: number) {
        if (picked.has(i) || drawn.length >= count) return
        setPicked(prev => new Set(prev).add(i))
        setDrawn(prev => [...prev, draw(deckOrder[i])])
    }

    function shuffleDraw() {
        setDrawn([])
        setLoading(true)
        setLoaderMsg('Тренер тасує колоду...')
        window.setTimeout(() => {
            setLoaderMsg('Витягую символи...')
            window.setTimeout(() => {
                setDrawn(shuffled(POOL).slice(0, count).map(draw))
                setLoading(false)
                setShuffledOnce(true)
            }, 900)
        }, 1100)
    }

    function revealCoach() {
        const mine = yourInterp.trim()
        setYourFinal(mine || '— Ви пропустили цей крок. Тренування інтуїції починається з власної спроби.')
        const r = localCoach(drawn, positions, mine)
        setShownScore(0)
        setCoach(r)
        saveSession(question.trim(), mine, r.score, drawn)
        goStep(4)
    }

    function resetSession() {
        setCount(3)
        setMode('random')
        rebuildDeck()
        setQuestion('')
        setQError(false)
        setQWarn('')
        setKwOpen(false)
        setYourInterp('')
        setYourFinal('')
        setCoach(null)
        setShownScore(0)
        setLoading(false)
        goStep(1)
    }

    const deckStatus = mode === 'random'
        ? (complete ? '✦ Колода прийняла ваш запит' : 'Натисніть «Тасувати та витягти», коли будете готові')
        : (complete ? '✦ Карти зібрано' : `Оберіть свідомо ${count} карт · обрано ${drawn.length}`)

    const drawnRow = (
        <div className="drawn-row">
            {drawn.map((d, i) => (
                <div key={i} className="drawn-card ca-host" style={{margin: '24px 0 18px'}}>
                    <div className="pos">{positions[i] || ''}</div>
                    <div className="ca" dangerouslySetInnerHTML={{__html: d.svg}}/>
                    {d.isRev && <div className="rv">Перевернута</div>}
                </div>
            ))}
        </div>
    )

    return (
        <>
            <Nav/>

            <main className="ts-main">
                <div className="stepper">
                    {STEPS.map(d => {
                        const done = d.n < step
                        return (
                            <div
                                key={d.n}
                                className={`step-dot ${step === d.n ? 'active' : ''} ${done ? 'done' : ''}`}
                                onClick={done ? () => goStep(d.n) : undefined}
                            >
                                <span className="rom">{d.rom}</span><span className="lab">{d.lab}</span>
                            </div>
                        )
                    })}
                </div>

                {/* STEP 1: QUESTION */}
                <div className={`pane ${step === 1 ? 'on' : ''}`}>
                    <div className="panel-head">
                        <h2>Сформулюйте <em>запит</em></h2>
                        <p className="sub">Не «що мене чекає», а «що в мені вже є». Найкращі запити —
                            конкретні, про теперішнє, без бажання отримати готову відповідь. Тренер
                            допоможе вам побачити свою ситуацію, а не передбачити її.</p>
                    </div>

                    <textarea
                        className={`q-input ${qError ? 'err' : ''}`}
                        maxLength={Q_MAX}
                        placeholder="Що я хочу зрозуміти? Наприклад — «Чому я знову відкладаю розмову з керівником про підвищення»…"
                        value={question}
                        onChange={e => onQuestion(e.target.value)}
                    />
                    <div className="q-meta">
                        <span>{qWarn && <span className="warn">{qWarn}</span>}</span>
                        <span>{question.length} / {Q_MAX}</span>
                    </div>

                    <div className="q-hints">
                        {HINTS.map(h => (
                            <button key={h} className="q-hint" onClick={() => onQuestion(h)}>{h}</button>
                        ))}
                    </div>

                    <div className="tip-box">
                        <strong>Порада тренера</strong>
                        Уникайте «коли», «чи», «з ким». Питайте «чому», «як», «що». Перші формують
                        очікування — другі відкривають свідомість.
                    </div>

                    <div className="panel-actions">
                        <div className="spacer"></div>
                        <button className="btn btn-primary" onClick={toCards}>Перейти до карт →</button>
                    </div>
                </div>

                {/* STEP 2: CARDS */}
                <div className={`pane ${step === 2 ? 'on' : ''}`}>
                    <div className="panel-head">
                        <h2>Витягніть <em>карти</em></h2>
                        <p className="sub">Оберіть розклад. Витягніть випадково — або клікніть на сорочки,
                            які вас «покличуть». Свідомий вибір карт — це теж дані для тренера.</p>
                    </div>

                    <div className="method-row">
                        {METHODS.map(m => (
                            <button key={m.count} className={`method-btn ${count === m.count ? 'on' : ''}`} onClick={() => selectCount(m.count)}>
                                <span className="rom">{m.rom}</span>
                                <span className="nm">{m.nm}</span>
                            </button>
                        ))}
                    </div>

                    <div className="pick-mode">
                        <button className={mode === 'random' ? 'on' : ''} onClick={() => selectMode('random')}>⚄ Випадково</button>
                        <button className={mode === 'manual' ? 'on' : ''} onClick={() => selectMode('manual')}>☾ Свідомо</button>
                    </div>

                    {loading && (
                        <div className="loader-state on">
                            <div className="loader-cards"><div className="lc"></div><div className="lc"></div><div className="lc"></div></div>
                            <div className="msg">{loaderMsg}</div>
                            <div className="sub">Зосередьтеся на запиті</div>
                        </div>
                    )}

                    {!loading && (
                        <div className="deck-area">
                            <div className="deck-status">{deckStatus}</div>
                            <div className="deck-fan">
                                {Array.from({length: DECK_SIZE}).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`deck-back ${picked.has(i) ? 'picked' : ''}`}
                                        style={mode === 'random' ? {cursor: 'default'} : undefined}
                                        onClick={mode === 'manual' ? () => pickManual(i) : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && drawnRow}

                    <div className="panel-actions">
                        <button className="btn btn-ghost" onClick={() => goStep(1)}>← Назад</button>
                        <div className="spacer"></div>
                        {mode === 'random' && !loading && (
                            <button className="shuffle-btn" onClick={shuffleDraw}>
                                {shuffledOnce ? '↻ Перетасувати' : '⚄ Тасувати та витягти'}
                            </button>
                        )}
                        {complete && !loading && (
                            <button className="btn btn-primary" onClick={() => goStep(3)}>До тлумачення →</button>
                        )}
                    </div>
                </div>

                {/* STEP 3: YOUR INTERPRETATION */}
                <div className={`pane ${step === 3 ? 'on' : ''}`}>
                    <div className="panel-head">
                        <h2>Ваше <em>тлумачення</em></h2>
                        <p className="sub">Подивіться на свої карти. Що ви бачите? Якщо не знаєте значень —
                            описуйте відчуття та образи. Тренер прочитає після вас, не до. Це найважливіший
                            крок тренування.</p>
                    </div>

                    {step === 3 && drawnRow}

                    <div className="kw-toggle">
                        <button className="btn btn-ghost" onClick={() => setKwOpen(o => !o)}>
                            {kwOpen ? 'Сховати ключові слова' : 'Підказати ключові слова'}
                        </button>
                    </div>
                    <div className={`kw-list ${kwOpen ? 'on' : ''}`}>
                        {drawn.map((d, i) => (
                            <div key={i} className="kw-item">
                                <b>{d.card.ua}{d.isRev ? ' · ↓' : ''}</b>
                                <span>{d.card.keywords}</span>
                            </div>
                        ))}
                    </div>

                    <div className="interp-area">
                        <textarea
                            className="your-interp"
                            placeholder="Що говорять ці карти конкретно для мого запиту? Які почуття виникають при погляді? Який зв'язок між ними…"
                            value={yourInterp}
                            onChange={e => setYourInterp(e.target.value)}
                        />
                        <div className="interp-helper">Не існує правильної відповіді. Тут немає оцінки.
                            Тільки <span className="accent">ваша уважність</span>.</div>
                    </div>

                    <div className="tip-box">
                        <strong>Підказка</strong>
                        Опишіть три речі: 1) перше враження від кожної карти; 2) як вони пов'язані між
                        собою; 3) що сказали б собі через місяць після цього розкладу.
                    </div>

                    <div className="panel-actions">
                        <button className="btn btn-ghost" onClick={() => goStep(2)}>← Назад</button>
                        <div className="spacer"></div>
                        <button className="btn btn-primary" onClick={revealCoach}>Показати дзеркало тренера →</button>
                    </div>
                </div>

                {/* STEP 4: COMPARE */}
                <div className={`pane ${step === 4 ? 'on' : ''}`}>
                    <div className="panel-head">
                        <h2>Дзеркало <em>тренера</em></h2>
                        <p className="sub">Поруч — ваше прочитання і тренера. Не змагайтеся з тренером.
                            Дивіться, де ваша інтуїція влучила в ціль, а де ви відмовляєтесь визнавати
                            очевидне.</p>
                    </div>

                    {step === 4 && drawnRow}

                    <div className="compare-grid">
                        <div className="comp-card">
                            <div className="tag">Ваше тлумачення</div>
                            <h3>Ваше <em>дзеркало</em></h3>
                            <div className="body">{yourFinal || '—'}</div>
                        </div>
                        <div className="comp-card gold">
                            <div className="tag">Тренер · демо (без ШІ)</div>
                            <h3>Прочитання <em>тренера</em></h3>
                            <div className="body">
                                {coach
                                    ? coach.paras.map((p, i) => <p key={i}><em>{p.head}</em> {p.text}</p>)
                                    : <div className="coach-wait"><i></i><i></i><i></i>Тренер читає розклад…</div>}
                            </div>
                        </div>
                    </div>

                    <div className={`score-row ${coach ? '' : 'pending'}`}>
                        <div
                            className="score-circ"
                            style={{background: `conic-gradient(var(--gold) 0% ${shownScore}%, rgba(237,228,211,0.08) ${shownScore}% 100%)`}}
                        >
                            <span>{coach ? `${shownScore}%` : '—'}</span>
                        </div>
                        <div className="score-text">
                            <div className="l">Тренувальний бал · цієї сесії</div>
                            <h3>{coach ? coach.title : 'Тренер порівнює прочитання…'}</h3>
                            <p>{coach?.feedback}</p>
                        </div>
                    </div>

                    <div className="tip-box">
                        <strong>Висновок</strong>
                        Це демо-версія: сесія ніде не зберігається, а бал рахується за збігом ключових
                        слів карт. Повна версія з ШІ-дзеркалом і тижневими трендами — у розробці.
                    </div>

                    <div className="panel-actions">
                        <button className="btn btn-ghost" onClick={resetSession}>↻ Нова сесія</button>
                        <div className="spacer"></div>
                        <Link to="/trainer" className="btn btn-primary">Завершити</Link>
                    </div>
                </div>
            </main>
        </>
    )
}
