// Вкладка «Задачи»: невыполненные сверху, затем по дате выполнения

import { renderCard, renderEmpty } from '../templates/card.template'

export function renderTasks(container, items) {
  const tasks = items.filter(item => item.kind === 'task')
  const doneCount = tasks.filter(task => task.done).length
  document.getElementById('tasks-count').textContent = tasks.length ? `${doneCount} / ${tasks.length}` : ''

  if (!tasks.length) {
    container.innerHTML = renderEmpty(
      'fa-solid fa-list-check',
      'Задач пока нет',
      'Добавьте задачу и отмечайте её выполненной галочкой.'
    )
    return
  }

  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.dueDate && b.dueDate) return a.dueDate < b.dueDate ? -1 : 1
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return b.createdAt > a.createdAt ? 1 : -1
  })

  container.innerHTML = sorted.map(renderCard).join('')
}
