import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { Analytics } from '@vercel/analytics/react'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Analytics />
    </ErrorBoundary>
  </React.StrictMode>,
)
