import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ConfirmarProvider } from './components/Confirmar'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ConfirmarProvider>
        <App />
      </ConfirmarProvider>
    </HashRouter>
  </StrictMode>,
)
