import { useEffect, useState } from 'react'
import { adminApi, type AnalyticsSummary } from '../../lib/api'

const RANGES = [7, 30, 90] as const

const PAGE_NAMES: Record<string, string> = {
  '/': 'Головна', '/guest': 'Гість', '/register': 'Реєстрація', '/login': 'Вхід',
  '/chat': 'Гадання (чат)', '/pricing': 'Пакети', '/library': 'Бібліотека', '/matrix': 'Матриця',
  '/trainer': 'Тренер', '/trainer-session': 'Сесія тренера', '/faq': 'FAQ', '/about': 'Про нас',
  '/profile': 'Профіль', '/support': 'Підтримка', '/deck': 'Колода', '/card/:id': 'Сторінка карти',
  '/journal': 'Журнал', '/reading': 'Розклад (демо)', '/admin': 'Адмінка',
}

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0)
// Ширина смуги не може бути > 100%: реєстрації рахуються з БД і можуть перевищити відвідувачів із трекера
const bar = (part: number, whole: number) => Math.min(100, pct(part, whole))

/**
 * Вкладка «Аналітика»: скільки людей прийшло, куди дивились і на якому кроці відпали.
 * Дані — з власного трекера (lib/analytics.ts) + реальних таблиць (юзери, розмови).
 */
export default function AdminAnalytics() {
  const [days, setDays] = useState<number>(30)
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    adminApi.analytics(days)
      .then(d => { if (alive) { setData(d); setError(null) } })
      .catch(e => { if (alive) setError((e as Error).message) })
    return () => { alive = false }
  }, [days])

  const maxDay = Math.max(1, ...(data?.daily.map(d => d.visitors) ?? [1]))
  const top = data?.funnel[0]?.count ?? 0
  const hovered = hover !== null ? data?.daily[hover] : null

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Аналітика <span className="accent">відвідувань</span></h1>
          <div className="sub">Хто приходить, що дивиться і де відпадає</div>
        </div>
        <div className="an-range" role="group" aria-label="Період">
          {RANGES.map(r => (
            <button key={r} type="button" className={days === r ? 'on' : ''} onClick={() => setDays(r)}>
              {r} днів
            </button>
          ))}
        </div>
      </div>

      {error && <div className="admin-status err an-pad">Не вдалось завантажити: {error}</div>}

      {data && (
        <div className="an-grid">
          <div className="an-tiles">
            <div className="an-tile"><div className="n">{data.visitors}</div><div className="l">унікальних відвідувачів</div></div>
            <div className="an-tile"><div className="n">{data.pageViews}</div><div className="l">переглядів сторінок</div></div>
            <div className="an-tile">
              <div className="n">{pct(data.bouncedVisitors, data.visitors)}%</div>
              <div className="l">пішли після 1 сторінки</div>
            </div>
            <div className="an-tile">
              <div className="n">{data.funnel[2]?.count ?? 0}</div>
              <div className="l">нових реєстрацій</div>
            </div>
          </div>

          {/* Відвідувачі по днях: одна серія → без легенди, назву дає заголовок */}
          <div className="panel">
            <h2>Відвідувачі по днях</h2>
            <div className="panel-sub">
              {hovered
                ? `${hovered.date}: ${hovered.visitors} відвідувачів · ${hovered.pageViews} переглядів`
                : 'Наведіть на стовпчик, щоб побачити число'}
            </div>
            <div className="an-bars" onMouseLeave={() => setHover(null)}>
              {data.daily.map((d, i) => (
                <div
                  key={d.date}
                  className={`an-bar-hit ${hover === i ? 'on' : ''}`}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => setHover(i)}
                  title={`${d.date}: ${d.visitors} відвідувачів`}
                >
                  <div className="an-bar" style={{ height: `${(d.visitors / maxDay) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="an-axis">
              <span>{data.daily[0]?.date.slice(5)}</span>
              <span>max {maxDay}</span>
              <span>{data.daily[data.daily.length - 1]?.date.slice(5)}</span>
            </div>
          </div>

          {/* Воронка: кожен рядок — % від першого кроку; підпис «−N» — скільки відпало на переході */}
          <div className="panel">
            <h2>Воронка</h2>
            <div className="panel-sub">Скільки людей дійшло до кожного кроку за період</div>
            <p className="an-note">
              Перші два кроки — з трекера сайту, решта — з бази. Хто зареєструвався до запуску аналітики
              або з блокувальником трекерів, теж рахується, тому кроки інколи «більші» за попередні.
            </p>
            <div className="an-funnel">
              {data.funnel.map((f, i) => {
                const prev = i > 0 ? data.funnel[i - 1].count : null
                return (
                  <div key={f.step} className="an-fstep">
                    <div className="an-flabel">
                      <span>{f.step}</span>
                      <span className="v">
                        {f.count}
                        {f.count <= top && <small> · {pct(f.count, top)}%</small>}
                        {prev !== null && prev > f.count && <small className="drop"> −{prev - f.count}</small>}
                      </span>
                    </div>
                    <div className="an-ftrack"><div className="an-ffill" style={{ width: `${bar(f.count, top)}%` }} /></div>
                  </div>
                )
              })}
            </div>
            <div className="an-signals">
              {data.signals.map(s => (
                <div key={s.step}><span className="v">{s.count}</span> {s.step}</div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>Популярні сторінки</h2>
            <div className="panel-sub">Відсортовано за унікальними відвідувачами</div>
            <table className="an-table">
              <thead><tr><th>Сторінка</th><th>Люди</th><th>Перегляди</th></tr></thead>
              <tbody>
                {data.topPages.length === 0 && (
                  <tr><td colSpan={3} className="muted">Поки немає даних — зайдіть на сайт з іншого браузера</td></tr>
                )}
                {data.topPages.map(p => (
                  <tr key={p.path}>
                    <td>{PAGE_NAMES[p.path] ?? p.path} <span className="muted">{p.path}</span></td>
                    <td>{p.visitors}</td>
                    <td>{p.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
