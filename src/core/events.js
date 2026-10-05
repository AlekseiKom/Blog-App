// Минимальная шина событий для уведомлений о смене состояния приложения

export class EventBus {
  constructor() {
    this.listeners = new Map()
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event).push(fn)
    return () => this.off(event, fn)
  }

  off(event, fn) {
    const list = this.listeners.get(event) || []
    this.listeners.set(event, list.filter(listener => listener !== fn))
  }

  emit(event, payload) {
    (this.listeners.get(event) || []).forEach(fn => fn(payload))
  }
}
