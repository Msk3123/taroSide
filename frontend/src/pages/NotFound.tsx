import { Link } from 'react-router-dom'

/**
 * NotFound (404) — «Вежа впала». Аркан XVI падає з анімацією.
 * Рендериться на будь-який невідомий маршрут.
 */
export default function NotFound() {
  return (
    <div className="nf-wrap">
      <div className="nf">
        <div className="nf-card">
          <div className="num">· XVI ·</div>
          <div className="sym">🗲</div>
          <div className="n">The Tower</div>
        </div>
        <div className="nf-code">· ERR · 404 ·</div>
        <h1>Вежа <span className="accent">впала</span></h1>
        <p>
          Сторінки, яку ви шукали, більше немає. Можливо, її зруйнував блискавкою
          Аркан XVI — або вона ніколи й не існувала в цьому вимірі.
          Спробуйте повернутися до знайомих стежок.
        </p>
        <div className="nf-actions">
          <Link to="/" className="btn btn-primary">← На головну</Link>
          <Link to="/library" className="btn btn-ghost">До бібліотеки</Link>
          <Link to="/guest" className="btn btn-ghost">Гадати</Link>
        </div>
      </div>
    </div>
  )
}
