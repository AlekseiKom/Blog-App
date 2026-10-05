// Ядро приложения: состояние, загрузка данных, действия, рендеринг вкладок

import { apiService } from '../services/api.service'
import { escapeHtml } from '../utils/dom'
import { toDateKey } from '../utils/date'
import { toast } from './toast'
import { ItemModal } from './modal.component'
import { confirmDelete } from './confirm.component'
import { renderNotes } from './notes.view'
import { renderTasks } from './tasks.view'
import { renderFavorites } from './favorites.view'
import { renderCalendar } from './calendar.view'

const TABS = ['notes', 'tasks', 'favorites', 'calendar']
const LIST_IDS = { notes: 'notes-list', tasks: 'tasks-list', favorites: 'favorites-list' }

export class App {
  constructor() {
    this.items = []
    this.loading = true
    this.loadError = null

    const savedTab = localStorage.getItem('planner.tab')
    this.tab = TABS.includes(savedTab) ? savedTab : 'notes'

    const now = new Date()
    this.monthCursor = new Date(now.getFullYear(), now.getMonth(), 1)
    this.selectedDateKey = toDateKey(now)

    this.modal = new ItemModal(this)

    this.bindTabs()
    this.bindLists()
    this.bindCalendar()
    document.getElementById('btn-create').addEventListener('click', () => this.modal.open('create'))

    // Кнопка «Повторить» в состоянии ошибки загрузки
    document.getElementById('notes-list').addEventListener('click', event => {
      if (event.target.closest('.js-retry')) this.load()
    })

    this.applyTab()
    this.load()
  }

  // ---------- Загрузка данных и действия ----------

  async load() {
    this.loading = true
    try {
      this.items = await apiService.fetchItems()
      this.loadError = null
    } catch (error) {
      this.loadError = error.message || 'Не удалось загрузить данные'
      toast(this.loadError, 'error')
    } finally {
      this.loading = false
      document.getElementById('app-loader').classList.add('hidden')
      this.renderAll()
    }
  }

  async createItem(payload) {
    const item = await apiService.createItem(payload)
    this.items.unshift(item)
    this.renderAll()
    return item
  }

  async updateItem(id, patch) {
    await apiService.updateItem(id, patch)
    const index = this.items.findIndex(i => i.id === id)
    if (index !== -1) this.items[index] = { ...this.items[index], ...patch }
    this.renderAll()
  }

  async toggleFavorite(id) {
    const item = this.items.find(i => i.id === id)
    if (!item) return
    await apiService.updateItem(id, { favorite: !item.favorite })
    item.favorite = !item.favorite
    this.renderAll()
  }

  async toggleDone(id) {
    const item = this.items.find(i => i.id === id)
    if (!item) return
    await apiService.updateItem(id, { done: !item.done })
    item.done = !item.done
    this.renderAll()
  }

  async removeItemWithConfirm(item) {
    const confirmed = await confirmDelete(item.title || 'запись')
    if (!confirmed) return
    await apiService.deleteItem(item.id)
    this.items = this.items.filter(i => i.id !== item.id)
    toast('Запись удалена', 'success')
    this.renderAll()
  }

  // ---------- Навигация и события ----------

  bindTabs() {
    document.getElementById('tabs').addEventListener('click', event => {
      const tabBtn = event.target.closest('.tab')
      if (!tabBtn || !TABS.includes(tabBtn.dataset.tab)) return
      this.setTab(tabBtn.dataset.tab)
    })
  }

  setTab(name) {
    this.tab = name
    localStorage.setItem('planner.tab', name)
    this.applyTab()
  }

  applyTab() {
    document.querySelectorAll('.tab').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === this.tab))
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${this.tab}`))
    if (this.tab === 'calendar') renderCalendar(this.calendarState())
  }

  bindLists() {
    Object.values(LIST_IDS).forEach(id => {
      const container = document.getElementById(id)
      container.addEventListener('click', event => this.onCardClick(event, container))
    })
  }

  onCardClick(event, container) {
    const actionBtn = event.target.closest('[data-action]')
    if (!actionBtn || !container.contains(actionBtn)) return
    const card = actionBtn.closest('.card')
    if (!card) return
    this.handleAction(actionBtn.dataset.action, card.dataset.id)
  }

  async handleAction(action, id) {
    const item = this.items.find(i => i.id === id)
    if (!item) return
    try {
      switch (action) {
        case 'favorite': await this.toggleFavorite(id); break
        case 'toggle-done': await this.toggleDone(id); break
        case 'edit': this.modal.open('edit', item); break
        case 'delete': await this.removeItemWithConfirm(item); break
      }
    } catch (error) {
      toast(error.message || 'Что-то пошло не так. Попробуйте ещё раз.', 'error')
    }
  }

  bindCalendar() {
    document.getElementById('cal-prev').addEventListener('click', () => this.shiftMonth(-1))
    document.getElementById('cal-next').addEventListener('click', () => this.shiftMonth(1))
    document.getElementById('cal-today').addEventListener('click', () => {
      const now = new Date()
      this.monthCursor = new Date(now.getFullYear(), now.getMonth(), 1)
      this.selectedDateKey = toDateKey(now)
      renderCalendar(this.calendarState())
    })

    document.getElementById('cal-grid').addEventListener('click', event => {
      const cell = event.target.closest('.cal-cell')
      if (!cell || !cell.dataset.day) return
      this.selectedDateKey = cell.dataset.day
      renderCalendar(this.calendarState())
    })

    // «Добавить на этот день» — модалка с предзаполненной датой
    document.getElementById('cal-day-panel').addEventListener('click', event => {
      if (event.target.closest('.js-cal-add')) this.modal.open('create', null, this.selectedDateKey)
    })
  }

  shiftMonth(delta) {
    const cursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() + delta, 1)
    this.monthCursor = cursor
    renderCalendar(this.calendarState())
  }

  calendarState() {
    return { monthCursor: this.monthCursor, selectedDateKey: this.selectedDateKey, items: this.items }
  }

  // ---------- Рендеринг ----------

  renderAll() {
    const notesList = document.getElementById('notes-list')
    const tasksList = document.getElementById('tasks-list')
    const favoritesList = document.getElementById('favorites-list')

    if (this.loadError && !this.items.length) {
      notesList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-cloud-bolt"></i>
          <h3>Не удалось загрузить данные</h3>
          <p>${escapeHtml(this.loadError)}</p>
          <button type="button" class="btn btn-primary btn-small js-retry"><i class="fa-solid fa-rotate-right"></i><span>Повторить</span></button>
        </div>`
      tasksList.innerHTML = ''
      favoritesList.innerHTML = ''
    } else {
      renderNotes(notesList, this.items)
      renderTasks(tasksList, this.items)
      renderFavorites(favoritesList, this.items)
    }

    if (this.tab === 'calendar') renderCalendar(this.calendarState())
  }
}

