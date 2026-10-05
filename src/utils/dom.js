// DOM-хелперы: безопасное экранирование HTML и создание элементов

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

/** Экранирует строку для безопасной вставки в innerHTML (защита от XSS) */
export function escapeHtml(value) {
  const str = value === null || value === undefined ? '' : String(value)
  return str.replace(/[&<>"']/g, char => ESCAPE_MAP[char])
}

/** Создаёт элемент с атрибутами и дочерними узлами (строки становятся текстовыми узлами) */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag)
  Object.keys(attrs).forEach(key => {
    const value = attrs[key]
    if (value === null || value === undefined || value === false) return
    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2), value)
    } else if (value === true) {
      node.setAttribute(key, '')
    } else {
      node.setAttribute(key, String(value))
    }
  })
  children.forEach(child => {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)))
  })
  return node
}
