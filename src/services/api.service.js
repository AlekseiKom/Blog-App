// Слой данных: Firebase Realtime Database через REST .json API.
// Каждый запрос проверяет response.ok и бросает ApiError при сбое — без тихих ошибок.

import { parseDateValue } from '../utils/date'

const BASE_URL = 'https://news-and-notes-blog-ak.firebaseio.com/'
const KINDS = ['note', 'reminder', 'task']

export class ApiError extends Error {
  constructor(status, message) {
    super(message || `Ошибка запроса (${status})`)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(BASE_URL + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })
  } catch (networkError) {
    throw new ApiError(0, 'Нет соединения с сервером. Проверьте интернет.')
  }

  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = body.error || ''
    } catch (e) { /* в ответе нет JSON */ }
    throw new ApiError(response.status, `Firebase: ${response.status}${detail ? ' — ' + detail : ''}`)
  }

  if (response.status === 204) return null // print=silent
  return response.json()
}

/** Нормализует запись из БД. Совместимо со старой схемой (type/fulltext/date dd.MM.yyyy). */
function normalizeItem(raw, id) {
  const kind = KINDS.includes(raw.kind) ? raw.kind : 'note'
  return {
    id,
    title: String(raw.title === null || raw.title === undefined ? '' : raw.title),
    text: String(raw.text !== undefined && raw.text !== null ? raw.text : (raw.fulltext || '')),
    kind,
    favorite: Boolean(raw.favorite),
    done: Boolean(raw.done),
    createdAt: parseDateValue(raw.createdAt) || parseDateValue(raw.date) || new Date().toISOString(),
    dueDate: typeof raw.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.dueDate) ? raw.dueDate : null
  }
}

export const apiService = {
  /** Все записи, новые сверху */
  async fetchItems() {
    const data = await request('posts.json')
    return Object.entries(data || {})
      .map(([id, item]) => normalizeItem(item, id))
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
  },

  /** Создаёт запись. Возвращает нормализованную запись с присвоенным id */
  async createItem(payload) {
    const ref = await request('posts.json', { method: 'POST', body: JSON.stringify(payload) })
    return normalizeItem({ ...payload, createdAt: payload.createdAt || new Date().toISOString() }, ref.name)
  },

  /** Частичное обновление записи (PATCH — только переданные поля) */
  async updateItem(id, patch) {
    await request(`posts/${id}.json?print=silent`, { method: 'PATCH', body: JSON.stringify(patch) })
    return null
  },

  /** Удаляет запись */
  async deleteItem(id) {
    await request(`posts/${id}.json?print=silent`, { method: 'DELETE' })
    return null
  }
}
