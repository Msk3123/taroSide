import { useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

/**
 * Сторінка тарифів за дизайн-шаблоном pricing.html.
 * Перемикач «Місяць / Рік» змінює ціну Premium і VIP (−20% при річній оплаті).
 * Розділ промокодів і поле вводу — статичний UI (бекенду промокодів ще немає),
 * CTA-кнопки ведуть на реєстрацію, бо checkout-маршруту в застосунку нема.
 */
export default function Pricing() {
  const [yearly, setYearly] = useState(false)

  const premNum = yearly ? '119' : '149'
  const premNote = yearly ? '1 428 ₴ на рік · економія 360 ₴' : 'скасуйте будь-коли'
  const vipNum = yearly ? '303' : '379'
  const vipNote = yearly ? '3 636 ₴ на рік · економія 912 ₴' : 'скасуйте будь-коли'

  return (
    <>
      <Nav />
      <main className="pricing-main">
        <div className="pricing-header fade-up d1">
          <div className="pricing-eyebrow">Тарифи Lunaris</div>
          <h1>Оберіть свій <span className="accent">рівень</span></h1>
          <p className="lede">
            Створіть акаунт, щоб робити розклади — безплатно демонстраційний доступ
            до базових методик, вірусних фіч і триденної історії. Пакети Premium і VIP
            відкривають усі розклади, ШІ-Тренера та Матрицю Долі.
          </p>

          <div className="billing-toggle">
            <button type="button" className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>
              Місяць
            </button>
            <button type="button" className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>
              Рік <span className="billing-save">−20%</span>
            </button>
          </div>
        </div>

        <div className="plans fade-up d2">
          {/* FREE · ДЕМО */}
          <div className="plan">
            <div className="plan-name">Free · Демо</div>
            <div className="plan-title">Спробувати <span className="accent">смак</span></div>
            <p className="plan-tagline">
              Безкоштовно для всіх, хто створив акаунт. Підсадитися на звичку без ризику.
            </p>

            <div className="plan-price">
              <span className="num">0</span>
              <span className="cur">₴</span>
              <span className="per">назавжди</span>
            </div>
            <div className="plan-price-note">потрібна реєстрація</div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li><span className="mark">✦</span> 1–2 розклади на добу</li>
              <li><span className="mark">✦</span> Базовий аналіз на 3 карти</li>
              <li><span className="mark">✦</span> <strong>«Режим Вечірки»</strong></li>
              <li><span className="mark">✦</span> Швидка картка-скріншот для соцмереж</li>
              <li><span className="mark">✦</span> Історія — останні 3 дні</li>
              <li className="off"><span className="mark">✕</span> Складні розклади 5/7 карт</li>
            </ul>

            <Link to="/register" className="btn btn-ghost plan-cta">Створити акаунт →</Link>
          </div>

          {/* PREMIUM */}
          <div className="plan">
            <div className="plan-name">Premium</div>
            <div className="plan-title">Прокачана <span className="accent">база</span></div>
            <p className="plan-tagline">
              Для тих, хто хоче більше фану, контролю та спеціальних розкладів.
            </p>

            <div className="plan-price">
              <span className="num">{premNum}</span>
              <span className="cur">₴</span>
              <span className="per">на місяць</span>
            </div>
            <div className="plan-price-note">{premNote}</div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li><span className="mark">✦</span> <strong>5–7 розкладів на день</strong></li>
              <li><span className="mark">✦</span> Увесь функціонал безкоштовного тарифу</li>
              <li><span className="mark">✦</span> Розширені розклади на 5 та 7 карт</li>
              <li><span className="mark">✦</span> Глибший розбір життєвих ситуацій</li>
              <li><span className="mark">✦</span> Безлімітна історія розкладів</li>
              <li><span className="mark">✦</span> Розширені відповіді ШІ</li>
              <li><span className="mark">✦</span> Експорт у PDF</li>
            </ul>

            <Link to="/register" className="btn btn-primary plan-cta">Отримати Premium →</Link>
          </div>

          {/* VIP · ПРОФІ */}
          <div className="plan featured">
            <div className="plan-featured-tag">Стратег · VIP</div>
            <div className="plan-name">VIP · Профі</div>
            <div className="plan-title">Тактичний <span className="accent">стратег</span></div>
            <p className="plan-tagline">
              Для тарологів, гіків та серйозного самоаналізу. Чи для тих, хто гадає іншим.
            </p>

            <div className="plan-price">
              <span className="num">{vipNum}</span>
              <span className="cur">₴</span>
              <span className="per">на місяць</span>
            </div>
            <div className="plan-price-note">{vipNote}</div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li><span className="mark">✦</span> <strong>До 20 розкладів на день</strong></li>
              <li><span className="mark">✦</span> Усі можливості Premium</li>
              <li><span className="mark">✦</span> Розклади на <strong>12 карт</strong> · рік прогнозу</li>
              <li><span className="mark">✦</span> Вільний режим</li>
              <li><span className="mark">✦</span> <strong>Матриця Долі</strong> <span className="vip-tag">VIP</span></li>
              <li><span className="mark">✦</span> ШІ-Тренер <span className="vip-tag">VIP</span></li>
              <li><span className="mark">✦</span> Пріоритетна обробка</li>
            </ul>

            <Link to="/register" className="btn btn-primary plan-cta">Стати VIP →</Link>
          </div>
        </div>

        {/* Денні ліміти */}
        <div className="daily-limits fade-up d3">
          <h3>Денні <em>ліміти</em></h3>
          <p className="sub">Оновлення щодня о 00:00</p>
          <div className="daily-grid">
            <div className="head head-first">&nbsp;</div>
            <div className="head">Free · Демо</div>
            <div className="head">Premium · 149₴</div>
            <div className="head">VIP · 379₴</div>

            <div className="row-label">Розклади на день</div>
            <div>1–2</div>
            <div>5–7</div>
            <div className="best">20</div>

            <div className="row-label">Базові розклади (3 карти)</div>
            <div className="best">✦</div>
            <div className="best">✦</div>
            <div className="best">✦</div>

            <div className="row-label">Режим Вечірки (фан, іронія)</div>
            <div className="best">✦</div>
            <div className="best">✦</div>
            <div className="best">✦</div>

            <div className="row-label">Вірусний шеринг</div>
            <div className="best">✦</div>
            <div className="best">✦</div>
            <div className="best">✦</div>

            <div className="row-label">Складні розклади (5, 7 карт)</div>
            <div className="zero">—</div>
            <div className="best">✦</div>
            <div className="best">✦</div>

            <div className="row-label">Повні розклади (12 карт)</div>
            <div className="zero">—</div>
            <div className="zero">—</div>
            <div className="best">✦</div>

            <div className="row-label">Вільний режим (n карт)</div>
            <div className="zero">—</div>
            <div className="zero">—</div>
            <div className="best">✦</div>

            <div className="row-label">Історія розкладів</div>
            <div>3 дні</div>
            <div className="best">✦ безліміт</div>
            <div className="best">✦ безліміт</div>

            <div className="row-label">Матриця Долі</div>
            <div className="zero">—</div>
            <div className="zero">—</div>
            <div className="best">✦</div>

            <div className="row-label">ШІ-Тренер</div>
            <div className="zero">—</div>
            <div className="zero">—</div>
            <div className="best">✦</div>

            <div className="row-label">Пріоритетна обробка</div>
            <div className="zero">—</div>
            <div className="zero">—</div>
            <div className="best">✦</div>
          </div>
        </div>

        {/* Промокоди */}
        <div className="promo-section fade-up d4">
          <div className="promo-head">
            <h3>Промокоди <em>з TikTok</em></h3>
            <div className="sub">Гейміфіковані винагороди — не звичайні знижки</div>
          </div>

          <div className="promo-grid">
            <div className="promo">
              <div className="promo-tag">Secret Card Code</div>
              <div className="promo-code">TikTok Lunaris</div>
              <p>На нашій TikTok-сторінці ви зможете знайти промокоди. Будемо раді Вас бачити!</p>
            </div>
            <div className="promo">
              <div className="promo-tag">Secret Card Code</div>
              <div className="promo-code">TikTok Lunaris</div>
              <p>На нашій TikTok-сторінці ви зможете знайти промокоди. Будемо раді Вас бачити!</p>
            </div>
            <div className="promo">
              <div className="promo-tag">Secret Card Code</div>
              <div className="promo-code">TikTok Lunaris</div>
              <p>На нашій TikTok-сторінці ви зможете знайти промокоди. Будемо раді Вас бачити!</p>
            </div>
          </div>

          <div className="promo-input-wrap">
            <input placeholder="Введіть код з TikTok-челенджу…" />
            <button type="button" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              Активувати
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
