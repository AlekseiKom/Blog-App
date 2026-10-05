// Вкладка «Заметки»: заметки и памятки (всё, кроме задач), новые сверху

import { renderCard, renderEmpty } from '../templates/card.template'

export function renderNotes(container, items) {
  const list = items.filter(item => item.kind !== 'task')
  document.getElementById('notes-count').textContent = list.length ? String(list.length) : ''

  if (!list.length) {
    container.innerHTML = renderEmpty(
      'fa-regular fa-note-sticky',
      'Заметок пока нет',
      'Нажмите «Создать», чтобы добавить первую заметку или памятку.'
    )
    return
  }

  container.innerHTML = list.map(renderCard).join('')
}
