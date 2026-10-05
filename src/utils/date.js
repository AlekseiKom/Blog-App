// Утилиты дат: парсинг (включая legacy dd.MM.yyyy из старой схемы), форматирование, сетка календаря

const MONTHS_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

/** Локальная дата → ключ 'YYYY-MM-DD' */
export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Парсит дату: ISO-строка или legacy-формат Firebase dd.MM.yyyy → ISO. null, если не распознано */
export function parseDateValue(value) {
  if (!value || typeof value !== 'string') return null
  const legacy = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (legacy) {
    // Полдень — чтобы дата не «съезжала» при сортировке в разных часовых поясах
    return new Date(Number(legacy[3]), Number(legacy[2]) - 1, Number(legacy[1]), 12).toISOString()
  }
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

/** Человекочитаемая дата по-русски: «5 октября 2026» */
export function formatHuman(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`
}

/** Короткая дата для чипов: «12 окт» (+ год, если не текущий) */
export function formatDueKey(key) {
  if (!key) return ''
  const parts = key.split('-').map(Number)
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return key
  const [y, m, d] = parts
  const yearSuffix = y === new Date().getFullYear() ? '' : ` ${y}`
  return `${d} ${MONTHS_SHORT[m - 1]}${yearSuffix}`
}

/** Заголовок месяца: «Октябрь 2026» */
export function monthTitle(date) {
  const title = `${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`
  return title.charAt(0).toUpperCase() + title.slice(1)
}

/** Является ли ключ сегодняшним днём (локальная дата) */
export function isTodayKey(key) {
  return key === toDateKey(new Date())
}

/** Сетка из 42 ячеек (6 недель), неделя начинается с понедельника */
export function buildMonthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const offset = (first.getDay() + 6) % 7 // getDay(): 0=воскресенье → сдвиг к началу недели с понедельника
  const cells = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, monthIndex, 1 - offset + i)
    cells.push({ key: toDateKey(date), inMonth: date.getMonth() === monthIndex })
  }
  return cells
}
