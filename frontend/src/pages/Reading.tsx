import {useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import Nav from '../components/Nav'

/**
 * Деталь одного розкладу (шаблон reading.html): карти, тлумачення,
 * розбір по картах, особисті нотатки з імітацією автозбереження.
 * Дані статичні-приклади — поки бекенд не персистить readings.
 */

const SPREAD = [
    {pos: 'Минуле', num: '· XI ·', sym: '⚖', name: 'Justice'},
    {pos: 'Теперішнє', num: '· II ·', sym: '☾', name: 'Priestess'},
    {pos: 'Майбутнє', num: '· VII ·', sym: '⚔', name: 'Chariot'},
]

const CARD_INTERP = [
    {rom: 'XI', name: 'Справедливість', pos: 'Минуле', text: 'Ваше теперішнє місце роботи дало вам чесний досвід. Ви навчилися правил гри, отримали заслужене та більше нікому нічого не винні. Цей розділ завершений із балансом.'},
    {rom: 'II', name: 'Верховна Жриця', pos: 'Теперішнє', text: 'Відповідь уже живе у вашій інтуїції. Ви вагаєтесь, бо прислухаєтесь до порад колег замість внутрішнього голосу. Дайте собі тишу — і рішення з\'явиться.'},
    {rom: 'VII', name: 'Колісниця', pos: 'Майбутнє', text: 'Рух, перемога через волю. Якщо ви зробите крок — він приведе саме туди, куди ви самі кермуєте. Карти не бачать поразки на цьому шляху.'},
]

export default function Reading() {
    const [notes, setNotes] = useState(
        'Поговорила з мамою — вона теж каже, що час. Здається, карти просто озвучили те, що я вже знаю.'
    )
    const [status, setStatus] = useState('Автозбереження · щойно')
    const [saved, setSaved] = useState(true)
    const timer = useRef<number | undefined>(undefined)

    // Імітація автозбереження: друкуємо → пауза → «збережено».
    useEffect(() => {
        return () => window.clearTimeout(timer.current)
    }, [])

    function onNotesChange(value: string) {
        setNotes(value)
        setStatus('Друкуємо…')
        setSaved(false)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => {
            setStatus('Збережено · щойно')
            setSaved(true)
        }, 800)
    }

    return (
        <>
            <Nav/>

            <main className="rd-main">
                <div className="rd-head">
                    <Link to="/chat" className="rd-back">← До чатів</Link>
                    <div className="rd-meta-row">
                        <span className="rd-eyebrow">Розклад · III · Минуле · Теперішнє · Майбутнє</span>
                        <span className="rd-date">14 квітня 2026 · 14:02</span>
                    </div>
                    <h1>Чи варто <em>змінити</em> роботу?</h1>
                    <p className="rd-q">«Я вже третій рік працюю на одному місці. Зараз отримала
                        пропозицію від іншої компанії — зарплата вища, але страшно.»</p>
                    <div className="rd-actions">
                        <button className="icon-btn primary">📄 Експорт у PDF</button>
                        <button className="icon-btn">🔗 Поділитися</button>
                        <button className="icon-btn">⭐ У збережені</button>
                        <button className="icon-btn">✕ Видалити</button>
                    </div>
                </div>

                <div className="rd-spread">
                    {SPREAD.map((c, i) => (
                        <div key={i} className="rd-card-wrap">
                            <div className="rd-card-pos">{c.pos}</div>
                            <div className="rd-card">
                                <div className="num">{c.num}</div>
                                <div className="sym">{c.sym}</div>
                                <div className="n">{c.name}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rd-section">
                    <div className="rd-label">Загальне тлумачення</div>
                    <div className="rd-interp">
                        <p>Ваше питання торкається <em>переходу</em> — моменту, коли старе вже дало свої
                            плоди, а нове ще не розпочалось. Карти показують ясний образ: ви стоїте на
                            порозі, і всі три часу говорять про рух уперед.</p>
                        <p>Минуле дало вам міцний фундамент справедливої праці. Теперішнє просить
                            заглянути всередину й не слухати зовнішні голоси. Майбутнє — це колісниця,
                            яка вже готова рушити, варто лише взятися за віжки.</p>
                    </div>
                </div>

                <div className="rd-section">
                    <div className="rd-label">Карта за картою</div>
                    {CARD_INTERP.map((c, i) => (
                        <div key={i} className="rd-card-interp">
                            <div className="rd-ci-head">
                                <span className="rd-ci-rom">{c.rom}</span>
                                <span className="rd-ci-name">{c.name}</span>
                                <span className="rd-ci-pos">{c.pos}</span>
                            </div>
                            <div className="rd-ci-text">{c.text}</div>
                        </div>
                    ))}
                </div>

                <div className="rd-section">
                    <div className="rd-label">Особисті нотатки</div>
                    <textarea
                        className="notes"
                        placeholder="Запишіть свої думки, інсайти, сни після розкладу…"
                        value={notes}
                        onChange={e => onNotesChange(e.target.value)}
                    />
                    <div className="notes-save">
                        <span className={`notes-status ${saved ? 'saved' : ''}`}>{status}</span>
                        <button className="icon-btn" onClick={() => onNotesChange(notes)}>✦ Зберегти</button>
                    </div>
                </div>
            </main>
        </>
    )
}
