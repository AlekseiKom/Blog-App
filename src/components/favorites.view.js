// Вкладка «Избранное»: записи любого типа со звёздочкой

import { renderCard, renderEmpty } from '../templates/card.template'

export function renderFavorites(container, items) {
  const list = items.filter(item => item.favorite)
  document.getElementById('fav-count').textContent = list.length ? String(list.length) : ''

  if (!list.length) {
    container.innerHTML = renderEmpty(
      'fa-regular fa-star',
      'В избранном пока пусто',
      'Нажмите на звёздочку у карточки, чтобы сохранить её здесь.'
    )
    return
  }

  container.innerHTML = list.map(renderCard).join('')
}
