import {useEffect, useRef, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import {
    ApiError,
    auth,
    birthDateStore,
    type Conversation,
    conversationApi,
    type CurrentUser,
    type DrawnCard,
    ROLE_RANK,
    type Spread,
    spreadApi,
    UNLIMITED,
    userApi,
    type UserUsage,
} from '../lib/api'
import {cardSvgByName} from '../lib/cardArt'
import {useLogout} from '../hooks/useLogout'


type MsgRole = 'user' | 'oracle'

interface ChatMessage {
    role: MsgRole
    who: string
    text: string[]         // paragraphs
    spread?: MiniCard[]    // optional inline card spread
}

interface MiniCard {
    pos: string
    svg: string            // лінійна SVG-карта з lib/cardArt (перевернута — повернута на 180°)
}

interface ChipDef {
    id: string
    rom: string
    label: string
    spreadId: number       // id розкладу в БД (НЕ кількість карт!); доступність — з /api/spreads
}

const CHIPS: ChipDef[] = [
    {id: 'c3', rom: 'III', label: 'Три карти', spreadId: 1},
    {id: 'c5', rom: 'V', label: "П'ять карт", spreadId: 2},
    {id: 'c7', rom: 'VII', label: 'Сім карт', spreadId: 3},
    {id: 'c12', rom: 'XII', label: 'Колесо року', spreadId: 4},
    {id: 'cinf', rom: '∞', label: 'Вільний · скоро', spreadId: 5},
]

/** Людська назва ролі для сайдбару/профілю. */
const ROLE_LABEL: Record<string, string> = {
    Guest: 'Гість',
    Free: 'Free · Подорожник',
    Premium: 'Premium · Оракул',
    Vip: 'VIP · Містик',
    Admin: 'Адмін',
}

/** Фрази, що крутяться по колу, поки LLM генерує відповідь. */
const THINKING_PHRASES = [
    'Lunaris обдумує…',
    'Слухаю карти…',
    'Духи шепочуть…',
    'Тасую колоду долі…',
    'Вдивляюся у тіні…',
]

const WELCOME: ChatMessage = {
    role: 'oracle',
    who: 'Lunaris · Оракул',
    text: [
        'Вітаю, подорожнику. Я слухаю шепіт карт у темряві ночі.',
        'Постав своє питання — або попроси зробити розклад, і я витягну карти за завісою.',
    ],
}

/** Render text with *italic* markers as em tags (per original design). */
function renderText(text: string) {
    const parts = text.split(/\*([^*]+)\*/g)
    return parts.map((part, i) =>
        i % 2 === 1 ? <em key={i}>{part}</em> : <span key={i}>{part}</span>
    )
}

/** Карти з бекенду → міні-картки для відмалювання в чаті (єдине місце мапінгу). */
function cardsToSpread(cards: DrawnCard[]): MiniCard[] {
    return cards.map(c => ({
        pos: `Позиція ${c.position}${c.isReversed ? ' · ↓' : ''}`,
        svg: cardSvgByName(c.name, {rev: c.isReversed}),
    }))
}

/** Коротка дата для пункту історії: сьогодні → час, цей тиждень → день, інакше → дд.мм. */
function shortDate(iso: string): { label: string; group: 'today' | 'week' | 'earlier' } {
    const d = new Date(iso)
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const ageDays = (startOfToday.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86_400_000
    if (ageDays <= 0) return {
        label: d.toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'}),
        group: 'today'
    }
    if (ageDays < 7) return {label: d.toLocaleDateString('uk-UA', {weekday: 'short'}), group: 'week'}
    return {label: d.toLocaleDateString('uk-UA', {day: '2-digit', month: '2-digit'}), group: 'earlier'}
}

/** Скільки лишилось + текст (з урахуванням «безліміту»). */
function remainingText(used: number, limit: number): string {
    if (limit >= UNLIMITED) return '∞'
    return `${Math.max(0, limit - used)}`
}

function barWidth(used: number, limit: number): string {
    if (limit >= UNLIMITED || limit <= 0) return '8%'
    return `${Math.min(100, Math.round((used / limit) * 100))}%`
}

export default function Chat() {
    const navigate = useNavigate()
    const logout = useLogout()
    const [user, setUser] = useState<CurrentUser | null>(null)
    // мобільна «шухляда» з історією розкладів (на десктопі сайдбар видно завжди)
    const [sbOpen, setSbOpen] = useState(false)
    const [usage, setUsage] = useState<UserUsage | null>(null)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [spreads, setSpreads] = useState<Spread[]>([])
    // Комбіноване гадання: якщо увімкнено — до запиту додається дата народження (Матриця Долі).
    const [useMatrix, setUseMatrix] = useState(false)
    const [birthDate, setBirthDate] = useState(birthDateStore.get())

    const [activeChip, setActiveChip] = useState('c3')
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
    const [input, setInput] = useState('')
    const [convId, setConvId] = useState<string | null>(null)  // id активної розмови
    const [thinking, setThinking] = useState(false)
    const [phraseIdx, setPhraseIdx] = useState(0)
    // короткий тост-підтвердження (напр. «Новий розклад розпочато»)
    const [toast, setToast] = useState<string | null>(null)
    const toastTimer = useRef<number | undefined>(undefined)
    const taRef = useRef<HTMLTextAreaElement | null>(null)
    const scrollRef = useRef<HTMLDivElement | null>(null)

    /** Стартове завантаження: профіль, ліміти, список розмов. */
    useEffect(() => {
        if (!auth.isAuthenticated()) {
            navigate('/login')
            return
        }
        userApi.me().then(u => {
            setUser(u);
            auth.setUser(u)
        }).catch(() => {
            auth.clearToken()
            navigate('/login')
        })
        refreshUsage()
        spreadApi.list().then(setSpreads).catch(() => { /* без розкладів відкритий лише базовий */
        })
        conversationApi.list().then(setConversations).catch(() => { /* мовчазно */
        })
    }, [])

    function refreshUsage() {
        userApi.usage().then(setUsage).catch(() => { /* ліміти не критичні для відмалювання */
        })
    }

    useEffect(() => {
        const ta = taRef.current
        if (!ta) return
        ta.style.height = 'auto'
        ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
    }, [input])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
    }, [messages, thinking])

    useEffect(() => {
        if (!thinking) return
        setPhraseIdx(0)
        const t = setInterval(() => {
            setPhraseIdx(i => (i + 1) % THINKING_PHRASES.length)
        }, 1800)
        return () => clearInterval(t)
    }, [thinking])

    /**
     * Чи замкнений розклад для поточного тарифу. Ті самі три умови перевіряє й бекенд
     * (ChatAiService), тут — лише щоб не дати обрати розклад, який усе одно не спрацює.
     */
    function isChipLocked(chip: ChipDef): boolean {
        if (chip.id === 'cinf') return true   // «Вільний розклад» ще не доведений — закритий для всіх
        const sp = spreads.find(s => s.id === chip.spreadId)
        if (!usage || !sp) return chip.spreadId !== 1   // поки не завантажилось — відкритий лише базовий
        const rank = ROLE_RANK[usage.role as CurrentUser['role']] ?? 0
        if (rank < sp.requiredRole) return true
        if (sp.isFreeMode) return !usage.freeMode
        return sp.cardCount > usage.maxCards
    }

    const matrixLocked = !usage?.destinyMatrix

    function onMatrixClick() {
        if (matrixLocked) {
            navigate('/pricing')
            return
        }
        setUseMatrix(v => !v)
    }

    function onBirthChange(v: string) {
        setBirthDate(v)
        birthDateStore.set(v)
    }

    function onChipClick(chip: ChipDef) {
        if (chip.id === 'cinf') return        // у розробці — нікуди не ведемо
        if (isChipLocked(chip)) {
            navigate('/pricing')
            return
        }
        setActiveChip(chip.id)
    }

    function showToast(text: string) {
        setToast(text)
        window.clearTimeout(toastTimer.current)
        toastTimer.current = window.setTimeout(() => setToast(null), 2200)
    }

    /** Новий розклад — чистимо активну розмову. Видимий відгук навіть якщо чат уже порожній. */
    function startNew() {
        setConvId(null)
        setMessages([WELCOME])
        setInput('')
        showToast('Новий розклад розпочато')
        taRef.current?.focus()
    }

    /** Відкрити збережену розмову — підвантажуємо її повідомлення з бекенду. */
    async function openConversation(id: string) {
        if (id === convId) return
        setConvId(id)
        try {
            const conv = await conversationApi.get(id)
            const msgs: ChatMessage[] = (conv.messages ?? [])
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                .map(m => {
                    const isUser = m.role === 'user'
                    const msg: ChatMessage = {
                        role: isUser ? 'user' : 'oracle',
                        who: isUser ? 'Ви' : 'Lunaris · Оракул',
                        text: m.content.split(/\n{2,}/).map(p => p.trim()).filter(Boolean),
                    }
                    // Відновлюємо карти зі збереженого JSON, щоб розклад не зникав.
                    if (!isUser && m.cardsJson) {
                        try {
                            const cards = JSON.parse(m.cardsJson) as DrawnCard[]
                            if (cards.length) msg.spread = cardsToSpread(cards)
                        } catch { /* зіпсований JSON — просто без карт */
                        }
                    }
                    return msg
                })
            setMessages(msgs.length ? msgs : [WELCOME])
        } catch {
            setMessages([WELCOME])
        }
    }

    async function sendMessage() {
        const value = input.trim()
        if (!value || thinking) return

        setMessages(prev => [...prev, {role: 'user', who: 'Ви', text: [value]}])
        setInput('')
        setThinking(true)

        try {
            let id = convId
            if (!id) {
                const conv = await conversationApi.create(value.slice(0, 60))
                id = conv.id
                setConvId(id)
                // нова розмова одразу зʼявляється у сайдбарі
                setConversations(prev => [conv, ...prev])
            }

            const spreadId = selectedChip.spreadId
            const withMatrix = useMatrix && !matrixLocked && birthDate ? birthDate : undefined
            const res = await conversationApi.sendMessage(id, value, spreadId, withMatrix)

            const paragraphs = res.reply.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
            const spread = res.cards ? cardsToSpread(res.cards) : undefined

            setMessages(prev => [...prev, {
                role: 'oracle',
                who: 'Lunaris · Оракул',
                text: paragraphs.length ? paragraphs : [res.reply],
                spread: spread && spread.length ? spread : undefined,
            }])
            refreshUsage()   // оновлюємо лічильники лімітів
        } catch (e) {
            // 429 (ліміт), 403 (тариф), 400 (дата) — показуємо реальний текст від бекенду, а не загальну помилку
            const isLimit = e instanceof ApiError && e.status === 429
            const isKnown = e instanceof ApiError && [400, 403, 429].includes(e.status)
            setMessages(prev => [...prev, {
                role: 'oracle',
                who: 'Lunaris · Оракул',
                text: isKnown
                    ? [(e as ApiError).message]
                    : ['Звʼязок із картами обірвався… Спробуйте ще раз за мить.'],
            }])
            if (isLimit) refreshUsage()
        } finally {
            setThinking(false)
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    // Групуємо реальні розмови за давністю.
    const bucketed: Record<'today' | 'week' | 'earlier', Conversation[]> = {today: [], week: [], earlier: []}
    for (const c of conversations) {
        const g = shortDate(c.updatedAt ?? c.createdAt ?? new Date().toISOString()).group
        bucketed[g].push(c)
    }
    const groups: Array<[string, 'today' | 'week' | 'earlier']> = [
        ['Сьогодні', 'today'],
        ['Цей тиждень', 'week'],
        ['Раніше', 'earlier'],
    ]

    // Якщо обраний розклад став недоступним (напр. ліміти довантажились) — повертаємось на базовий.
    const selectedChip = CHIPS.find(c => c.id === activeChip && !isChipLocked(c)) ?? CHIPS[0]
    const selectedSpread = spreads.find(s => s.id === selectedChip.spreadId)
    const activeConv = conversations.find(c => c.id === convId)
    const headTitle = activeConv?.title ?? 'Новий розклад'
    const roleLabel = user ? (ROLE_LABEL[user.role] ?? user.role) : '—'
    const initial = user?.userName?.charAt(0).toUpperCase() || '☾'

    const resetLabel = usage
        ? new Date(usage.resetsAt).toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'}) + ' ↻'
        : '00:00 ↻'

    return (
        <div className="chat-app">
            {/* SIDEBAR */}
            <div className={`sb-backdrop ${sbOpen ? 'on' : ''}`} onClick={() => setSbOpen(false)}/>
            <aside className={`sidebar ${sbOpen ? 'open' : ''}`}>
                <Link to="/" className="sb-brand">
                    <span className="sb-brand-mark"><BrandMark size={22}/></span>
                    Lunaris
                </Link>

                <button type="button" className="sb-new" onClick={() => { startNew(); setSbOpen(false) }}>
                    Новий розклад
                    <span className="plus">+</span>
                </button>

                <div className="sb-group">
                    {groups.map(([label, key]) => (
                        bucketed[key].length > 0 && (
                            <div key={label}>
                                <div className="sb-group-label">{label}</div>
                                {bucketed[key].map(c => {
                                    const d = shortDate(c.updatedAt ?? c.createdAt ?? '')
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            className={`sb-item ${c.id === convId ? 'active' : ''}`}
                                            onClick={() => { openConversation(c.id); setSbOpen(false) }}
                                        >
                                            <span className="roman">☾</span>
                                            <span className="title">{c.title}</span>
                                            <span className="date">{d.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )
                    ))}
                    {conversations.length === 0 && (
                        <div className="sb-group-label" style={{opacity: 0.6}}>
                            Ще немає розкладів
                        </div>
                    )}
                </div>

                <div className="sb-user">
                    <div className="sb-quota">
                        <div className="sb-quota-row">
                            <span>Денні ліміти</span>
                            <span className="val">{resetLabel}</span>
                        </div>
                        <div className="sb-quota-bars">
                            <div className="sb-quota-bar">
                                <span className="lab">✦</span>
                                <div className="sb-bar">
                                    <div
                                        className={`sb-bar-fill ${usage && usage.readingsLimit < UNLIMITED && usage.readingsUsed >= usage.readingsLimit ? 'full' : ''}`}
                                        style={{width: usage ? barWidth(usage.readingsUsed, usage.readingsLimit) : '0%'}}
                                    />
                                </div>
                                <span className="val">
                                    {usage ? `${usage.readingsUsed}/${usage.readingsLimit >= UNLIMITED ? '∞' : usage.readingsLimit}` : '—'}
                                </span>
                            </div>
                            <div className="sb-quota-bar">
                                <span className="lab">☾</span>
                                <div className="sb-bar">
                                    <div
                                        className={`sb-bar-fill ${usage && usage.chatMessagesLimit < UNLIMITED && usage.chatMessagesUsed >= usage.chatMessagesLimit ? 'full' : ''}`}
                                        style={{width: usage ? barWidth(usage.chatMessagesUsed, usage.chatMessagesLimit) : '0%'}}
                                    />
                                </div>
                                <span className="val">
                                    {usage ? `${usage.chatMessagesUsed}/${usage.chatMessagesLimit >= UNLIMITED ? '∞' : usage.chatMessagesLimit}` : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {usage?.role !== 'Vip' && usage?.role !== 'Admin' && (
                        <Link to="/pricing" className="sb-upgrade">✦ Отримати Premium</Link>
                    )}

                    <Link to="/profile" className="sb-profile">
                        <div className="sb-avatar">{initial}</div>
                        <div className="sb-name">
                            {user?.userName ?? '…'}
                            <small>{roleLabel}</small>
                        </div>
                    </Link>

                    <button type="button" className="sb-logout" onClick={logout}>Вийти з акаунта</button>
                </div>
            </aside>

            {/* MAIN CHAT */}
            <section className="chat-panel">
                <header className="chat-head">
                    <div className="title">
                        <button
                        type="button"
                        className="head-btn sb-toggle"
                        aria-label="Історія розкладів"
                        aria-expanded={sbOpen}
                        onClick={() => setSbOpen(true)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path d="M4 7h16M4 12h16M4 17h16"/>
                        </svg>
                    </button>
                    <Link to="/" className="head-btn head-back" aria-label="На головну" title="На головну">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path d="M19 12H5M11 6l-6 6 6 6"/>
                        </svg>
                    </Link>
                    <span className="roman">☾</span>
                        <div>
                            <div className="t">{headTitle}</div>
                            <small>
                                {selectedSpread?.name ?? 'Минуле · Теперішнє · Майбутнє'}
                                {useMatrix && !matrixLocked && birthDate ? ' + Матриця Долі' : ''}
                            </small>
                        </div>
                    </div>
                    <div className="chat-head-actions">
                        <button type="button" className="head-btn" title="Новий розклад" aria-label="Новий розклад"
                                onClick={startNew}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="chat-scroll" ref={scrollRef}>
                    <div className="chat-wrap">
                        {messages.map((m, i) => (
                            <div key={i} className={`msg ${m.role}`}>
                                <div className="avatar">{m.role === 'user' ? initial : '☾'}</div>
                                <div className="body">
                                    <div className="who">{m.who}</div>
                                    <div className="text">
                                        {m.text.map((p, pi) => {
                                            const showSpread = m.role === 'oracle' && m.spread && pi === 0
                                            return (
                                                <div key={pi}>
                                                    <p>{renderText(p)}</p>
                                                    {showSpread && m.spread && (
                                                        <div className="chat-spread">
                                                            {m.spread.map((c, ci) => (
                                                                <div key={ci} className="mini-card ca-host">
                                                                    <div className="mc-pos">{c.pos}</div>
                                                                    <div className="ca" dangerouslySetInnerHTML={{__html: c.svg}}/>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {thinking && (
                            <div className="msg oracle thinking">
                                <div className="avatar">☾</div>
                                <div className="body">
                                    <div className="who">Lunaris · Оракул</div>
                                    <div className="text">
                                        <p className="thinking-text">
                                            {THINKING_PHRASES[phraseIdx]}
                                            <span className="thinking-dots"><i/><i/><i/></span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {toast && <div className="chat-toast" role="status">{toast}</div>}

                <div className="composer">
                    <div className="composer-inner">
                        <div className="composer-top">
                        <div className="composer-chips">
                            {CHIPS.map(c => {
                                const locked = isChipLocked(c)
                                const cls = [
                                    'chip',
                                    c.id === selectedChip.id ? 'active' : '',
                                    locked ? 'locked' : '',
                                ].filter(Boolean).join(' ')
                                return (
                                    <button key={c.id} type="button" className={cls} onClick={() => onChipClick(c)}
                                            title={c.id === 'cinf' ? 'У розробці' : locked ? 'Доступно на вищому тарифі' : undefined}>
                                        <span className="rom">{c.rom}</span> {c.label}
                                    </button>
                                )
                            })}
                            <button type="button"
                                    className={['chip', 'chip-matrix', useMatrix && !matrixLocked ? 'active' : '', matrixLocked ? 'locked' : ''].filter(Boolean).join(' ')}
                                    onClick={onMatrixClick}
                                    title={matrixLocked ? 'Матриця Долі — пакет VIP' : 'Поєднати розклад із Матрицею Долі'}>
                                <span className="rom">⌖</span> + Матриця
                            </button>
                        </div>

                        {/* Дата — окремим рядком: на телефоні рядок чипів скролиться горизонтально */}
                        {useMatrix && !matrixLocked && (
                            <input type="date" className="chip-date" value={birthDate}
                                   min="1900-01-01" max={new Date().toISOString().slice(0, 10)}
                                   onChange={e => onBirthChange(e.target.value)}
                                   aria-label="Дата народження"/>
                        )}
                        </div>

                        <div className="input-wrap">
              <textarea
                  ref={taRef}
                  placeholder="Запитайте карти про будь-що..."
                  rows={1}
                  maxLength={500}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
              />
                            <button className="send-btn" title="Спитати" onClick={sendMessage} disabled={thinking}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 19V5 M5 12l7-7 7 7"/>
                                </svg>
                            </button>
                        </div>

                        <div className="composer-foot">
              <span className="foot-sel">
                Обрано: <span className="sel">{selectedChip.label}</span>
                  {usage && ` · Розкладів сьогодні: ${remainingText(usage.readingsUsed, usage.readingsLimit)}`}
              </span>
                            <span className="foot-ver">Lunaris v1.0</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
