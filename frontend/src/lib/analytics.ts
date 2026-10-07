import { API_URL, auth } from './api'

/**
 * Власна легка аналітика: фронт шле «відкрили сторінку X», бекенд складає звіт для адмінки.
 * Без сторонніх сервісів і cookie-банерів: зберігаємо лише шлях і анонімний id браузера,
 * жодних текстів запитів чи особистих даних.
 */

const VISITOR_KEY = 'lunaris_vid'

export type AnalyticsEventType = 'page_view' | 'guest_message' | 'buy_click'

/** Анонімний id браузера — щоб рахувати людей, а не перезавантаження. */
function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    // приватний режим без localStorage — id на одну вкладку
    return (window as unknown as { __lunarisVid?: string }).__lunarisVid ??=
      Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

/** Надіслати подію. «Вистрілив і забув»: помилка аналітики ніколи не ламає сторінку. */
export function track(type: AnalyticsEventType, path: string = window.location.pathname): void {
  const token = auth.getToken()
  fetch(`${API_URL}/api/analytics/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ visitorId: visitorId(), type, path }),
    keepalive: true, // подія дійде, навіть якщо людина одразу закрила вкладку
  }).catch(() => { /* аналітика не критична */ })
}
