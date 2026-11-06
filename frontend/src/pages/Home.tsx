import Nav from '../components/Nav'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <Nav />

      <main className="home-main">
        <section className="hero">
          <div className="eyebrow fade-up d2">Вищі Аркани · Розклад Таро</div>
          <h1 className="fade-up d3">
            <span className="greeting">Вітаємо, подорожній —</span>
            Lunaris.{' '}
            <span className="accent">Шепіт карт</span>{' '}
            у темряві ночі.
          </h1>
          <p className="lede fade-up d4">
            Відкрийте для себе стародавнє мистецтво Таро. Lunaris читає зашифровані символи
            колоди, щоб допомогти вам розібратися в почуттях, стосунках та майбутньому.
            Кожен розклад — окрема історія, написана зірками саме для вас.
          </p>

          <div className="cta-row fade-up d5">
            <Link to="/login" className="btn btn-primary">Розпочати розклад</Link>
            <Link to="/register" className="btn btn-ghost">Створити акаунт</Link>
            <Link to="/guest" className="guest-link">Подивитись як гість</Link>
          </div>

          <div className="meta-row fade-up d6">
            <div className="meta-item">
              <span className="n">78</span>
              <div className="l">Карт у колоді</div>
            </div>
            <div className="meta-item">
              <span className="n">4</span>
              <div className="l">Види розкладу</div>
            </div>
            <div className="meta-item">
              <span className="n">∞</span>
              <div className="l">Можливих шляхів</div>
            </div>
          </div>
        </section>

        <section className="stage fade-up d3">
          <div className="halo" />
          <div className="ring" />
          <div className="ring-inner" />
          <div className="cards">
            <div className="card left">
              <div className="card-inner">
                <div className="card-num">· XVIII ·</div>
                <div className="card-sym">☾</div>
                <div className="card-name">La Luna</div>
              </div>
            </div>
            <div className="card center">
              <div className="card-inner">
                <div className="card-num">· XVII ·</div>
                <div className="card-sym">✦</div>
                <div className="card-name">La Stella</div>
              </div>
            </div>
            <div className="card right">
              <div className="card-inner">
                <div className="card-num">· XIX ·</div>
                <div className="card-sym">☉</div>
                <div className="card-name">Il Sole</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer fade-up d6">
        <div>Est. Anno MMXXVI</div>
        <div><span>Слухай шепіт</span> · Довіряй карті</div>
        <div>Lunaris — ☾ —</div>
      </footer>
    </>
  )
}
