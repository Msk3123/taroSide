import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import Nav from '../components/Nav'
import {auth, type Conversation, conversationApi} from '../lib/api'

/**
 * Журнал — особистий архів: справжні розмови користувача з Lunaris.
 * Натиск на рядок відкриває розмову в чаті разом зі збереженими картами.
 */

const dateOf = (c: Conversation) => new Date(c.updatedAt ?? c.createdAt ?? 0)

function monthLabel(date: Date): string {
    return date.toLocaleDateString('uk-UA', {month: 'long', year: 'numeric'})
}

function groupByMonth(items: Conversation[]): { month: string; rows: Conversation[] }[] {
    const groups: { month: string; rows: Conversation[] }[] = []
    for (const conv of items) {
        const month = monthLabel(dateOf(conv))
        const last = groups[groups.length - 1]
        if (last?.month === month) last.rows.push(conv)
        else groups.push({month, rows: [conv]})
    }
    return groups
}

export default function Journal() {
    const loggedIn = auth.isAuthenticated()
    const [conversations, setConversations] = useState<Conversation[] | null>(null)
    const [failed, setFailed] = useState(false)
    const [query, setQuery] = useState('')

    useEffect(() => {
        if (!loggedIn) return
        conversationApi.list()
            .then(list => setConversations(
                [...list].sort((a, b) => dateOf(b).getTime() - dateOf(a).getTime())))
            .catch(() => setFailed(true))
    }, [loggedIn])

    const needle = query.trim().toLowerCase()
    const visible = (conversations ?? []).filter(c => c.title.toLowerCase().includes(needle))

    return (
        <>
            <Nav/>

            <main className="j-main">
                <div className="j-head fade-up d1">
                    <div className="j-eyebrow">Особистий журнал</div>
                    <h1>Архів <span className="accent">розкладів</span></h1>
                    <p className="lede">Усі ваші запити до карт, збережені в одному місці. Перегляньте,
                        як змінювалися відповіді, як рухається ваша доля.</p>
                </div>

                {!loggedIn && (
                    <div className="panel panel-cta fade-up d2">
                        <p>Увійдіть, щоб побачити свої розклади.</p>
                        <Link to="/login" className="btn btn-primary">Увійти →</Link>
                    </div>
                )}

                {failed && (
                    <div className="panel panel-cta fade-up d2">
                        <p>Не вдалося завантажити архів. Оновіть сторінку або спробуйте трохи згодом.</p>
                    </div>
                )}

                {conversations?.length === 0 && (
                    <div className="panel panel-cta fade-up d2">
                        <p>Тут поки порожньо. Ваші розклади зʼявляться після першої розмови з Lunaris.</p>
                        <Link to="/chat" className="btn btn-primary">Зробити перший розклад →</Link>
                    </div>
                )}

                {!!conversations?.length && (
                    <>
                        <div className="j-tools fade-up d2">
                            <input
                                placeholder="🔍 Пошук за темою…"
                                aria-label="Пошук за темою"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </div>

                        <div className="j-list fade-up d3">
                            {visible.length === 0 && <p className="lede">Нічого не знайдено.</p>}
                            {groupByMonth(visible).map(g => (
                                <div key={g.month}>
                                    <div className="month-label">{g.month}</div>
                                    {g.rows.map(c => {
                                        const d = dateOf(c)
                                        return (
                                            <Link key={c.id} to={`/chat?c=${c.id}`} className="j-row j-row-conv">
                                                <span className="j-rom">☾</span>
                                                <div className="j-meta">
                                                    <div className="t">{c.title}</div>
                                                </div>
                                                <div className="j-date">
                                                    <span className="y">
                                                        {d.toLocaleDateString('uk-UA', {day: '2-digit', month: '2-digit'})}
                                                    </span>
                                                    {d.toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'})}
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </>
    )
}
