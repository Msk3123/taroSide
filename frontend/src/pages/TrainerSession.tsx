import {useState} from 'react'
import {Link} from 'react-router-dom'
import Nav from '../components/Nav'

/**
 * Інтерактивна сесія ментального тренера (шаблон trainer-session.html).
 * 4 кроки: запит → карти → ваше тлумачення → дзеркало тренера.
 * Логіка vanilla-JS з макета переписана на React-стан. Карти/«дзеркало»
 * поки локальні-демо: окремого бекенд-ендпоінта тренера ще немає.
 */

interface Card {
    n: string
    s: string
    name: string
}

const POOL: Card[] = [
    {n: 'II', s: '☾', name: 'Priestess'}, {n: 'XI', s: '⚖', name: 'Justice'},
    {n: 'VII', s: '⚔', name: 'Chariot'}, {n: 'XVIII', s: '☾', name: 'Moon'},
    {n: 'XVII', s: '✦', name: 'Star'}, {n: 'XIX', s: '☉', name: 'Sun'},
    {n: 'IX', s: '⚝', name: 'Hermit'}, {n: 'XIII', s: '☠', name: 'Death'},
    {n: 'XIV', s: '⚱', name: 'Temperance'}, {n: 'XV', s: '⛧', name: 'Devil'},
    {n: 'XVI', s: '🗲', name: 'Tower'}, {n: 'XXI', s: '⊕', name: 'World'},
    {n: 'I', s: '⚚', name: 'Magician'}, {n: 'IV', s: '♂', name: 'Emperor'},
]

const POSITIONS: Record<number, string[]> = {
    3: ['Минуле', 'Теперішнє', 'Майбутнє'],
    5: ['Корінь', 'Перешкода', 'Поради', 'Зовнішнє', 'Результат'],
    7: ['Минуле', 'Теперішнє', 'Прихований вплив', 'Поради', 'Зовні', 'Очікування', 'Результат'],
}

const HINTS = [
    'Що блокує мене у проекті',
    'Чому повторюється конфлікт у стосунках',
    'Як я бачу себе через рік',
    'Що мені дає тривога останнього тижня',
]

const DECK_SIZE = 24

export default function TrainerSession() {
    const [step, setStep] = useState(1)
    const [count, setCount] = useState(3)
    const [mode, setMode] = useState<'random' | 'manual'>('random')
    const [drawn, setDrawn] = useState<Card[]>([])
    const [picked, setPicked] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(false)
    const [loaderMsg, setLoaderMsg] = useState('Тренер тасує колоду...')
    const [question, setQuestion] = useState('')
    const [yourInterp, setYourInterp] = useState('')
    const [yourFinal, setYourFinal] = useState('')

    const positions = POSITIONS[count]

    function goStep(n: number) {
        setStep(n)
        window.scrollTo({top: 0, behavior: 'smooth'})
    }

    function resetDraw() {
        setDrawn([])
        setPicked(new Set())
    }

    function selectCount(c: number) {
        setCount(c)
        resetDraw()
    }

    function selectMode(m: 'random' | 'manual') {
        setMode(m)
        resetDraw()
    }

    function pickManual(i: number) {
        if (picked.has(i) || drawn.length >= count) return
        const next = new Set(picked)
        next.add(i)
        setPicked(next)
        setDrawn(prev => [...prev, POOL[Math.floor(Math.random() * POOL.length)]])
    }

    function shuffleDraw() {
        setDrawn([])
        setLoading(true)
        setLoaderMsg('Тренер тасує колоду...')
        window.setTimeout(() => {
            setLoaderMsg('Витягую символи...')
            window.setTimeout(() => {
                const shuffled = [...POOL].sort(() => Math.random() - 0.5).slice(0, count)
                setDrawn(shuffled)
                setLoading(false)
            }, 900)
        }, 1100)
    }

    function revealCoach() {
        setYourFinal(
            yourInterp.trim() ||
            '— Ви пропустили цей крок. Спробуйте знову — тренування інтуїції починається з власної спроби.'
        )
        goStep(4)
    }

    function resetSession() {
        setStep(1)
        setCount(3)
        setMode('random')
        resetDraw()
        setQuestion('')
        setYourInterp('')
        setYourFinal('')
        setLoading(false)
    }

    const complete = drawn.length === count
    const deckStatus = mode === 'random'
        ? (complete ? '✦ Колода прийняла ваш запит' : 'Натисніть «Тасувати та витягти», коли будете готові')
        : (complete ? '✦ Карти зібрано' : `Оберіть свідомо ${count} карт зі стопки`)

    const DrawnRow = ({withTopMargin = true}: {withTopMargin?: boolean}) => (
        <div className="drawn-row">
            {drawn.map((c, i) => (
                <div key={i} className="drawn-card" style={withTopMargin ? {marginTop: 24} : undefined}>
                    <div className="pos">{positions[i] || ''}</div>
                    <div className="num">· {c.n} ·</div>
                    <div className="sym">{c.s}</div>
                    <div className="n">{c.name}</div>
                </div>
            ))}
        </div>
    )

    return (
        <>
            <Nav/>

            <main className="ts-main">
                <div className="stepper">
                    {[
                        {n: 1, rom: 'I', lab: 'Запит'},
                        {n: 2, rom: 'II', lab: 'Карти'},
                        {n: 3, rom: 'III', lab: 'Ваше тлумачення'},
                        {n: 4, rom: 'IV', lab: 'Дзеркало'},
                    ].map(d => (
                        <div key={d.n} className={`step-dot ${step === d.n ? 'active' : ''} ${d.n < step ? 'done' : ''}`}>
                            <span className="rom">{d.rom}</span><span className="lab">{d.lab}</span>
                        </div>
                    ))}
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
                        className="q-input"
                        placeholder="Що я хочу зрозуміти? Наприклад — «Чому я знову відкладаю розмову з керівником про підвищення»…"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                    />

                    <div className="q-hints">
                        {HINTS.map(h => (
                            <button key={h} className="q-hint" onClick={() => setQuestion(h)}>{h}</button>
                        ))}
                    </div>

                    <div className="tip-box">
                        <strong>Порада тренера</strong>
                        Уникайте «коли», «чи», «з ким». Питайте «чому», «як», «що». Перші формують
                        очікування — другі відкривають свідомість.
                    </div>

                    <div className="panel-actions">
                        <div className="spacer"></div>
                        <button className="btn btn-primary" onClick={() => goStep(2)}>Перейти до карт →</button>
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
                        {[3, 5, 7].map(c => (
                            <button key={c} className={`method-btn ${count === c ? 'on' : ''}`} onClick={() => selectCount(c)}>
                                <span className="rom">{POSITIONS[c] ? ({3: 'III', 5: 'V', 7: 'VII'} as Record<number, string>)[c] : ''}</span>
                                <span className="nm">{c === 3 ? 'Три карти' : c === 5 ? "П'ять карт" : 'Сім карт'}</span>
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
                                        onClick={mode === 'manual' ? () => pickManual(i) : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && <DrawnRow/>}

                    <div className="panel-actions">
                        <button className="btn btn-ghost" onClick={() => goStep(1)}>← Назад</button>
                        <div className="spacer"></div>
                        {mode === 'random' && !complete && (
                            <button className="shuffle-btn" onClick={shuffleDraw}>⚄ Тасувати та витягти</button>
                        )}
                        {complete && (
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

                    <DrawnRow/>

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

                    <DrawnRow/>

                    <div className="compare-grid">
                        <div className="comp-card">
                            <div className="tag">Ваше тлумачення</div>
                            <h3>Ваше <em>дзеркало</em></h3>
                            <div className="body">{yourFinal || '—'}</div>
                        </div>
                        <div className="comp-card gold">
                            <div className="tag">Тренер · AI Coach</div>
                            <h3>Прочитання <em>тренера</em></h3>
                            <div className="body">
                                <p>Запит про <em>підвищення</em> та страх розмови — це не про керівника.
                                    Це про вашу готовність взяти на себе власну цінність.</p>
                                <p><em>Минуле — Жриця.</em> Ви довго слухали інтуїцію всередині, мовчки
                                    накопичували досвід. Це сила.</p>
                                <p><em>Теперішнє — Справедливість.</em> Ви заслужили розмову. Карти прямо
                                    кажуть: баланс на вашому боці.</p>
                                <p><em>Майбутнє — Колісниця.</em> Дія приведе перемогу. Не уникайте, але
                                    не нападайте — кермуйте.</p>
                            </div>
                        </div>
                    </div>

                    <div className="score-row">
                        <div className="score-circ"><span>74%</span></div>
                        <div className="score-text">
                            <div className="l">Тренувальний бал · цієї сесії</div>
                            <h3>Ваша інтуїція звучить ясно</h3>
                            <p>74% збіг із прочитанням тренера. Ви точно вловили тему «дозволу собі», але
                                пропустили нюанс Колісниці — рух уже почався, його не потрібно ініціювати.</p>
                        </div>
                    </div>

                    <div className="tip-box">
                        <strong>Висновок</strong>
                        Сесію збережено у вашому журналі. Через тиждень тренер зробить аналіз ваших
                        трендів — які карти повторюються, які теми всередині вас наполягають на увазі.
                    </div>

                    <div className="panel-actions">
                        <button className="btn btn-ghost" onClick={resetSession}>↻ Нова сесія</button>
                        <Link to="/journal" className="btn btn-ghost">У журнал</Link>
                        <div className="spacer"></div>
                        <Link to="/trainer" className="btn btn-primary">Завершити</Link>
                    </div>
                </div>
            </main>
        </>
    )
}
