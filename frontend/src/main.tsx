import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { WhitepaperPage } from './WhitepaperPage'
import { DeckPage } from './DeckPage'

export const Root = () => {
  const path = window.location.pathname
  if (path.startsWith('/deck')) {
    return <DeckPage />
  }
  if (path.startsWith('/whitepaper')) {
    return <WhitepaperPage />
  }
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
