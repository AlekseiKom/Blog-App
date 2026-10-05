// Вкладка «Календарь»: сетка месяца с точками записей + панель выбранного дня

import { escapeHtml } from '../utils/dom'
import { buildMonthGrid, isTodayKey, monthTitle, formatDueKey } from '../utils/date'
import { KIND_LABELS } from '../templates/card.template'

const DOT_COLORS = { note: 'var(--accent-1)', reminder: '#38bdf8', task: 'var(--accent-2)' }

/** state: { monthCursor, selectedDateKey, items } */
export function renderCalendar(state) {
  const { monthCursor, selectedDateKey, items } = state

  document.getElementById('cal-title').textContent = monthTitle(monthCursor)

  // Индекс записей по дате (dueDate)
  const byDay = {}
  items.forEach(item => {
    if (!item.dueDate) return
    ;(byDay[item.dueDate] = byDay[item.dueDate] || []).push(item)
  })

  // Сетка месяца
  const cells = buildMonthGrid(monthCursor.getFullYear(), monthCursor.getMonth())
  document.getElementById('cal-grid').innerHTML = cells.map(cell => {
    const dayItems = byDay[cell.key] || []
    const dots = dayItems.slice(0, 3)
      .map(item => `<span class="cal-dot" style="background:${DOT_COLORS[item.kind]}"></span>`)
      .join('')
    const more = dayItems.length > 3 ? `<span class="cal-more">+${dayItems.length - 3}</span>` : ''

    const classes = ['cal-cell']
    if (!cell.inMonth) classes.push('other-month')
    if (isTodayKey(cell.key)) classes.push('today')
    if (cell.key === selectedDateKey) classes.push('selected')

    return `
      <button type="button" class="${classes.join(' ')}" data-day="${cell.key}">
        <span class="cal-num">${Number(cell.key.slice(8, 10))}</span>
        <span class="cal-dots">${dots}${more}</span>
      </button>`
  }).join('')

  // Панель выбранного дня
  const dayItems = byDay[selectedDateKey] || []
  const addBtn = `<button type="button" class="btn btn-primary btn-small js-cal-add"><i class="fa-solid fa-plus"></i><span>Добавить на этот день</span></button>`

  if (!dayItems.length) {
    document.getElementById('cal-day-panel').innerHTML = `
      <div class="cal-day-head">
        <h3>${escapeHtml(formatDueKey(selectedDateKey))}</h3>
        ${addBtn}
      </div>
      <p class="cal-day-empty">На этот день нет заметок, памяток и задач.</p>`
    return
  }

  const rows = dayItems.map(item => `
    <div class="cal-row ${item.done ? 'done' : ''}">
      <span class="badge badge-${item.kind}">${KIND_LABELS[item.kind]}</span>
      <span class="cal-row-title">${escapeHtml(item.title)}</span>
      ${item.kind === 'task' ? '<i class="fa-solid fa-circle-check cal-row-done"></i>' : ''}
    </div>`).join('')

  document.getElementById('cal-day-panel').innerHTML = `
    <div class="cal-day-head">
      <h3>${escapeHtml(formatDueKey(selectedDateKey))}</h3>
      ${addBtn}
    </div>
    ${rows}`
}
