// Шаблон карточки записи. Все пользовательские данные экранируются escapeHtml — без XSS.

import { escapeHtml } from '../utils/dom'
import { formatHuman, formatDueKey } from '../utils/date'

export const KIND_LABELS = {
  note: 'Заметка',
  reminder: 'Памятка',
  task: 'Задача'
}

/** HTML карточки одной записи */
export function renderCard(item) {
  const isTask = item.kind === 'task'
  const check = isTask
    ? `<button class="task-check ${item.done ? 'done' : ''}" data-action="toggle-done" title="${item.done ? 'Отметить невыполненной' : 'Отметить выполненной'}"><i class="fa-solid fa-check"></i></button>`
    : ''

  const due = item.dueDate
    ? `<span class="chip-due"><i class="fa-regular fa-calendar"></i>${escapeHtml(formatDueKey(item.dueDate))}</span>`
    : ''

  return `
  <article class="card glass ${item.done ? 'card--done' : ''}" data-id="${escapeHtml(item.id)}">
    <div class="card-top">
      ${check}
      <span class="badge badge-${item.kind}">${KIND_LABELS[item.kind]}</span>
      <button class="icon-btn js-fav ${item.favorite ? 'active' : ''}" data-action="favorite" title="${item.favorite ? 'Убрать из избранного' : 'В избранное'}">
        <i class="fa-${item.favorite ? 'solid' : 'regular'} fa-star"></i>
      </button>
    </div>
    <h3 class="card-title">${escapeHtml(item.title)}</h3>
    ${item.text ? `<p class="card-text">${escapeHtml(item.text)}</p>` : ''}
    <div class="card-meta">
      <span class="meta-date"><i class="fa-regular fa-clock"></i>${escapeHtml(formatHuman(item.createdAt))}</span>
      ${due}
    </div>
    <div class="card-actions">
      <button class="icon-btn" data-action="edit" title="Редактировать"><i class="fa-solid fa-pen"></i></button>
      <button class="icon-btn icon-danger" data-action="delete" title="Удалить"><i class="fa-regular fa-trash-can"></i></button>
    </div>
  </article>`
}

/** Пустое состояние списка */
export function renderEmpty(icon, title, hint) {
  return `
  <div class="empty-state">
    <i class="${icon}"></i>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(hint || '')}</p>
  </div>`
}
