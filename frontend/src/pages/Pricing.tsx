import { useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

export default function Pricing() {
  const [yearly, setYearly] = useState(false)
  const priceNum = yearly ? '119' : '149'
  const priceNote = yearly ? '1 428 ₴ на рік · економія 360 ₴' : 'скасуйте будь-коли'

  return (
    <>
      <Nav />
      <main className="pricing-main">
        <div className="pricing-header fade-up d2">
          <div className="pricing-eyebrow">Пакети підписки</div>
          <h1>Зніміть <span className="accent">ланцюги</span> долі</h1>
          <p className="lede">
            Три рівні доступу до мистецтва Таро. Почніть безкоштовно,
            розширюйте межі свого віщування, коли відчуєте необхідність.
          </p>

          <div className="billing-toggle">
            <button
              type="button"
              className={!yearly ? 'on' : ''}
              onClick={() => setYearly(false)}
            >
              Місяць
            </button>
            <button
              type="button"
              className={yearly ? 'on' : ''}
              onClick={() => setYearly(true)}
            >
              Рік <span className="billing-save">−20%</span>
            </button>
          </div>
        </div>

        <div className="plans fade-up d3">
          <div className="plan">
            <div className="plan-name">Гість</div>
            <div className="plan-title">Перший <span className="accent">погляд</span></div>
            <p className="plan-tagline">Без акаунта. Щоб спробувати смак карт.</p>

            <div className="plan-price">
              <span className="num">0</span>
              <span className="cur">₴</span>
              <span className="per">назавжди</span>
            </div>
            <div className="plan-price-note">&nbsp;</div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li><span className="mark">✦</span> 1 розклад на день</li>
              <li><span className="mark">✦</span> Тільки розклад з 3 карт</li>
              <li><span className="mark">✦</span> Швидке тлумачення</li>
              <li className="off"><span className="mark">✕</span> Історія чатів</li>
              <li className="off"><span className="mark">✕</span> Розклади V, VII, XII</li>
              <li className="off"><span className="mark">✕</span> Вільний розклад</li>
            </ul>

            <Link to="/guest" className="btn btn-ghost plan-cta">Спробувати →</Link>
          </div>

          <div className="plan">
            <div className="plan-name">Подорожник</div>
            <div className="plan-title">Відкрита <span className="accent">колода</span></div>
            <p className="plan-tagline">Безкоштовно для всіх, хто створив акаунт.</p>

            <div className="plan-price">
              <span className="num">0</span>
              <span className="cur">₴</span>
              <span className="per">з акаунтом</span>
            </div>
            <div className="plan-price-note">потрібна реєстрація</div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li><span className="mark">✦</span> 5 розкладів по 3 карти</li>
              <li><span className="mark">✦</span> 3 розклади по 5 карт</li>
              <li><span className="mark">✦</span> 1 розклад на 7 карт</li>
              <li><span className="mark">✦</span> Історія чатів та розкладів</li>
              <li><span className="mark">✦</span> Журнал віщувань</li>
              <li className="off"><span className="mark">✕</span> Розклади XII та ∞</li>
            </ul>

            <Link to="/register" className="btn btn-ghost plan-cta">Створити акаунт →</Link>
          </div>

          <div className="plan featured">
            <div className="plan-featured-tag">Найпопулярніше</div>
            <div className="plan-name">Pro · Оракул</div>
            <div className="plan-title">Без <span className="accent">меж</span></div>
            <p className="plan-tagline">Повний доступ до всіх розкладів та щедрий добовий ліміт.</p>

            <div className="plan-price">
              <span className="num">{priceNum}</span>
              <span className="cur">₴</span>
              <span className="per">на місяць</span>
            </div>
            <div className="plan-price-note">{priceNote}</div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li><span className="mark">✦</span> До 20 розкладів на день</li>
              <li><span className="mark">✦</span> Будь-який вид: 3, 5, 7, 12 карт</li>
              <li><span className="mark">✦</span> Вільний розклад (∞ карт)</li>
              <li><span className="mark">✦</span> Поглиблене тлумачення ШІ</li>
              <li><span className="mark">✦</span> Експорт розкладу у PDF</li>
              <li><span className="mark">✦</span> Пріоритетна підтримка</li>
            </ul>

            <Link to="/register" className="btn btn-primary plan-cta">Отримати Pro →</Link>
          </div>
        </div>

        <div className="daily-limits fade-up d4">
          <h3>Денні ліміти</h3>
          <p className="sub">Оновлення щодня о 00:00</p>
          <div className="daily-grid">
            <div className="head head-first">&nbsp;</div>
            <div className="head">Гість</div>
            <div className="head">Подорожник</div>
            <div className="head">Pro</div>

            <div className="row-label">3 карти</div>
            <div>1</div>
            <div>5</div>
            <div className="best">до 20</div>

            <div className="row-label">5 карт</div>
            <div className="zero">—</div>
            <div>3</div>
            <div className="best">до 20</div>

            <div className="row-label">7 карт</div>
            <div className="zero">—</div>
            <div>1</div>
            <div className="best">до 20</div>

            <div className="row-label">12 карт</div>
            <div className="zero">—</div>
            <div className="zero">—</div>
            <div className="best">до 20</div>

            <div className="row-label">∞ карт</div>
            <div className="zero">—</div>
            <div className="zero">—</div>
            <div className="best">до 20</div>
          </div>
        </div>
      </main>
    </>
  )
}
