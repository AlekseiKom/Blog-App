// Модалка создания/редактирования записи с валидацией и честной обработкой ошибок

import { apiService } from '../services/api.service'
import { toast } from './toast'

const KINDS = ['note', 'reminder', 'task']

export class ItemModal {
  constructor(app) {
    this.app = app
    this.editingId = null

    this.overlay = document.getElementById('item-modal')
    this.form = document.getElementById('item-form')
    this.titleInput = document.getElementById('f-title')
    this.kindSelect = document.getElementById('f-kind')
    this.dueInput = document.getElementById('f-due')
    this.textArea = document.getElementById('f-text')
    this.saveBtn = document.getElementById('btn-save')

    this.form.addEventListener('submit', event => this.onSubmit(event))
    document.getElementById('btn-cancel').addEventListener('click', () => this.close())
    // Закрытие по клику на подложку (но не по клику внутри модалки)
    this.overlay.addEventListener('mousedown', event => {
      if (event.target === this.overlay) this.close()
    })
  }

  /** mode: 'create' | 'edit'; presetDue — предзаполненная дата (из календаря) */
  open(mode = 'create', item = null, presetDue = null) {
    this.editingId = mode === 'edit' && item ? item.id : null
    document.getElementById('modal-title').textContent = this.editingId ? 'Редактировать запись' : 'Новая запись'

    const source = item || {}
    this.titleInput.value = source.title || ''
    this.kindSelect.value = KINDS.includes(source.kind) ? source.kind : 'note'
    // При редактировании сохраняем дату записи; при создании — предзаполненную из календаря
    this.dueInput.value = mode === 'edit' && item ? (item.dueDate || '') : (presetDue || '')
    this.textArea.value = source.text || ''

    this.clearErrors()
    this.overlay.classList.remove('hidden')
    setTimeout(() => this.titleInput.focus(), 50)
  }

  close() {
    this.overlay.classList.add('hidden')
    this.editingId = null
  }

  clearErrors() {
    this.form.querySelectorAll('.field-error').forEach(node => node.classList.add('hidden'))
  }

  showError(field, message) {
    const node = this.form.querySelector(`[data-error-for="${field}"]`)
    if (!node) return
    node.textContent = message
    node.classList.remove('hidden')
  }

  validate() {
    let valid = true
    const title = this.titleInput.value.trim()

    if (!title) {
      this.showError('title', 'Введите название')
      valid = false
    } else if (title.length > 120) {
      this.showError('title', 'Название слишком длинное (до 120 символов)')
      valid = false
    }

    // Текст опционален: запись создаётся и без него
    return valid
  }

  async onSubmit(event) {
    event.preventDefault()
    this.clearErrors()
    if (!this.validate()) return

    const payload = {
      title: this.titleInput.value.trim(),
      text: this.textArea.value.trim(),
      kind: this.kindSelect.value,
      dueDate: this.dueInput.value || null
    }

    this.saveBtn.disabled = true
    try {
      if (this.editingId) {
        await this.app.updateItem(this.editingId, payload)
        toast('Изменения сохранены', 'success')
      } else {
        const item = {
          title: payload.title,
          text: payload.text,
          kind: payload.kind,
          favorite: false,
          done: false,
          createdAt: new Date().toISOString(),
          dueDate: payload.dueDate
        }
        await this.app.createItem(item)
        toast('Запись создана', 'success')
      }
      this.close()
    } catch (error) {
      // Честная обработка: модалка остаётся открытой, показываем реальную причину
      toast(error.message || 'Не удалось сохранить. Попробуйте ещё раз.', 'error')
    } finally {
      this.saveBtn.disabled = false
    }
  }
}
