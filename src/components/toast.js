// Тосты вместо alert(): всплывающие уведомления с автозакрытием

const TOAST_ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  info: 'fa-circle-info'
}

/** Показывает тост. type: 'success' | 'error' | 'info' */
export function toast(message, type = 'info', timeout = 3500) {
  const container = document.getElementById('toasts')
  if (!container || !message) return

  const node = document.createElement('div')
  node.className = `toast toast-${type}`
  node.setAttribute('role', 'status')

  const icon = document.createElement('i')
  icon.className = `fa-solid ${TOAST_ICONS[type] || TOAST_ICONS.info}`

  // textContent — пользовательские данные никогда не проходят через innerHTML
  const text = document.createElement('span')
  text.textContent = message

  node.append(icon, text)
  container.append(node)

  requestAnimationFrame(() => node.classList.add('toast-visible'))

  setTimeout(() => {
    node.classList.remove('toast-visible')
    let removed = false
    const remove = () => {
      if (removed) return
      removed = true
      node.remove()
    }
    node.addEventListener('transitionend', remove, { once: true })
    setTimeout(remove, 500) // запасной вариант, если transition не сработал
  }, timeout)
}
