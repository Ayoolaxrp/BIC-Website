import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted variable fonts (see index.html — the Google Fonts link was
// render-blocking and its swap caused heading layout shift).
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
