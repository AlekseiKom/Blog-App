import { App } from './components/app'

// Бандл подключается в конце <body> (html-webpack-plugin), поэтому DOM уже готов.
// Страховка на случай, если сборка изменится:
const start = () => new App()
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start)
} else {
  start()
}
