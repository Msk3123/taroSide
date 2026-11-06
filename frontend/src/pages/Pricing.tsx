import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { auth, promoApi, type PromoDiscount } from '../lib/api'
import { track } from '../lib/analytics'
import { TIKTOK_URL } from '../lib/links'

/**
 * Сторінка тарифів. Ліміти тут МАЮТЬ збігатися з бекендом — RolePolicies.For(role)
 * і Spread.RequiredRole. Онлайн-оплати ще немає: кнопки «Купити» відкривають
 * пояснення, як отримати тариф через розробника (він видає його в адмінці).
 * «Скоро» — фічі, які заплановані, але в коді ще не реалізовані.
 */
export default function Pricing() {
  const [yearly, setYearly] = useState(false)
  // Який тариф людина хотіла купити — показуємо модалку-заглушку
  const [buying, setBuying] = useState<'Premium' | 'VIP' | null>(null)

  const loggedIn = auth.isAuthenticated()
  const [promoCode, setPromoCode] = useState('')
  const [promoBusy, setPromoBusy] = useState(false)
  const [promoResult, setPromoResult] = useState<{ kind: 'ok' | 'err'; text: string; chat?: boolean } | null>(null)
  const [discount, setDiscount] = useState<PromoDiscount | null>(null)

  useEffect(() => {
    if (loggedIn) promoApi.discount().then(d => setDiscount(d ?? null)).catch(() => { /* не критично */ })
  }, [loggedIn])

  async function redeem(e: FormEvent) {
    e.preventDefault()
    setPromoResult(null)
    setPromoBusy(true)
    try {
      const res = await promoApi.redeem(promoCode)
      if (res.discount) setDiscount(res.discount)
      setPromoCode('')
      setPromoResult({ kind: 'ok', text: res.message, chat: res.type === 'Subscription' })
    } catch (err) {
      setPromoResult({ kind: 'err', text: err instanceof Error ? err.message : 'Не вдалося застосувати промокод' })
    } finally {
      setPromoBusy(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setBuying(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function buy(plan: 'Premium' | 'VIP') {
    setBuying(plan)
    track('buy_click') // в адмінці видно, скільки людей хотіли купити
  }

  const withDiscount = (price: number) =>
    discount ? Math.round(price * (100 - discount.percent) / 100) : price
  const discountNote = (price: number) =>
    `було ${price} ₴ · знижка ${discount?.percent}% за кодом ${discount?.code}`

  const premBase = yearly ? 119 : 149
  const premNote = discount
    ? discountNote(premBase)
    : yearly ? '1 428 ₴ на рік · економія 360 ₴' : 'планова ціна'
  const vipBase = yearly ? 303 : 379
  const vipNote = discount
    ? discountNote(vipBase)
    : yearly ? '3 636 ₴ на рік · економія 912 ₴' : 'планова ціна'

  return (
    <>
      <Nav />
      <main className="pricing-main">
        <div className="pricing-header fade-up d1">
          <div className="pricing-eyebrow">Тарифи Lunaris</div>
          <h1>Оберіть свій <span className="accent">рівень</span></h1>
          <p className="lede">
            Створіть акаунт — і отримаєте безкоштовні розклади на три карти щодня.
            Premium і VIP відкривають великі розклади та більше лімітів.
          </p>
          <div className="pricing-notice">
            ☾ Онлайн-оплата поки не працює. Хочете Premium або VIP уже зараз —{' '}
            <Link to="/support">напишіть розробнику</Link> або в{' '}
            <a href={TIKTOK_URL} target="_blank" rel="noreferrer">TikTok</a>, і ми домовимось.
          </div>

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
          {/* FREE */}
          <div className="plan">
            <div className="plan-name">Free</div>
            <div className="plan-title">Спробувати <span className="accent">смак</span></div>
            <p className="plan-tagline">
              Безкоштовно для всіх, хто створив акаунт. Без картки й без пробного періоду.
            </p>

            <div className="plan-price">
              <span className="num">0</span>
              <span className="cur">₴</span>
              <span className="per">назавжди</span>
            </div>
            <div className="plan-price-note">потрібна реєстрація</div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li><span className="mark">✦</span> <strong>2 розклади на добу</strong></li>
              <li><span className="mark">✦</span> Розклад на 3 карти</li>
              <li><span className="mark">✦</span> 20 повідомлень Lunaris на день</li>
              <li><span className="mark">✦</span> Історія розмов у чаті</li>
              <li><span className="mark">✦</span> Бібліотека карт і розрахунок Матриці Долі</li>
              <li className="off"><span className="mark">✕</span> Розклади на 5, 7 і 12 карт</li>
            </ul>

            <Link to={loggedIn ? '/chat' : '/register'} className="btn btn-ghost plan-cta">
              {loggedIn ? 'До гадання →' : 'Створити акаунт →'}
            </Link>
          </div>

          {/* PREMIUM */}
          <div className="plan">
            <div className="plan-name">Premium</div>
            <div className="plan-title">Прокачана <span className="accent">база</span></div>
            <p className="plan-tagline">
              Для тих, хто хоче глибших розкладів і частіше питати карти.
            </p>

            <div className="plan-price">
              <span className="num">{withDiscount(premBase)}</span>
              <span className="cur">₴</span>
              <span className="per">на місяць</span>
            </div>
            <div className="plan-price-note">{premNote}</div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li><span className="mark">✦</span> <strong>7 розкладів на день</strong></li>
              <li><span className="mark">✦</span> Розклади на 5 і 7 карт</li>
              <li><span className="mark">✦</span> 100 повідомлень на день</li>
              <li><span className="mark">✦</span> Усе з тарифу Free</li>
              <li className="soon"><span className="mark">◌</span> Експорт у PDF <span className="soon-tag">скоро</span></li>
              <li className="soon"><span className="mark">◌</span> Розширені відповіді ШІ <span className="soon-tag">скоро</span></li>
            </ul>

            <button type="button" className="btn btn-primary plan-cta" onClick={() => buy('Premium')}>
              Отримати Premium →
            </button>
          </div>

          {/* VIP */}
          <div className="plan featured">
            <div className="plan-featured-tag">Стратег · VIP</div>
            <div className="plan-name">VIP</div>
            <div className="plan-title">Тактичний <span className="accent">стратег</span></div>
            <p className="plan-tagline">
              Для тарологів, гіків та серйозного самоаналізу. Чи для тих, хто гадає іншим.
            </p>

            <div className="plan-price">
              <span className="num">{withDiscount(vipBase)}</span>
              <span className="cur">₴</span>
              <span className="per">на місяць</span>
            </div>
            <div className="plan-price-note">{vipNote}</div>

            <div className="plan-divider" />

            <ul className="plan-features">
              <li><span className="mark">✦</span> <strong>20 розкладів на день</strong></li>
              <li><span className="mark">✦</span> «Колесо року» на <strong>12 карт</strong></li>
              <li><span className="mark">✦</span> Безліміт повідомлень</li>
              <li><span className="mark">✦</span> <strong>Прочитання Матриці Долі</strong> <span className="vip-tag">VIP</span></li>
              <li><span className="mark">✦</span> Усе з тарифу Premium</li>
              <li className="soon"><span className="mark">◌</span> Вільний розклад <span className="soon-tag">у розробці</span></li>
              <li className="soon"><span className="mark">◌</span> ШІ-Тренер <span className="soon-tag">у розробці</span></li>
            </ul>

            <button type="button" className="btn btn-primary plan-cta" onClick={() => buy('VIP')}>
              Стати VIP →
            </button>
          </div>
        </div>

        {/* Денні ліміти — ті самі числа, що в RolePolicies на бекенді */}
        <div className="daily-limits fade-up d3">
          <h3>Денні <em>ліміти</em></h3>
          <p className="sub">Оновлення щодня о 00:00 UTC (02:00–03:00 за Києвом)</p>
          <div className="daily-grid">
            <div className="head head-first">&nbsp;</div>
            <div className="head">Free</div>
            <div className="head">Premium</div>
            <div className="head">VIP</div>

            <div className="row-label">Розклади на день</div>
            <div>2</div>
            <div>7</div>
            <div className="best">20</div>

            <div className="row-label">Повідомлення на день</div>
            <div>20</div>
            <div>100</div>
            <div className="best">∞</div>

            <div className="row-label">Розклад на 3 карти</div>
            <div className="best">✦</div>
            <div className="best">✦</div>
            <div className="best">✦</div>

            <div className="row-label">Розклади на 5 і 7 карт</div>
            <div className="zero">—</div>
            <div className="best">✦</div>
            <div className="best">✦</div>

            <div className="row-label">«Колесо року» (12 карт)</div>
            <div className="zero">—</div>
            <div className="zero">—</div>
            <div className="best">✦</div>

            <div className="row-label">Розрахунок Матриці Долі</div>
            <div className="best">✦</div>
            <div className="best">✦</div>
            <div className="best">✦</div>

            <div className="row-label">Прочитання Матриці Долі</div>
            <div className="zero">—</div>
            <div className="zero">—</div>
            <div className="best">✦</div>

            <div className="row-label">Вільний розклад (n карт)</div>
            <div className="zero">—</div>
            <div className="zero">—</div>
            <div>скоро</div>
          </div>
        </div>

        {/* Підписка за кодом діє одразу. Знижку адмін бачить у профілі й враховує, поки немає онлайн-оплати. */}
        <div className="promo-section fade-up d4">
          <div className="promo-head">
            <h3>Є <em>промокод?</em></h3>
            <div className="sub">Введіть його, щоб отримати знижку або подарунковий тариф</div>
          </div>
          {loggedIn ? (
            <form className="promo-input-wrap" onSubmit={redeem}>
              <input
                aria-label="Промокод"
                placeholder="Ваш промокод"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                maxLength={32}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={promoBusy}>
                {promoBusy ? '…' : 'Застосувати'}
              </button>
            </form>
          ) : (
            <p className="promo-login"><Link to="/login">Увійдіть</Link>, щоб застосувати промокод.</p>
          )}
          {promoResult && (
            <p className={`promo-result ${promoResult.kind}`} role="status">
              {promoResult.text}
              {promoResult.chat && <> · <Link to="/chat">До гадання →</Link></>}
            </p>
          )}
          {discount && (
            <p className="promo-login">
              Щоб отримати тариф зі знижкою {discount.percent}%, <Link to="/support">напишіть розробнику</Link>: він бачить вашу знижку.
            </p>
          )}
          <div className="promo-grid promo-grid-single">
            <div className="promo">
              <div className="promo-tag">Слідкуйте за новинами</div>
              <div className="promo-code">TikTok Lunaris</div>
              <p>Там ми анонсуємо акції й розіграші підписок для перших користувачів.</p>
              <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">Відкрити TikTok ↗</a>
            </div>
          </div>
        </div>
      </main>

      {/* Заглушка купівлі */}
      <div
        className={`lock-modal ${buying ? 'open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setBuying(null) }}
      >
        {buying && (
          <div className="lock-modal-card" role="dialog" aria-modal="true">
            <button className="lock-close" onClick={() => setBuying(null)} aria-label="Закрити">✕</button>
            <div className="auth-eyebrow">☾ {buying} ☾</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 36, marginBottom: 14 }}>
              Купівля поки <span style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>недоступна</span>
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-dim)', marginBottom: 24 }}>
              Онлайн-оплату ми ще підключаємо. Але якщо хочете {buying} вже зараз — напишіть розробнику:
              домовимось, і підписку буде активовано на ваш профіль раніше, ніж оплата з’явиться на сайті.
            </p>
            <Link
              to={loggedIn ? '/support' : '/register'}
              className="btn btn-primary auth-submit"
              style={{ marginBottom: 12 }}
            >
              {loggedIn ? 'Написати розробнику →' : 'Створити акаунт і написати →'}
            </Link>
            <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="btn btn-ghost auth-submit" style={{ marginBottom: 12 }}>
              Написати в TikTok ↗
            </a>
            <button
              className="btn"
              onClick={() => setBuying(null)}
              style={{ display: 'block', width: '100%', textAlign: 'center', padding: 10 }}
            >
              Закрити
            </button>
          </div>
        )}
      </div>
    </>
  )
}
