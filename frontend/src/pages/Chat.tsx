import {useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import BrandMark from '../components/BrandMark'


type MsgRole = 'user' | 'oracle'

interface ChatMessage {
    role: MsgRole
    who: string
    text: string[]         // paragraphs
    spread?: MiniCard[]    // optional inline card spread
}

interface MiniCard {
    pos: string
    num: string
    sym: string
    name: string
}

interface HistoryItem {
    id: string
    roman: string
    title: string
    date: string
    group: 'today' | 'week' | 'earlier'
}

interface ChipDef {
    id: string
    rom: string
    label: string
    locked?: boolean
}

const HISTORY: HistoryItem[] = [
    {id: 'h1', roman: 'III', title: 'Чи варто змінити роботу?', date: '14:02', group: 'today'},
    {id: 'h2', roman: 'V', title: 'Стосунки з Мариною', date: '10:44', group: 'today'},
    {id: 'h3', roman: 'III', title: 'Фінансовий період', date: 'Вт', group: 'week'},
    {id: 'h4', roman: 'VII', title: 'Прихована причина тривоги', date: 'Пн', group: 'week'},
    {id: 'h5', roman: 'III', title: 'Щоденний витяг', date: 'Пн', group: 'week'},
    {id: 'h6', roman: 'V', title: 'Подорож на південь', date: '11.04', group: 'earlier'},
    {id: 'h7', roman: 'III', title: 'Переїзд та родина', date: '08.04', group: 'earlier'},
    {id: 'h8', roman: 'III', title: 'Перший розклад', date: '02.04', group: 'earlier'},
]

const CHIPS: ChipDef[] = [
    {id: 'c3', rom: 'III', label: 'Три карти'},
    {id: 'c5', rom: 'V', label: "П'ять карт"},
    {id: 'c7', rom: 'VII', label: 'Сім карт'},
    {id: 'c12', rom: 'XII', label: 'Колесо року', locked: true},
    {id: 'cinf', rom: '∞', label: 'Вільний', locked: true},
]

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        role: 'user',
        who: 'Ви',
        text: [
            'Я вже третій рік працюю на одному місці. Зараз отримала пропозицію від іншої компанії — зарплата вища, але страшно. Чи варто зараз змінити роботу?',
        ],
    },
    {
        role: 'oracle',
        who: 'Lunaris · Оракул',
        text: [
            'Дозвольте картам відповісти. Ви обрали розклад на три карти — *Минуле, Теперішнє, Майбутнє*. Перемішую колоду…',
            '*Минуле — Справедливість.* Ваше теперішнє місце дало вам чесний досвід. Ви вивчили правила гри й більше нікому нічого не винні.',
            '*Теперішнє — Верховна Жриця.* Ви вже знаєте відповідь у собі, але вагаєтеся довіритися їй. Прислухайтесь до внутрішнього голосу, а не до порад колег.',
            '*Майбутнє — Колісниця.* Рух. Перемога через волю. Якщо зробите крок — він приведе туди, куди ви самі кермуєте.',
            'Страх — природний супутник будь-якого переходу. Але карти не бачать для вас поразки на цьому шляху.',
        ],
        spread: [
            {pos: 'Минуле', num: '· VIII ·', sym: '⚖', name: 'Justice'},
            {pos: 'Теперішнє', num: '· II ·', sym: '☾', name: 'Priestess'},
            {pos: 'Майбутнє', num: '· VII ·', sym: '⚔', name: 'Chariot'},
        ],
    },
    {
        role: 'user',
        who: 'Ви',
        text: ['А якщо я відмовлю — що буде?'],
    },
    {
        role: 'oracle',
        who: 'Lunaris · Оракул',
        text: [
            'Запитайте у карт ще раз — це вже новий розклад. Ваша Колісниця не зникне, але змінить напрям. Ви і так рухаєтеся вперед, питання лише в тому, яку дорогу обрати…',
        ],
    },
]

/** Render text with *italic* markers as em tags (per original design). */
function renderText(text: string) {
    const parts = text.split(/\*([^*]+)\*/g)
    return parts.map((part, i) =>
        i % 2 === 1 ? <em key={i}>{part}</em> : <span key={i}>{part}</span>
    )
}

export default function Chat() {
    const [activeHistory, setActiveHistory] = useState('h1')
    const [activeChip, setActiveChip] = useState('c3')
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
    const [input, setInput] = useState('')
    const taRef = useRef<HTMLTextAreaElement | null>(null)
    const scrollRef = useRef<HTMLDivElement | null>(null)

    /** Auto-grow textarea on change. */
    useEffect(() => {
        const ta = taRef.current
        if (!ta) return
        ta.style.height = 'auto'
        ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
    }, [input])

    /** Auto-scroll to bottom when new messages arrive. */
    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
    }, [messages])

    function onChipClick(chip: ChipDef) {
        if (chip.locked) {
            // Locked chips redirect to pricing — use SPA nav via a Link would be cleaner,
            // but we want a programmatic redirect to match original behaviour.
            window.location.href = '/pricing'
            return
        }
        setActiveChip(chip.id)
    }

    function sendMessage() {
        const value = input.trim()
        if (!value) return
        setMessages(prev => [
            ...prev,
            {role: 'user', who: 'Ви', text: [value]},
            {
                role: 'oracle',
                who: 'Lunaris · Оракул',
                text: [
                    'Карти почули ваше питання. *Відповідь формується…* У наступній ітерації тут буде живий діалог з AI-тарологом.',
                ],
            },
        ])
        setInput('')
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const groups: Array<[string, HistoryItem[]]> = [
        ['Сьогодні', HISTORY.filter(h => h.group === 'today')],
        ['Цей тиждень', HISTORY.filter(h => h.group === 'week')],
        ['Раніше', HISTORY.filter(h => h.group === 'earlier')],
    ]

    const selectedChip = CHIPS.find(c => c.id === activeChip) ?? CHIPS[0]
    const activeItem = HISTORY.find(h => h.id === activeHistory) ?? HISTORY[0]

    return (
        <div className="chat-app">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <Link to="/" className="sb-brand">
                    <span className="sb-brand-mark"><BrandMark size={22}/></span>
                    Lunaris
                </Link>

                <button type="button" className="sb-new">
                    Новий розклад
                    <span className="plus">+</span>
                </button>

                <div className="sb-group">
                    {groups.map(([label, items]) => (
                        <div key={label}>
                            <div className="sb-group-label">{label}</div>
                            {items.map(h => (
                                <button
                                    key={h.id}
                                    type="button"
                                    className={`sb-item ${h.id === activeHistory ? 'active' : ''}`}
                                    onClick={() => setActiveHistory(h.id)}
                                >
                                    <span className="roman">{h.roman}</span>
                                    <span className="title">{h.title}</span>
                                    <span className="date">{h.date}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="sb-user">
                    <div className="sb-quota">
                        <div className="sb-quota-row">
                            <span>Денні ліміти</span>
                            <span className="val">00:00 ↻</span>
                        </div>
                        <div className="sb-quota-bars">
                            <div className="sb-quota-bar">
                                <span className="lab">III</span>
                                <div className="sb-bar">
                                    <div className="sb-bar-fill" style={{width: '40%'}}/>
                                </div>
                                <span className="val">2/5</span>
                            </div>
                            <div className="sb-quota-bar">
                                <span className="lab">V</span>
                                <div className="sb-bar">
                                    <div className="sb-bar-fill" style={{width: '33%'}}/>
                                </div>
                                <span className="val">1/3</span>
                            </div>
                            <div className="sb-quota-bar">
                                <span className="lab">VII</span>
                                <div className="sb-bar">
                                    <div className="sb-bar-fill full" style={{width: '100%'}}/>
                                </div>
                                <span className="val">1/1</span>
                            </div>
                        </div>
                    </div>

                    <Link to="/pricing" className="sb-upgrade">✦ Отримати Pro</Link>

                    <div className="sb-profile">
                        <div className="sb-avatar">R</div>
                        <div className="sb-name">
                            raven
                            <small>Подорожник</small>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CHAT */}
            <section className="chat-panel">
                <header className="chat-head">
                    <div className="title">
                        <span className="roman">{activeItem.roman}</span>
                        <div>
                            <div className="t">{activeItem.title}</div>
                            <small>Минуле · Теперішнє · Майбутнє</small>
                        </div>
                    </div>
                    <div className="chat-head-actions">
                        <button className="head-btn" title="Зберегти">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <path d="M5 3h11l3 3v15l-7-4-7 4V3z"/>
                            </svg>
                        </button>
                        <button className="head-btn" title="Поділитись">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <circle cx={18} cy={5} r={3}/>
                                <circle cx={6} cy={12} r={3}/>
                                <circle cx={18} cy={19} r={3}/>
                                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
                            </svg>
                        </button>
                        <button className="head-btn" title="Видалити">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="chat-scroll" ref={scrollRef}>
                    <div className="chat-wrap">
                        {messages.map((m, i) => (
                            <div key={i} className={`msg ${m.role}`}>
                                <div className="avatar">{m.role === 'user' ? 'R' : '☾'}</div>
                                <div className="body">
                                    <div className="who">{m.who}</div>
                                    <div className="text">
                                        {m.text.map((p, pi) => {
                                            // Insert spread after first paragraph of an oracle message if present
                                            const showSpread = m.role === 'oracle' && m.spread && pi === 0
                                            return (
                                                <div key={pi}>
                                                    <p>{renderText(p)}</p>
                                                    {showSpread && m.spread && (
                                                        <div className="chat-spread">
                                                            {m.spread.map((c, ci) => (
                                                                <div key={ci} className="mini-card">
                                                                    <div className="mc-pos">{c.pos}</div>
                                                                    <div className="mc-num">{c.num}</div>
                                                                    <div className="mc-sym">{c.sym}</div>
                                                                    <div className="mc-name">{c.name}</div>
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
                    </div>
                </div>

                <div className="composer">
                    <div className="composer-inner">
                        <div className="composer-chips">
                            {CHIPS.map(c => {
                                const cls = [
                                    'chip',
                                    c.id === activeChip ? 'active' : '',
                                    c.locked ? 'locked' : '',
                                ].filter(Boolean).join(' ')
                                return (
                                    <button key={c.id} type="button" className={cls} onClick={() => onChipClick(c)}>
                                        <span className="rom">{c.rom}</span> {c.label}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="input-wrap">
              <textarea
                  ref={taRef}
                  placeholder="Запитайте карти про будь-що..."
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
              />
                            <button className="send-btn" title="Спитати" onClick={sendMessage}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 19V5 M5 12l7-7 7 7"/>
                                </svg>
                            </button>
                        </div>

                        <div className="composer-foot">
              <span>
                Обрано: <span className="sel">{selectedChip.label}</span> · Залишилось сьогодні: 3/5
              </span>
                            <span>Lunaris v1.0</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
