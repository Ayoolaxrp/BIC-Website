import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are declared as @font-face in index.css against preloaded files in
// public/fonts — do NOT import them via JS (that delays the swap and causes
// heading layout shift).
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
