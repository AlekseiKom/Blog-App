// scripts/watch-deploy.js
// Следит за src/ и при изменениях автоматически собирает проект и деплоит на Firebase Hosting.
// Запуск: npm run watch  (оставлять открытым, пока правите код)

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const WATCH_DIR = path.join(ROOT, 'src')
const DEBOUNCE_MS = 1000 // пауза после последней правки перед сборкой

let timer = null
let running = false

function log(msg) {
  const time = new Date().toLocaleTimeString('ru-RU')
  console.log(`[watch ${time}] ${msg}`)
}

// Рекурсивно следим за каждым файлом в src/ (надёжно на любой версии Node и Windows).
// Новые каталоги, созданные во время работы, отслеживаться не будут — для этого проекта набор файлов фиксирован.
function watchDir(dir) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (e) {
    return
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      watchDir(full)
    } else {
      fs.watch(full, () => schedule(entry.name))
    }
  }
}

function schedule(filename) {
  log(`Изменён файл: ${filename}`)
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    buildAndDeploy()
  }, DEBOUNCE_MS)
}

function runStep(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, CI: 'true' } // без интерактивных вопросов
    })
    child.on('close', code => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} завершился с кодом ${code}`))))
    child.on('error', reject)
  })
}

async function buildAndDeploy() {
  if (running) return // не запускаем вторую сборку поверх первой
  running = true
  try {
    log('Запускаю сборку…')
    await runStep('npm', ['run', 'build'])
    log('Сборка успешна — деплою на Firebase Hosting…')
    await runStep('npx', ['firebase', 'deploy', '--only', 'hosting'])
    log('✅ Готово: изменения опубликованы на Firebase.')
  } catch (err) {
    console.error(`[watch] ❌ Ошибка: ${err.message}`)
  } finally {
    running = false
  }
}

watchDir(WATCH_DIR)
log(`Слежу за src/ — правки автоматически собираются и деплоятся на Firebase.`)
