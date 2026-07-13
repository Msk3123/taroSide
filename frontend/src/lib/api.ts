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
  role: 'Guest' | 'Free' | 'Premium' | 'Vip' | 'Admin'
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

/** Помилка запиту з HTTP-статусом — щоб UI міг відрізнити 429 (ліміт) від решти. */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
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
    throw new ApiError(message, res.status)
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

export const authApi = {
  /** POST /api/auth/change-password — змінює пароль (перевіряє поточний). */
  changePassword: (currentPassword: string, newPassword: string) =>
    api<void>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ CurrentPassword: currentPassword, NewPassword: newPassword }),
    }),
}

/** Денні ліміти + поточне використання (з /api/user/usage). Ліміт MAX_INT = безліміт. */
export interface UserUsage {
  role: string
  chatMessagesUsed: number
  chatMessagesLimit: number
  readingsUsed: number
  readingsLimit: number
  maxCards: number
  resetsAt: string
}

/** .NET int.MaxValue приходить як це число — трактуємо як «безліміт». */
export const UNLIMITED = 2147483647

export const userApi = {
  /** GET /api/user/me — поточний користувач. */
  me: () => api<CurrentUser>('/api/user/me'),

  /** GET /api/user/usage — денні ліміти та скільки вже використано. */
  usage: () => api<UserUsage>('/api/user/usage'),

  /** PUT /api/User/{id} — повертає {id, userName, email}. */
  update: (id: string, payload: UpdateUserPayload) =>
    api<{ id: string; userName: string; email: string }>(`/api/User/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  /** DELETE /api/user/{id} — видаляє акаунт (204 No Content). */
  remove: (id: string) => api<void>(`/api/user/${id}`, { method: 'DELETE' }),
}
/** Одне збережене повідомлення розмови (role = "user" | "assistant"). */
export interface ConversationMessage {
  id: string
  role: string
  content: string
  createdAt: string
  /** JSON-рядок із картами (масив DrawnCard), якщо в повідомленні був розклад. */
  cardsJson?: string | null
}

/** Розмова, як її віддає бекенд. messages приходить лише в GET by id. */
export interface Conversation {
  id: string
  title: string
  createdAt?: string
  updatedAt?: string
  messages?: ConversationMessage[]
}

/** Одна витягнута карта — те, що бекенд тепер віддає разом із текстом. */
export interface DrawnCard {
  position: number
  name: string
  symbol: string
  isReversed: boolean
}

/** Відповідь оракула: текст + карти, що випали (cards порожній, якщо розкладу не було). */
export interface ChatReply {
  reply: string
  cards: DrawnCard[]
}

export const conversationApi = {
  /** GET /api/conversations — список розмов користувача (без повідомлень). */
  list: () => api<Conversation[]>('/api/conversations'),

  /** GET /api/conversations/{id} — одна розмова разом із повідомленнями. */
  get: (id: string) => api<Conversation>(`/api/conversations/${id}`),

  /** POST /api/conversations — створює розмову, повертає {id, title, ...}. */
  create: (title: string) =>
    api<Conversation>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ Title: title }),
    }),

  /**
   * POST /api/conversations/{id}/messages — шле питання, чекає відповідь LLM.
   * Бекенд повертає { Reply, Cards }, ASP.NET серіалізує в camelCase → { reply, cards }.
   */
  sendMessage: (id: string, message: string, spreadId: number) =>
    api<ChatReply>(`/api/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ Message: message, SpreadId: spreadId }),
    }),
}

/* -------- адмінка (усі запити вимагають роль Admin у JWT) -------- */

/** Користувач очима адміна: роль + сьогоднішнє використання лімітів. */
export interface AdminUser {
  id: string
  userName: string
  email: string
  role: 'Guest' | 'Free' | 'Premium' | 'Vip' | 'Admin'
  createdAt: string
  dailyChatMessagesUsed: number
  dailyQuestionsUsed: number
}

/** Глобальні лічильники для дашборду адмінки. */
export interface AdminStats {
  totalUsers: number
  totalConversations: number
  totalMessages: number
  totalCards: number
}

export const adminApi = {
  /** GET /api/admin/users — усі користувачі (новіші першими). */
  listUsers: () => api<AdminUser[]>('/api/admin/users'),

  /** GET /api/admin/stats — лічильники по всій базі. */
  stats: () => api<AdminStats>('/api/admin/stats'),

  /**
   * PUT /api/admin/users/{id}/role — змінює роль. Роль шлемо РЯДКОМ ("Premium"),
   * бекенд парсить її через Enum.TryParse. Повертає оновленого користувача.
   */
  setRole: (id: string, role: AdminUser['role']) =>
    api<AdminUser>(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ Role: role }),
    }),

  /** DELETE /api/admin/users/{id} — видаляє акаунт (204 No Content). */
  deleteUser: (id: string) => api<void>(`/api/admin/users/${id}`, { method: 'DELETE' }),
}

