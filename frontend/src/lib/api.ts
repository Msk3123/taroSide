/**
 * Тонкий обгортач навколо fetch для роботи з ASP.NET Core API.
 *
 * Чому окремий файл:
 *   - Уся frontend-кодова база знає тільки одну точку зміни URL/headers.
 *   - JWT-токен підтягується з localStorage централізовано.
 *   - У майбутньому сюди легко додати refresh-token логіку, обробку 401, retry.
 *
 * Усі ендпоінти повертають JSON і кидають помилку з текстом сервера на non-2xx.
 */

export const API_URL = 'http://localhost:5080'

const TOKEN_KEY = 'lunaris_jwt'
const USER_KEY = 'lunaris_user'

/** Профіль поточного користувача — мінімум, що потрібен фронту. */
export interface CurrentUser {
  id: string
  userName: string
  email: string
  role: 'Guest' | 'Free' | 'Premium'
  createdAt: string
}

export const auth = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
  getUser(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as CurrentUser
    } catch {
      return null
    }
  },
  setUser(user: CurrentUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY)
  },
}

/** Базовий fetch з JWT-заголовком (якщо є) та JSON-парсингом. */
export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = auth.getToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    const text = await res.text()
    let message = text || `HTTP ${res.status}`
    try {
      const json = JSON.parse(text)
      if (json.message) message = json.message
    } catch { /* not JSON */ }
    throw new Error(message)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  const contentType = res.headers.get('content-type') ?? ''
  return contentType.includes('application/json')
    ? ((await res.json()) as T)
    : ((await res.text()) as unknown as T)
}

/* -------- доменні виклики -------- */

export interface UpdateUserPayload {
  userName: string
  email: string
}

export const userApi = {
  /** PUT /api/User/{id} — повертає {id, userName, email}. */
  update: (id: string, payload: UpdateUserPayload) =>
    api<{ id: string; userName: string; email: string }>(`/api/User/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
}
