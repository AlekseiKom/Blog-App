// Диалог подтверждения удаления (Promise-based)

export function confirmDelete(title) {
  return new Promise(resolve => {
    const overlay = document.getElementById('confirm-modal')
    const okBtn = document.getElementById('btn-confirm-ok')
    const cancelBtn = document.getElementById('btn-confirm-cancel')
    document.getElementById('confirm-text').textContent = `«${title}» будет удалена без возможности восстановления.`

    let settled = false
    const finish = value => {
      if (settled) return
      settled = true
      overlay.classList.add('hidden')
      okBtn.removeEventListener('click', onOk)
      cancelBtn.removeEventListener('click', onCancel)
      overlay.removeEventListener('mousedown', onOverlayClick)
      document.removeEventListener('keydown', onKeydown)
      resolve(value)
    }

    const onOk = () => finish(true)
    const onCancel = () => finish(false)
    const onOverlayClick = event => {
      if (event.target === overlay) finish(false)
    }
    const onKeydown = event => {
      if (event.key === 'Escape') finish(false)
      else if (event.key === 'Enter' && document.activeElement !== cancelBtn) finish(true)
    }

    okBtn.addEventListener('click', onOk)
    cancelBtn.addEventListener('click', onCancel)
    overlay.addEventListener('mousedown', onOverlayClick)
    document.addEventListener('keydown', onKeydown)
    overlay.classList.remove('hidden')
  })
}
